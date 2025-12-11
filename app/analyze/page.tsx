'use client';

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
import { PAGE_TEXTS } from '@/features/analyze-style/constants/texts';

export default function AnalyzePage() {
  const router = useRouter();
  const [rssUrl, setRssUrl] = useState(''); // 타입 추론 가능
  const [maxPosts, setMaxPosts] = useState<number>(
    ANALYSIS_CONFIG.DEFAULT_MAX_POSTS
  );

  const {
    data: styleProfile,
    execute: executeAnalysis,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useAsync(analyzeStyle);

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
      <StepIndicator />

      <AnalysisPageHeader />

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
        <div className="mt-4 text-center text-sm text-gray-500">
          혹시 RSS가 안 되시나요?
          <a href="/analyze/pdf" className="text-blue-500 hover:underline">
            PDF로 분석하기
          </a>
        </div>
      </SectionCard>

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
