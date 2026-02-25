'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import type { Review } from '@/entities/review';
import { groupReviewsByMonth } from '@/entities/review';
import { formatReviewDate } from '@/shared/lib/utils';
import { apiDelete } from '@/shared/api/httpClient';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/Popover';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiDelete<{ id: string }>(`/api/reviews/${encodeURIComponent(id)}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'recent'] });
      setDeleteTarget(null);
      router.refresh();
    },
  });

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center rounded-2xl bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <div className="mb-4 text-5xl opacity-40">
          🍽️
        </div>
        <h3 className="mb-2 text-lg font-semibold text-stone-800">
          아직 기록된 경험이 없어요
        </h3>
        <p className="mb-6 max-w-xs text-sm leading-relaxed text-stone-500">
          첫 번째 맛집 리뷰를 작성하고
          <br />
          소중한 순간을 남겨보세요
        </p>
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-orange-200 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-xl"
        >
          첫 리뷰 시작하기
        </Link>
      </div>
    );
  }

  const groups = groupReviewsByMonth(reviews);

  return (
    <>
      <div className="space-y-8">
        {groups.map((group) => (
          <section key={group.yearMonth}>
            <h2 className="mb-4 pb-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
              {group.label}
            </h2>
            <div className="divide-y divide-stone-100">
              {group.reviews.map((review) => (
                <div
                  key={review.id}
                  className="group flex items-center gap-2 rounded-lg transition-all duration-200 ease-out hover:bg-surface"
                >
                  <Link
                    href={`/reviews/${review.id}`}
                    className="flex min-w-0 flex-1 items-start justify-between gap-4 px-4 py-4"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-gray-900">
                        {review.storeName}
                      </h3>
                      <p className="mt-1 text-xs text-stone-400">
                        {formatReviewDate(review.date)}
                      </p>
                    </div>
                    <span className="shrink-0 self-center text-xs font-medium text-stone-400">
                      {review.characterCount.toLocaleString()}자
                    </span>
                  </Link>

                  <Popover>
                    <PopoverTrigger className="mr-2 rounded-lg p-1.5 text-stone-300 opacity-0 transition-all hover:bg-surface hover:text-primary group-hover:opacity-100">
                      <MoreHorizontal className="size-4" />
                    </PopoverTrigger>
                    <PopoverContent>
                      <button
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                        onClick={() => setDeleteTarget(review)}
                      >
                        <Trash2 className="size-4" />
                        삭제하기
                      </button>
                    </PopoverContent>
                  </Popover>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => {
          deleteMutation.reset();
          setDeleteTarget(null);
        }}
        title="리뷰를 삭제할까요?"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600">
            &apos;{deleteTarget?.storeName}&apos; 리뷰가 영구적으로 삭제됩니다.
            이 작업은 되돌릴 수 없어요.
          </p>

          {deleteMutation.isError && (
            <p className="text-sm text-red-500">
              삭제에 실패했어요. 잠시 후 다시 시도해주세요.
            </p>
          )}

          <div className="flex gap-3">
            <Button
              variant="danger"
              size="sm"
              className="flex-1"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              isLoading={deleteMutation.isPending}
            >
              삭제하기
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteMutation.isPending}
            >
              취소
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
