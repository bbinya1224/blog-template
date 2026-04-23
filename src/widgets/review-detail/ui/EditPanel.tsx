'use client';

import { useState, useRef } from 'react';
import { InlineDiffView } from '@/features/review-edit';
import { apiSSE } from '@/shared/api/sseClient';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { REVIEW_MESSAGES } from '../constants/messages';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onExitComplete?: () => void;
  content: string;
  onApplyEdit: (newContent: string) => void;
}

export function EditPanel({ isOpen, onClose, onExitComplete, content, onApplyEdit }: Props) {
  const [editRequest, setEditRequest] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [showDiff, setShowDiff] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleSubmit = async () => {
    if (!editRequest.trim() || abortRef.current) return;

    setIsPending(true);
    setIsError(false);
    setEditedContent('');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await apiSSE(
        '/api/chat/edit-review',
        {
          originalReview: content,
          editRequest,
          styleProfile: null,
        },
        {
          onToken: (fullText) => setEditedContent(fullText),
          onDone: (fullText) => {
            setEditedContent(fullText);
            setShowDiff(true);
          },
        },
        { signal: controller.signal },
      );
    } catch {
      if (!controller.signal.aborted) {
        setIsError(true);
      }
    } finally {
      setIsPending(false);
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const handleApply = () => {
    onApplyEdit(editedContent);
    setShowDiff(false);
    setEditedContent('');
    setEditRequest('');
    onClose();
  };

  const handleRetry = () => {
    setShowDiff(false);
    setEditedContent('');
    handleSubmit();
  };

  const handleCancelDiff = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setShowDiff(false);
    setEditedContent('');
    setIsPending(false);
  };

  const { editPanel } = REVIEW_MESSAGES;

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} onExitComplete={onExitComplete} title={editPanel.title}>
      <div className="space-y-4">
        <label htmlFor="edit-request" className="sr-only">{editPanel.label}</label>
        <textarea
          id="edit-request"
          className="w-full resize-none rounded-2xl border border-stone-200 p-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          rows={3}
          value={editRequest}
          onChange={(e) => setEditRequest(e.target.value)}
          placeholder={editPanel.placeholder}
          disabled={showDiff}
        />

        <button
          onClick={handleSubmit}
          className="w-full rounded-2xl bg-stone-900 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:bg-stone-400"
          disabled={!editRequest.trim() || isPending || showDiff}
        >
          {isPending ? editPanel.submitting : editPanel.submit}
        </button>

        {isError && (
          <p className="text-center text-sm text-red-500">{editPanel.error}</p>
        )}

        <InlineDiffView
          show={showDiff}
          originalContent={content}
          editedContent={editedContent}
          editRequest={editRequest}
          onApply={handleApply}
          onRetry={handleRetry}
          onCancel={handleCancelDiff}
        />
      </div>
    </BottomSheet>
  );
}
