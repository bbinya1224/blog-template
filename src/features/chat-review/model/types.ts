import type { StyleProfile } from '@/entities/style-profile';
import type { ReviewPayload } from '@/shared/types/review';

// 대화 단계
export type ConversationStep =
  | 'onboarding'        // 인사 & 이름 입력
  | 'style-check'       // 기존 스타일 확인
  | 'style-setup'       // 스타일 설정 (URL/직접입력/설문)
  | 'topic-select'      // 주제 선택
  | 'info-gathering'    // 정보 수집
  | 'smart-followup'    // 스마트 후속 질문 (Haiku)
  | 'confirmation'      // 수집 정보 확인
  | 'generating'        // 리뷰 생성 중
  | 'review-edit'       // 리뷰 수정
  | 'complete';         // 완료

// 맛집 정보 수집 세부 단계
export type RestaurantInfoStep =
  | 'date'        // 언제 갔는지
  | 'companion'   // 누구랑 갔는지
  | 'place'       // 어디서 (검색 연동)
  | 'menu'        // 뭘 먹었는지
  | 'taste'       // 미각/시각 — 맛, 식감, 비주얼
  | 'atmosphere'  // 공간/분위기 — 인테리어, 음악, 서비스
  | 'highlight';  // 감정/하이라이트 — 가장 기억에 남는 순간

// 책 정보 수집 세부 단계
export type BookInfoStep =
  | 'title'       // 책 제목
  | 'author'      // 저자
  | 'readDate'    // 읽은 시기
  | 'genre'       // 장르
  | 'experience'  // 독서 경험
  | 'additional'; // 추가 정보

// 리뷰 주제 타입
export type ReviewTopic =
  | 'restaurant'  // 맛집 (MVP)
  | 'beauty'      // 뷰티
  | 'product'     // 제품
  | 'movie'       // 영화
  | 'book'        // 책
  | 'travel';     // 여행

// 대화 상태
export interface ConversationState {
  step: ConversationStep;
  subStep?: RestaurantInfoStep;
  userName: string | null;
  hasExistingStyle: boolean;
  styleProfile: StyleProfile | null;
  selectedTopic: ReviewTopic | null;
  collectedInfo: Partial<ReviewPayload>;
  generatedReview: string | null;
  sessionId: string | null;
}

// 초기 상태
export const initialConversationState: ConversationState = {
  step: 'onboarding',
  subStep: undefined,
  userName: null,
  hasExistingStyle: false,
  styleProfile: null,
  selectedTopic: null,
  collectedInfo: {},
  generatedReview: null,
  sessionId: null,
};

// 상태 전이 규칙
export const stepTransitions: Record<ConversationStep, ConversationStep[]> = {
  'onboarding': ['style-check'],
  'style-check': ['style-setup', 'topic-select'],
  'style-setup': ['topic-select'],
  'topic-select': ['info-gathering'],
  'info-gathering': ['smart-followup', 'info-gathering'],
  'smart-followup': ['confirmation', 'smart-followup'],
  'confirmation': ['generating', 'info-gathering'],
  'generating': ['review-edit'],
  'review-edit': ['review-edit', 'complete'],
  'complete': [],
};

// 대화 액션 타입
export type ConversationAction =
  | { type: 'SET_USER_NAME'; payload: string }
  | { type: 'SET_STYLE_PROFILE'; payload: StyleProfile }
  | { type: 'SET_HAS_EXISTING_STYLE'; payload: boolean }
  | { type: 'SET_TOPIC'; payload: ReviewTopic }
  | { type: 'UPDATE_COLLECTED_INFO'; payload: Partial<ReviewPayload> }
  | { type: 'SET_GENERATED_REVIEW'; payload: string }
  | { type: 'GO_TO_STEP'; payload: ConversationStep }
  | { type: 'SET_SUB_STEP'; payload: RestaurantInfoStep }
  | { type: 'RESET' };

// 스타일 설정 방법
export type StyleSetupMethod =
  | 'blog-url'      // 네이버 블로그 URL 크롤링
  | 'paste-text'    // 글 직접 첨부
  | 'questionnaire'; // 직접 스타일 설정 (설문)
