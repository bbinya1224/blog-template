function Bone({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-md bg-stone-200/50 ${className ?? ''}`}
      style={{ animation: 'pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
    />
  );
}

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

      {/* Review content card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
        <Bone className="mb-6 h-5 w-20" />
        <div className="rounded-2xl bg-stone-50 p-4 md:p-6">
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
        </div>
        <Bone className="mt-4 ml-auto h-3.5 w-20" />
      </div>

      {/* AI edit card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6 space-y-2">
          <Bone className="h-5 w-28" />
          <Bone className="h-4 w-52" />
        </div>
        <Bone className="h-24 w-full rounded-2xl" />
        <Bone className="mt-4 h-11 w-full rounded-2xl" />
      </div>
    </div>
  );
}
