import { SectionCard } from '@/shared/ui/SectionCard';
import type { StyleProfile } from '@/shared/types/style-profile';

interface StyleProfileDisplayProps {
  styleProfile: StyleProfile | null;
}

export const StyleProfileDisplay = ({
  styleProfile,
}: StyleProfileDisplayProps) => {
  if (!styleProfile) {
    return (
      <SectionCard title="스타일 프로필 없음">
        <p className="text-sm text-gray-600">
          아직 스타일 분석이 완료되지 않은 것 같아요. 먼저{' '}
          <a
            className="font-semibold text-blue-500 underline-offset-2 hover:underline"
            href="/analyze"
          >
            스타일 분석
          </a>{' '}
          페이지에서 프로필을 생성해주세요.
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="적용된 스타일"
      description="최근 분석된 결과를 요약해서 보여줍니다."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-1 text-sm text-gray-700">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
            문체
          </p>
          <p>{styleProfile.writing_style.formality}</p>
          <p>{styleProfile.writing_style.tone}</p>
          <p>{styleProfile.writing_style.emotion}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
            구조
          </p>
          <div className="mt-1 text-sm text-gray-700 space-y-2">
            <p>
              <span className="font-medium text-gray-900">도입부:</span>{' '}
              {styleProfile.structure_pattern.opening_style}
            </p>
            <div>
              <span className="font-medium text-gray-900">자주 쓰는 섹션:</span>
              <ul className="list-disc list-inside text-gray-600 mt-1 pl-1">
                {styleProfile.structure_pattern.frequent_sections
                  .slice(0, 3)
                  .map((section, index) => (
                    <li key={index}>{section}</li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
};
