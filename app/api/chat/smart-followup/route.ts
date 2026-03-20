import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/auth';
import { reviewPayloadSchema } from '@/shared/types/review';
import { ApiResponse } from '@/shared/api/response';
import { getAnthropicClient, CLAUDE_HAIKU } from '@/shared/api/claudeClient';
import { supabaseAdmin } from '@/shared/lib/supabase';
import {
  formatCollectedInfo,
  parseQuestions,
} from '@/features/chat-review';
import { shouldUseMock } from '@/shared/lib/mock/chatMock';

const reviewTopicSchema = z.enum(['restaurant', 'beauty', 'product']);

const smartFollowupInputSchema = z.object({
  collectedInfo: reviewPayloadSchema.partial(),
  selectedTopic: reviewTopicSchema,
});

const SYSTEM_PROMPT = `당신은 맛집 리뷰 작성을 돕는 어시스턴트입니다.
사용자가 수집한 리뷰 정보를 보고, 리뷰를 더 생생하고 풍부하게 만들어줄 후속 질문 2~3개를 생성하세요.

규칙:
- 이미 수집된 정보를 반복하는 질문은 하지 마세요
- 감각적(맛, 식감, 향, 비주얼)이거나 감정적(기분, 느낌, 에피소드) 디테일을 유도하세요
- 질문은 한국어로, 친근한 존댓말 톤으로 작성하세요
- 각 질문은 1~2문장으로 짧게 작성하세요
- 반드시 JSON 형식으로만 응답하세요: {"questions": ["질문1", "질문2", "질문3"]}`;

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

    if (shouldUseMock()) {
      console.log('[Smart Followup API] 🎭 MOCK MODE');
      return Response.json({
        questions: [
          '음식이 나왔을 때 비주얼은 어떠셨어요? 플레이팅이 예뻤나요?',
          '같이 간 분이랑 어떤 대화를 나누셨어요? 특별한 에피소드가 있었나요?',
          '다음에 또 가고 싶으세요? 다른 메뉴도 도전해보고 싶은 게 있나요?',
        ],
      });
    }

    const { data: reserved, error: rpcError } = await supabaseAdmin.rpc('try_reserve_usage', {
      p_email: session.user.email,
    });
    if (rpcError || !reserved) {
      return ApiResponse.quotaExceeded();
    }

    const infoSummary = formatCollectedInfo(collectedInfo);

    console.log(
      `\n[Smart Followup API] 후속 질문 생성 시작 (${selectedTopic})`,
    );

    const response = await getAnthropicClient().messages.create({
      model: CLAUDE_HAIKU,
      max_tokens: 512,
      system: SYSTEM_PROMPT,
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

