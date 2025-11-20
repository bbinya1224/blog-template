'use client';

import type { ChangeEvent, FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SectionCard } from '@/components/section-card';
import { StepIndicator } from '@/components/step-indicator';
import type { ReviewPayload, StyleProfile } from '@/lib/types';

const steps = [
  { label: '스타일 분석', status: 'completed' as const },
  { label: '리뷰 생성', status: 'current' as const },
  { label: '수정/보관', status: 'upcoming' as const },
];

const emptyForm: ReviewPayload = {
  name: '',
  location: '',
  date: '',
  summary: '',
  pros: '',
  cons: '',
  extra: '',
};

type ReviewState = 'idle' | 'loading' | 'error' | 'ready';

export default function GeneratePage() {
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null);
  const [form, setForm] = useState<ReviewPayload>(emptyForm);
  const [review, setReview] = useState('');
  const [status, setStatus] = useState<ReviewState>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [editRequest, setEditRequest] = useState('');
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // 1. localStorage에서 먼저 확인
        if (typeof window !== 'undefined') {
          const savedProfile = localStorage.getItem('styleProfile');
          if (savedProfile) {
            const profile = JSON.parse(savedProfile) as StyleProfile;
            setStyleProfile(profile);
            setStatusMessage('✅ 저장된 스타일 프로필을 불러왔습니다.');
            return;
          }
        }

        // 2. localStorage에 없으면 API에서 불러오기
        const response = await fetch('/api/style-profile');
        if (!response.ok) {
          throw new Error('스타일 프로필을 불러오지 못했습니다.');
        }
        const { styleProfile } = (await response.json()) as {
          styleProfile: StyleProfile;
        };
        setStyleProfile(styleProfile);
        setStatusMessage('✅ 스타일 프로필을 불러왔습니다.');
      } catch (error) {
        console.warn(error);
        setStatusMessage(
          '⚠️ 스타일 프로필이 없습니다. 먼저 스타일 분석을 진행해주세요.',
        );
      }
    };

    loadProfile();
  }, []);

  const isGenerateDisabled = useMemo(() => {
    return (
      status === 'loading' ||
      !form.name.trim() ||
      !form.location.trim() ||
      !form.date ||
      !form.summary.trim()
    );
  }, [status, form]);

  const handleChange = useCallback(
    (field: keyof ReviewPayload) =>
      (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({
          ...prev,
          [field]: event.target.value,
        }));
      },
    []
  );

  const handleGenerate = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setStatus('loading');
      setStatusMessage('리뷰를 생성하는 중입니다…');

      try {
        const response = await fetch('/api/generate-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });

        if (!response.ok) {
          throw new Error('리뷰 생성에 실패했습니다.');
        }

        const data = (await response.json()) as {
          review: string;
          message: string;
        };
        setReview(data.review);
        setStatus('ready');
        setStatusMessage(data.message);
      } catch (error) {
        setStatus('error');
        setStatusMessage(
          error instanceof Error
            ? error.message
            : '리뷰 생성 중 오류가 발생했습니다.'
        );
      }
    },
    [form]
  );

  const handleEdit = useCallback(async () => {
    if (!review.trim() || !editRequest.trim()) {
      return;
    }
    setStatus('loading');
    setStatusMessage('수정 요청을 반영하는 중입니다…');

    try {
      const response = await fetch('/api/edit-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review, request: editRequest }),
      });

      if (!response.ok) {
        throw new Error('수정 요청을 처리하지 못했습니다.');
      }

      const data = (await response.json()) as { review: string };
      setReview(data.review);
      setEditRequest('');
      setStatus('ready');
      setStatusMessage('수정 반영이 완료되었습니다.');
    } catch (error) {
      setStatus('error');
      setStatusMessage(
        error instanceof Error
          ? error.message
          : '리뷰 수정 중 오류가 발생했습니다.'
      );
    }
  }, [review, editRequest]);

  const handleCopy = useCallback(async () => {
    if (!review) return;
    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(review);
      setStatusMessage('클립보드에 복사했습니다.');
    } catch (error) {
      console.warn(error);
    } finally {
      setIsCopying(false);
    }
  }, [review]);

  return (
    <div className='space-y-10'>
      <StepIndicator steps={steps} />

      <section className='space-y-3'>
        <p className='text-sm font-semibold uppercase tracking-[0.3em] text-blue-500'>
          Step 2 · Generate
        </p>
        <div className='space-y-2'>
          <h1 className='text-3xl font-semibold text-gray-900'>
            템플릿만 입력하면 1500자 리뷰가 완성돼요.
          </h1>
          <p className='text-gray-600'>
            스타일 프로필을 불러와 동일한 말투로 글을 생성하고 저장까지 한 번에
            진행합니다.
          </p>
        </div>
      </section>

      {styleProfile ? (
        <SectionCard
          title='적용된 스타일'
          description='최근 분석된 결과를 요약해서 보여줍니다.'
        >
          <div className='grid gap-6 md:grid-cols-2'>
            <div className='space-y-1 text-sm text-gray-700'>
              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-blue-500'>
                문체
              </p>
              <p>{styleProfile.writing_style.formality}</p>
              <p>{styleProfile.writing_style.tone}</p>
              <p>{styleProfile.writing_style.emotion}</p>
            </div>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.2em] text-blue-500'>
                구조
              </p>
              <p className='mt-1 text-sm text-gray-700'>
                {styleProfile.structure_pattern.overall_flow}
              </p>
            </div>
          </div>
        </SectionCard>
      ) : (
        <SectionCard title='스타일 프로필 없음'>
          <p className='text-sm text-gray-600'>
            아직 스타일 분석이 완료되지 않은 것 같아요. 먼저{' '}
            <a
              className='font-semibold text-blue-500 underline-offset-2 hover:underline'
              href='/analyze'
            >
              스타일 분석
            </a>{' '}
            페이지에서 프로필을 생성해주세요.
          </p>
        </SectionCard>
      )}

      <SectionCard
        title='리뷰 생성 폼'
        description='필수 값만 입력하면 나머지는 AI가 자연스럽게 채워줍니다.'
        footer={
          statusMessage && (
            <p
              className={`text-sm ${
                status === 'error' ? 'text-red-600' : 'text-blue-600'
              }`}
            >
              {statusMessage}
            </p>
          )
        }
      >
        <form className='space-y-6' onSubmit={handleGenerate}>
          <div className='grid gap-4 md:grid-cols-2'>
            <div>
              <label
                className='text-sm font-medium text-gray-700'
                htmlFor='name'
              >
                가게명 *
              </label>
              <input
                id='name'
                value={form.name}
                onChange={handleChange('name')}
                required
                className='mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
              />
            </div>
            <div>
              <label
                className='text-sm font-medium text-gray-700'
                htmlFor='location'
              >
                위치 *
              </label>
              <input
                id='location'
                value={form.location}
                onChange={handleChange('location')}
                required
                className='mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
              />
            </div>
          </div>
          <div className='grid gap-4 md:grid-cols-3'>
            <div>
              <label
                className='text-sm font-medium text-gray-700'
                htmlFor='date'
              >
                방문 날짜 *
              </label>
              <input
                id='date'
                type='date'
                value={form.date}
                onChange={handleChange('date')}
                required
                className='mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
              />
            </div>
            <div className='md:col-span-2'>
              <label
                className='text-sm font-medium text-gray-700'
                htmlFor='summary'
              >
                한줄평 *
              </label>
              <input
                id='summary'
                value={form.summary}
                onChange={handleChange('summary')}
                required
                className='mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
              />
            </div>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <div>
              <label
                className='text-sm font-medium text-gray-700'
                htmlFor='pros'
              >
                장점
              </label>
              <textarea
                id='pros'
                value={form.pros}
                onChange={handleChange('pros')}
                className='mt-2 h-28 w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
              />
            </div>
            <div>
              <label
                className='text-sm font-medium text-gray-700'
                htmlFor='cons'
              >
                단점
              </label>
              <textarea
                id='cons'
                value={form.cons}
                onChange={handleChange('cons')}
                className='mt-2 h-28 w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
              />
            </div>
          </div>

          <div>
            <label
              className='text-sm font-medium text-gray-700'
              htmlFor='extra'
            >
              추가 정보
            </label>
            <textarea
              id='extra'
              value={form.extra}
              onChange={handleChange('extra')}
              className='mt-2 h-32 w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
            />
            <p className='mt-2 text-sm text-gray-500'>
              방문 이유, 분위기, 서빙, 추천 메뉴 등 자유롭게 적어주세요.
            </p>
          </div>

          <button
            type='submit'
            disabled={isGenerateDisabled}
            className='w-full rounded-xl bg-blue-500 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-200'
          >
            {status === 'loading' ? '리뷰 생성 중…' : '1500자 리뷰 생성하기'}
          </button>
        </form>
      </SectionCard>

      {review && (
        <SectionCard
          title='생성된 리뷰'
          description='아래 내용을 그대로 복사해서 블로그에 붙여넣을 수 있습니다.'
        >
          <div className='space-y-4'>
            <div className='rounded-xl border border-gray-200 bg-slate-50 p-4 text-sm leading-relaxed text-gray-800 md:p-6'>
              <pre className='max-h-96 whitespace-pre-wrap wrap-break-word'>
                {review}
              </pre>
            </div>
            <div className='flex flex-wrap gap-3'>
              <button
                type='button'
                onClick={handleCopy}
                disabled={isCopying}
                className='inline-flex flex-1 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed'
              >
                {isCopying ? '복사 중…' : '복사하기'}
              </button>
              <button
                type='button'
                onClick={handleEdit}
                disabled={!editRequest.trim()}
                className='inline-flex flex-1 items-center justify-center rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-200'
              >
                수정 반영하기
              </button>
            </div>
            <div>
              <label
                className='text-sm font-medium text-gray-700'
                htmlFor='editRequest'
              >
                수정 요청
              </label>
              <textarea
                id='editRequest'
                placeholder='ex. 서론을 3문장으로 줄이고, 음식 설명을 더 자세히'
                value={editRequest}
                onChange={(event) => setEditRequest(event.target.value)}
                className='mt-2 h-28 w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
              />
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
