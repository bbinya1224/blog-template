import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import {
  shouldUseMock,
  generateMockStream,
} from '@/shared/lib/mock/chat-mock';

// Model constants
const MODEL_HAIKU = 'claude-3-haiku-20240307';
const MODEL_SONNET = 'claude-sonnet-4-5-20250929';

const getAnthropicClient = (): Anthropic => {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  return new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
  });
};

interface StreamRequestBody {
  message: string;
  context: {
    step: string;
    userName: string | null;
    collectedInfo: Record<string, unknown>;
    styleProfile: Record<string, unknown> | null;
  };
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

function buildSystemPrompt(context: StreamRequestBody['context']): string {
  const basePrompt = `당신은 "쁠리"라는 이름의 친근한 블로그 리뷰 작성 도우미입니다.
사용자와 자연스럽게 대화하며 리뷰 작성에 필요한 정보를 수집합니다.

## 캐릭터 설정
- 이름: 쁠리
- 성격: 친근하고 호기심 많음
- 말투: 존댓말 기반, 이모티콘 적절히 사용
- 특징: 공감을 잘 해주고, 추가 질문으로 대화를 이끌어감

## 현재 상태
- 단계: ${context.step}
- 사용자 이름: ${context.userName || '미설정'}
- 수집된 정보: ${JSON.stringify(context.collectedInfo, null, 2)}
${context.styleProfile ? `- 스타일 프로필: ${JSON.stringify(context.styleProfile, null, 2)}` : ''}

## 응답 규칙
1. 한 번에 하나의 질문만 합니다
2. 사용자 답변을 요약하며 공감을 표현합니다
3. 이모티콘을 적절히 사용합니다 (과하지 않게)
4. 응답은 2-3문장으로 간결하게 유지합니다
5. 선택지가 필요한 경우 자연스럽게 안내합니다`;

  const stepInstructions = getStepInstructions(context.step);

  return basePrompt + '\n\n' + stepInstructions;
}

function getStepInstructions(step: string): string {
  const instructions: Record<string, string> = {
    onboarding: `## 온보딩 단계 지시
- 따뜻하게 인사하고 자기소개를 합니다
- 사용자의 이름이나 닉네임을 물어봅니다
- 예: "안녕하세요! 블로그 글쓰기를 도와줄 쁠리예요 어떻게 불러드릴까요?"`,

    'style-check': `## 스타일 확인 단계 지시
- 기존 스타일이 있으면 요약해서 보여주고 수정 여부를 물어봅니다
- 없으면 스타일 설정 방법을 안내합니다 (블로그 URL / 글 첨부 / 직접 설정)`,

    'style-setup': `## 스타일 설정 단계 지시
- 선택한 방법에 따라 안내합니다
- URL 입력, 글 첨부, 또는 설문 질문을 진행합니다`,

    'topic-select': `## 주제 선택 단계 지시
- 오늘 작성할 글의 주제를 물어봅니다
- 맛집, 뷰티, 제품, 영화, 책, 여행 중 선택하도록 안내합니다
- MVP에서는 맛집만 활성화됩니다`,

    'info-gathering': `## 정보 수집 단계 지시 (맛집)
순서대로 질문합니다:
1. 언제 갔는지 (오늘/어제/이번주/직접입력)
2. 누구랑 갔는지 (혼자/친구/가족/연인/직장동료)
3. 어디서 뭘 먹었는지 (자유 입력)
4. 맛, 분위기, 서비스 등 경험 상세
5. 추가 정보 (웨이팅, 가격 등)

각 답변에 공감하며 자연스럽게 다음 질문으로 넘어갑니다.`,

    confirmation: `## 확인 단계 지시
- 지금까지 수집된 정보를 요약해서 보여줍니다
- 맞는지 확인을 받습니다
- 수정이 필요하면 해당 부분으로 돌아갑니다`,

    generating: `## 생성 단계 지시
- 리뷰를 작성 중이라고 안내합니다
- "잠시만 기다려주세요~" 등의 메시지`,

    'review-edit': `## 수정 단계 지시
- 수정 요청을 받아 반영합니다
- 구체적으로 어떤 부분을 수정하고 싶은지 물어봅니다`,

    complete: `## 완료 단계 지시
- 축하 메시지와 함께 마무리합니다
- 다음에 또 이용해달라고 안내합니다`,
  };

  return instructions[step] || '';
}

/**
 * Create mock streaming response for development
 */
function createMockStreamResponse(step: string): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let fullText = '';

      for await (const char of generateMockStream(step)) {
        fullText += char;
        const data = `data: ${JSON.stringify({ token: char })}\n\n`;
        controller.enqueue(encoder.encode(data));
      }

      const doneData = `event: done\ndata: ${JSON.stringify({
        fullText,
        usage: { input_tokens: 0, output_tokens: fullText.length },
      })}\n\n`;
      controller.enqueue(encoder.encode(doneData));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

/**
 * Select appropriate model based on the conversation step
 * - Haiku: Simple conversational responses (cheap, fast)
 * - Sonnet: Complex content generation (quality matters)
 */
function selectModel(step: string): string {
  // Use Sonnet for complex tasks requiring quality
  const sonnetSteps = ['generating', 'review-edit'];

  if (sonnetSteps.includes(step)) {
    return MODEL_SONNET;
  }

  // Use Haiku for simple conversational responses
  return MODEL_HAIKU;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(
        JSON.stringify({ error: '인증이 필요합니다.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body: StreamRequestBody = await req.json();
    const { message, context, history = [] } = body;

    // 개발 환경에서 Mock 사용
    if (shouldUseMock()) {
      console.log(`[Chat Stream] 🎭 MOCK MODE - step: ${context.step}`);
      return createMockStreamResponse(context.step);
    }

    const systemPrompt = buildSystemPrompt(context);

    // Build messages array
    const messages: Anthropic.MessageParam[] = [
      ...history.map((h) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user' as const, content: message },
    ];

    const client = getAnthropicClient();

    // Select model based on step
    const model = selectModel(context.step);
    console.log(`[Chat Stream] Using model: ${model} for step: ${context.step}`);

    // Create streaming response
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await client.messages.stream({
            model,
            max_tokens: 1024,
            system: systemPrompt,
            messages,
          });

          for await (const event of response) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const data = `data: ${JSON.stringify({ token: event.delta.text })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }

          // Send done event with full message
          const finalMessage = await response.finalMessage();
          const fullText = finalMessage.content
            .filter(
              (block): block is Anthropic.TextBlock => block.type === 'text'
            )
            .map((block) => block.text)
            .join('');

          const doneData = `event: done\ndata: ${JSON.stringify({
            fullText,
            usage: finalMessage.usage,
          })}\n\n`;
          controller.enqueue(encoder.encode(doneData));

          controller.close();
        } catch (error) {
          const errorData = `event: error\ndata: ${JSON.stringify({
            message: error instanceof Error ? error.message : 'Unknown error',
          })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat stream error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
