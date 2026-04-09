import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/auth';
import { reviewPayloadSchema } from '@/shared/types/review';
import { ApiResponse } from '@/shared/api/response';
import { getAnthropicClient, CLAUDE_HAIKU } from '@/shared/api/claudeClient';
import { getSmartFollowupPrompt } from '@/shared/api/promptService';
import { supabaseAdmin } from '@/shared/lib/supabase';
import {
  formatCollectedInfo,
  parseQuestions,
} from '@/features/chat-review';

const reviewTopicSchema = z.enum(['restaurant', 'beauty', 'product']);

const smartFollowupInputSchema = z.object({
  collectedInfo: reviewPayloadSchema.partial(),
  selectedTopic: reviewTopicSchema,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return ApiResponse.unauthorized();
    }

    const body = await req.json();
    const parsed = smartFollowupInputSchema.safeParse(body);

    if (!parsed.success) {
      return ApiResponse.validationError('잘못된 요청 형식입니다.', parsed.error.flatten());
    }

    const { collectedInfo, selectedTopic } = parsed.data;

    const { data: reserved, error: rpcError } = await supabaseAdmin.rpc('try_reserve_usage', {
      p_email: session.user.email,
    });
    if (rpcError || !reserved) {
      return ApiResponse.quotaExceeded();
    }

    const infoSummary = formatCollectedInfo(collectedInfo);
    const systemPrompt = await getSmartFollowupPrompt();

    console.log(
      `\n[Smart Followup API] 후속 질문 생성 시작 (${selectedTopic})`,
    );

    const response = await getAnthropicClient().messages.create({
      model: CLAUDE_HAIKU,
      max_tokens: 512,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `리뷰 카테고리: ${selectedTopic}\n\n수집된 리뷰 정보:\n${infoSummary}\n\n이 정보를 바탕으로 사용자가 놓쳤을만한 감각적/감정적 디테일을 유도하는 후속 질문 2~3개를 생성해주세요.`,
        },
      ],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    console.log(`[Smart Followup API] 응답 생성 완료 (${text.length}자)`);

    const jsonText = text
      .replace(/^```(?:json)?\s*\n?/, '')
      .replace(/\n?```\s*$/, '')
      .trim();

    const questions = parseQuestions(jsonText);

    return Response.json({ questions });
  } catch (error) {
    console.error('[Smart Followup API] 에러:', error);
    return ApiResponse.serverError();
  }
}
