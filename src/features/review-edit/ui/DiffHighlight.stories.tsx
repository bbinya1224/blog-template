import type { Meta, StoryObj } from '@storybook/react';
import { DiffHighlight } from './DiffHighlight';

const meta = {
  title: 'Features/ReviewEdit/DiffHighlight',
  component: DiffHighlight,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['before', 'after'],
      description: 'diff 표시 모드 (before: 삭제 표시, after: 추가 표시)',
    },
  },
} satisfies Meta<typeof DiffHighlight>;

export default meta;
type Story = StoryObj<typeof meta>;

const ORIGINAL = '이 집 피자가 정말 맛있었다. 치즈가 진짜 많았고 가격도 괜찮았다.';
const EDITED = '이곳의 피자는 정말 맛있었어요! 치즈가 풍성하게 녹아내렸고, 가격도 합리적이었죠. ❤️';

/**
 * Before 모드 - 삭제된 텍스트 표시
 */
export const BeforeMode: Story = {
  args: {
    content: ORIGINAL,
    newContent: EDITED,
    mode: 'before',
  },
};

/**
 * After 모드 - 추가된 텍스트 표시
 */
export const AfterMode: Story = {
  args: {
    content: EDITED,
    oldContent: ORIGINAL,
    mode: 'after',
  },
};

/**
 * 변경사항 없음
 */
export const NoChanges: Story = {
  args: {
    content: '변경사항이 없는 텍스트입니다.',
    mode: 'before',
  },
};

/**
 * Side-by-Side 비교
 */
export const SideBySide: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700 border-b pb-2">
          수정 전
        </h4>
        <div className="bg-gray-50 rounded-lg p-4 text-sm">
          <DiffHighlight
            content={ORIGINAL}
            newContent={EDITED}
            mode="before"
          />
        </div>
      </div>
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700 border-b pb-2">
          수정 후
        </h4>
        <div className="bg-gray-50 rounded-lg p-4 text-sm">
          <DiffHighlight content={EDITED} oldContent={ORIGINAL} mode="after" />
        </div>
      </div>
    </div>
  ),
};

/**
 * 긴 텍스트 diff
 */
export const LongText: Story = {
  render: () => {
    const longOriginal = `제주도 여행 중에 들른 이 카페는 정말 인상적이었다. 오션뷰가 너무 좋았고 커피도 맛있었다. 디저트는 그냥 그랬다. 가격이 좀 비싼 편이지만 뷰를 생각하면 괜찮다. 재방문 의사 있음.`;

    const longEdited = `제주도 여행 중에 우연히 발견한 이 카페는 정말 특별한 경험이었어요. 탁 트인 오션뷰 덕분에 시원한 바다를 바라보며 여유로운 시간을 보낼 수 있었고, 특히 아메리카노는 산미와 바디감이 적절히 조화로워 정말 맛있었습니다. 케이크류 디저트는 평범한 맛이었지만, 그래도 뷰와 함께하니 충분히 만족스러웠어요. 가격대는 조금 높은 편이지만, 이런 멋진 오션뷰를 생각하면 충분히 가치가 있다고 생각합니다. 날씨 좋은 날 다시 방문하고 싶은 곳이에요! ☕`;

    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">수정 전</h4>
          <div className="bg-gray-50 rounded-lg p-4 text-sm max-h-[300px] overflow-y-auto">
            <DiffHighlight
              content={longOriginal}
              newContent={longEdited}
              mode="before"
            />
          </div>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">수정 후</h4>
          <div className="bg-gray-50 rounded-lg p-4 text-sm max-h-[300px] overflow-y-auto">
            <DiffHighlight
              content={longEdited}
              oldContent={longOriginal}
              mode="after"
            />
          </div>
        </div>
      </div>
    );
  },
};
