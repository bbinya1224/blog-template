import type { ChoiceOption } from '@/entities/chat-message';

export const CHOICE_OPTIONS: Record<string, ChoiceOption[]> = {
  // 스타일 설정 방법
  styleSetupMethod: [
    {
      id: 'blog-url',
      label: '네이버 블로그 주소 알려주기',
      icon: '1️⃣',
      description: '기존 글을 분석해서 스타일 파악',
    },
    {
      id: 'paste-text',
      label: '글 직접 첨부하기 (5개 이상)',
      icon: '2️⃣',
      description: '복사해서 붙여넣기',
    },
    {
      id: 'questionnaire',
      label: '직접 스타일 설정하기',
      icon: '3️⃣',
      description: '질문에 답하면서 설정',
    },
  ],

  // 스타일 확인
  styleConfirm: [
    { id: 'yes', label: '좋아요!' },
    { id: 'no', label: '수정할래요' },
  ],

  // 주제
  topics: [
    { id: 'restaurant', label: '맛집', icon: '🍽️' },
    { id: 'beauty', label: '뷰티', icon: '💄', disabled: true },
    { id: 'product', label: '제품', icon: '📦', disabled: true },
    { id: 'movie', label: '영화', icon: '🎬', disabled: true },
    { id: 'book', label: '책', icon: '📚', disabled: true },
    { id: 'travel', label: '여행', icon: '✈️', disabled: true },
  ],

  // 방문 날짜
  visitDate: [
    { id: 'today', label: '오늘' },
    { id: 'yesterday', label: '어제' },
    { id: 'this-week', label: '이번 주' },
    { id: 'custom', label: '📅 날짜 직접 선택' },
  ],

  // 동행인
  companion: [
    { id: 'alone', label: '혼자' },
    { id: 'friend', label: '친구' },
    { id: 'family', label: '가족' },
    { id: 'lover', label: '연인' },
    { id: 'colleague', label: '직장 동료' },
    { id: 'custom', label: '✏️ 직접 입력' },
  ],

  // 웨이팅 시간
  waitingTime: [
    { id: 'under-10', label: '10분 이하' },
    { id: '10-30', label: '10-30분' },
    { id: 'over-30', label: '30분 이상' },
  ],

  // 가격대
  priceRange: [
    { id: 'under-10000', label: '1만원 이하' },
    { id: '10000-20000', label: '1-2만원' },
    { id: '20000-30000', label: '2-3만원' },
    { id: 'over-30000', label: '3만원 이상' },
  ],

  // 스마트 후속 질문 스킵
  smartFollowupSkip: [{ id: 'skip', label: '충분해요! 리뷰 작성해주세요' }],

  // 정보 확인
  confirmInfo: [
    { id: 'yes', label: '네!' },
    { id: 'no', label: '수정할 부분 있어' },
  ],

  // 리뷰 완료
  reviewComplete: [
    { id: 'complete', label: '✨ 완벽해요!' },
    { id: 'edit', label: '✏️ 수정해주세요' },
  ],

  // 스타일 분석 페이지 액션
  styleAnalyzeAction: [
    { id: 'modify', label: '수정하고 싶은 내용이 있어요' },
    { id: 'go-home', label: '경험 기록하러 가기' },
  ],

  // 에러 복구
  errorRecovery: [
    { id: 'retry', label: '다시 시도' },
    { id: 'skip', label: '건너뛰기' },
  ],

  // 말투
  toneOptions: [
    { id: 'formal', label: '존댓말' },
    { id: 'casual', label: '반말' },
    { id: 'mixed', label: '상황에 따라 섞어서' },
  ],

  // 이모티콘 사용량
  emojiOptions: [
    { id: 'lots', label: '많이 😊😊😊' },
    { id: 'moderate', label: '적당히 😊' },
    { id: 'rarely', label: '거의 안 써요' },
  ],

  // 글 분위기
  moodOptions: [
    { id: 'emotional', label: '감성적' },
    { id: 'informative', label: '정보 전달형' },
    { id: 'humorous', label: '유머러스' },
  ],

  // 문장 길이
  lengthOptions: [
    { id: 'short', label: '짧고 경쾌하게' },
    { id: 'long', label: '길고 상세하게' },
  ],
} as const;

export function getCompanionLabel(id: string): string {
  const option = CHOICE_OPTIONS.companion.find((o) => o.id === id);
  return option?.label || id;
}

export function getDateLabel(id: string): string {
  const option = CHOICE_OPTIONS.visitDate.find((o) => o.id === id);
  return option?.label || id;
}
