'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { apiDelete } from '@/shared/api/httpClient';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/Popover';
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

  const handleClose = () => {
    deleteMutation.reset();
    setIsOpen(false);
  };

  const { deleteModal } = REVIEW_MESSAGES;

  return (
    <>
      <Popover>
        <PopoverTrigger className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600">
          <MoreHorizontal className="size-5" />
        </PopoverTrigger>
        <PopoverContent>
          <button
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
            onClick={() => setIsOpen(true)}
          >
            <Trash2 className="size-4" />
            삭제하기
          </button>
        </PopoverContent>
      </Popover>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="sm"
        showCloseButton={false}
      >
        <div className="flex flex-col items-center pt-2 text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-50">
            <Trash2 className="size-5 text-red-400" />
          </div>

          <h3 className="mb-2 text-lg font-semibold text-stone-800">
            {deleteModal.title}
          </h3>

          <p className="mb-1 text-sm text-stone-500">
            <span className="font-medium text-stone-700">
              &apos;{storeName}&apos;
            </span>
            {' '}리뷰가 영구적으로 삭제돼요.
          </p>
          <p className="mb-6 text-xs text-stone-400">
            {deleteModal.warning}
          </p>

          {deleteMutation.isError && (
            <div className="mb-4 w-full rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-500">
              {deleteModal.error}
            </div>
          )}

          <div className="flex w-full gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={handleClose}
              disabled={deleteMutation.isPending}
            >
              {deleteModal.cancel}
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="flex-1"
              onClick={() => deleteMutation.mutate()}
              isLoading={deleteMutation.isPending}
            >
              {deleteModal.confirm}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
