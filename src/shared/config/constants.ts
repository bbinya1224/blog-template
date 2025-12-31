/**
 * 애플리케이션 전역 상수
 */

// LocalStorage 키
export const STORAGE_KEYS = {
  STYLE_PROFILE: 'styleProfile',
  STYLE_PROFILE_DATE: 'styleProfileDate',
  LAST_REVIEW: 'lastReview',
} as const;

// API 엔드포인트
export const API_ENDPOINTS = {
  FETCH_RSS: '/api/fetch-rss',
  ANALYZE_STYLE: '/api/analyze-style',
  GENERATE_REVIEW: '/api/generate-review',
  EDIT_REVIEW: '/api/edit-review',
  STYLE_PROFILE: '/api/style-profile',
} as const;

// 분석 설정
export const ANALYSIS_CONFIG = {
  DEFAULT_MAX_POSTS: 15,
  MIN_POSTS: 5,
  MAX_POSTS: 25,
  RECOMMENDED_MIN: 10,
  RECOMMENDED_MAX: 20,
} as const;

// 상태 메시지
export const STATUS_MESSAGES = {
  FETCHING_RSS: 'RSS에서 글을 읽어오는 중입니다…',
  ANALYZING_STYLE: '스타일 분석을 시작합니다…',
  ANALYSIS_COMPLETE: '스타일 분석이 완료되었습니다! 이제 리뷰를 생성할 수 있어요.',
  ANALYSIS_ERROR: '스타일 분석에 실패했습니다.',
  PROFILE_LOADED: '✅ 저장된 스타일 프로필을 불러왔습니다.',
  PROFILE_NOT_FOUND: '⚠️ 스타일 프로필이 없습니다. 먼저 스타일 분석을 진행해주세요.',
  GENERATING_REVIEW: '리뷰를 생성하는 중입니다…',
  REVIEW_COMPLETE: '리뷰가 생성되었습니다!',
  EDITING_REVIEW: '리뷰를 수정하는 중입니다…',
  EDIT_COMPLETE: '리뷰가 수정되었습니다!',
} as const;

// FAQ 목록
export const FAQ_ITEMS = [
  {
    q: '정말 $3만 내면 끝인가요?',
    a: '네, 맞습니다. API 비용은 제가 부담합니다. 커피 한 잔만 사주세요!',
  },
  {
    q: '어떻게 시작하나요?',
    a: 'Buy Me a Coffee로 $3를 후원하면서 메시지에 이메일을 남겨주시면, 제가 확인 후 1~2시간 내로 승인해드립니다.',
  },
] as const;
