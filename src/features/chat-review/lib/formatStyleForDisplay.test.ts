import { describe, it, expect } from 'vitest';
import { formatStyleForDisplay } from './formatStyleForDisplay';
import type { StyleProfile } from '@/shared/types/styleProfile';

function createStyleProfile(overrides: Partial<StyleProfile> = {}): StyleProfile {
  return {
    writing_style: {
      formality: '존댓말',
      tone: '친근한 톤',
      emotion: '긍정적',
      sentence_length: '보통',
      pacing: '빠름',
      habitual_phrases: [],
      emoji_usage: '적당히 사용',
      style_notes: '',
    },
    visual_structure: {
      line_breaks: '적절',
      paragraph_pattern: '단락 구분',
    },
    structure_pattern: {
      overall_flow: '서론-본론-결론',
      opening_style: '질문',
      frequent_sections: [],
    },
    keyword_profile: {
      frequent_words: [],
      topic_bias: '음식',
    },
    ...overrides,
  };
}

describe('formatStyleForDisplay', () => {
  it('전체 필드가 있는 StyleProfile을 올바르게 매핑한다', () => {
    const profile = createStyleProfile({
      writing_style: {
        formality: '반말',
        tone: '유머러스',
        emotion: '긍정적',
        sentence_length: '짧음',
        pacing: '빠름',
        habitual_phrases: [],
        emoji_usage: '많이 사용',
        style_notes: '',
      },
      keyword_profile: {
        frequent_words: ['맛있다', '추천', '좋아'],
        topic_bias: '음식',
      },
    });

    const result = formatStyleForDisplay(profile);

    expect(result.writingStyle).toBe('유머러스');
    expect(result.emojiUsage).toBe('많이 사용');
    expect(result.sentenceLength).toBe('짧음');
    expect(result.tone).toBe('반말');
    expect(result.frequentExpressions).toEqual(['맛있다', '추천', '좋아']);
  });

  it('writing_style 필드 누락 시 기본값을 반환한다', () => {
    const profile = {
      writing_style: undefined,
      visual_structure: { line_breaks: '적절', paragraph_pattern: '단락 구분' },
      structure_pattern: { overall_flow: '', opening_style: '', frequent_sections: [] },
      keyword_profile: { frequent_words: [], topic_bias: '' },
    } as unknown as StyleProfile;

    const result = formatStyleForDisplay(profile);

    expect(result.writingStyle).toBe('친근한 톤');
    expect(result.emojiUsage).toBe('적당히 사용');
    expect(result.sentenceLength).toBe('보통');
    expect(result.tone).toBe('존댓말');
  });

  it('frequent_words가 5개를 초과하면 앞 5개만 반환한다', () => {
    const profile = createStyleProfile({
      keyword_profile: {
        frequent_words: ['가', '나', '다', '라', '마', '바', '사'],
        topic_bias: '음식',
      },
    });

    const result = formatStyleForDisplay(profile);

    expect((result.frequentExpressions as string[]).length).toBe(5);
    expect(result.frequentExpressions).toEqual(['가', '나', '다', '라', '마']);
  });

  it('frequent_words가 없으면 빈 배열을 반환한다', () => {
    const profile = createStyleProfile({
      keyword_profile: {
        frequent_words: [],
        topic_bias: '음식',
      },
    });

    const result = formatStyleForDisplay(profile);

    expect(result.frequentExpressions).toEqual([]);
  });
});
