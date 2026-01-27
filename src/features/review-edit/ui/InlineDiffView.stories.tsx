import type { Meta, StoryObj } from '@storybook/react';
import { InlineDiffView } from './InlineDiffView';

const meta = {
  title: 'Features/ReviewEdit/InlineDiffView',
  component: InlineDiffView,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    show: {
      control: 'boolean',
      description: 'diff 뷰를 표시할지 여부',
    },
    onApply: { action: 'onApply' },
    onRetry: { action: 'onRetry' },
    onCancel: { action: 'onCancel' },
  },
  args: {
    onApply: () => {},
    onRetry: () => {},
    onCancel: () => {},
  },
} satisfies Meta<typeof InlineDiffView>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock 데이터
const ORIGINAL_REVIEW = `이 집 피자가 정말 맛있었다. 치즈가 진짜 많았고 가격도 괜찮았다. 분위기도 좋고 직원들도 친절했다.`;

const EDITED_REVIEW_CASUAL = `이곳의 피자는 정말 맛있었어요! 치즈가 풍성하게 녹아내렸고, 가격도 합리적이었죠. 분위기도 아늑하고 직원들도 너무 친절하셨어요. ❤️`;

const EDITED_REVIEW_FORMAL = `해당 매장의 피자는 매우 훌륭했습니다. 치즈의 양이 풍부했으며 가격 또한 적정했습니다. 매장의 분위기가 쾌적했고 직원들의 응대가 정중했습니다.`;

const EDITED_REVIEW_DETAILED = `이 집 피자가 정말 맛있었다. 특히 모짜렐라 치즈가 진짜 많았고, 도우가 바삭하면서도 쫄깃해서 식감이 훌륭했다. 1인 1피자 기준으로 15,000원 정도의 가격도 괜찮았다. 인테리어는 모던한 스타일이라 분위기도 좋고, 직원들도 주문할 때 메뉴 추천을 친절하게 해줬다.`;

const LONG_ORIGINAL = `제주도 여행 중에 들른 이 카페는 정말 인상적이었다. 오션뷰가 너무 좋았고 커피도 맛있었다. 디저트는 그냥 그랬다. 가격이 좀 비싼 편이지만 뷰를 생각하면 괜찮다. 재방문 의사 있음.`;

const LONG_EDITED = `제주도 여행 중에 우연히 발견한 이 카페는 정말 특별한 경험이었어요. 탁 트인 오션뷰 덕분에 시원한 바다를 바라보며 여유로운 시간을 보낼 수 있었고, 특히 아메리카노는 산미와 바디감이 적절히 조화로워 정말 맛있었습니다.

케이크류 디저트는 평범한 맛이었지만, 그래도 뷰와 함께하니 충분히 만족스러웠어요. 가격대는 커피 한 잔에 8,000원 정도로 조금 높은 편이지만, 이런 멋진 오션뷰를 생각하면 충분히 가치가 있다고 생각합니다.

날씨 좋은 날 다시 방문하고 싶은 곳이에요! 특히 일몰 시간대를 추천드려요. ☕🌅`;

/**
 * 기본 상태 - 감성적인 말투로 변경
 */
export const Default: Story = {
  args: {
    show: true,
    originalContent: ORIGINAL_REVIEW,
    editedContent: EDITED_REVIEW_CASUAL,
    editRequest: '감성적인 말투로 바꿔줘',
  },
};

/**
 * 격식있는 표현으로 변경
 */
export const FormalTone: Story = {
  args: {
    show: true,
    originalContent: ORIGINAL_REVIEW,
    editedContent: EDITED_REVIEW_FORMAL,
    editRequest: '격식있는 표현으로 바꿔줘',
  },
};

/**
 * 더 자세하게 작성
 */
export const Detailed: Story = {
  args: {
    show: true,
    originalContent: ORIGINAL_REVIEW,
    editedContent: EDITED_REVIEW_DETAILED,
    editRequest: '메뉴 설명을 더 자세히 해줘',
  },
};

/**
 * 긴 텍스트 비교
 */
export const LongText: Story = {
  args: {
    show: true,
    originalContent: LONG_ORIGINAL,
    editedContent: LONG_EDITED,
    editRequest: '좀 더 감성적이고 자세하게 작성해줘',
  },
};

/**
 * 숨김 상태 (show=false)
 */
export const Hidden: Story = {
  args: {
    show: false,
    originalContent: ORIGINAL_REVIEW,
    editedContent: EDITED_REVIEW_CASUAL,
    editRequest: '감성적인 말투로 바꿔줘',
  },
};

/**
 * 변경사항이 거의 없는 경우
 */
export const MinimalChanges: Story = {
  args: {
    show: true,
    originalContent: '이 집 피자가 정말 맛있었다.',
    editedContent: '이 집 피자가 진짜 맛있었다.',
    editRequest: '좀 더 강조해줘',
  },
};

/**
 * 전체 시나리오 (애니메이션 포함)
 */
export const FullScenario: Story = {
  args: {
    show: true,
    originalContent: ORIGINAL_REVIEW,
    editedContent: EDITED_REVIEW_CASUAL,
    editRequest: '감성적인 말투로 바꿔줘',
  },
  render: (args) => (
    <div className='space-y-4'>
      <div className='bg-white rounded-xl border border-gray-200 p-6'>
        <h3 className='text-lg font-bold mb-4'>리뷰 내용</h3>
        <div className='bg-slate-50 rounded-lg p-4 text-sm'>
          <pre className='whitespace-pre-wrap font-sans'>
            {args.originalContent}
          </pre>
        </div>
        <InlineDiffView {...args} />
      </div>
    </div>
  ),
};
