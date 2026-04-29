'use client';

import type { EndpointSummary } from '../model/useUsageStats';

interface Props {
  endpoints: EndpointSummary[];
}

export function EndpointBreakdown({ endpoints }: Props) {
  if (endpoints.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white">
      <div className="border-b border-stone-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-stone-900">엔드포인트별 현황</h3>
      </div>
      <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
        {endpoints.map((ep) => (
          <div key={ep.endpoint} className="rounded-lg border border-stone-100 p-4">
            <p className="mb-2 truncate font-mono text-xs text-stone-500">{ep.endpoint}</p>
            <p className="text-2xl font-bold text-stone-900">
              {ep.request_count.toLocaleString()}
              <span className="ml-1 text-sm font-normal text-stone-400">회</span>
            </p>
            <p className="mt-1 text-xs text-stone-400">
              입력 {ep.total_input_tokens.toLocaleString()} / 출력{' '}
              {ep.total_output_tokens.toLocaleString()} 토큰
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
