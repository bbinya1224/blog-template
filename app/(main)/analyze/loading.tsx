function Bone({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-md bg-stone-200/50 ${className ?? ''}`}
      style={{ animation: 'pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
    />
  );
}

export default function AnalyzeLoading() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <Bone className="h-3 w-16" />
        <div className="space-y-3">
          <Bone className="h-9 w-44" />
          <Bone className="h-5 w-64" />
        </div>
      </section>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <Bone className="mb-6 h-5 w-36" />
        <div className="space-y-4">
          <div className="space-y-2">
            <Bone className="h-4 w-24" />
            <Bone className="h-11 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Bone className="h-4 w-20" />
            <Bone className="h-11 w-full rounded-xl" />
          </div>
        </div>
        <Bone className="mt-6 h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
