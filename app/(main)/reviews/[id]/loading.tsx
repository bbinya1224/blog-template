import { Bone } from '@/shared/ui/Skeleton';

export default function ReviewDetailLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="리뷰 상세 로딩 중">
      {/* Top bar: back icon + more icon */}
      <div className="flex items-center justify-between">
        <Bone className="size-8 rounded-lg" />
        <Bone className="size-8 rounded-lg" />
      </div>

      {/* Header: store name + date */}
      <div>
        <Bone className="h-8 w-40 md:h-9" />
        <Bone className="mt-2 h-4 w-28" />
      </div>

      {/* Review text — no card wrapping */}
      <div className="space-y-2.5">
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-11/12" />
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-4/5" />
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-3/5" />
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-5/6" />
      </div>

      {/* Character count */}
      <Bone className="ml-auto h-3.5 w-20" />

      {/* Conversation accordion */}
      <hr className="border-stone-100" />
      <Bone className="h-12 w-full rounded-2xl" />
    </div>
  );
}
