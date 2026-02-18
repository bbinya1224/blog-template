import type { StyleProfile } from '@/shared/types/styleProfile';

interface StyleProfileSummaryProps {
  styleProfile: StyleProfile;
  onNextStep?: () => void;
  showCTA?: boolean;
}

export const StyleProfileSummary = ({
  styleProfile,
  onNextStep,
  showCTA = true,
}: StyleProfileSummaryProps) => {
  return (
    <div className='space-y-6'>
      <div className='card-info'>
        <h3 className='mb-3 text-sm font-bold text-blue-900'>
          📝 핵심 스타일 특징
        </h3>
        <div className='space-y-2 text-sm text-blue-800'>
          <KeyValuePair
            label='문체'
            value={styleProfile.writing_style.formality}
          />
          <KeyValuePair label='톤' value={styleProfile.writing_style.tone} />
          <KeyValuePair
            label='감정'
            value={styleProfile.writing_style.emotion}
          />
        </div>
      </div>

      <HabitualPhrases phrases={styleProfile.writing_style.habitual_phrases} />

      <StyleProfileDetails styleProfile={styleProfile} />

      {showCTA && onNextStep && <NextStepCTA onNext={onNextStep} />}
    </div>
  );
};

const KeyValuePair = ({ label, value }: { label: string; value: string }) => (
  <p>
    <span className='font-semibold'>{label}:</span> {value}
  </p>
);

const HabitualPhrases = ({ phrases }: { phrases: string[] }) => (
  <div>
    <p className='mb-3 text-sm font-semibold text-gray-700'>
      💬 자주 사용하는 표현
    </p>
    <div className='flex flex-wrap gap-2'>
      {phrases.map((phrase) => (
        <span
          key={phrase}
          className='rounded-full bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-700'
        >
          &ldquo;{phrase}&rdquo;
        </span>
      ))}
    </div>
  </div>
);

const StyleProfileDetails = ({
  styleProfile,
}: {
  styleProfile: StyleProfile;
}) => (
  <details className='group'>
    <summary className='cursor-pointer text-sm font-semibold text-gray-600 hover:text-gray-900'>
      <span className='inline-block transition-transform group-open:rotate-90'>
        ▶
      </span>{' '}
      상세 분석 결과 보기
    </summary>
    <div className='mt-4 space-y-4 rounded-lg bg-gray-50 p-4'>
      <DetailSection
        title='문장 구조'
        content={`${styleProfile.writing_style.sentence_length} · ${styleProfile.writing_style.pacing}`}
      />
      <DetailSection
        title='글 구조 패턴'
        content={styleProfile.structure_pattern.overall_flow}
        subContent={styleProfile.visual_structure.paragraph_pattern}
      />
      <DetailSection title='주요 섹션'>
        <div className='flex flex-wrap gap-2'>
          {styleProfile.structure_pattern.frequent_sections.map((section) => (
            <span
              key={section}
              className='rounded-md bg-gray-200 px-2 py-1 text-xs text-gray-700'
            >
              {section}
            </span>
          ))}
        </div>
      </DetailSection>
    </div>
  </details>
);

const DetailSection = ({
  title,
  content,
  subContent,
  children,
}: {
  title: string;
  content?: string;
  subContent?: string;
  children?: React.ReactNode;
}) => (
  <div>
    <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500'>
      {title}
    </p>
    {content && <p className='text-sm text-gray-700'>{content}</p>}
    {subContent && <p className='mt-1 text-sm text-gray-600'>{subContent}</p>}
    {children}
  </div>
);

const NextStepCTA = ({ onNext }: { onNext: () => void }) => (
  <div className='card-success flex items-center justify-between'>
    <div>
      <p className='font-semibold text-green-900'>다음 단계</p>
      <p className='text-sm text-green-700'>
        분석된 스타일로 리뷰를 생성해보세요
      </p>
    </div>
    <button onClick={onNext} className='btn-success'>
      리뷰 생성하기 →
    </button>
  </div>
);
