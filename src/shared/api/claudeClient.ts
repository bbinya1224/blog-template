import Anthropic from '@anthropic-ai/sdk';
import { AppError, RateLimitError } from '@/shared/lib/errors';
import { withTimeoutAndRetry } from '@/shared/lib/timeout';
import { isRetryableError } from '@/shared/lib/retry';
import type { ReviewPayload } from '@/shared/types/review';

export const CLAUDE_SONNET = 'claude-sonnet-4-5-20250929';
export const CLAUDE_HAIKU = 'claude-haiku-4-5-20251001';

let anthropic: Anthropic | null = null;

export const getAnthropicClient = (): Anthropic => {
  if (anthropic) {
    return anthropic;
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    throw new AppError(
      'ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.',
      'MISSING_API_KEY',
      500,
    );
  }

  anthropic = new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
  });

  return anthropic;
};

const CLAUDE_TIMEOUT_MS = 60000;
const CLAUDE_RETRY_OPTIONS = {
  maxAttempts: 3,
  initialDelayMs: 2000,
  maxDelayMs: 10000,
  // Don't retry 429s - they should be handled by callers
  retryableErrors: (error: unknown) => {
    if (error instanceof Anthropic.APIError && error.status === 429) {
      return false;
    }
    return isRetryableError(error);
  },
  onRetry: (attempt: number, error: unknown) => {
    const safeMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : '알 수 없는 오류';
    console.warn(`[Claude] 재시도 ${attempt}회:`, safeMessage);
  },
};

export const callClaude = async (
  systemPrompt: string,
  userPrompt: string,
  model: string = CLAUDE_SONNET,
  maxTokens: number = 4096,
): Promise<string> => {
  try {
    const client = getAnthropicClient();
    const message = await withTimeoutAndRetry(
      () =>
        client.messages.create({
          model,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userPrompt,
            },
          ],
        }),
      CLAUDE_TIMEOUT_MS,
      CLAUDE_RETRY_OPTIONS,
    );

    const textContent = message.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new AppError(
        'Claude API 응답에서 텍스트를 찾을 수 없습니다.',
        'INVALID_API_RESPONSE',
        500,
      );
    }

    return textContent.text;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        throw new AppError(
          'Claude API 인증 실패: API 키를 확인해주세요.',
          'AUTHENTICATION_FAILED',
          401,
        );
      }
      if (error.status === 429) {
        // Parse Retry-After header (seconds or HTTP-date format)
        let retryAfterSeconds: string | null = null;
        if (error.headers && typeof error.headers.get === 'function') {
          retryAfterSeconds = error.headers.get('retry-after');
        } else if (error.headers && typeof error.headers === 'object') {
          retryAfterSeconds = error.headers['retry-after'] as string;
        }

        let retryAfterMs: number | undefined = undefined;
        if (retryAfterSeconds) {
          const parsedSeconds = parseInt(retryAfterSeconds, 10);
          if (!isNaN(parsedSeconds) && parsedSeconds > 0) {
            retryAfterMs = parsedSeconds * 1000;
          } else {
            const dateMs = Date.parse(retryAfterSeconds);
            if (!isNaN(dateMs)) {
              const delaySeconds = (dateMs - Date.now()) / 1000;
              if (delaySeconds > 0) {
                retryAfterMs = Math.ceil(delaySeconds * 1000);
              }
            }
          }
        }

        throw new RateLimitError(
          'Claude API 요청 한도 초과 (재시도 후 실패).',
          retryAfterMs,
        );
      }
      throw new AppError(
        `Claude API 오류: ${error.message}`,
        'CLAUDE_API_ERROR',
        error.status || 500,
      );
    }

    throw new AppError(
      'Claude API 호출 중 예상치 못한 오류가 발생했습니다.',
      'UNEXPECTED_ERROR',
      500,
    );
  }
};

export const analyzeStyleWithClaude = async (
  blogText: string,
  systemPrompt: string,
  userPromptTemplate: string,
): Promise<string> => {
  const userPrompt = userPromptTemplate.replace(
    '{여기에 blog-posts.txt 내용 붙이기}',
    blogText,
  );

  return callClaude(systemPrompt, userPrompt, CLAUDE_SONNET, 8192);
};

export interface ReviewGenerationData extends ReviewPayload {
  kakao_place_info?: string;
  tavily_search_result_context?: string;
  writing_samples?: string;
}

export const generateReviewWithClaude = async (
  styleProfileJson: string,
  reviewData: ReviewGenerationData,
  systemPrompt: string,
  userPromptTemplate: string,
): Promise<string> => {
  const userPrompt = userPromptTemplate
    .replace('{스타일 프로필 JSON}', styleProfileJson)
    .replace('{name}', reviewData.name)
    .replace('{location}', reviewData.location)
    .replace('{date}', reviewData.date)
    .replace('{menu}', reviewData.menu)
    .replace('{companion}', reviewData.companion)
    .replace('{pros}', reviewData.pros || '')
    .replace('{cons}', reviewData.cons || '')
    .replace('{extra}', reviewData.extra || '')
    .replace(
      '{kakao_place_info}',
      reviewData.kakao_place_info || '카카오 정보 없음',
    )
    .replace(
      '{tavily_search_result_context}',
      reviewData.tavily_search_result_context || '정보 없음',
    )
    .replace('{writing_samples}', reviewData.writing_samples || '샘플 없음')
    .replace('{user_draft}', reviewData.user_draft || '');

  return callClaude(systemPrompt, userPrompt, CLAUDE_SONNET, 4096);
};

export const editReviewWithClaude = async (
  originalReview: string,
  editRequest: string,
  styleProfileJson: string,
  promptTemplate: string,
): Promise<string> => {
  const userPrompt = promptTemplate
    .replace('{기존 리뷰 텍스트}', originalReview)
    .replace('{수정 요청 텍스트}', editRequest)
    .replace('{스타일 JSON}', styleProfileJson);

  return callClaude('', userPrompt, CLAUDE_HAIKU, 4096);
};
