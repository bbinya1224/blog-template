import type { ReviewPayload } from '@/shared/types/review';
import type { StyleProfile } from '@/entities/style-profile';
import { formatKoreanDate } from '@/shared/lib/utils';

export function buildReviewSystemPrompt(
  basePrompt: string,
  styleProfile: StyleProfile | null,
): string {
  if (!styleProfile) {
    return basePrompt;
  }

  const styleProfileJson = JSON.stringify(styleProfile, null, 2);
  return basePrompt.replace('{스타일 프로필 JSON}', styleProfileJson);
}

export function buildReviewUserPrompt(
  basePrompt: string,
  payload: ReviewPayload,
  styleProfile: StyleProfile | null,
  kakaoPlaceInfo: string,
  tavilyContext: string,
  writingSamples: string,
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
      tavilyContext || '검색된 정보가 없습니다. 일반적인 맛집 리뷰처럼 작성해주세요.',
    )
    .replace(
      '{writing_samples}',
      writingSamples || '샘플 데이터가 없습니다. 스타일 프로필을 참고해주세요.',
    )
    .replace('{user_draft}', payload.user_draft || '');
}

export function formatCollectedInfo(info: Partial<ReviewPayload>): string {
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

export function parseQuestions(text: string): string[] {
  try {
    return JSON.parse(text).questions || [];
  } catch {
    const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]).questions || [];
      } catch {
        return [];
      }
    }
    return [];
  }
}
