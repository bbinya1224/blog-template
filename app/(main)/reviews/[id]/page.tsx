import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getReviewById } from '@/entities/review/api/review-repository';
import { ReviewDetailViewer } from '@/widgets/review-detail/ui/review-detail-viewer';

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
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">{review.storeName}</h1>
        <p className="text-gray-500">{review.date}</p>
      </div>

      <ReviewDetailViewer initialReview={review} />
    </div>
  );
}
