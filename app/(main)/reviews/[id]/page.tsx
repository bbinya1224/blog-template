import Link from 'next/link';
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/reviews"
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          &larr; 목록으로 돌아가기
        </Link>
        <DeleteReviewButton reviewId={review.id} storeName={review.storeName} />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{review.storeName}</h1>
        <p className="text-gray-500">{review.date}</p>
      </div>

      <ReviewDetailViewer initialReview={review} />
    </div>
  );
}
