import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { supabaseAdmin } from '@/shared/lib/supabase';
import type { ReviewPayload } from '@/shared/types/review';
import type { StyleProfile } from '@/entities/style-profile';
import { getReviewGenerationPrompts } from '@/shared/api/prompt-service';
import { formatKoreanDate } from '@/shared/lib/utils';
import { searchStoreInfo } from '@/shared/lib/search';
import { formatKakaoPlaceInfo } from '@/shared/lib/kakao-local';
import { readBlogSamples } from '@/shared/api/data-files';
import {
  shouldUseMock,
  generateMockReview,
} from '@/shared/lib/mock/chat-mock';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface GenerateReviewInput {
  payload: ReviewPayload;
  styleProfile: StyleProfile | null;
  userEmail: string;
}

const getRandomWritingSamples = async (
  email: string,
  count: number = 3
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
      return new Response(
        JSON.stringify({ error: '인증이 필요합니다.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { payload, styleProfile, userEmail }: GenerateReviewInput =
      await req.json();

    // 개발 환경에서 Mock 사용
    if (shouldUseMock()) {
      console.log('[Review Gen API] 🎭 MOCK MODE');
      return createMockReviewResponse(userEmail, payload);
    }

    // 검색 및 프롬프트 로드
    const searchQuery = `${payload.location} ${payload.name}`;
    console.log(`\n[Review Gen API] 검색 시작: "${searchQuery}"`);

    const [searchResult, writingSamples, prompts] = await Promise.all([
      searchStoreInfo(searchQuery).catch((err) => {
        console.error('❌ 통합 검색 실패:', err.message || err);
        return { kakaoPlace: null, tavilyContext: '' };
      }),
      userEmail ? getRandomWritingSamples(userEmail, 3) : Promise.resolve(''),
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
          const response = await client.messages.stream({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 4096,
            system: systemPrompt,
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

          // 리뷰 저장
          await supabaseAdmin.from('reviews').insert({
            user_email: userEmail,
            content: reviewText,
            payload: payload,
            character_count: reviewText.length,
            created_at: new Date().toISOString(),
          });

          console.log(
            `\n✅ [Review Gen API] 리뷰 생성 완료: ${reviewText.length}자`
          );

          const doneData = `event: done\ndata: ${JSON.stringify({
            fullText: reviewText,
            characterCount: reviewText.length,
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
    return new Response(
      JSON.stringify({ error: 'Failed to generate review' }),
      { status: 500 }
    );
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

      // Mock 리뷰 저장
      try {
        await supabaseAdmin.from('reviews').insert({
          user_email: userEmail,
          content: fullText,
          payload: payload,
          character_count: fullText.length,
          created_at: new Date().toISOString(),
        });
        console.log(
          `\n✅ [Review Gen API] MOCK 리뷰 저장 완료: ${fullText.length}자`
        );
      } catch (error) {
        console.warn('[Review Gen API] MOCK 리뷰 저장 실패:', error);
      }

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

function buildReviewSystemPrompt(
  basePrompt: string,
  styleProfile: StyleProfile | null
): string {
  if (!styleProfile) {
    return basePrompt;
  }

  // Inject style profile into system prompt
  const styleProfileJson = JSON.stringify(styleProfile, null, 2);
  return basePrompt.replace('{스타일 프로필 JSON}', styleProfileJson);
}

function buildReviewUserPrompt(
  basePrompt: string,
  payload: ReviewPayload,
  styleProfile: StyleProfile | null,
  kakaoPlaceInfo: string,
  tavilyContext: string,
  writingSamples: string
): string {
  const styleProfileJson = styleProfile
    ? JSON.stringify(styleProfile, null, 2)
    : '{}';

  return basePrompt
    .replace('{스타일 프로필 JSON}', styleProfileJson)
    .replace('{name}', payload.name)
    .replace('{location}', payload.location)
    .replace('{date}', formatKoreanDate(payload.date))
    .replace('{menu}', payload.menu)
    .replace('{companion}', payload.companion)
    .replace('{pros}', payload.pros || '')
    .replace('{cons}', payload.cons || '')
    .replace('{extra}', payload.extra || '')
    .replace('{kakao_place_info}', kakaoPlaceInfo)
    .replace(
      '{tavily_search_result_context}',
      tavilyContext || '검색된 정보가 없습니다. 일반적인 맛집 리뷰처럼 작성해주세요.'
    )
    .replace(
      '{writing_samples}',
      writingSamples || '샘플 데이터가 없습니다. 스타일 프로필을 참고해주세요.'
    )
    .replace('{user_draft}', payload.user_draft || '');
}
