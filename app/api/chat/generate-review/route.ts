import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/auth';
import { supabaseAdmin } from '@/shared/lib/supabase';
import type { ReviewPayload } from '@/shared/types/review';
import { getReviewGenerationPrompts } from '@/shared/api/promptService';
import { searchStoreInfo } from '@/shared/lib/search';
import { formatKakaoPlaceInfo } from '@/shared/lib/kakaoLocal';
import { readBlogSamples } from '@/shared/api/dataFiles';
import { ApiResponse } from '@/shared/api/response';
import { getAnthropicClient, CLAUDE_SONNET } from '@/shared/api/claudeClient';
import { createSSEStream, createSSEResponse } from '@/shared/api/sse';
import {
  buildReviewSystemPrompt,
  buildReviewUserPrompt,
} from '@/features/chat-review';

import { reviewPayloadSchema } from '@/shared/types/review';
import { styleProfileSchema } from '@/shared/types/styleProfile';

const generateReviewInputSchema = z.object({
  payload: reviewPayloadSchema,
  styleProfile: styleProfileSchema.nullable(),
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

    const { payload, styleProfile } = parsed.data;

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

    const stream = createSSEStream(async (emit, signal) => {
      console.log('\n[Review Gen API] Claude API 스트리밍 시작...');
      const response = await getAnthropicClient().messages.stream({
        model: CLAUDE_SONNET,
        max_tokens: 4096,
        system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: userPrompt }],
      });

      signal.addEventListener('abort', () => response.abort(), { once: true });

      let fullText = '';
      for await (const event of response) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          fullText += event.delta.text;
          emit(event.delta.text);
        }
      }

      const finalMessage = await response.finalMessage();
      const finalText = finalMessage.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('');
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

      console.log(`\n✅ [Review Gen API] 리뷰 생성 완료: ${reviewText.length}자`);

      return {
        fullText: reviewText,
        done: {
          characterCount: reviewText.length,
          reviewId: insertedReview?.id ?? null,
        },
      };
    });

    return createSSEResponse(stream);
  } catch (error) {
    console.error('Review generation error:', error);
    return ApiResponse.serverError();
  }
}
