/**
 * Chat Message Entity Types
 * 채팅 메시지 엔티티 타입 정의
 */

export type MessageRole = 'assistant' | 'user';

export type MessageType =
  | 'text'           // 일반 텍스트
  | 'choice'         // 선택지 버튼
  | 'input'          // 텍스트 입력 요청
  | 'url-input'      // URL 입력
  | 'date-picker'    // 날짜 선택
  | 'file-upload'    // 파일 업로드
  | 'place-card'     // 장소 정보 카드
  | 'style-summary'  // 스타일 요약 카드
  | 'review-preview' // 리뷰 미리보기
  | 'loading'        // 로딩 상태
  | 'summary';       // 정보 요약

export interface ChoiceOption {
  id: string;
  label: string;
  icon?: string;
  description?: string;
  disabled?: boolean;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
  content: string;
  options?: ChoiceOption[];
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface PlaceCardMetadata {
  name: string;
  category?: string;
  rating?: number;
  address: string;
  roadAddress?: string;
  phone?: string;
  mapLink?: string;
  tags?: string[];
  description?: string;
}

export interface StyleSummaryMetadata {
  writingStyle: string;
  emojiUsage: string;
  sentenceLength: string;
  tone: string;
  frequentExpressions?: string[];
}

export interface ReviewPreviewMetadata {
  characterCount: number;
  review: string;
}
