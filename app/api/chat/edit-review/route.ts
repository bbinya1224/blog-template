import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import type { StyleProfile } from '@/entities/style-profile';
import { getReviewEditPrompt } from '@/shared/api/prompt-service';
import { ApiResponse } from '@/shared/api/response';
import { getAnthropicClient, CLAUDE_HAIKU } from '@/shared/api/claude-client';
import {
  shouldUseMock,
  generateMockEditReview,
} from '@/shared/lib/mock/chat-mock';

interface EditReviewInput {
  originalReview: string;
  editRequest: string;
  styleProfile: StyleProfile | null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return ApiResponse.unauthorized();
    }

    const { originalReview, editRequest, styleProfile }: EditReviewInput =
      await req.json();

    if (!originalReview?.trim() || !editRequest?.trim()) {
      return ApiResponse.validationError('원본 리뷰와 수정 요청은 필수입니다.');
    }

    // 개발 환경에서 Mock 사용
    if (shouldUseMock()) {
      console.log('[Review Edit API] 🎭 MOCK MODE');
      return createMockEditResponse(originalReview, editRequest);
    }

    console.log(`\n[Review Edit API] 리뷰 수정 요청: "${editRequest.substring(0, 50)}..."`);

    // 프롬프트 로드
    const editPromptTemplate = await getReviewEditPrompt();

    // 프롬프트 구성
    const styleProfileJson = styleProfile
      ? JSON.stringify(styleProfile, null, 2)
      : '{}';

    const userPrompt = editPromptTemplate
      .replace('{기존 리뷰 텍스트}', originalReview)
      .replace('{수정 요청 텍스트}', editRequest)
      .replace('{스타일 JSON}', styleProfileJson);

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('\n[Review Edit API] Claude API 스트리밍 시작...');
          const response = await getAnthropicClient().messages.stream({
            model: CLAUDE_HAIKU,
            max_tokens: 4096,
            system: [
              {
                type: 'text',
                text: '당신은 블로그 리뷰 수정 전문가입니다. 사용자의 글쓰기 스타일을 유지하면서 요청된 부분만 정확하게 수정합니다. 전체 리뷰의 흐름과 톤을 해치지 않으면서 자연스럽게 수정해주세요.',
                cache_control: { type: 'ephemeral' },
              },
            ],
            messages: [{ role: 'user', content: userPrompt }],
          });

          let fullText = '';

          for await (const event of response) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const token = event.delta.text;
              fullText += token;
              const data = `data: ${JSON.stringify({ token })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }

          const finalMessage = await response.finalMessage();
          const finalText = finalMessage.content
            .filter(
              (block): block is Anthropic.TextBlock => block.type === 'text'
            )
            .map((block) => block.text)
            .join('');

          // Use finalText if available, otherwise use accumulated fullText
          const editedText = finalText || fullText;

          console.log(
            `\n✅ [Review Edit API] 리뷰 수정 완료: ${editedText.length}자`
          );

          const doneData = `event: done\ndata: ${JSON.stringify({
            fullText: editedText,
            characterCount: editedText.length,
          })}\n\n`;
          controller.enqueue(encoder.encode(doneData));

          controller.close();
        } catch (error) {
          console.error('❌ [Review Edit API] 스트리밍 에러:', error);
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
    console.error('Review edit error:', error);
    return ApiResponse.serverError();
  }
}

/**
 * Create mock edit response for development
 */
function createMockEditResponse(
  originalReview: string,
  editRequest: string
): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let fullText = '';

      for await (const word of generateMockEditReview(
        originalReview,
        editRequest
      )) {
        fullText += word;
        const data = `data: ${JSON.stringify({ token: word })}\n\n`;
        controller.enqueue(encoder.encode(data));
      }

      console.log(
        `\n✅ [Review Edit API] MOCK 리뷰 수정 완료: ${fullText.length}자`
      );

      const doneData = `event: done\ndata: ${JSON.stringify({
        fullText,
        characterCount: fullText.length,
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
