import type { Review } from '../model/review';

export interface MonthGroup {
  label: string;
  yearMonth: string;
  reviews: Review[];
}

export function groupReviewsByMonth(reviews: Review[]): MonthGroup[] {
  const groups = new Map<string, Review[]>();

  for (const review of reviews) {
    const yearMonth = review.date.slice(0, 7);
    const existing = groups.get(yearMonth);
    if (existing) {
      existing.push(review);
    } else {
      groups.set(yearMonth, [review]);
    }
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([yearMonth, groupReviews]) => {
      const [year, month] = yearMonth.split('-');
      return {
        label: `${year}년 ${Number(month)}월`,
        yearMonth,
        reviews: groupReviews,
      };
    });
}
