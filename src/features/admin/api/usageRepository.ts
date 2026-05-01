import { supabaseAdmin } from '@/shared/lib/supabase';

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

export const getUsageSummary = async (
  startDate?: string,
  endDate?: string,
): Promise<UsageSummary> => {
  let query = supabaseAdmin
    .from('api_usage_logs')
    .select(
      'input_tokens, output_tokens, cache_creation_input_tokens, cache_read_input_tokens',
    );

  if (startDate) query = query.gte('created_at', startDate);
  if (endDate) query = query.lte('created_at', endDate);

  const { data, error } = await query;

  if (error) {
    console.error('사용량 요약 조회 실패:', error);
    throw error;
  }

  const rows = data ?? [];
  return {
    total_requests: rows.length,
    total_input_tokens: rows.reduce((sum, r) => sum + (r.input_tokens ?? 0), 0),
    total_output_tokens: rows.reduce(
      (sum, r) => sum + (r.output_tokens ?? 0),
      0,
    ),
    total_cache_creation_tokens: rows.reduce(
      (sum, r) => sum + (r.cache_creation_input_tokens ?? 0),
      0,
    ),
    total_cache_read_tokens: rows.reduce(
      (sum, r) => sum + (r.cache_read_input_tokens ?? 0),
      0,
    ),
  };
};

export const getUsageLogs = async (
  startDate?: string,
  endDate?: string,
) => {
  let query = supabaseAdmin
    .from('api_usage_logs')
    .select(
      'model, input_tokens, output_tokens, cache_creation_input_tokens, cache_read_input_tokens',
    );

  if (startDate) query = query.gte('created_at', startDate);
  if (endDate) query = query.lte('created_at', endDate);

  const { data, error } = await query;

  if (error) {
    console.error('사용량 로그 조회 실패:', error);
    throw error;
  }

  return (data ?? []).map((row) => ({
    model: row.model ?? '',
    input_tokens: row.input_tokens ?? 0,
    output_tokens: row.output_tokens ?? 0,
    cache_creation_input_tokens: row.cache_creation_input_tokens ?? 0,
    cache_read_input_tokens: row.cache_read_input_tokens ?? 0,
  }));
};

export const getUserUsageSummaries = async (
  startDate?: string,
  endDate?: string,
): Promise<UserUsageSummary[]> => {
  let query = supabaseAdmin
    .from('api_usage_logs')
    .select(
      'user_email, input_tokens, output_tokens, cache_creation_input_tokens, cache_read_input_tokens',
    );

  if (startDate) query = query.gte('created_at', startDate);
  if (endDate) query = query.lte('created_at', endDate);

  const { data, error } = await query;

  if (error) {
    console.error('사용자별 사용량 조회 실패:', error);
    throw error;
  }

  const rows = data ?? [];
  const groupedMap = new Map<string, UserUsageSummary>();

  for (const row of rows) {
    const email = row.user_email;
    const existing = groupedMap.get(email) ?? {
      user_email: email,
      request_count: 0,
      total_input_tokens: 0,
      total_output_tokens: 0,
      total_cache_creation_tokens: 0,
      total_cache_read_tokens: 0,
    };

    groupedMap.set(email, {
      ...existing,
      request_count: existing.request_count + 1,
      total_input_tokens:
        existing.total_input_tokens + (row.input_tokens ?? 0),
      total_output_tokens:
        existing.total_output_tokens + (row.output_tokens ?? 0),
      total_cache_creation_tokens:
        existing.total_cache_creation_tokens +
        (row.cache_creation_input_tokens ?? 0),
      total_cache_read_tokens:
        existing.total_cache_read_tokens + (row.cache_read_input_tokens ?? 0),
    });
  }

  return Array.from(groupedMap.values());
};

export const getEndpointBreakdown = async (
  startDate?: string,
  endDate?: string,
): Promise<EndpointSummary[]> => {
  let query = supabaseAdmin
    .from('api_usage_logs')
    .select('endpoint, input_tokens, output_tokens');

  if (startDate) query = query.gte('created_at', startDate);
  if (endDate) query = query.lte('created_at', endDate);

  const { data, error } = await query;

  if (error) {
    console.error('엔드포인트별 사용량 조회 실패:', error);
    throw error;
  }

  const rows = data ?? [];
  const groupedMap = new Map<string, EndpointSummary>();

  for (const row of rows) {
    const endpoint = row.endpoint;
    const existing = groupedMap.get(endpoint) ?? {
      endpoint,
      request_count: 0,
      total_input_tokens: 0,
      total_output_tokens: 0,
    };

    groupedMap.set(endpoint, {
      ...existing,
      request_count: existing.request_count + 1,
      total_input_tokens:
        existing.total_input_tokens + (row.input_tokens ?? 0),
      total_output_tokens:
        existing.total_output_tokens + (row.output_tokens ?? 0),
    });
  }

  return Array.from(groupedMap.values());
};

export const getRecentActivity = async (
  limit: number = 20,
): Promise<RecentActivity[]> => {
  const { data, error } = await supabaseAdmin
    .from('api_usage_logs')
    .select(
      'id, user_email, endpoint, model, input_tokens, output_tokens, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('최근 활동 조회 실패:', error);
    throw error;
  }

  return data ?? [];
};
