import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/auth';
import { supabaseAdmin } from '@/shared/lib/supabase';
import type { ReviewPayload } from '@/shared/types/review';
import type { StyleProfile } from '@/entities/style-profile';
import { getReviewGenerationPrompts } from '@/shared/api/promptService';
import { searchStoreInfo } from '@/shared/lib/search';
import { formatKakaoPlaceInfo } from '@/shared/lib/kakaoLocal';
import { readBlogSamples } from '@/shared/api/dataFiles';
import { ApiResponse } from '@/shared/api/response';
import { getAnthropicClient, CLAUDE_SONNET } from '@/shared/api/claudeClient';
import {
  buildReviewSystemPrompt,
  buildReviewUserPrompt,
} from '@/features/chat-review';
import {
  shouldUseMock,
  generateMockReview,
} from '@/shared/lib/mock/chatMock';

import { reviewPayloadSchema } from '@/shared/types/review';

const generateReviewInputSchema = z.object({
  payload: reviewPayloadSchema,
  styleProfile: z.unknown().nullable(),
});

const getRandomWritingSamples = async (
  email: string,
  count: number = 3,
): Promise<string> => {
  try {
    const samples = await readBlogSamples(email);

    if (!Array.isArray(samples) || samples.length === 0) return '';

    return samples
      .sort(() => 0.5 - Math.random())
      .slice(0, count)
      .join('\n\n[Reference Sample]\n\n');
  } catch (error) {
    console.warn(`샘플 로드 실패 (DB):`, error);
    return '';
  }
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return ApiResponse.unauthorized();
    }

    const authenticatedEmail = session.user.email;

    // 원자적 쿼터 확인 + 증가 (TOCTOU 레이스 컨디션 방지)
    const { data: reserved, error: rpcError } = await supabaseAdmin.rpc('try_reserve_usage', {
      p_email: authenticatedEmail,
    });
    if (rpcError || !reserved) {
      return ApiResponse.quotaExceeded();
    }

    const body = await req.json();
    const parsed = generateReviewInputSchema.safeParse(body);

    if (!parsed.success) {
      return ApiResponse.validationError(
        '잘못된 요청 형식입니다.',
        parsed.error.flatten(),
      );
    }

    const { payload, styleProfile: rawStyleProfile } = parsed.data;
    const styleProfile = rawStyleProfile as StyleProfile | null;

    // 개발 환경에서 Mock 사용
    if (shouldUseMock()) {
      console.log('[Review Gen API] 🎭 MOCK MODE');
      return createMockReviewResponse(authenticatedEmail, payload);
    }

    // 검색 및 프롬프트 로드
    const searchQuery = `${payload.location} ${payload.name}`;
    console.log(`\n[Review Gen API] 검색 시작: "${searchQuery}"`);

    const [searchResult, writingSamples, prompts] = await Promise.all([
      searchStoreInfo(searchQuery).catch((err) => {
        console.error('❌ 통합 검색 실패:', err.message || err);
        return { kakaoPlace: null, tavilyContext: '' };
      }),
      getRandomWritingSamples(authenticatedEmail, 3),
      getReviewGenerationPrompts(),
    ]);

    // 카카오 정보 포맷팅
    const kakaoPlaceFormatted = searchResult.kakaoPlace
      ? formatKakaoPlaceInfo(searchResult.kakaoPlace)
      : '카카오 검색 결과 없음';

    const tavilyContext = searchResult.tavilyContext || '';

    console.log(
      `\n[Review Gen API] 검색 결과:\n- 카카오: ${searchResult.kakaoPlace ? searchResult.kakaoPlace.name : '없음'}\n- Tavily: ${tavilyContext.length}자\n- 샘플: ${writingSamples.length}자`
    );

    // 시스템 및 유저 프롬프트 구성
    const systemPrompt = buildReviewSystemPrompt(
      prompts.systemPrompt,
      styleProfile
    );
    const userPrompt = buildReviewUserPrompt(
      prompts.userPrompt,
      payload,
      styleProfile,
      kakaoPlaceFormatted,
      tavilyContext,
      writingSamples
    );

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('\n[Review Gen API] Claude API 스트리밍 시작...');
          const response = await getAnthropicClient().messages.stream({
            model: CLAUDE_SONNET,
            max_tokens: 4096,
            system: [
              {
                type: 'text',
                text: systemPrompt,
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
          const reviewText = finalText || fullText;

          const { data: insertedReview, error: insertError } = await supabaseAdmin
            .from('user_reviews')
            .insert({
              user_email: authenticatedEmail,
              restaurant_name: payload.name,
              visit_date: payload.date || new Date().toISOString().split('T')[0],
              review_content: reviewText,
              metadata: payload,
              character_count: reviewText.length,
              created_at: new Date().toISOString(),
            })
            .select('id')
            .single();

          if (insertError) {
            throw new Error(`리뷰 저장 실패: ${insertError.message}`);
          }

          console.log(
            `\n✅ [Review Gen API] 리뷰 생성 완료: ${reviewText.length}자`
          );

          const doneData = `event: done\ndata: ${JSON.stringify({
            fullText: reviewText,
            characterCount: reviewText.length,
            reviewId: insertedReview?.id ?? null,
          })}\n\n`;
          controller.enqueue(encoder.encode(doneData));

          controller.close();
        } catch (error) {
          console.error('❌ [Review Gen API] 스트리밍 에러:', error);
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
    console.error('Review generation error:', error);
    return ApiResponse.serverError();
  }
}

/**
 * Create mock review response for development
 */
function createMockReviewResponse(
  userEmail: string,
  payload: ReviewPayload
): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let fullText = '';

      for await (const word of generateMockReview()) {
        fullText += word;
        const data = `data: ${JSON.stringify({ token: word })}\n\n`;
        controller.enqueue(encoder.encode(data));
      }

      let reviewId: string | null = null;

      try {
        const { data: insertedReview } = await supabaseAdmin
          .from('user_reviews')
          .insert({
            user_email: userEmail,
            restaurant_name: payload.name,
            visit_date: payload.date || new Date().toISOString().split('T')[0],
            review_content: fullText,
            metadata: payload,
            character_count: fullText.length,
            created_at: new Date().toISOString(),
          })
          .select('id')
          .single();
        reviewId = insertedReview?.id ?? null;
        console.log(
          `\n✅ [Review Gen API] MOCK 리뷰 저장 완료: ${fullText.length}자`
        );
      } catch (error) {
        console.warn('[Review Gen API] MOCK 리뷰 저장 실패:', error);
      }

      const doneData = `event: done\ndata: ${JSON.stringify({
        fullText,
        characterCount: fullText.length,
        reviewId,
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

