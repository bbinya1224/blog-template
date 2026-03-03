import type { StyleProfile } from '@/shared/types/styleProfile';

export function formatStyleForDisplay(
  profile: StyleProfile,
): Record<string, unknown> {
  return {
    writingStyle: profile.writing_style?.tone || '친근한 톤',
    emojiUsage: profile.writing_style?.emoji_usage || '적당히 사용',
    sentenceLength: profile.writing_style?.sentence_length || '보통',
    tone: profile.writing_style?.formality || '존댓말',
    frequentExpressions:
      profile.keyword_profile?.frequent_words?.slice(0, 5) || [],
  };
}
