import type { Meta, StoryObj } from '@storybook/react';
import { ReviewResultSkeleton } from './ReviewResultSkeleton';
import { ReviewResult } from './ReviewResult';
import { useState } from 'react';

const meta = {
  title: 'Skeleton/ReviewResult',
  component: ReviewResultSkeleton,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ReviewResultSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

const MOCK_REVIEW = `서울 마포구에 위치한 연남동 파스타 맛집 '라비타'를 다녀왔습니다.

## 분위기
작은 골목 안쪽에 자리잡고 있어서, 처음 찾아가실 때는 조금 헤매실 수 있어요. 하지만 그만큼 조용하고 아늑한 분위기를 제공합니다. 

테이블은 총 6개 정도로 규모가 크지 않아서 미리 예약하시고 가시는 걸 추천드려요.

## 메뉴
저는 로제 파스타(15,000원)와 크림 파스타(14,000원)를 주문했습니다. 

로제 파스타는 생각보다 크림이 진하지 않고 토마토 향이 은은하게 느껴졌어요. 파스타 면발도 알덴테로 잘 삶아져 있었습니다.

크림 파스타는 정말 고소하고 부드러웠는데, 베이컨이 듬뿍 들어가 있어서 만족스러웠어요.

## 총평
가격 대비 양도 적당하고, 맛도 훌륭했습니다. 다만 웨이팅이 길 수 있으니 시간 여유를 두고 방문하시면 좋을 것 같아요!

평점: ⭐⭐⭐⭐ (4/5)`;

export const Default: Story = {};

function ReviewResultWithMockData() {
  const [editRequest, setEditRequest] = useState('');

  return (
    <div className='max-w-3xl'>
      <ReviewResult
        review={MOCK_REVIEW}
        editRequest={editRequest}
        isCopying={false}
        isEditing={false}
        onEditRequestChange={setEditRequest}
        onCopy={() => console.log('Copy clicked')}
        onEdit={() => console.log('Edit clicked')}
      />
    </div>
  );
}

export const WithMockData: Story = {
  render: () => <ReviewResultWithMockData />,
};

function ReviewResultComparison() {
  const [editRequest, setEditRequest] = useState('');

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='mb-4 text-xl font-bold'>Skeleton (Loading State)</h2>
        <div className='max-w-3xl rounded-lg border-2 border-blue-200 p-4'>
          <ReviewResultSkeleton />
        </div>
      </div>

      <div>
        <h2 className='mb-4 text-xl font-bold'>Actual Component (Loaded)</h2>
        <div className='max-w-3xl rounded-lg border-2 border-green-200 p-4'>
          <ReviewResult
            review={MOCK_REVIEW}
            editRequest={editRequest}
            isCopying={false}
            isEditing={false}
            onEditRequestChange={setEditRequest}
            onCopy={() => console.log('Copy clicked')}
            onEdit={() => console.log('Edit clicked')}
          />
        </div>
      </div>
    </div>
  );
}

export const Comparison: Story = {
  render: () => <ReviewResultComparison />,
};
