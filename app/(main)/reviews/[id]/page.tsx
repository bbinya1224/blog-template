import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getReviewById } from '@/entities/review/api';
import { ReviewDetailViewer } from '@/widgets/review-detail/ui/ReviewDetailViewer';
import { DeleteReviewButton } from '@/widgets/review-detail';

interface ReviewDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  const { id } = await params;
  const review = await getReviewById(decodeURIComponent(id));

  if (!review) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/reviews"
          className="flex items-center gap-1 rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
          aria-label="목록으로 돌아가기"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <DeleteReviewButton reviewId={review.id} storeName={review.storeName} />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-stone-900 md:text-3xl">{review.storeName}</h1>
        <p className="mt-1.5 text-sm text-stone-400">
          {review.date} · {review.characterCount.toLocaleString()}자
        </p>
      </div>

      <ReviewDetailViewer initialReview={review} />
    </div>
  );
}
