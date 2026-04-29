import { supabaseAdmin } from '@/shared/lib/supabase';
import type { TokenUsage } from '@/shared/types/usage';

export interface UsageLogEntry {
  user_email: string;
  endpoint: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
}

export function buildUsageLogEntry(
  email: string,
  endpoint: string,
  model: string,
  usage: TokenUsage,
): UsageLogEntry {
  return {
    user_email: email,
    endpoint,
    model,
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    cache_creation_input_tokens: usage.cache_creation_input_tokens ?? 0,
    cache_read_input_tokens: usage.cache_read_input_tokens ?? 0,
  };
}

export function addUsage(a: TokenUsage, b: TokenUsage): TokenUsage {
  return {
    input_tokens: a.input_tokens + b.input_tokens,
    output_tokens: a.output_tokens + b.output_tokens,
    cache_creation_input_tokens:
      (a.cache_creation_input_tokens ?? 0) + (b.cache_creation_input_tokens ?? 0),
    cache_read_input_tokens:
      (a.cache_read_input_tokens ?? 0) + (b.cache_read_input_tokens ?? 0),
  };
}

export function logTokenUsage(entry: UsageLogEntry): void {
  supabaseAdmin
    .from('api_usage_logs')
    .insert(entry)
    .then(({ error }) => {
      if (error) {
        console.warn('[UsageLogger] 토큰 사용량 기록 실패:', error.message);
      }
    });
}
