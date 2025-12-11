import Link from 'next/link';
import { Review } from '../model/review';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Link
      href={`/reviews/${review.id}`}
      className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-300 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">
          {review.storeName}
        </h3>
        <span className="text-xs font-medium text-gray-500">{review.date}</span>
      </div>
      <p className="mt-3 line-clamp-3 text-sm text-gray-600">
        {review.preview}
      </p>
      <div className="mt-4 flex items-center text-xs font-medium text-blue-500 opacity-0 transition group-hover:opacity-100">
        자세히 보기 &rarr;
      </div>
    </Link>
  );
}
