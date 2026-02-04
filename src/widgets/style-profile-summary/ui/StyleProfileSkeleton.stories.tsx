import type { Meta, StoryObj } from '@storybook/react';
import { StyleProfileSkeleton } from './StyleProfileSkeleton';
import { StyleProfileSummary } from './StyleProfileSummary';
import type { StyleProfile } from '@/shared/types/style-profile';

const meta = {
  title: 'Skeleton/StyleProfile',
  component: StyleProfileSkeleton,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StyleProfileSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

const MOCK_STYLE_PROFILE: StyleProfile = {
  writing_style: {
    formality: '친근하고 편안한 구어체',
    tone: '따뜻하고 솔직한 톤',
    emotion: '긍정적이고 활기찬 감정',
    sentence_length: '짧고 간결한 문장',
    pacing: '빠르고 경쾌한 전개',
    habitual_phrases: [
      '정말 맛있어요',
      '강추합니다',
      '대박이에요',
      '꼭 가보세요',
      '후회 안 하실 거예요',
    ],
    emoji_usage: '적당히 사용 (감정 강조)',
    style_notes: '친근하고 솔직한 리뷰 스타일',
  },
  structure_pattern: {
    overall_flow: '도입 → 본문 (경험 중심) → 마무리',
    opening_style: '간단한 소개로 시작',
    frequent_sections: ['분위기', '메뉴', '가격', '총평'],
  },
  visual_structure: {
    line_breaks: '단락 사이 여백 있음',
    paragraph_pattern: '짧은 단락, 명확한 구분',
  },
  keyword_profile: {
    frequent_words: ['맛집', '추천', '방문', '분위기', '가격', '메뉴'],
    topic_bias: '맛집 리뷰',
  },
};

export const Default: Story = {};

// Proper React component for WithMockData story
function StyleProfileWithMockData() {
  return (
    <div className='max-w-2xl'>
      <StyleProfileSummary
        styleProfile={MOCK_STYLE_PROFILE}
        onNextStep={() => console.log('Next step clicked')}
        showCTA={true}
      />
    </div>
  );
}

export const WithMockData: Story = {
  render: () => <StyleProfileWithMockData />,
};

// Proper React component for Comparison story
function StyleProfileComparison() {
  return (
    <div className='space-y-8'>
      <div>
        <h2 className='mb-4 text-xl font-bold'>Skeleton (Loading State)</h2>
        <div className='max-w-2xl rounded-lg border-2 border-blue-200 p-4'>
          <StyleProfileSkeleton />
        </div>
      </div>

      <div>
        <h2 className='mb-4 text-xl font-bold'>Actual Component (Loaded)</h2>
        <div className='max-w-2xl rounded-lg border-2 border-green-200 p-4'>
          <StyleProfileSummary
            styleProfile={MOCK_STYLE_PROFILE}
            onNextStep={() => console.log('Next step clicked')}
            showCTA={true}
          />
        </div>
      </div>
    </div>
  );
}

export const Comparison: Story = {
  render: () => <StyleProfileComparison />,
};
