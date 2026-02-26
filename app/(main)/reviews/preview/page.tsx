'use client';

import { useState } from 'react';
import { ReviewDetailViewer } from '@/widgets/review-detail/ui/ReviewDetailViewer';
import { InlineDiffView } from '@/features/review-edit';
import { SectionCard } from '@/shared/ui/SectionCard';
import type { Review } from '@/entities/review';

const MOCK_REVIEW: Review = {
  id: 'preview-mock',
  storeName: '을지로 골목식당',
  date: '2026-02-20',
  createdAt: '2026-02-20T12:00:00Z',
  characterCount: 342,
  content: `을지로 골목 안쪽에 숨어 있는 이 식당은, 간판이 워낙 작아서 모르고 지나치기 십상이다. 하지만 안으로 들어서면 분위기가 확 달라진다. 나무 테이블과 따뜻한 조명이 어우러진 공간에서, 정성스럽게 차려진 한 상이 나온다.

이날 주문한 건 된장찌개 정식. 직접 담근 된장으로 끓인 찌개는 깊고 구수한 맛이 일품이었다. 반찬도 하나하나 정갈했고, 특히 계란말이가 부드럽고 촉촉해서 인상적이었다.

가격도 합리적이고, 사장님의 따뜻한 인사까지. 을지로에서 조용히 점심 한 끼 하고 싶을 때 다시 찾고 싶은 곳이다.`,
  conversation: [
    { role: 'assistant', content: '안녕하세요! 맛집 리뷰를 도와드릴게요. 어떤 음식점을 다녀오셨나요?', type: 'text' },
    { role: 'user', content: '을지로 골목식당이요', type: 'text' },
    { role: 'assistant', content: '을지로 골목식당이군요! 언제 방문하셨나요?', type: 'text' },
    { role: 'user', content: '2월 20일이요', type: 'text' },
    { role: 'assistant', content: '2월 20일에 다녀오셨군요! 어떤 메뉴를 드셨나요?', type: 'text' },
    { role: 'user', content: '된장찌개 정식 먹었어요. 된장이 직접 담근 거라 맛있었어요', type: 'text' },
    { role: 'assistant', content: '직접 담근 된장으로 만든 찌개라니, 정성이 느껴지네요! 분위기는 어땠나요?', type: 'text' },
    { role: 'user', content: '간판이 작아서 찾기 어려운데 안은 나무 테이블이랑 조명이 좋았어요', type: 'text' },
    { role: 'assistant', content: '숨은 맛집 느낌이네요! 반찬은 어땠나요?', type: 'text' },
    { role: 'user', content: '반찬 정갈하고 계란말이가 특히 맛있었어요. 가격도 괜찮고 사장님도 친절해요', type: 'text' },
    { role: 'assistant', content: '리뷰를 작성하고 있어요, 잠시만 기다려주세요!', type: 'text' },
  ],
};

const MOCK_ORIGINAL = MOCK_REVIEW.content;

const MOCK_EDITED = `을지로 골목 깊숙이 자리한 이 식당은, 간판이 소박해 자칫 스쳐 지나가기 쉽다. 하지만 문을 열고 들어서는 순간, 따스한 나무 테이블과 은은한 조명이 반겨주는 아늑한 공간이 펼쳐진다.

이날의 선택은 된장찌개 정식. 사장님이 직접 담근 된장으로 정성껏 끓여낸 찌개는, 한 숟가락에 깊고 구수한 풍미가 입안 가득 번졌다. 곁들여진 반찬들도 하나하나 손맛이 느껴졌고, 그중에서도 겹겹이 부드러운 계란말이가 특히 기억에 남는다.

합리적인 가격에, 나갈 때 건네시는 사장님의 따뜻한 한마디까지. 을지로에서 혼자만 알고 싶은 조용한 점심 한 끼가 필요할 때, 다시 발걸음을 옮기고 싶은 곳이다.`;

export default function ReviewPreviewPage() {
  const [activeTab, setActiveTab] = useState<'full' | 'diff'>('full');

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
        디자인 프리뷰 페이지 — 목 데이터로 렌더링됩니다
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('full')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeTab === 'full'
              ? 'bg-stone-900 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          전체 레이아웃
        </button>
        <button
          onClick={() => setActiveTab('diff')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            activeTab === 'diff'
              ? 'bg-stone-900 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          AI 수정 Diff 뷰
        </button>
      </div>

      {activeTab === 'full' && (
        <>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 md:text-3xl">
              {MOCK_REVIEW.storeName}
            </h1>
            <p className="mt-1.5 text-sm text-stone-400">
              {MOCK_REVIEW.date} · {MOCK_REVIEW.characterCount.toLocaleString()}자
            </p>
          </div>
          <ReviewDetailViewer initialReview={MOCK_REVIEW} />
        </>
      )}

      {activeTab === 'diff' && (
        <>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 md:text-3xl">
              {MOCK_REVIEW.storeName}
            </h1>
            <p className="mt-1.5 text-sm text-stone-400">
              {MOCK_REVIEW.date} · {MOCK_REVIEW.characterCount.toLocaleString()}자
            </p>
          </div>
          <SectionCard
            title="AI 수정 요청"
            description="AI에게 리뷰 수정을 요청할 수 있습니다."
          >
            <div className="space-y-4">
              <textarea
                defaultValue="조금 더 감성적인 말투로 바꿔줘"
                className="w-full rounded-2xl border border-stone-200 p-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                rows={3}
                disabled
              />
              <button
                disabled
                className="w-full rounded-2xl bg-stone-400 py-3 text-sm font-semibold text-white"
              >
                수정 요청하기
              </button>

              <InlineDiffView
                show={true}
                originalContent={MOCK_ORIGINAL}
                editedContent={MOCK_EDITED}
                editRequest="조금 더 감성적인 말투로 바꿔줘"
                onApply={() => alert('적용하기 클릭')}
                onRetry={() => alert('다시 요청하기 클릭')}
                onCancel={() => alert('취소 클릭')}
              />
            </div>
          </SectionCard>
        </>
      )}
    </div>
  );
}
