/**
 * 스타일 분석 폼 컴포넌트
 * - RSS URL 입력
 * - 최근 글 개수 설정
 * - 분석 실행
 */

import type { Dispatch, FormEvent, SetStateAction } from 'react';
// TODO: 아래 컴포넌트들은 shared/ui 레이어로 이동하는 것을 권장합니다.
// import { UrlInput, NumberInput } from '@/shared/ui/input';
import { UrlInput, NumberInput } from './temp-inputs'; // 임시 경로
import { ANALYSIS_CONFIG } from '@/shared/config/constants';

const UI_CLASSES = {
  INPUT: 'input-base',
  BUTTON: 'btn-primary w-full',
  LABEL: 'text-sm font-medium text-gray-700',
  DESCRIPTION: 'mt-2 text-sm text-gray-500',
};

const FORM_TEXTS = {
  RSS_URL_LABEL: 'RSS URL',
  RSS_URL_PLACEHOLDER: 'https://rss.blog.naver.com/블로그ID.xml',
  MAX_POSTS_LABEL: '최근 글 개수',
  MAX_POSTS_DESCRIPTION: `추천 범위 ${ANALYSIS_CONFIG.RECOMMENDED_MIN}~${ANALYSIS_CONFIG.RECOMMENDED_MAX}개, 각 포스트의 일부만 사용하여 스타일을 분석합니다.`,
  SUBMIT_BUTTON: '스타일 분석하기',
  SUBMIT_BUTTON_LOADING: '분석 중…',
};

interface AnalysisFormProps {
  rssUrl: string;
  maxPosts: number;
  isDisabled: boolean;
  isLoading: boolean;
  onRssUrlChange: (value: string) => void;
  onMaxPostsChange: Dispatch<SetStateAction<number>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const AnalysisForm = ({
  rssUrl,
  maxPosts,
  isDisabled,
  isLoading,
  onRssUrlChange,
  onMaxPostsChange,
  onSubmit,
}: AnalysisFormProps) => (
  <form className='space-y-5' onSubmit={onSubmit}>
    <UrlInput
      id='rssUrl'
      label={FORM_TEXTS.RSS_URL_LABEL}
      value={rssUrl}
      onChange={(e) => onRssUrlChange(e.target.value)}
      placeholder={FORM_TEXTS.RSS_URL_PLACEHOLDER}
      required
    />

    <div className='grid gap-4 md:grid-cols-2'>
      <NumberInput
        id='maxPosts'
        label={FORM_TEXTS.MAX_POSTS_LABEL}
        value={maxPosts}
        onChange={(e) => onMaxPostsChange(Number(e.target.value))}
        min={ANALYSIS_CONFIG.MIN_POSTS}
        max={ANALYSIS_CONFIG.MAX_POSTS}
        description={FORM_TEXTS.MAX_POSTS_DESCRIPTION}
      />
    </div>

    <button type='submit' disabled={isDisabled} className={UI_CLASSES.BUTTON}>
      {isLoading ? FORM_TEXTS.SUBMIT_BUTTON_LOADING : FORM_TEXTS.SUBMIT_BUTTON}
    </button>
  </form>
);
