'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiDelete } from '@/shared/api/httpClient';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { REVIEW_MESSAGES } from '../constants/messages';

interface DeleteReviewButtonProps {
  reviewId: string;
  storeName: string;
}

export function DeleteReviewButton({ reviewId, storeName }: DeleteReviewButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () =>
      apiDelete<{ id: string }>(`/api/reviews/${encodeURIComponent(reviewId)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'recent'] });
      router.push('/reviews');
    },
  });

  const { deleteModal } = REVIEW_MESSAGES;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-red-500"
        onClick={() => setIsOpen(true)}
      >
        삭제
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={deleteModal.title}
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            {deleteModal.description(storeName)}
          </p>

          {deleteMutation.isError && (
            <p className="text-sm text-red-500">{deleteModal.error}</p>
          )}

          <div className="flex gap-3">
            <Button
              variant="danger"
              size="sm"
              className="flex-1"
              onClick={() => deleteMutation.mutate()}
              isLoading={deleteMutation.isPending}
            >
              {deleteModal.confirm}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => setIsOpen(false)}
              disabled={deleteMutation.isPending}
            >
              {deleteModal.cancel}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
