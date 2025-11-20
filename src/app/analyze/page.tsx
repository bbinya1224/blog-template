'use client';

/**
 * 스타일 분석 페이지
 * - RSS 크롤링 → 스타일 분석 → 결과 표시
 * - localStorage에 자동 저장
 * - 함수형 프로그래밍 패턴 적용
 */

import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { SectionCard } from '@/components/section-card';
import { StepIndicator } from '@/components/step-indicator';
import { StyleProfileSummary } from '@/components/style-profile-summary';
import { useAsync } from '@/hooks/useAsync';
import type { StyleProfile } from '@/lib/types';
import {
  API_ENDPOINTS,
  STATUS_MESSAGES,
  ANALYSIS_CONFIG,
  STORAGE_KEYS,
} from '@/lib/constants';

type StepStatus = 'current' | 'completed' | 'upcoming';

interface Step {
  label: string;
  status: StepStatus;
}

// 스타일 분석 실행 함수 (순수 함수로 분리)
const analyzeStyle = async (
  rssUrl: string,
  maxPosts: number,
): Promise<StyleProfile> => {
  // 1. RSS Fetch
  const fetchResponse = await fetch(API_ENDPOINTS.FETCH_RSS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rssUrl, maxPosts }),
  });

  if (!fetchResponse.ok) {
    throw new Error('RSS를 읽어오지 못했습니다.');
  }

  // 2. Style Analysis
  const analysisResponse = await fetch(API_ENDPOINTS.ANALYZE_STYLE, {
    method: 'POST',
  });

  if (!analysisResponse.ok) {
    throw new Error(STATUS_MESSAGES.ANALYSIS_ERROR);
  }

  const data = (await analysisResponse.json()) as {
    styleProfile: StyleProfile;
  };

  return data.styleProfile;
};

// localStorage 저장 유틸 (순수 함수)
const saveStyleProfileToStorage = (profile: StyleProfile): void => {
  if (typeof window === 'undefined') return;

  localStorage.setItem(STORAGE_KEYS.STYLE_PROFILE, JSON.stringify(profile));
  localStorage.setItem(STORAGE_KEYS.STYLE_PROFILE_DATE, new Date().toISOString());
};

export default function AnalyzePage() {
  const router = useRouter();
  const [rssUrl, setRssUrl] = useState('');
  const [maxPosts, setMaxPosts] = useState(ANALYSIS_CONFIG.DEFAULT_MAX_POSTS);
  const [statusMessage, setStatusMessage] = useState('');

  // 비동기 작업 관리 (useAsync 훅 사용)
  const {
    data: styleProfile,
    execute: executeAnalysis,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useAsync(analyzeStyle);

  // 계산된 값들 (메모이제이션)
  const isDisabled = useMemo(
    () => isLoading || !rssUrl.trim(),
    [isLoading, rssUrl],
  );

  const steps: Step[] = useMemo(
    () => [
      {
        label: '스타일 분석',
        status: isSuccess ? 'completed' : 'current',
      },
      { label: '리뷰 생성', status: 'upcoming' },
      { label: '수정/보관', status: 'upcoming' },
    ],
    [isSuccess],
  );

  // 폼 제출 핸들러
  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setStatusMessage(STATUS_MESSAGES.FETCHING_RSS);
      const profile = await executeAnalysis(rssUrl, maxPosts);

      if (profile) {
        saveStyleProfileToStorage(profile);
        setStatusMessage(STATUS_MESSAGES.ANALYSIS_COMPLETE);
      } else {
        setStatusMessage(error || STATUS_MESSAGES.ANALYSIS_ERROR);
      }
    },
    [rssUrl, maxPosts, executeAnalysis, error],
  );

  // 다음 단계로 이동
  const handleNextStep = useCallback(() => {
    router.push('/generate');
  }, [router]);

  return (
    <div className="space-y-10">
      <StepIndicator steps={steps} />

      {/* 페이지 헤더 */}
      <PageHeader />

      {/* RSS 입력 폼 */}
      <SectionCard
        title="RSS 정보 입력"
        description="네이버 블로그 RSS 주소 형식: https://rss.blog.naver.com/블로그ID.xml"
        footer={statusMessage && <StatusMessage message={statusMessage} isError={isError} />}
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
          title="✅ 분석 완료"
          description="당신의 블로그 스타일이 성공적으로 분석되었습니다."
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

// ===================
// 하위 컴포넌트들
// ===================

const PageHeader = () => (
  <section className="space-y-3">
    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
      Step 1 · Analyze
    </p>
    <div className="space-y-2">
      <h1 className="text-3xl font-semibold text-gray-900">
        RSS 기반으로 내 블로그 톤을 추출해요.
      </h1>
      <p className="text-gray-600">
        최근 {ANALYSIS_CONFIG.RECOMMENDED_MIN}~{ANALYSIS_CONFIG.RECOMMENDED_MAX}개의
        포스트를 읽고 문체, 말투, 문단 구조를 JSON으로 정리합니다.
      </p>
    </div>
  </section>
);

interface StatusMessageProps {
  message: string;
  isError: boolean;
}

const StatusMessage = ({ message, isError }: StatusMessageProps) => (
  <p className={`text-sm ${isError ? 'text-red-600' : 'text-blue-600'}`}>
    {message}
  </p>
);

interface AnalysisFormProps {
  rssUrl: string;
  maxPosts: number;
  isDisabled: boolean;
  isLoading: boolean;
  onRssUrlChange: (value: string) => void;
  onMaxPostsChange: (value: number) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const AnalysisForm = ({
  rssUrl,
  maxPosts,
  isDisabled,
  isLoading,
  onRssUrlChange,
  onMaxPostsChange,
  onSubmit,
}: AnalysisFormProps) => (
  <form className="space-y-5" onSubmit={onSubmit}>
    <div>
      <label htmlFor="rssUrl" className="text-sm font-medium text-gray-700">
        RSS URL
      </label>
      <input
        id="rssUrl"
        name="rssUrl"
        type="url"
        required
        value={rssUrl}
        onChange={(e) => onRssUrlChange(e.target.value)}
        placeholder="https://rss.blog.naver.com/블로그ID.xml"
        className="input-base"
      />
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label htmlFor="maxPosts" className="text-sm font-medium text-gray-700">
          최근 글 개수
        </label>
        <input
          id="maxPosts"
          name="maxPosts"
          type="number"
          min={ANALYSIS_CONFIG.MIN_POSTS}
          max={ANALYSIS_CONFIG.MAX_POSTS}
          value={maxPosts}
          onChange={(e) => onMaxPostsChange(Number(e.target.value))}
          className="input-base"
        />
        <p className="mt-2 text-sm text-gray-500">
          추천 범위 {ANALYSIS_CONFIG.RECOMMENDED_MIN}~
          {ANALYSIS_CONFIG.RECOMMENDED_MAX}개, 각 포스트의 일부만 사용하여 스타일을
          분석합니다.
        </p>
      </div>
    </div>

    <button type="submit" disabled={isDisabled} className="btn-primary w-full">
      {isLoading ? '분석 중…' : '스타일 분석하기'}
    </button>
  </form>
);
