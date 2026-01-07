import { Review } from '@/entities/review/model/review';
import { ReviewCard } from '@/entities/review/ui/ReviewCard';

interface ReviewListProps {
  reviews: Review[];
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center">
        <p className="text-gray-500">아직 생성된 리뷰가 없습니다.</p>
        <p className="mt-1 text-sm text-gray-400">
          첫 번째 리뷰를 생성해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
