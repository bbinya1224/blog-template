'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { InlineDiffView } from '@/features/review-edit';
import { apiPost } from '@/shared/api/httpClient';
import { BottomSheet } from '@/shared/ui/BottomSheet';
import { REVIEW_MESSAGES } from '../constants/messages';

interface EditPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onExitComplete?: () => void;
  content: string;
  onApplyEdit: (newContent: string) => void;
}

export function EditPanel({ isOpen, onClose, onExitComplete, content, onApplyEdit }: EditPanelProps) {
  const [editRequest, setEditRequest] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [showDiff, setShowDiff] = useState(false);

  const editMutation = useMutation({
    mutationFn: (input: { review: string; request: string }) =>
      apiPost<{ review: string }>('/api/edit-review', input),
    onSuccess: (data) => {
      setEditedContent(data.review);
      setShowDiff(true);
    },
  });

  const handleSubmit = () => {
    if (!editRequest.trim()) return;
    editMutation.mutate({ review: content, request: editRequest });
  };

  const handleApply = () => {
    onApplyEdit(editedContent);
    setShowDiff(false);
    setEditedContent('');
    setEditRequest('');
    onClose();
  };

  const handleRetry = () => {
    if (!editRequest.trim()) return;
    editMutation.mutate({ review: content, request: editRequest });
  };

  const handleCancelDiff = () => {
    setShowDiff(false);
    setEditedContent('');
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
          disabled={!editRequest.trim() || editMutation.isPending || showDiff}
        >
          {editMutation.isPending ? editPanel.submitting : editPanel.submit}
        </button>

        {editMutation.isError && (
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
