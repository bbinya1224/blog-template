/**
 * Supabase 프롬프트 서비스
 * DB에서 프롬프트를 가져오고 캐싱 관리
 */

import { supabaseAdmin } from '@/shared/lib/supabase';

type PromptKey =
  | 'style_analysis_system'
  | 'style_analysis_user'
  | 'review_generation_system'
  | 'review_generation_user'
  | 'review_edit_system';

type CategorySlug = 'restaurant' | 'product' | 'tech_blog';

interface CachedPrompt {
  content: string;
  fetchedAt: number;
}

// 메모리 캐시 (5분 TTL)
const promptCache = new Map<string, CachedPrompt>();
const CACHE_TTL_MS = 5 * 60 * 1000;

const getCacheKey = (category: CategorySlug, promptKey: PromptKey): string => {
  return `${category}:${promptKey}`;
};

const isCacheValid = (cached: CachedPrompt | undefined): boolean => {
  if (!cached) return false;
  return Date.now() - cached.fetchedAt < CACHE_TTL_MS;
};

/**
 * 단일 프롬프트 조회
 */
export const getPrompt = async (
  promptKey: PromptKey,
  category: CategorySlug = 'restaurant'
): Promise<string> => {
  const cacheKey = getCacheKey(category, promptKey);

  // 캐시 확인
  const cached = promptCache.get(cacheKey);
  if (isCacheValid(cached)) {
    return cached!.content;
  }

  // DB 조회
  const { data, error } = await supabaseAdmin
    .from('prompts')
    .select('content, prompt_categories!inner(slug)')
    .eq('prompt_key', promptKey)
    .eq('prompt_categories.slug', category)
    .eq('is_active', true)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    console.error(`프롬프트 조회 실패 [${promptKey}]:`, error);
    throw new Error(`프롬프트를 찾을 수 없습니다: ${promptKey}`);
  }

  // 캐시 저장
  promptCache.set(cacheKey, {
    content: data.content,
    fetchedAt: Date.now(),
  });

  return data.content;
};

/**
 * 여러 프롬프트 일괄 조회 (성능 최적화)
 */
export const getPrompts = async (
  promptKeys: PromptKey[],
  category: CategorySlug = 'restaurant'
): Promise<Record<PromptKey, string>> => {
  const result: Partial<Record<PromptKey, string>> = {};
  const keysToFetch: PromptKey[] = [];

  // 캐시된 것과 아닌 것 분리
  for (const key of promptKeys) {
    const cacheKey = getCacheKey(category, key);
    const cached = promptCache.get(cacheKey);

    if (isCacheValid(cached)) {
      result[key] = cached!.content;
    } else {
      keysToFetch.push(key);
    }
  }

  // DB에서 나머지 조회
  if (keysToFetch.length > 0) {
    const { data, error } = await supabaseAdmin
      .from('prompts')
      .select('prompt_key, content, prompt_categories!inner(slug)')
      .in('prompt_key', keysToFetch)
      .eq('prompt_categories.slug', category)
      .eq('is_active', true);

    if (error) {
      console.error('프롬프트 일괄 조회 실패:', error);
      throw new Error('프롬프트를 불러오는데 실패했습니다.');
    }

    // 결과 및 캐시 저장
    for (const row of data || []) {
      const key = row.prompt_key as PromptKey;
      result[key] = row.content;

      promptCache.set(getCacheKey(category, key), {
        content: row.content,
        fetchedAt: Date.now(),
      });
    }
  }

  return result as Record<PromptKey, string>;
};

/**
 * 스타일 분석용 프롬프트 조회
 */
export const getStyleAnalysisPrompts = async (
  category: CategorySlug = 'restaurant'
) => {
  const prompts = await getPrompts(
    ['style_analysis_system', 'style_analysis_user'],
    category
  );

  return {
    systemPrompt: prompts.style_analysis_system,
    userPrompt: prompts.style_analysis_user,
  };
};

/**
 * 리뷰 생성용 프롬프트 조회
 */
export const getReviewGenerationPrompts = async (
  category: CategorySlug = 'restaurant'
) => {
  const prompts = await getPrompts(
    ['review_generation_system', 'review_generation_user'],
    category
  );

  return {
    systemPrompt: prompts.review_generation_system,
    userPrompt: prompts.review_generation_user,
  };
};

/**
 * 리뷰 수정용 프롬프트 조회
 */
export const getReviewEditPrompt = async (
  category: CategorySlug = 'restaurant'
) => {
  return getPrompt('review_edit_system', category);
};

/**
 * 캐시 무효화 (Admin에서 프롬프트 수정 시 호출)
 */
export const invalidatePromptCache = (
  category?: CategorySlug,
  promptKey?: PromptKey
) => {
  if (category && promptKey) {
    promptCache.delete(getCacheKey(category, promptKey));
  } else if (category) {
    // 특정 카테고리 전체 무효화
    for (const key of promptCache.keys()) {
      if (key.startsWith(`${category}:`)) {
        promptCache.delete(key);
      }
    }
  } else {
    // 전체 무효화
    promptCache.clear();
  }
};
