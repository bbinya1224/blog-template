/**
 * Chat Message Constants
 * 쁠리 캐릭터 메시지 템플릿 및 선택지 옵션
 */

import type { ChoiceOption } from '@/entities/chat-message';

/**
 * 쁠리 캐릭터 메시지 템플릿
 */
export const MESSAGES = {
  // 온보딩
  onboarding: {
    welcome: `안녕하세요!

먼저, 어떻게 불러드릴까요?`,

    nameReceived: (name: string) =>
      `${name}님, 반가워요!\n오늘부터 함께 멋진 블로그 글을 써봐요!`,
  },

  // 스타일 체크
  styleCheck: {
    hasStyle: (name: string) =>
      `${name}님의 글 스타일을 확인해봤어요.\n\n혹시 수정하고 싶은 부분이 있나요?`,

    noStyle: (name: string) =>
      `${name}님의 글 스타일을 알고 싶어요.\n제가 알 수 있는 방법이 있을까요?`,

    styleModifyRequest: '어떤 부분을 바꾸고 싶으세요?\n자유롭게 말씀해주세요.',

    styleUpdated: '스타일 설정이 완료됐어요.\n이제 글을 써볼까요?',
  },

  // 스타일 설정
  styleSetup: {
    urlInput: '좋아요! 네이버 블로그 주소를 알려주세요.',

    urlAnalyzing: '잠시만요, 글을 읽어보고 있어요...',

    urlAnalyzed: (name: string) =>
      `${name}님 글 스타일 파악했어요!\n이 스타일로 글을 써드릴까요?`,

    pastePrompt: '글을 붙여넣어 주세요.\n5개 이상의 글이 있으면 더 정확하게 분석할 수 있어요.',

    pasteReceived: '글 잘 받았어요! 분석 중...',

    questionnaireStart: '그럼 몇 가지 질문을 드릴게요.',

    questionTone: '평소에 어떤 말투를 주로 사용하세요?',

    questionEmoji: '이모티콘은 얼마나 사용하세요?',

    questionMood: '글 분위기는 어떤 걸 선호하세요?',

    questionLength: '문장 길이는요?',

    urlError: `블로그 분석이 어려워요.
혹시 블로그가 비공개 설정인가요?

다른 방법으로 진행해볼까요?`,
  },

  // 주제 선택
  topicSelect: {
    ask: `스타일 설정 완료!

자, 이제 오늘 저랑 같이 글을 써봐요!
오늘의 글 주제는 무엇인가요?`,

    selected: (topic: string) => `${topic} 리뷰군요! 좋아요!`,

    comingSoon: '아직 준비 중이에요.\n조금만 기다려주세요! 맛집 리뷰부터 시작해볼까요?',
  },

  // 정보 수집 - 맛집
  infoGathering: {
    restaurant: {
      date: '맛집 리뷰군요!\n언제 식사하러 가셨어요?',

      companion: (date: string) =>
        `${date}에 다녀오셨군요!\n누구랑 같이 가셨어요?`,

      place: (companion: string) =>
        `${companion}이랑 맛있는 거 먹으러 가셨군요!\n\n어느 매장에서 어떤 음식을 드셨어요?\n더 알려주세요.`,

      placeConfirm: '혹시 이 매장인가요?',

      placeNotFound: '검색 결과가 없네요.\n매장 이름과 위치를 더 자세히 알려주실 수 있나요?',

      placeConfirmed: (placeName: string) =>
        `${placeName}! 여기 요즘 핫하잖아요!`,

      menu: '뭘 드셨어요? 메뉴 이름을 알려주세요.',

      experience: `맛이나 분위기, 기억에 남는 거
자유롭게 얘기해주세요.`,

      experienceFollowUp: (keyword: string) =>
        `${keyword} 좋았군요!\n더 자세히 얘기해주실 수 있어요?`,

      additional: '혹시 더 알려주실 내용이 있나요?',

      waitingTime: '웨이팅이 있었다고 하셨는데,\n대략 얼마나 기다리셨어요?',

      price: '가격대는 어땠어요?',

      otherMenu: '다른 메뉴도 드셨어요?',
    },
  },

  // 확인
  confirmation: {
    summary: '지금까지 얘기해주신 내용 정리해볼게요.',

    correct: '좋아요! 그럼 리뷰를 작성해볼게요.',

    needsEdit: '어떤 부분을 수정할까요?',
  },

  // 리뷰 생성
  generating: {
    working: '리뷰를 작성 중이에요...\n잠시만 기다려주세요.',

    almostDone: '거의 다 됐어요! 조금만 더요.',
  },

  // 리뷰 수정
  reviewEdit: {
    complete: '리뷰가 완성됐어요!\n\n어떠세요? 수정하고 싶은 부분이 있나요?',

    askEdit: '어떤 부분을 수정하면 좋을까요?\n자유롭게 말씀해주세요.',

    editing: '수정 중이에요...',

    edited: '수정했어요!\n이제 마음에 드시나요?',
  },

  // 완료
  complete: {
    thanks: (name: string) =>
      `${name}님, 오늘도 수고하셨어요!\n\n멋진 리뷰가 완성됐네요!\n다음에 또 함께해요!`,

    copied: '클립보드에 복사했어요!',
  },

  // 에러
  error: {
    network: `연결이 끊어졌어요.
다시 시도해볼까요?`,

    unknown: `뭔가 문제가 생겼어요.
다시 한번 시도해볼게요!`,

    retry: '다시 시도해볼까요?',
  },
} as const;

/**
 * 선택지 옵션
 */
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

  // 추가 정보
  additionalInfo: [
    { id: 'waiting', label: '웨이팅 정보' },
    { id: 'price', label: '가격대' },
    { id: 'other-menu', label: '다른 메뉴' },
    { id: 'done', label: '됐어요, 이만하면 충분해요!' },
  ],

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

/**
 * 동행인 ID → 표시 텍스트 변환
 */
export function getCompanionLabel(id: string): string {
  const option = CHOICE_OPTIONS.companion.find(o => o.id === id);
  return option?.label || id;
}

/**
 * 날짜 ID → 표시 텍스트 변환
 */
export function getDateLabel(id: string): string {
  const option = CHOICE_OPTIONS.visitDate.find(o => o.id === id);
  return option?.label || id;
}
