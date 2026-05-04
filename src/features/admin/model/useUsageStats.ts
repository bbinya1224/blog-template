'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { createAdminClient } from '@/shared/api/adminClient';

export interface UsageSummary {
  total_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cache_creation_tokens: number;
  total_cache_read_tokens: number;
}

export interface UserUsageSummary {
  user_email: string;
  request_count: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cache_creation_tokens: number;
  total_cache_read_tokens: number;
}

export interface EndpointSummary {
  endpoint: string;
  request_count: number;
  total_input_tokens: number;
  total_output_tokens: number;
}

export interface RecentActivity {
  id: string;
  user_email: string;
  endpoint: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  created_at: string;
}

export interface UsageStatsData {
  summary: UsageSummary;
  users: UserUsageSummary[];
  endpoints: EndpointSummary[];
  recent: RecentActivity[];
  estimatedCost: number;
}

export function useUsageStats(password: string) {
  const [data, setData] = useState<UsageStatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSeq = useRef(0);

  const client = useMemo(() => createAdminClient(password), [password]);

  const fetchUsageStats = useCallback(
    async (startDate?: string, endDate?: string) => {
      const seq = ++requestSeq.current;
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const result = await client.get<UsageStatsData>('/api/admin/usage', params);
        if (seq === requestSeq.current) setData(result);
      } catch (err) {
        if (seq === requestSeq.current) {
          setError(err instanceof Error ? err.message : '사용량 데이터 로드 실패');
        }
      } finally {
        if (seq === requestSeq.current) setLoading(false);
      }
    },
    [client]
  );

  return { data, loading, error, fetchUsageStats };
}
