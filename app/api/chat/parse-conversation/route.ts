import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/auth';
import { reviewPayloadSchema } from '@/shared/types/review';
import { ApiResponse } from '@/shared/api/response';
import { getAnthropicClient, CLAUDE_HAIKU } from '@/shared/api/claudeClient';
import { supabaseAdmin } from '@/shared/lib/supabase';
import { isGenerateIntent } from '@/features/chat-review/lib/conversation/isGenerateIntent';
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

const SYSTEM_PROMPT = `당신은 맛집 리뷰 정보를 자연스럽게 수집하는 대화 어시스턴트입니다.

## 역할
사용자가 자유롭게 이야기하면, 그 안에서 리뷰에 필요한 정보를 추출하고,
부족한 부분만 자연스럽게 물어보세요.

## 추출할 정보 (JSON 필드명)
- name: 매장/식당 이름
- location: 위치/주소/지역
- date: 방문 날짜 (오늘, 어제, 이번 주 등도 OK)
- menu: 주문한 메뉴
- companion: 동행인 (혼자, 친구, 가족 등)
- pros: 좋았던 점 (맛, 서비스, 분위기 등)
- cons: 아쉬웠던 점
- extra: 기타 특별한 경험, 에피소드

## 규칙
1. 사용자 메시지에서 위 정보를 최대한 추출하세요
2. 이미 수집된 정보(collectedInfo)는 다시 묻지 마세요
3. 부족한 정보가 있으면 자연스러운 대화체로 하나만 물어보세요
4. 최소 "장소명(name) + 메뉴(menu) + 감상(pros 또는 extra)" 3가지가 모이면 isReady = true
5. 친근한 존댓말로 응답하세요. 설문 느낌이 아니라 친구와 대화하는 느낌으로
6. 사용자가 "생성해줘", "이제 만들어", "써줘", "리뷰 작성해" 등을 말하면 무조건 isReady = true
7. 추출한 정보만 parsedInfo에 포함하세요 (이미 수집된 것은 제외)
8. 사용자의 감정과 경험에 공감하며 반응하세요

## 응답 형식
반드시 아래 JSON만 응답하세요 (다른 텍스트 없이):
{"parsedInfo": {}, "nextResponse": "", "isReady": false, "confidence": 0.0}`;

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

    const infoSummary = formatCollectedInfo(collectedInfo as Partial<ReviewPayload>);

    const userPrompt = `카테고리: ${selectedTopic}

이미 수집된 정보:
${infoSummary || '(아직 없음)'}

대화 기록:
${conversationHistory.map((m) => `${m.role === 'user' ? '사용자' : '봇'}: ${m.content}`).join('\n')}

사용자의 새 메시지: "${userMessage}"

위 메시지에서 리뷰 정보를 추출하고 자연스러운 응답을 생성하세요.`;

    console.log(
      `\n[Parse Conversation API] 대화 파싱 시작 (${selectedTopic})`,
    );

    const response = await getAnthropicClient().messages.create({
      model: CLAUDE_HAIKU,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
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

    const { data: reserved, error: rpcError } = await supabaseAdmin.rpc(
      'try_reserve_usage',
      { p_email: session.user.email },
    );
    if (rpcError || !reserved) {
      return ApiResponse.quotaExceeded();
    }

    return Response.json(normalizedResult);
  } catch (error) {
    console.error('[Parse Conversation API] 에러:', error);
    return ApiResponse.serverError();
  }
}

function formatCollectedInfo(info: Partial<ReviewPayload>): string {
  const entries = Object.entries(info).filter(
    ([, value]) => value !== undefined && value !== '',
  );
  if (entries.length === 0) return '';

  const labels: Record<string, string> = {
    name: '매장명',
    location: '위치',
    date: '날짜',
    menu: '메뉴',
    companion: '동행',
    pros: '좋았던 점',
    cons: '아쉬운 점',
    extra: '기타',
  };

  return entries
    .map(([key, value]) => `- ${labels[key] || key}: ${value}`)
    .join('\n');
}

function normalizeConversationResult(
  result: z.infer<typeof parseConversationOutputSchema>,
  userMessage: string,
  collectedInfo: Partial<ReviewPayload>,
) {
  const mergedInfo = { ...collectedInfo, ...result.parsedInfo };
  const isReady = computeIsReady(mergedInfo, isGenerateIntent(userMessage));

  return {
    ...result,
    isReady,
  };
}

function computeIsReady(
  info: Partial<ReviewPayload>,
  wantsGenerate: boolean,
): boolean {
  return reviewPayloadSchema.safeParse(info).success || wantsGenerate;
}

function maskPreview(text: string): string {
  return text.length <= 120 ? text : `${text.slice(0, 120)}...`;
}
