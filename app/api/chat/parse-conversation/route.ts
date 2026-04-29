import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/auth';
import { reviewPayloadSchema } from '@/shared/types/review';
import { ApiResponse } from '@/shared/api/response';
import { getAnthropicClient, CLAUDE_HAIKU } from '@/shared/api/claudeClient';
import { getParseConversationPrompts } from '@/shared/api/promptService';
import { supabaseAdmin } from '@/shared/lib/supabase';
import { formatCollectedInfo } from '@/features/chat-review/lib/promptBuilder';
import { normalizeConversationResult } from '@/features/chat-review/lib/conversation/reviewReadiness';
import { sanitizeUserInput, wrapInXmlTag } from '@/shared/lib/sanitizeInput';
import type Anthropic from '@anthropic-ai/sdk';
import type { ReviewPayload } from '@/shared/types/review';

const MAX_CONVERSATION_TEXT_LENGTH = 2000;

const conversationMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  // Bound transcript size before forwarding it to the model.
  content: z.string().trim().min(1).max(MAX_CONVERSATION_TEXT_LENGTH),
});

const parseConversationInputSchema = z.object({
  userMessage: z.string().trim().min(1).max(MAX_CONVERSATION_TEXT_LENGTH),
  collectedInfo: reviewPayloadSchema.partial(),
  conversationHistory: z.array(conversationMessageSchema).max(30),
  selectedTopic: z.enum([
    'restaurant',
    'beauty',
    'product',
    'movie',
    'book',
    'travel',
  ]),
});

const parseConversationOutputSchema = z.object({
  parsedInfo: reviewPayloadSchema.partial().default({}),
  nextResponse: z.string(),
  isReady: z.boolean(),
  confidence: z.number().min(0).max(1),
});

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return ApiResponse.unauthorized();
    }

    const body = await req.json();
    const parsed = parseConversationInputSchema.safeParse(body);

    if (!parsed.success) {
      return ApiResponse.validationError(
        '잘못된 요청 형식입니다.',
        parsed.error.flatten(),
      );
    }

    const { userMessage, collectedInfo, conversationHistory, selectedTopic } =
      parsed.data;

    if (selectedTopic !== 'restaurant') {
      return ApiResponse.validationError(
        '현재 대화형 리뷰 작성은 맛집 주제만 지원합니다.',
      );
    }

    const { data: reserved, error: rpcError } = await supabaseAdmin.rpc(
      'try_reserve_usage',
      { p_email: session.user.email },
    );
    if (rpcError || !reserved) {
      return ApiResponse.quotaExceeded();
    }

    const infoSummary = formatCollectedInfo(
      collectedInfo as Partial<ReviewPayload>,
    );
    const conversationSummary = conversationHistory
      .map((m) => `${m.role === 'user' ? '사용자' : '봇'}: ${m.content}`)
      .join('\n');
    const { systemPrompt, userPrompt: userPromptTemplate } =
      await getParseConversationPrompts();

    const userPrompt = userPromptTemplate
      .replaceAll('{selectedTopic}', selectedTopic)
      .replaceAll('{infoSummary}', infoSummary || '(아직 없음)')
      .replaceAll('{conversationHistory}', conversationSummary || '(아직 없음)')
      .replaceAll('{userMessage}', wrapInXmlTag('user_input', sanitizeUserInput(userMessage)));

    console.log(
      `\n[Parse Conversation API] 대화 파싱 시작 (${selectedTopic})`,
    );

    const response = await getAnthropicClient().messages.create({
      model: CLAUDE_HAIKU,
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = response.content
      .filter(
        (block): block is Anthropic.TextBlock => block.type === 'text',
      )
      .map((block) => block.text)
      .join('');

    console.log(`[Parse Conversation API] 응답 생성 완료 (${text.length}자)`);

    const jsonText = text
      .replace(/^```(?:json)?\s*\n?/, '')
      .replace(/\n?```\s*$/, '')
      .trim();

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('[Parse Conversation API] JSON 파싱 실패:', {
        requestId,
        parseError,
        responseLength: jsonText.length,
        responsePreview: maskPreview(jsonText),
      });
      return Response.json({
        parsedInfo: {},
        nextResponse:
          '죄송해요, 답변을 이해하지 못했어요. 다시 한번 말씀해주세요!',
        isReady: false,
        confidence: 0,
      });
    }

    const aiResult = parseConversationOutputSchema.safeParse(parsedJson);

    if (!aiResult.success) {
      console.error('[Parse Conversation API] AI 응답 스키마 파싱 실패:', {
        requestId,
        responseLength: jsonText.length,
        responsePreview: maskPreview(jsonText),
        issues: aiResult.error.issues,
      });
      return Response.json({
        parsedInfo: {},
        nextResponse:
          '죄송해요, 답변을 이해하지 못했어요. 다시 한번 말씀해주세요!',
        isReady: false,
        confidence: 0,
      });
    }

    const normalizedResult = normalizeConversationResult(
      aiResult.data,
      userMessage,
      collectedInfo as Partial<ReviewPayload>,
    );

    return Response.json(normalizedResult);
  } catch (error) {
    console.error('[Parse Conversation API] 에러:', error);
    return ApiResponse.serverError();
  }
}

function maskPreview(text: string): string {
  return text.length <= 120 ? text : `${text.slice(0, 120)}...`;
}
