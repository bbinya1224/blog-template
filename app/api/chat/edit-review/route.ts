import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/auth';
import { getReviewEditPrompt } from '@/shared/api/promptService';
import { ApiResponse } from '@/shared/api/response';
import { getAnthropicClient, CLAUDE_HAIKU } from '@/shared/api/claudeClient';
import { createSSEStream, createSSEResponse } from '@/shared/api/sse';
import { supabaseAdmin } from '@/shared/lib/supabase';
import {
  shouldUseMock,
  generateMockEditReview,
} from '@/shared/lib/mock/chatMock';
import { styleProfileSchema } from '@/shared/types/styleProfile';

const editReviewInputSchema = z.object({
  originalReview: z.string().min(1, '원본 리뷰가 필요합니다'),
  editRequest: z.string().min(1, '수정 요청을 입력해주세요'),
  styleProfile: styleProfileSchema.optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return ApiResponse.unauthorized();
    }

    const { data: reserved, error: rpcError } = await supabaseAdmin.rpc('try_reserve_usage', {
      p_email: session.user.email,
    });
    if (rpcError || !reserved) {
      return ApiResponse.quotaExceeded();
    }

    const body = await req.json();
    const validation = editReviewInputSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return ApiResponse.validationError(
        firstError?.message || '입력 값이 올바르지 않습니다.'
      );
    }

    const { originalReview, editRequest, styleProfile } = validation.data;

    // 개발 환경에서 Mock 사용
    if (shouldUseMock()) {
      console.log('[Review Edit API] 🎭 MOCK MODE');
      return createMockEditResponse(originalReview, editRequest);
    }

    console.log(`\n[Review Edit API] 리뷰 수정 요청 수신`);

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

    const stream = createSSEStream(async (emit) => {
      console.log('\n[Review Edit API] Claude API 스트리밍 시작...');
      const response = await getAnthropicClient().messages.stream({
        model: CLAUDE_HAIKU,
        max_tokens: 4096,
        system: [{ type: 'text', text: '당신은 블로그 리뷰 수정 전문가입니다. 사용자의 글쓰기 스타일을 유지하면서 요청된 부분만 정확하게 수정합니다. 전체 리뷰의 흐름과 톤을 해치지 않으면서 자연스럽게 수정해주세요.', cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: userPrompt }],
      });

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
      const editedText = finalText || fullText;

      console.log(`\n✅ [Review Edit API] 리뷰 수정 완료: ${editedText.length}자`);

      return {
        fullText: editedText,
        done: { characterCount: editedText.length },
      };
    });

    return createSSEResponse(stream);
  } catch (error) {
    console.error('Review edit error:', error);
    return ApiResponse.serverError();
  }
}

function createMockEditResponse(originalReview: string, editRequest: string): Response {
  const stream = createSSEStream(async (emit) => {
    let fullText = '';
    for await (const word of generateMockEditReview(originalReview, editRequest)) {
      fullText += word;
      emit(word);
    }
    console.log(`\n✅ [Review Edit API] MOCK 리뷰 수정 완료: ${fullText.length}자`);
    return {
      fullText,
      done: { characterCount: fullText.length },
    };
  });
  return createSSEResponse(stream);
}
