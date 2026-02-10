import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import type { ReviewPayload } from '@/shared/types/review';
import {
  shouldUseMock,
} from '@/shared/lib/mock/chat-mock';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface SmartFollowupInput {
  collectedInfo: Partial<ReviewPayload>;
  selectedTopic: string;
}

const SYSTEM_PROMPT = `당신은 맛집 리뷰 작성을 돕는 어시스턴트입니다.
사용자가 수집한 리뷰 정보를 보고, 리뷰를 더 생생하고 풍부하게 만들어줄 후속 질문 2~3개를 생성하세요.

규칙:
- 이미 수집된 정보를 반복하는 질문은 하지 마세요
- 감각적(맛, 식감, 향, 비주얼)이거나 감정적(기분, 느낌, 에피소드) 디테일을 유도하세요
- 질문은 한국어로, 친근한 반말 톤으로 작성하세요
- 각 질문은 1~2문장으로 짧게 작성하세요
- 반드시 JSON 형식으로만 응답하세요: {"questions": ["질문1", "질문2", "질문3"]}`;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(
        JSON.stringify({ error: '인증이 필요합니다.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { collectedInfo, selectedTopic }: SmartFollowupInput =
      await req.json();

    if (shouldUseMock()) {
      console.log('[Smart Followup API] 🎭 MOCK MODE');
      return Response.json({
        questions: [
          '음식이 나왔을 때 비주얼은 어땠어? 플레이팅이 예뻤어?',
          '같이 간 사람이랑 어떤 대화를 나눴어? 특별한 에피소드가 있었어?',
          '다음에 또 가고 싶어? 다른 메뉴도 도전해보고 싶은 게 있어?',
        ],
      });
    }

    const infoSummary = formatCollectedInfo(collectedInfo);

    console.log(`\n[Smart Followup API] 후속 질문 생성 시작 (${selectedTopic})`);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `수집된 리뷰 정보:\n${infoSummary}\n\n이 정보를 바탕으로 사용자가 놓쳤을만한 감각적/감정적 디테일을 유도하는 후속 질문 2~3개를 생성해주세요.`,
        },
      ],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    console.log(`[Smart Followup API] 응답: ${text}`);

    const parsed = JSON.parse(text);
    const questions: string[] = parsed.questions || [];

    return Response.json({ questions });
  } catch (error) {
    console.error('[Smart Followup API] 에러:', error);
    return Response.json(
      { questions: [], error: 'Failed to generate follow-up questions' },
      { status: 200 }
    );
  }
}

function formatCollectedInfo(info: Partial<ReviewPayload>): string {
  const lines: string[] = [];
  if (info.name) lines.push(`매장: ${info.name}`);
  if (info.location) lines.push(`위치: ${info.location}`);
  if (info.date) lines.push(`방문일: ${info.date}`);
  if (info.companion) lines.push(`동행: ${info.companion}`);
  if (info.menu) lines.push(`메뉴: ${info.menu}`);
  if (info.pros) lines.push(`맛/느낌: ${info.pros}`);
  if (info.cons) lines.push(`아쉬운 점: ${info.cons}`);
  if (info.extra) lines.push(`기타: ${info.extra}`);
  return lines.join('\n');
}
