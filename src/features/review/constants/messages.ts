// StepExperience
export const KEYWORD_CHIPS = [
  '분위기가 깡패예요 ✨',
  '가성비가 좋아요 💰',
  '직원이 친절해요 😊',
  '사진이 잘 나와요 📸',
  '웨이팅이 있어요 ⏳',
  '주차가 편해요 🚗',
  '양이 정말 많아요 🍜',
  '재료가 신선해요 🥬',
  '특별한 날 가기 좋아요 🎉',
  '혼밥하기 좋아요 🍚',
] as const;

export const STEP_EXPERIENCE_MESSAGES = {
  badge: '⭐ 가장 중요한 단계입니다 (필수!)',
  title: '어떤 점이 기억에 남으세요?',
  subtitle: '키워드를 선택하거나, 의식의 흐름대로 편하게 적어주세요.',
  tipTitle: '✍️ 작성 팁 - 이렇게 작성하면 최고의 리뷰가 만들어져요!',
  tips: [
    { emphasis: '완벽한 문장이 아니어도 괜찮아요!', example: '(예: "파스타 좀 짰음, 근데 맛남")' },
    { emphasis: '맛, 양, 식감, 분위기, 서비스', detail: ' 등 떠오르는 대로 자유롭게 적어주세요' },
    { emphasis: '1500자 이상의 생생한 리뷰', prefix: 'AI가 여러분의 경험을 ', suffix: '로 확장합니다' },
  ],
  minRecommended: '최소 30자 이상 작성을 권장드려요! 📝',
  status: {
    empty: '⚠️ 필수 항목입니다 - 경험을 작성해주세요!',
    short: (count: number, min: number) => `⚠️ ${count}자 (최소 ${min}자 이상 권장)`,
    enough: (count: number) => `✅ ${count}자 (충분해요!)`,
  },
  expansion: 'AI가 10배 이상 확장해드려요 ✨',
  placeholder:
    '예: 창가 자리에 앉았는데 노을이 너무 예뻤음. 파스타는 좀 짰는데 스테이크는 입에서 살살 녹음. 사장님이 서비스로 주신 샐러드도 맛있었음. 분위기 진짜 좋아서 데이트하기 딱 좋았음...',
  shortWarning: '💡 조금만 더 자세히 적어주시면 훨씬 생생한 리뷰가 완성돼요!',
  shortExample: '예: 맛은 어땠나요? 분위기는요? 서비스는요?',
} as const;

// StepMenu
export const COMPANION_OPTIONS = [
  { value: '친구', emoji: '👥' },
  { value: '연인', emoji: '💑' },
  { value: '가족', emoji: '👨‍👩‍👧' },
  { value: '혼자', emoji: '🙋' },
  { value: '비즈니스', emoji: '💼' },
] as const;

export const STEP_MENU_MESSAGES = {
  title: '누구와 무엇을 드셨나요?',
  subtitle: '동행인과 주문한 메뉴를 알려주세요.',
  companionLabel: '누구와 함께였나요?',
  menuLabel: '어떤 메뉴를 드셨나요?',
  menuPlaceholder: '예: 고등어 봉초밥, 유자 하이볼, 연어 사시미',
  menuHelp: '💡 정확한 가격 정보 검색을 위해 메뉴명은 정확히 적어주세요.',
} as const;
