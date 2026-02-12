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
