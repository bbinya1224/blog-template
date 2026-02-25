function Bone({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-md bg-stone-200/50 ${className ?? ''}`}
      style={{ animation: 'pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
    />
  );
}

function SkeletonItem() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex min-w-0 flex-1 items-start justify-between gap-4 px-4 py-4">
        <div className="min-w-0 flex-1">
          <Bone className="h-5 w-28" />
          <Bone className="mt-2 h-3 w-14" />
        </div>
        <Bone className="h-4 w-10 shrink-0 self-center" />
      </div>
      <div className="mr-2 size-7" />
    </div>
  );
}

export default function ReviewsLoading() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="space-y-3">
          <Bone className="h-9 w-36" />
          <Bone className="h-5 w-56" />
        </div>
      </section>

      <div className="space-y-8">
        {[0, 1].map((group) => (
          <section key={group}>
            <div className="mb-4 pb-2">
              <Bone className="h-3 w-20" />
            </div>
            <div className="divide-y divide-stone-100">
              {Array.from({ length: group === 0 ? 4 : 2 }).map((_, i) => (
                <SkeletonItem key={i} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
