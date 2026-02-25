function Bone({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-md bg-stone-200/50 ${className ?? ''}`}
      style={{ animation: 'pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
    />
  );
}

export default function GenerateLoading() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <Bone className="h-3 w-16" />
        <div className="space-y-3">
          <Bone className="h-9 w-48" />
          <Bone className="h-5 w-72" />
        </div>
      </section>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <Bone className="mb-6 h-5 w-28" />
        <div className="space-y-4">
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-3/4" />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <Bone className="mb-6 h-5 w-32" />
        <div className="space-y-4">
          <Bone className="h-11 w-full rounded-xl" />
          <Bone className="h-11 w-full rounded-xl" />
          <Bone className="h-11 w-full rounded-xl" />
        </div>
        <Bone className="mt-6 h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
