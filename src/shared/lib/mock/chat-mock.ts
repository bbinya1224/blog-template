export interface MockResponse {
  content: string;
  delay?: number; // 토큰당 딜레이 (ms)
}

export const MOCK_RESPONSES: Record<string, MockResponse[]> = {
  onboarding: [
    {
      content: `안녕하세요! 👋

당신의 블로그 기록을 더욱 단순하게,
그리고 경험을 더 증폭시키는 걸 도와줄 쁠리예요! 🌱

먼저, 어떻게 불러드릴까요?`,
      delay: 20,
    },
  ],

  'style-check': [
    {
      content: `반가워요! 😊

기존에 저장된 글 스타일이 있는지 확인해볼게요...

스타일이 없네요! 제가 알 수 있는 방법을 선택해주세요.`,
      delay: 25,
    },
  ],

  'style-setup': [
    {
      content: `좋아요! 스타일 분석을 시작할게요 📝

잠시만요, 블로그를 읽어보고 있어요... 📖

와, 스타일 파악했어요! ✨
- 친근한 존댓말 톤
- 이모티콘 적당히 사용
- 문장이 짧고 경쾌한 편

이 스타일로 글을 써드릴까요?`,
      delay: 30,
    },
  ],

  'topic-select': [
    {
      content: `스타일 설정 완료! 🎉

자, 이제 오늘 저랑 같이 글을 써봐요!
오늘의 글 주제는 무엇인가요? ✏️`,
      delay: 20,
    },
  ],

  'info-gathering': [
    {
      content: `맛집 리뷰군요! 🍽️
언제 식사하러 가셨어요?`,
      delay: 20,
    },
    {
      content: `어제 다녀오셨군요! 👀
누구랑 같이 가셨어요?`,
      delay: 20,
    },
    {
      content: `와! 친구랑 맛있는 거 먹으러 가셨군요! 😆
정말 재미있는 하루였겠어요~

어느 매장에서 어떤 음식을 드셨어요?
더 알려주세요! 🍴`,
      delay: 25,
    },
    {
      content: `오~ 거기 요즘 핫하잖아요! 🔥
맛이나 분위기, 기억에 남는 거 자유롭게 얘기해주세요! 💬`,
      delay: 20,
    },
    {
      content: `맛있었군요! 👍
혹시 더 알려주실 내용이 있나요?`,
      delay: 20,
    },
  ],

  confirmation: [
    {
      content: `지금까지 얘기해주신 내용 정리해볼게요! 📋

내용이 맞나요?`,
      delay: 20,
    },
  ],

  generating: [
    {
      content: `리뷰를 작성하고 있어요... ✨
잠시만 기다려주세요!`,
      delay: 20,
    },
  ],

  'review-edit': [
    {
      content: `수정했어요! ✨

가격 정보를 추가했어요:
"1인당 약 15,000원 정도로, 이 퀄리티 대비 가성비도 좋은 편이에요!"

이제 마음에 드시나요?`,
      delay: 20,
    },
  ],

  complete: [
    {
      content: `수고하셨어요! 🎊

멋진 리뷰가 완성됐네요!
다음에 또 함께해요! 🌱`,
      delay: 20,
    },
  ],
};

export async function* generateMockStream(
  step: string,
  responseIndex: number = 0
): AsyncGenerator<string> {
  const responses = MOCK_RESPONSES[step] || MOCK_RESPONSES['onboarding'];
  const response = responses[Math.min(responseIndex, responses.length - 1)];

  const content = response.content;
  const delay = response.delay || 20;

  // 글자 단위로 스트리밍 시뮬레이션
  for (const char of content) {
    yield char;
    await sleep(delay);
  }
}

export async function* generateMockReview(): AsyncGenerator<string> {
  const content = `어제 친구와 함께 요즘 핫하다는 맛집에 다녀왔어요! 🍽️

솔직히 처음엔 "과연 소문만큼 맛있을까?" 싶었는데, 결론부터 말하자면... 완전 인정입니다! 👍

매장에 들어서자마자 느껴지는 분위기부터 달랐어요. 깔끔하면서도 아늑한 인테리어에 조명도 은은해서 대화하기 딱 좋았거든요.

메뉴를 주문하고 기다리는 동안 두근두근했는데, 음식이 나오자마자 비주얼에 한 번 놀랐어요! 🤩 플레이팅이 정말 예쁘더라고요.

한 입 먹어보니... 와, 이건 진짜 맛집 맞네요! 재료가 신선한 게 느껴졌고, 간도 딱 적당했어요. 친구랑 서로 눈빛 교환하면서 "여기 찐이다" 했답니다 ㅋㅋ

직원분들도 친절하셔서 기분 좋게 식사할 수 있었어요. 웨이팅이 좀 있긴 했지만, 이 정도 맛이면 충분히 기다릴 만해요!

다음에 또 가고 싶은 맛집으로 등극 ⭐ 주변에 맛집 찾는 분들께 강추합니다!

#맛집추천 #맛있는점심 #친구와함께`;

  // 단어 단위로 스트리밍 (더 자연스러움)
  const words = content.split(/(\s+)/);
  for (const word of words) {
    yield word;
    await sleep(30 + Math.random() * 20); // 30-50ms 랜덤 딜레이
  }
}

export async function* generateMockEditReview(
  originalReview: string,
  _editRequest: string
): AsyncGenerator<string> {
  // 간단한 수정 시뮬레이션 - 가격 정보 추가 예시
  const content = `${originalReview}

1인당 약 15,000원 정도로, 이 퀄리티 대비 가성비도 좋은 편이에요!`;

  // 단어 단위로 스트리밍
  const words = content.split(/(\s+)/);
  for (const word of words) {
    yield word;
    await sleep(25 + Math.random() * 15); // 25-40ms 랜덤 딜레이
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function shouldUseMock(): boolean {
  return (
    process.env.NODE_ENV === 'development' &&
    process.env.USE_REAL_API !== 'true'
  );
}
