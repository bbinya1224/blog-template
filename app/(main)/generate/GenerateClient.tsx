'use client';

import type { ChangeEvent, FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SectionCard } from '@/shared/ui/SectionCard';
import { StatusMessage } from '@/shared/ui/StatusMessage';
import { DynamicMessage } from '@/shared/ui/DynamicMessage';
import { ReviewResultSkeleton } from '@/features/review/ui/ReviewResultSkeleton';
import type { ReviewPayload } from '@/entities/review/model/types';
import type { StyleProfile } from '@/entities/style-profile/model/types';
import {
  loadStyleProfile,
  copyToClipboard,
  GeneratePageHeader,
  StyleProfileDisplay,
  ReviewWizard,
  ReviewResult,
} from '@/features/review';
import { trpc } from '@/shared/api/trpc';

const emptyForm: ReviewPayload = {
  name: '',
  location: '',
  date: '',
  menu: '',
  companion: '',
  pros: '',
  cons: '',
  extra: '',
};

export default function GenerateClient() {
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null);
  const [form, setForm] = useState<ReviewPayload>(emptyForm);
  const [review, setReview] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [editRequest, setEditRequest] = useState('');
  const [isCopying, setIsCopying] = useState(false);

  const generateMutation = trpc.review.generate.useMutation({
    onMutate: async () => {
      setStatusMessage('리뷰를 생성하는 중입니다…');
    },
    onSuccess: (data) => {
      setReview(data.review);
      setStatusMessage(data.message);

      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
        });
      });
    },
    onError: (error) => {
      setStatusMessage(error.message);
    },
  });

  const editMutation = trpc.review.edit.useMutation({
    onMutate: async (variables) => {
      // 이전 상태를 context에 저장
      const previousReview = review;

      setReview(
        (prev) =>
          `${prev}\n\n🤖 AI가 "${variables.request}" 요청을 처리 중입니다...`,
      );
      setStatusMessage('수정 요청을 반영하는 중입니다…');

      return { previousReview };
    },
    onSuccess: (data) => {
      setReview(data.review);
      setEditRequest('');
      setStatusMessage('수정 반영이 완료되었습니다.');
    },
    onError: (error, _variables, context) => {
      // 에러 시 원래대로 복구
      if (context?.previousReview) {
        setReview(context.previousReview);
      }
      setStatusMessage(error.message);
    },
  });

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
        setStatusMessage('⚠️ 스타일 프로필을 불러오지 못했습니다.');
      }
    };

    load();
  }, []);

  const isGenerateDisabled = useMemo(() => {
    return (
      generateMutation.isPending ||
      editMutation.isPending ||
      !form.name.trim() ||
      !form.location.trim() ||
      !form.menu.trim() ||
      !(form.user_draft && form.user_draft.trim())
    );
  }, [generateMutation.isPending, editMutation.isPending, form]);

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

  const handleAppendDraft = useCallback((text: string) => {
    setForm((prev) => ({
      ...prev,
      user_draft: prev.user_draft ? `${prev.user_draft}\n${text}` : text,
    }));
  }, []);

  const handleGenerate = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      generateMutation.mutate(form);
    },
    [form, generateMutation],
  );

  const handleEdit = useCallback(() => {
    if (!review.trim() || !editRequest.trim()) {
      return;
    }
    editMutation.mutate({
      review,
      request: editRequest,
    });
  }, [review, editRequest, editMutation]);

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
    <div className='space-y-10'>
      <GeneratePageHeader />

      <StyleProfileDisplay styleProfile={styleProfile} />

      <SectionCard
        title='리뷰 생성 폼'
        description='필수 값만 입력하면 나머지는 AI가 자연스럽게 채워줍니다.'
        footer={
          statusMessage && (
            <div className='space-y-4'>
              <StatusMessage
                message={statusMessage}
                isError={generateMutation.isError || editMutation.isError}
              />
              {statusMessage.includes('QUOTA_EXCEEDED') && (
                <div className='flex flex-col items-center justify-center rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center'>
                  <p className='mb-4 font-bold text-yellow-800'>
                    ☕️ 더 많은 리뷰를 생성하려면 후원이 필요합니다
                  </p>
                  <a
                    href='https://www.buymeacoffee.com/bbinya'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:opacity-90 transition-opacity'
                  >
                    <img
                      src='https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png'
                      alt='Buy Me A Coffee'
                      style={{ height: '50px', width: 'auto' }}
                    />
                  </a>
                </div>
              )}
            </div>
          )
        }
      >
        <ReviewWizard
          form={form}
          isDisabled={isGenerateDisabled}
          isLoading={generateMutation.isPending || editMutation.isPending}
          onChange={handleChange}
          onSubmit={handleGenerate}
          onAppendDraft={handleAppendDraft}
        />
      </SectionCard>

      {/* Loading Skeleton & Dynamic Message */}
      {(generateMutation.isPending || editMutation.isPending) && (
        <SectionCard
          title='리뷰 생성 중...'
          description='최고의 리뷰를 위해 AI가 열심히 글을 쓰고 있어요! ✍️'
        >
          <div className='space-y-8 py-4'>
            <DynamicMessage
              messages={[
                '작성해주신 초안을 읽고 있어요... 👀',
                '블로그 스타일에 맞춰 톤을 조정 중입니다... 🎨',
                '매력적인 문장을 다듬고 있어요... ✨',
                '거의 다 됐어요! 🚀',
              ]}
            />
            <ReviewResultSkeleton />
          </div>
        </SectionCard>
      )}

      {review && !generateMutation.isPending && !editMutation.isPending && (
        <SectionCard
          title='생성된 리뷰'
          description='아래 내용을 그대로 복사해서 블로그에 붙여넣을 수 있습니다.'
        >
          <ReviewResult
            review={review}
            editRequest={editRequest}
            isCopying={isCopying}
            isEditing={false}
            onEditRequestChange={setEditRequest}
            onCopy={handleCopy}
            onEdit={handleEdit}
          />
        </SectionCard>
      )}
    </div>
  );
}
