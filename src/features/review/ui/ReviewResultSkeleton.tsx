import { Skeleton } from '@/shared/ui/Skeleton';

export function ReviewResultSkeleton() {
  return (
    <div className='space-y-4'>
      {/* 리뷰 미리보기 - matches ReviewResult preview box */}
      <div className='rounded-xl border border-gray-200 bg-slate-50 p-4 md:p-6'>
        <div className='max-h-96 space-y-2'>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className='h-4 w-full' />
          ))}
          <Skeleton className='h-4 w-3/4' />
        </div>
      </div>

      {/* 액션 버튼 - flex-1 buttons */}
      <div className='flex flex-wrap gap-3'>
        <Skeleton className='h-10 flex-1 rounded-xl' /> {/* 복사하기 */}
        <Skeleton className='h-10 flex-1 rounded-xl' /> {/* 수정 반영하기 */}
      </div>

      {/* 수정 요청 입력 - textarea */}
      <div>
        <Skeleton className='mb-2 h-4 w-20' /> {/* label */}
        <Skeleton className='h-28 w-full rounded-xl' /> {/* textarea */}
      </div>
    </div>
  );
}
