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

const promptCache = new Map<string, CachedPrompt>();
const CACHE_TTL_MS = 5 * 60 * 1000;

const getCacheKey = (category: CategorySlug, promptKey: PromptKey): string => {
  return `${category}:${promptKey}`;
};

const isCacheValid = (cached: CachedPrompt | undefined): boolean => {
  if (!cached) return false;
  return Date.now() - cached.fetchedAt < CACHE_TTL_MS;
};

export const getPrompt = async (
  promptKey: PromptKey,
  category: CategorySlug = 'restaurant'
): Promise<string> => {
  const cacheKey = getCacheKey(category, promptKey);

  const cached = promptCache.get(cacheKey);
  if (isCacheValid(cached)) {
    return cached!.content;
  }

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

  promptCache.set(cacheKey, {
    content: data.content,
    fetchedAt: Date.now(),
  });

  return data.content;
};

export const getPrompts = async (
  promptKeys: PromptKey[],
  category: CategorySlug = 'restaurant'
): Promise<Record<PromptKey, string>> => {
  const result: Partial<Record<PromptKey, string>> = {};
  const keysToFetch: PromptKey[] = [];

  for (const key of promptKeys) {
    const cacheKey = getCacheKey(category, key);
    const cached = promptCache.get(cacheKey);

    if (isCacheValid(cached)) {
      result[key] = cached!.content;
    } else {
      keysToFetch.push(key);
    }
  }

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

export const getReviewEditPrompt = async (
  category: CategorySlug = 'restaurant'
) => {
  return getPrompt('review_edit_system', category);
};

// Call this when admin updates prompts to invalidate cache
export const invalidatePromptCache = (
  category?: CategorySlug,
  promptKey?: PromptKey
) => {
  if (category && promptKey) {
    promptCache.delete(getCacheKey(category, promptKey));
  } else if (category) {
    for (const key of promptCache.keys()) {
      if (key.startsWith(`${category}:`)) {
        promptCache.delete(key);
      }
    }
  } else {
    promptCache.clear();
  }
};
