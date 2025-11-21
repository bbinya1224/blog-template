'use client';

/**
 * 스타일 분석 페이지
 * - FSD 아키텍처: 얇은 조합 레이어 (Composition Layer)
 * - 비즈니스 로직은 features/analyze-style에 위임
 * - UI 컴포넌트 조합만 담당
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { SectionCard } from '@/shared/ui/section-card';
import { StepIndicator } from '@/shared/ui/step-indicator';
import { StatusMessage } from '@/shared/ui/status-message';
import { StyleProfileSummary } from '@/widgets/style-profile-summary';
import { useAsync } from '@/shared/lib/hooks/useAsync';
import { ANALYSIS_CONFIG, STATUS_MESSAGES } from '@/shared/config/constants';
import {
  analyzeStyle,
  saveStyleProfileToStorage,
  AnalysisPageHeader,
  AnalysisForm,
} from '@/features/analyze-style';
import { PAGE_TEXTS } from './texts';

type StepStatus = 'current' | 'completed' | 'upcoming';

interface Step {
  label: string;
  status: StepStatus;
}

export default function AnalyzePage() {
  const router = useRouter();
  const [rssUrl, setRssUrl] = useState(''); // 타입 추론 가능
  const [maxPosts, setMaxPosts] = useState<number>(
    ANALYSIS_CONFIG.DEFAULT_MAX_POSTS
  );

  // 비동기 작업 관리
  const {
    data: styleProfile,
    execute: executeAnalysis,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useAsync(analyzeStyle);

  // 계산된 값들
  const isDisabled = useMemo(
    () => isLoading || !rssUrl.trim(),
    [isLoading, rssUrl]
  );

  const statusMessage = useMemo(() => {
    if (isLoading) return STATUS_MESSAGES.FETCHING_RSS;
    if (isError) return error || STATUS_MESSAGES.ANALYSIS_ERROR;
    if (isSuccess) return STATUS_MESSAGES.ANALYSIS_COMPLETE;
    return '';
  }, [isLoading, isError, isSuccess, error]);

  useEffect(() => {
    if (isSuccess && styleProfile) {
      saveStyleProfileToStorage(styleProfile);
    }
  }, [isSuccess, styleProfile]);

  const steps: Step[] = useMemo(
    () => [
      {
        label: PAGE_TEXTS.STEP_ANALYZE,
        status: isSuccess ? 'completed' : 'current',
      },
      { label: PAGE_TEXTS.STEP_GENERATE, status: 'upcoming' },
      { label: PAGE_TEXTS.STEP_SAVE, status: 'upcoming' },
    ],
    [isSuccess]
  );

  // 이벤트 핸들러
  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      executeAnalysis(rssUrl, maxPosts);
    },
    [rssUrl, maxPosts, executeAnalysis]
  );

  const handleNextStep = useCallback(() => {
    router.push('/generate');
  }, [router]);

  return (
    <div className='space-y-10'>
      <StepIndicator steps={steps} />

      {/* 페이지 헤더 */}
      <AnalysisPageHeader />

      {/* RSS 입력 폼 */}
      <SectionCard
        title={PAGE_TEXTS.RSS_FORM_TITLE}
        description={PAGE_TEXTS.RSS_FORM_DESCRIPTION}
        footer={
          statusMessage && (
            <StatusMessage message={statusMessage} isError={isError} />
          )
        }
      >
        <AnalysisForm
          rssUrl={rssUrl}
          maxPosts={maxPosts}
          isDisabled={isDisabled}
          isLoading={isLoading}
          onRssUrlChange={setRssUrl}
          onMaxPostsChange={setMaxPosts}
          onSubmit={handleSubmit}
        />
      </SectionCard>

      {/* 분석 결과 */}
      {styleProfile && (
        <SectionCard
          title={PAGE_TEXTS.RESULT_CARD_TITLE}
          description={PAGE_TEXTS.RESULT_CARD_DESCRIPTION}
        >
          <StyleProfileSummary
            styleProfile={styleProfile}
            onNextStep={handleNextStep}
            showCTA
          />
        </SectionCard>
      )}
    </div>
  );
}
