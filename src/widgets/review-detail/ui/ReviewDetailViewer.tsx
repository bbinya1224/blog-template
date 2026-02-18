'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Review } from '@/entities/review';
import { SectionCard } from '@/shared/ui/SectionCard';
import { copyToClipboard } from '@/features/review';
import { InlineDiffView } from '@/features/review-edit';
import { apiPost, apiPut } from '@/shared/api/httpClient';

interface ReviewDetailViewerProps {
  initialReview: Review;
}

export function ReviewDetailViewer({ initialReview }: ReviewDetailViewerProps) {
  const router = useRouter();
  const [content, setContent] = useState(initialReview.content);
  const [originalContent, setOriginalContent] = useState(initialReview.content);
  const [editRequest, setEditRequest] = useState('');
  const [isCopying, setIsCopying] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [showDiff, setShowDiff] = useState(false);

  const editMutation = useMutation({
    mutationFn: (input: { review: string; request: string }) =>
      apiPost<{ review: string }>('/api/edit-review', input),
    onSuccess: (data) => {
      setEditedContent(data.review);
      setShowDiff(true);
    },
    onError: (error) => {
      alert(`수정 요청 중 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: string; content: string }) =>
      apiPut<{ id: string }>(`/api/reviews/${encodeURIComponent(input.id)}`, { content: input.content }),
    onSuccess: () => {
      setOriginalContent(content);
      alert('저장되었습니다.');
      router.refresh();
    },
    onError: (error) => {
      alert(`저장 중 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    },
  });

  const hasChanges = content !== originalContent;

  const handleRequestEdit = async () => {
    if (!editRequest.trim()) return;

    editMutation.mutate({
      review: content,
      request: editRequest,
    });
  };

  const handleSave = async () => {
    updateMutation.mutate({
      id: initialReview.id,
      content,
    });
  };

  const handleCancel = () => {
    if (confirm('수정 사항을 취소하고 원래대로 되돌리시겠습니까?')) {
      setContent(originalContent);
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(content);
    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 2000);
  };

  const handleApplyEdit = () => {
    setContent(editedContent);
    setShowDiff(false);
    setEditedContent('');
    setEditRequest('');
  };

  const handleRetryEdit = () => {
    if (!editRequest.trim()) return;
    editMutation.mutate({
      review: content,
      request: editRequest,
    });
  };

  const handleCancelEdit = () => {
    setShowDiff(false);
    setEditedContent('');
  };

  return (
    <div className='space-y-8'>
      <SectionCard title='리뷰 내용'>
        <div className='space-y-4'>
          <div className='relative rounded-xl border border-gray-200 bg-slate-50 p-4 text-sm leading-relaxed text-gray-800 md:p-6 overflow-scroll'>
            <button
              onClick={handleCopy}
              className='absolute right-4 top-4 rounded-lg bg-white/80 p-2 text-gray-500 backdrop-blur-sm transition hover:bg-white hover:text-blue-600 shadow-sm border border-gray-100'
              title='내용 복사'
            >
              {isCopying ? (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <polyline points='20 6 9 17 4 12' />
                </svg>
              ) : (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <rect x='9' y='9' width='13' height='13' rx='2' ry='2' />
                  <path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' />
                </svg>
              )}
            </button>
            <pre className='max-h-[600px] whitespace-pre-wrap wrap-break-word font-sans'>
              {content}
            </pre>
          </div>

          <div className='text-right text-xs text-gray-500'>
            공백 포함 {content.length.toLocaleString()}자
          </div>

          {hasChanges && (
            <div className='flex gap-3'>
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className='flex-1 rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:bg-blue-300'
              >
                {updateMutation.isPending ? '저장 중...' : '변경사항 저장'}
              </button>
              <button
                onClick={handleCancel}
                disabled={updateMutation.isPending}
                className='flex-1 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50'
              >
                취소
              </button>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title='AI 수정 요청'
        description='AI에게 리뷰 수정을 요청할 수 있습니다.'
      >
        <div className='space-y-4'>
          <textarea
            value={editRequest}
            onChange={(e) => setEditRequest(e.target.value)}
            placeholder='ex. 조금 더 감성적인 말투로 바꿔줘, 메뉴 설명을 더 자세히 해줘'
            className='w-full rounded-xl border border-gray-200 p-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
            rows={3}
            disabled={showDiff}
          />
          <button
            onClick={handleRequestEdit}
            disabled={!editRequest.trim() || editMutation.isPending || showDiff}
            className='w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:bg-gray-400'
          >
            {editMutation.isPending ? '수정 중...' : '수정 요청하기'}
          </button>

          <InlineDiffView
            show={showDiff}
            originalContent={content}
            editedContent={editedContent}
            editRequest={editRequest}
            onApply={handleApplyEdit}
            onRetry={handleRetryEdit}
            onCancel={handleCancelEdit}
          />
        </div>
      </SectionCard>
    </div>
  );
}
