'use client';

/**
 * 리뷰 생성 페이지
 * - FSD 아키텍처: 얇은 조합 레이어 (Composition Layer)
 * - 비즈니스 로직은 features/review에 위임
 * - UI 컴포넌트 조합만 담당
 */

import type { ChangeEvent, FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SectionCard } from '@/shared/ui/section-card';
import { StepIndicator } from '@/shared/ui/step-indicator';
import { StatusMessage } from '@/shared/ui/status-message';
import type { ReviewPayload } from '@/entities/review/model/types';
import type { StyleProfile } from '@/entities/style-profile/model/types';
import {
  loadStyleProfile,
  generateReview as generateReviewAPI,
  editReview as editReviewAPI,
  copyToClipboard,
  GeneratePageHeader,
  StyleProfileDisplay,
  ReviewForm,
  ReviewResult,
} from '@/features/review';

const steps = [
  { label: '스타일 분석', status: 'completed' as const },
  { label: '리뷰 생성', status: 'current' as const },
  { label: '수정/보관', status: 'upcoming' as const },
];

const emptyForm: ReviewPayload = {
  name: '',
  location: '',
  date: '',
  menu: '',
  companion: '',
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

  // 스타일 프로필 로드
  useEffect(() => {
    const load = async () => {
      try {
        const profile = await loadStyleProfile();
        if (profile) {
          setStyleProfile(profile);
          setStatusMessage('✅ 저장된 스타일 프로필을 불러왔습니다.');
        } else {
          setStatusMessage(
            '⚠️ 스타일 프로필이 없습니다. 먼저 스타일 분석을 진행해주세요.',
          );
        }
      } catch (error) {
        console.warn(error);
        setStatusMessage(
          '⚠️ 스타일 프로필을 불러오지 못했습니다.',
        );
      }
    };

    load();
  }, []);

  // 계산된 값
  const isGenerateDisabled = useMemo(() => {
    return (
      status === 'loading' ||
      !form.name.trim() ||
      !form.location.trim() ||
      !form.date ||
      !form.menu.trim() ||
      !form.summary.trim()
    );
  }, [status, form]);

  // 이벤트 핸들러
  const handleChange = useCallback(
    (field: keyof ReviewPayload) =>
      (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({
          ...prev,
          [field]: event.target.value,
        }));
      },
    [],
  );

  const handleGenerate = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setStatus('loading');
      setStatusMessage('리뷰를 생성하는 중입니다…');

      try {
        const data = await generateReviewAPI(form);
        setReview(data.review);
        setStatus('ready');
        setStatusMessage(data.message);
      } catch (error) {
        setStatus('error');
        setStatusMessage(
          error instanceof Error
            ? error.message
            : '리뷰 생성 중 오류가 발생했습니다.',
        );
      }
    },
    [form],
  );

  const handleEdit = useCallback(async () => {
    if (!review.trim() || !editRequest.trim()) {
      return;
    }
    setStatus('loading');
    setStatusMessage('수정 요청을 반영하는 중입니다…');

    try {
      const editedReview = await editReviewAPI(review, editRequest);
      setReview(editedReview);
      setEditRequest('');
      setStatus('ready');
      setStatusMessage('수정 반영이 완료되었습니다.');
    } catch (error) {
      setStatus('error');
      setStatusMessage(
        error instanceof Error
          ? error.message
          : '리뷰 수정 중 오류가 발생했습니다.',
      );
    }
  }, [review, editRequest]);

  const handleCopy = useCallback(async () => {
    if (!review) return;
    try {
      setIsCopying(true);
      await copyToClipboard(review);
      setStatusMessage('클립보드에 복사했습니다.');
    } catch (error) {
      console.warn(error);
    } finally {
      setIsCopying(false);
    }
  }, [review]);

  return (
    <div className="space-y-10">
      <StepIndicator steps={steps} />

      {/* 페이지 헤더 */}
      <GeneratePageHeader />

      {/* 스타일 프로필 표시 */}
      <StyleProfileDisplay styleProfile={styleProfile} />

      {/* 리뷰 생성 폼 */}
      <SectionCard
        title="리뷰 생성 폼"
        description="필수 값만 입력하면 나머지는 AI가 자연스럽게 채워줍니다."
        footer={
          statusMessage && (
            <StatusMessage message={statusMessage} isError={status === 'error'} />
          )
        }
      >
        <ReviewForm
          form={form}
          isDisabled={isGenerateDisabled}
          isLoading={status === 'loading'}
          onChange={handleChange}
          onSubmit={handleGenerate}
        />
      </SectionCard>

      {/* 생성된 리뷰 */}
      {review && (
        <SectionCard
          title="생성된 리뷰"
          description="아래 내용을 그대로 복사해서 블로그에 붙여넣을 수 있습니다."
        >
          <ReviewResult
            review={review}
            editRequest={editRequest}
            isCopying={isCopying}
            isEditing={status === 'loading'}
            onEditRequestChange={setEditRequest}
            onCopy={handleCopy}
            onEdit={handleEdit}
          />
        </SectionCard>
      )}
    </div>
  );
}
