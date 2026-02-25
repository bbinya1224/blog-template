function Bone({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-md bg-stone-200/50 ${className ?? ''}`}
      style={{ animation: 'pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
    />
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
      <Bone className="mb-6 h-5 w-36" />
      <div className="space-y-2">
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-4/5" />
      </div>
      <Bone className="mt-6 h-10 w-32 rounded-lg" />
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="space-y-10" role="status" aria-label="대시보드 로딩 중">
      <section className="space-y-4">
        <Bone className="h-3 w-20" />
        <div className="space-y-3">
          <Bone className="h-9 w-64" />
          <Bone className="h-5 w-48" />
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <Bone className="mb-6 h-5 w-24" />
        <div className="space-y-3 pl-5">
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-5/6" />
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}
