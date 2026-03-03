'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import type { Review } from '@/entities/review';
import { copyToClipboard } from '@/features/review';
import { apiPut } from '@/shared/api/httpClient';
import { useOverlay } from '@/shared/providers/overlay';
import { Modal } from '@/shared/ui/Modal';
import { REVIEW_MESSAGES } from '../constants/messages';
import { ConversationTimeline } from './ConversationTimeline';
import { FloatingActionBar } from './FloatingActionBar';
import { EditPanel } from './EditPanel';

type SaveStatus = 'idle' | 'saved' | 'error';

interface ReviewDetailViewerProps {
  initialReview: Review;
}

export function ReviewDetailViewer({ initialReview }: ReviewDetailViewerProps) {
  const router = useRouter();
  const conversationRef = useRef<HTMLDivElement>(null);
  const saveStatusTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const editOverlay = useOverlay();
  const cancelOverlay = useOverlay();

  useEffect(() => {
    return () => {
      if (saveStatusTimerRef.current) clearTimeout(saveStatusTimerRef.current);
    };
  }, []);

  const [content, setContent] = useState(initialReview.content);
  const [originalContent, setOriginalContent] = useState(initialReview.content);
  const [isCopying, setIsCopying] = useState(false);
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const prevConversationOpenRef = useRef(false);

  const updateMutation = useMutation({
    mutationFn: (input: { id: string; content: string }) =>
      apiPut<{ id: string }>(`/api/reviews/${encodeURIComponent(input.id)}`, {
        content: input.content,
      }),
    onSuccess: (_data, variables) => {
      setOriginalContent(variables.content);
      setSaveStatus('saved');
      if (saveStatusTimerRef.current) clearTimeout(saveStatusTimerRef.current);
      saveStatusTimerRef.current = setTimeout(
        () => setSaveStatus('idle'),
        2000,
      );
      router.refresh();
    },
    onError: () => {
      setSaveStatus('error');
      if (saveStatusTimerRef.current) clearTimeout(saveStatusTimerRef.current);
      saveStatusTimerRef.current = setTimeout(
        () => setSaveStatus('idle'),
        3000,
      );
    },
  });

  const hasChanges = content !== originalContent;
  const hasConversation = initialReview.conversation.length > 0;

  const handleCopy = async () => {
    try {
      await copyToClipboard(content);
      setIsCopying(true);
      setTimeout(() => setIsCopying(false), 2000);
    } catch {
      // Clipboard API 실패 시 무시
    }
  };

  const handleSave = () => {
    updateMutation.mutate({ id: initialReview.id, content });
  };

  const handleEditClick = () => {
    setIsEditOpen(true);
    editOverlay.open(({ isOpen, close, unmount }) => (
      <EditPanel
        isOpen={isOpen}
        onClose={() => {
          close();
          setIsEditOpen(false);
        }}
        onExitComplete={unmount}
        content={content}
        onApplyEdit={setContent}
      />
    ));
  };

  const handleCancelClick = () => {
    const { cancelModal } = REVIEW_MESSAGES;
    cancelOverlay.open(({ isOpen, close, unmount }) => (
      <Modal
        isOpen={isOpen}
        onClose={close}
        onExitComplete={unmount}
        title={cancelModal.title}
        size='sm'
      >
        <p className='text-sm text-stone-600'>{cancelModal.description}</p>
        <div className='mt-5 flex gap-3'>
          <button
            onClick={() => {
              setContent(originalContent);
              close();
            }}
            className='flex-1 rounded-2xl bg-stone-900 py-3 text-sm font-semibold text-white transition hover:bg-stone-800'
          >
            {cancelModal.confirm}
          </button>
          <button
            onClick={close}
            className='flex-1 rounded-2xl border border-stone-200 bg-white py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50'
          >
            {cancelModal.cancel}
          </button>
        </div>
      </Modal>
    ));
  };

  useEffect(() => {
    if (isConversationOpen && !prevConversationOpenRef.current) {
      conversationRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    prevConversationOpenRef.current = isConversationOpen;
  }, [isConversationOpen]);

  const handleConversationClick = () => {
    setIsConversationOpen(true);
  };

  const { save } = REVIEW_MESSAGES;
  const saveButtonLabel: Record<SaveStatus, string> = {
    idle: updateMutation.isPending ? save.pending : save.idle,
    saved: save.saved,
    error: save.error,
  };

  return (
    <>
      <article>
        <pre className='font-sans text-base/relaxed wrap-break-word whitespace-pre-wrap text-stone-800'>
          {content}
        </pre>
      </article>

      <p className='mt-3 text-right text-xs text-stone-400'>
        공백 포함 {content.length.toLocaleString()}자
      </p>

      {hasChanges && (
        <div className='mt-4 flex gap-3'>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending || saveStatus === 'saved'}
            className={
              saveStatus === 'error'
                ? 'flex-1 rounded-2xl bg-red-500 py-3 text-sm font-semibold text-white transition hover:bg-red-600'
                : saveStatus === 'saved'
                  ? 'flex-1 rounded-2xl bg-green-600 py-3 text-sm font-semibold text-white'
                  : 'flex-1 rounded-2xl bg-primary py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:bg-primary/50'
            }
          >
            {saveButtonLabel[saveStatus]}
          </button>
          <button
            onClick={handleCancelClick}
            disabled={updateMutation.isPending}
            className='flex-1 rounded-2xl border border-stone-200 bg-white py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50'
          >
            취소
          </button>
        </div>
      )}

      {hasConversation && (
        <>
          <hr className='mt-8 border-stone-100' />
          <div className='mt-6'>
            <ConversationTimeline
              ref={conversationRef}
              conversation={initialReview.conversation}
              isOpen={isConversationOpen}
              onToggle={() => setIsConversationOpen((prev) => !prev)}
            />
          </div>
        </>
      )}

      <FloatingActionBar
        onCopy={handleCopy}
        isCopying={isCopying}
        onEditClick={handleEditClick}
        onConversationClick={handleConversationClick}
        conversationCount={initialReview.conversation.length}
        isEditPanelOpen={isEditOpen}
      />
    </>
  );
}
