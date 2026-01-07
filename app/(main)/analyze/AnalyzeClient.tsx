'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { SectionCard } from '@/shared/ui/SectionCard';
import { StatusMessage } from '@/shared/ui/StatusMessage';
import { DynamicMessage } from '@/shared/ui/DynamicMessage';
import { StyleProfileSummary } from '@/widgets/style-profile-summary';
import { StyleProfileSkeleton } from '@/widgets/style-profile-summary/ui/StyleProfileSkeleton';
import { useAsync } from '@/shared/lib/hooks/useAsync';
import { ANALYSIS_CONFIG, STATUS_MESSAGES } from '@/shared/config/constants';
import {
  analyzeStyle,
  saveStyleProfileToStorage,
  AnalysisPageHeader,
  AnalysisForm,
} from '@/features/analyze-style';
import { loadStyleProfile } from '@/features/review';
import { PAGE_TEXTS } from '@/features/analyze-style/constants/texts';
import type { StyleProfile } from '@/entities/style-profile/model/types';
import type { Session } from 'next-auth';

interface AnalyzeClientPageProps {
  user: Session['user'];
}

export default function AnalyzeClientPage({ user }: AnalyzeClientPageProps) {
  const router = useRouter();
  const [rssUrl, setRssUrl] = useState('');
  const [maxPosts, setMaxPosts] = useState<number>(
    ANALYSIS_CONFIG.DEFAULT_MAX_POSTS
  );
  const [existingProfile, setExistingProfile] = useState<StyleProfile | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadStyleProfile().then((profile) => {
      if (profile) {
        setExistingProfile(profile);
      } else {
        setShowForm(true);
      }
    });
  }, []);

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
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      });
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

  const handleReAnalyze = useCallback(() => {
    setShowForm(true);
    setExistingProfile(null);
  }, []);

  if (!showForm && existingProfile) {
    return (
      <div className='space-y-10'>
        <AnalysisPageHeader />
        <div className='bg-blue-50 p-4 rounded-lg mb-4'>
          <p className='text-sm text-blue-800'>
            안녕하세요, <span className='font-bold'>{user?.name}</span>님! 내
            블로그의 톤을 분석하여 맞춤형 리뷰를 생성해보세요.
          </p>
        </div>
        <SectionCard
          title='나의 스타일 프로필'
          description='이미 분석된 스타일 프로필이 있습니다.'
        >
          <StyleProfileSummary
            styleProfile={existingProfile}
            onNextStep={handleNextStep}
            showCTA={false}
          />
          <div className='mt-8 flex justify-center gap-4'>
            <button
              onClick={handleNextStep}
              className='rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600'
            >
              리뷰 생성하러 가기
            </button>
            <button
              onClick={handleReAnalyze}
              className='rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50'
            >
              새로운 톤 분석하기
            </button>
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className='space-y-10'>
      <AnalysisPageHeader />
      <div className='bg-blue-50 p-4 rounded-lg mb-4'>
        <p className='text-sm text-blue-800'>
          안녕하세요, <span className='font-bold'>{user?.name}</span>님! 내
          블로그의 톤을 분석하여 맞춤형 리뷰를 생성해보세요.
        </p>
      </div>

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

      {/* Loading Skeleton & Dynamic Message */}
      {isLoading && (
        <SectionCard
          title={PAGE_TEXTS.RESULT_CARD_TITLE}
          description='스타일 분석 결과를 기다리는 중입니다...'
        >
          <div className='space-y-8 py-4'>
            <DynamicMessage
              messages={[
                '블로그의 최근 글을 읽어오고 있어요 📖',
                '작성된 글의 스타일과 톤을 분석 중입니다 🧐',
                '거의 다 분석했어요! 조금만 더 기다려주세요 🚀',
              ]}
            />
            <StyleProfileSkeleton />
          </div>
        </SectionCard>
      )}

      {/* Success Result */}
      {styleProfile && !isLoading && (
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
