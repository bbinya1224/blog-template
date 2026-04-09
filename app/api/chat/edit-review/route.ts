import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/auth';
import { getReviewEditPrompts } from '@/shared/api/promptService';
import { ApiResponse } from '@/shared/api/response';
import { getAnthropicClient, CLAUDE_HAIKU } from '@/shared/api/claudeClient';
import { createSSEStream, createSSEResponse } from '@/shared/api/sse';
import { supabaseAdmin } from '@/shared/lib/supabase';
import { withPromptDefense } from '@/shared/lib/promptDefense';
import { styleProfileSchema } from '@/shared/types/styleProfile';
import { validateEditedReview } from '@/features/review-edit/lib/validateEditedReview';

const editReviewInputSchema = z.object({
  originalReview: z.string().min(1, '원본 리뷰가 필요합니다'),
  editRequest: z.string().min(1, '수정 요청을 입력해주세요'),
  styleProfile: styleProfileSchema.optional().nullable(),
});

const DEFAULT_EDIT_SYSTEM_PROMPT =
  '당신은 블로그 리뷰 수정 전문가입니다. 사용자의 글쓰기 스타일을 유지하면서 요청된 부분만 정확하게 수정합니다. 전체 리뷰의 흐름과 톤을 해치지 않으면서 자연스럽게 수정해주세요.';
const EDIT_VALIDATION_SYSTEM_PROMPT = `너는 블로그 리뷰 수정 결과를 검수하는 엄격한 검사기다.

반드시 JSON만 출력하라.
형식:
{"valid": true, "issues": []}

검사 기준:
- 수정 요청 범위만 반영되었는가
- 원본의 사실(매장명/위치/메뉴명/가격/방문일/실제 경험)이 불필요하게 바뀌지 않았는가
- 원본 문체와 흐름이 과도하게 훼손되지 않았는가
- 설명문, 마크다운, 메타 코멘트 없이 본문만 출력되었는가`;
const editValidationSchema = z.object({
  valid: z.boolean(),
  issues: z.array(z.string()).max(8).default([]),
});

function buildRetryUserPrompt(basePrompt: string, issues: string[]): string {
  if (issues.length === 0) return basePrompt;

  return `${basePrompt}

[이전 시도에서 발견된 문제]
${issues.map((issue, index) => `${index + 1}. ${issue}`).join('\n')}

[재수정 지침]
- 위 문제를 모두 해결해서 다시 수정하라.
- 수정 규칙을 더 보수적으로 적용하라.
- 원본 리뷰를 해치지 않는 방향을 우선하라.`;
}

function chunkText(text: string): string[] {
  const chunks = text.match(/.{1,24}(\s|$)|\S+/g);
  return chunks?.map((chunk) => chunk) ?? [text];
}

async function generateEditedReview(params: {
  systemPrompt: string;
  userPrompt: string;
  signal?: AbortSignal;
}): Promise<string> {
  const response = await getAnthropicClient().messages.create(
    {
      model: CLAUDE_HAIKU,
      max_tokens: 4096,
      system: [{ type: 'text', text: params.systemPrompt, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: params.userPrompt }],
    },
    { signal: params.signal },
  );

  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');
}

async function validateWithClaude(params: {
  originalReview: string;
  editedReview: string;
  editRequest: string;
  signal?: AbortSignal;
}): Promise<z.infer<typeof editValidationSchema>> {
  const response = await getAnthropicClient().messages.create(
    {
      model: CLAUDE_HAIKU,
      max_tokens: 400,
      system: [{ type: 'text', text: EDIT_VALIDATION_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: [
        {
          role: 'user',
          content: `[원본 리뷰]
${params.originalReview}

[수정 요청]
${params.editRequest}

[수정 결과]
${params.editedReview}`,
        },
      ],
    },
    { signal: params.signal },
  );

  try {
    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .replace(/^```(?:json)?\s*\n?/, '')
      .replace(/\n?```\s*$/, '')
      .trim();

    const parsed = JSON.parse(text);
    return editValidationSchema.parse(parsed);
  } catch (error) {
    return {
      valid: false,
      issues: [
        `LLM 검수 응답 파싱 실패: ${error instanceof Error ? error.message : 'unknown error'}`,
      ],
    };
  }
}

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

    console.log(`\n[Review Edit API] 리뷰 수정 요청 수신`);

    // 프롬프트 로드
    const editPrompts = await getReviewEditPrompts();

    // 프롬프트 구성
    const styleProfileJson = styleProfile
      ? JSON.stringify(styleProfile, null, 2)
      : '{}';

    const userPrompt = editPrompts.userPrompt
      .replace('{기존 리뷰 텍스트}', originalReview)
      .replace('{수정 요청 텍스트}', editRequest)
      .replace('{스타일 JSON}', styleProfileJson);
    const systemPrompt = withPromptDefense(
      editPrompts.systemPrompt ?? DEFAULT_EDIT_SYSTEM_PROMPT,
    );

    const stream = createSSEStream(async (emit, signal) => {
      console.log('\n[Review Edit API] Claude API 수정/검증 시작...');
      let editedText = '';
      let lastIssues: string[] = [];
      let finalIssues: string[] = [];

      for (let attempt = 1; attempt <= 2; attempt++) {
        const attemptUserPrompt = buildRetryUserPrompt(userPrompt, lastIssues);
        editedText = await generateEditedReview({
          systemPrompt,
          userPrompt: attemptUserPrompt,
          signal,
        });

        const deterministicValidation = validateEditedReview({
          originalReview,
          editedReview: editedText,
          editRequest,
        });

        let llmValidation = { valid: true, issues: [] as string[] };
        if (deterministicValidation.softIssues.length > 0) {
          try {
            llmValidation = await validateWithClaude({
              originalReview,
              editedReview: editedText,
              editRequest,
              signal,
            });
          } catch (error) {
            console.warn('[Review Edit API] Claude 검수 실패, 규칙 검증만 사용:', error);
            llmValidation = {
              valid: false,
              issues: ['LLM 검수 실패로 인한 재시도 필요'],
            };
          }
        }

        const retryIssues = Array.from(
          new Set([
            ...deterministicValidation.hardIssues,
            ...deterministicValidation.softIssues,
          ]),
        );
        finalIssues = Array.from(
          new Set([...retryIssues, ...llmValidation.issues]),
        );
        lastIssues = retryIssues;

        if (
          deterministicValidation.hardIssues.length === 0 &&
          deterministicValidation.softIssues.length === 0
        ) {
          break;
        }

        if (
          deterministicValidation.hardIssues.length === 0 &&
          deterministicValidation.softIssues.length > 0 &&
          llmValidation.valid
        ) {
          break;
        }

        if (attempt === 2) {
          console.error('[Review Edit API] 수정 결과 검증 실패:', finalIssues);
          throw new Error('수정 결과가 검증 기준을 통과하지 못했습니다.');
        }
      }

      for (const chunk of chunkText(editedText)) {
        emit(chunk);
      }

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
