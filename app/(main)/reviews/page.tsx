import { requireAuth } from '@/shared/lib/authUtils';
import { getReviews } from '@/entities/review/api';
import { ReviewList } from '@/widgets/review-list/ui/ReviewList';

export const dynamic = 'force-dynamic';

export default async function ReviewsPage() {
  const { user } = await requireAuth();
  const reviews = await getReviews(user.email);

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl/tight font-semibold text-gray-900 md:text-4xl">
            리뷰 보관함
          </h1>
          <p className="text-lg text-gray-600">
            생성된 리뷰들을 확인하고 관리할 수 있습니다.
          </p>
        </div>
      </section>

      <ReviewList reviews={reviews} />
    </div>
  );
}
