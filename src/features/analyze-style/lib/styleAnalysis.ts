import type { StyleProfile } from '@/shared/types/styleProfile';
import { StyleAnalysisError } from '@/shared/lib/errors';
import { unique } from '@/shared/lib/utils';
import { analyzeStyleWithClaude } from '@/shared/api/claudeClient';
import { getStyleAnalysisPrompts } from '@/shared/api/promptService';

const COMMON_SECTIONS = ['방문 이유', '분위기', '메뉴/맛', '서비스', '총평'];

const STOP_WORDS = new Set([
  '그리고',
  '정말',
  '조금',
  '이번',
  '해서',
  '오늘',
  '또',
  '정도',
]);

const splitSentences = (text: string): string[] => {
  return text
    .split(/[.!?。\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

const calculateAverageSentenceLength = (sentences: string[]): number => {
  if (sentences.length === 0) return 0;
  const totalLength = sentences.reduce((sum, s) => sum + s.length, 0);
  return totalLength / sentences.length;
};

const extractFrequentWords = (text: string, limit = 6): string[] => {
  const tokens = text
    .replace(/[^가-힣a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

  const frequency: Record<string, number> = {};
  tokens.forEach((token) => {
    frequency[token] = (frequency[token] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .filter((word) => !STOP_WORDS.has(word))
    .slice(0, limit);
};

const detectTone = (text: string): string => {
  if (text.includes('설레') || text.includes('행복')) {
    return '감성적이고 따뜻한 톤';
  }
  if (text.includes('추천') || text.includes('팁')) {
    return '정보 중심이지만 친근한 톤';
  }
  return '담백하게 경험을 전달하는 톤';
};

const detectTopicBias = (words: string[]): string => {
  if (words.find((word) => word.includes('카페'))) {
    return '카페 및 디저트 리뷰 비중이 높음';
  }
  if (words.find((word) => word.includes('맛집'))) {
    return '식당 리뷰 중심';
  }
  return '일상 기록 중심';
};

const guessPhrases = (text: string): string[] => {
  const phrases = ['솔직히', '개인적으로'];
  if (text.includes('분위기')) {
    phrases.push('분위기가 참 좋았어요');
  }
  if (text.includes('가성비')) {
    phrases.push('가성비가 좋아요');
  }
  return unique(phrases);
};

export const generateHeuristicProfile = (text: string): StyleProfile => {
  if (!text.trim()) {
    throw new StyleAnalysisError(
      '분석할 텍스트가 비어있습니다. 먼저 RSS를 불러와주세요.',
    );
  }
  const sentences = splitSentences(text);
  const avgLength = calculateAverageSentenceLength(sentences);
  const tone = detectTone(text);
  const frequentWords = extractFrequentWords(text);
  const topicBias = detectTopicBias(frequentWords);

  const formality = text.includes('요')
    ? '친근한 존댓말'
    : '담백한 반말 혹은 혼합체';

  const sentenceLengthDesc =
    avgLength > 120
      ? '길고 묘사 위주 문장'
      : avgLength > 80
        ? '중간 길이 문장'
        : '짧고 경쾌한 문장';

  const pacing =
    sentences.length > 80
      ? '느긋하게 장면을 묘사함'
      : '빠르게 핵심을 전달하고 체험을 요약';

  const emojiUsage =
    text.includes('ㅎㅎ') || text.includes('^^')
      ? '이모티콘을 가볍게 활용'
      : '이모티콘 사용 적음';

  return {
    writing_style: {
      formality,
      tone,
      emotion: tone.includes('감성') ? '감성 표현이 풍부함' : '정보 중심',
      sentence_length: sentenceLengthDesc,
      pacing,
      habitual_phrases: guessPhrases(text),
      emoji_usage: emojiUsage,
      style_notes: '휴리스틱 알고리즘 기반 분석 (Claude API 연동 전)',
    },
    visual_structure: {
      line_breaks: '1~3문장마다 줄바꿈으로 가독성 확보',
      paragraph_pattern: '1~3문장 단락으로 끊어 읽기 쉽도록 구성',
    },
    structure_pattern: {
      overall_flow: '인사 → 방문 이유 → 공간 묘사 → 메뉴/서비스 → 총평',
      opening_style: '간단한 인사 또는 계절 언급으로 시작',
      frequent_sections: COMMON_SECTIONS,
    },
    keyword_profile: {
      frequent_words: frequentWords,
      topic_bias: topicBias,
    },
  };
};

export const generateStyleProfileWithClaude = async (
  blogText: string,
): Promise<StyleProfile> => {
  if (!blogText.trim()) {
    throw new StyleAnalysisError(
      '분석할 텍스트가 비어있습니다. 먼저 RSS를 불러와주세요.',
    );
  }

  try {
    const { systemPrompt, userPrompt } = await getStyleAnalysisPrompts();

    const responseText = await analyzeStyleWithClaude(
      blogText,
      systemPrompt,
      userPrompt,
    );

    console.log('\n[스타일 분석] Claude 응답 (첫 500자):');
    console.log(responseText.substring(0, 500));
    console.log('...\n');

    let cleanedJson = responseText;

    cleanedJson = cleanedJson.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedJson = jsonMatch[0];
    }

    cleanedJson = cleanedJson.trim();

    console.log('[스타일 분석] 정제된 JSON (첫 300자):');
    console.log(cleanedJson.substring(0, 300));
    console.log('...\n');

    const styleProfile = JSON.parse(cleanedJson) as StyleProfile;

    if (
      !styleProfile.writing_style ||
      !styleProfile.structure_pattern ||
      !styleProfile.keyword_profile
    ) {
      throw new StyleAnalysisError('Claude API 응답이 올바른 형식이 아닙니다.');
    }

    return styleProfile;
  } catch (error) {
    console.error('스타일 분석 상세 에러:', error);

    if (error instanceof StyleAnalysisError) {
      throw error;
    }

    if (error instanceof SyntaxError) {
      throw new StyleAnalysisError(
        'Claude API 응답을 JSON으로 파싱할 수 없습니다. 다시 시도해주세요.',
      );
    }

    const errorMessage =
      error instanceof Error
        ? `스타일 분석 중 오류: ${error.message}`
        : 'Claude API를 사용한 스타일 분석 중 오류가 발생했습니다.';

    throw new StyleAnalysisError(errorMessage);
  }
};
