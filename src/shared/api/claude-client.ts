import Anthropic from '@anthropic-ai/sdk';
import { AppError } from '@/shared/lib/errors';
import type { ReviewPayload } from '@/entities/review/model/types';

// 모델 상수
export const CLAUDE_SONNET = 'claude-sonnet-4-5-20250929'; // Sonnet 3.5 (안정 버전)
export const CLAUDE_HAIKU = 'claude-3-haiku-20240307'; // Haiku 3.0 (안정 버전)

// Lazy initialization
let anthropic: Anthropic | null = null;

const getAnthropicClient = (): Anthropic => {
  if (anthropic) {
    return anthropic;
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    throw new AppError(
      'ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.',
      'MISSING_API_KEY',
      500
    );
  }

  anthropic = new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
  });

  return anthropic;
};

/**
 * Claude API 호출 (범용)
 */
export const callClaude = async (
  systemPrompt: string,
  userPrompt: string,
  model: string = CLAUDE_SONNET,
  maxTokens: number = 4096
): Promise<string> => {
  try {
    const client = getAnthropicClient();
    const message = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const textContent = message.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new AppError(
        'Claude API 응답에서 텍스트를 찾을 수 없습니다.',
        'INVALID_API_RESPONSE',
        500
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
          401
        );
      }
      if (error.status === 429) {
        throw new AppError(
          'Claude API 요청 한도 초과 (Rate Limit).',
          'RATE_LIMIT_EXCEEDED',
          429
        );
      }
      throw new AppError(
        `Claude API 오류: ${error.message}`,
        'CLAUDE_API_ERROR',
        error.status || 500
      );
    }

    throw new AppError(
      'Claude API 호출 중 예상치 못한 오류가 발생했습니다.',
      'UNEXPECTED_ERROR',
      500
    );
  }
};

/**
 * 스타일 분석용 Claude Sonnet 호출
 */
export const analyzeStyleWithClaude = async (
  blogText: string,
  systemPrompt: string,
  userPromptTemplate: string
): Promise<string> => {
  const userPrompt = userPromptTemplate.replace(
    '{여기에 blog-posts.txt 내용 붙이기}',
    blogText
  );

  return callClaude(systemPrompt, userPrompt, CLAUDE_SONNET, 8192);
};

/**
 * 리뷰 생성용 데이터 인터페이스 정의
 * ReviewPayload를 확장하여 타입 중복 제거
 */
export interface ReviewGenerationData extends ReviewPayload {
  naver_place_info?: string;
  tavily_search_result_context?: string;
  writing_samples?: string;
}

/**
 * 리뷰 생성용 Claude Haiku 호출
 */
export const generateReviewWithClaude = async (
  styleProfileJson: string,
  reviewData: ReviewGenerationData,
  systemPrompt: string,
  userPromptTemplate: string
): Promise<string> => {
  const userPrompt = userPromptTemplate
    .replace('{스타일 프로필 JSON}', styleProfileJson)
    .replace('{name}', reviewData.name)
    .replace('{location}', reviewData.location)
    .replace('{date}', reviewData.date)
    .replace('{menu}', reviewData.menu)
    .replace('{companion}', reviewData.companion)
    .replace('{summary}', reviewData.summary)
    .replace('{pros}', reviewData.pros || '')
    .replace('{cons}', reviewData.cons || '')
    .replace('{extra}', reviewData.extra || '')
    .replace(
      '{naver_place_info}',
      reviewData.naver_place_info || '네이버 정보 없음'
    )
    .replace(
      '{tavily_search_result_context}',
      reviewData.tavily_search_result_context || '정보 없음'
    )
    .replace('{writing_samples}', reviewData.writing_samples || '샘플 없음')
    .replace('{user_draft}', reviewData.user_draft || '');

  return callClaude(systemPrompt, userPrompt, CLAUDE_SONNET, 4096);
};

/**
 * 리뷰 수정용 Claude Haiku 호출
 */
export const editReviewWithClaude = async (
  originalReview: string,
  editRequest: string,
  styleProfileJson: string,
  promptTemplate: string
): Promise<string> => {
  const userPrompt = promptTemplate
    .replace('{기존 리뷰 텍스트}', originalReview)
    .replace('{수정 요청 텍스트}', editRequest)
    .replace('{스타일 JSON}', styleProfileJson);

  return callClaude('', userPrompt, CLAUDE_HAIKU, 4096);
};
