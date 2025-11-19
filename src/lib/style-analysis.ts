/**
 * 스타일 분석 모듈
 * 비즈니스 로직을 순수 함수로 분리
 */

import type { StyleProfile } from './types';
import { StyleAnalysisError } from './errors';
import { unique } from './utils';
import { analyzeStyleWithClaude } from './claude-client';
import { STYLE_ANALYSIS_PROMPT, STYLE_USER_PROMPT } from './prompts';

const COMMON_SECTIONS = [
  '방문 이유',
  '분위기',
  '메뉴/맛',
  '서비스',
  '총평',
];

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

/**
 * 문장 분리 (순수 함수)
 */
const splitSentences = (text: string): string[] => {
  return text
    .split(/[.!?。\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

/**
 * 평균 문장 길이 계산 (순수 함수)
 */
const calculateAverageSentenceLength = (sentences: string[]): number => {
  if (sentences.length === 0) return 0;
  const totalLength = sentences.reduce((sum, s) => sum + s.length, 0);
  return totalLength / sentences.length;
};

/**
 * 빈도수 기반 단어 추출 (순수 함수)
 */
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

/**
 * 톤 감지 (순수 함수)
 */
const detectTone = (text: string): string => {
  if (text.includes('설레') || text.includes('행복')) {
    return '감성적이고 따뜻한 톤';
  }
  if (text.includes('추천') || text.includes('팁')) {
    return '정보 중심이지만 친근한 톤';
  }
  return '담백하게 경험을 전달하는 톤';
};

/**
 * 주제 편향 감지 (순수 함수)
 */
const detectTopicBias = (words: string[]): string => {
  if (words.find((word) => word.includes('카페'))) {
    return '카페 및 디저트 리뷰 비중이 높음';
  }
  if (words.find((word) => word.includes('맛집'))) {
    return '식당 리뷰 중심';
  }
  return '일상 기록 중심';
};

/**
 * 습관적 표현 추측 (순수 함수)
 */
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

/**
 * 휴리스틱 기반 스타일 프로필 생성 (순수 함수)
 * I/O 없이 순수하게 텍스트 분석만 수행
 */
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

  // 존댓말 사용 여부 확인
  const formality = text.includes('요')
    ? '친근한 존댓말'
    : '담백한 반말 혹은 혼합체';

  // 문장 길이 분류
  const sentenceLengthDesc =
    avgLength > 120
      ? '길고 묘사 위주 문장'
      : avgLength > 80
        ? '중간 길이 문장'
        : '짧고 경쾌한 문장';

  // 글쓰기 속도/리듬
  const pacing =
    sentences.length > 80
      ? '느긋하게 장면을 묘사함'
      : '빠르게 핵심을 전달하고 체험을 요약';

  // 이모티콘 사용 여부
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
    structure_pattern: {
      overall_flow: '인사 → 방문 이유 → 공간 묘사 → 메뉴/서비스 → 총평',
      paragraph_pattern: '1~3문장 단락으로 끊어 읽기 쉽도록 구성',
      frequent_sections: COMMON_SECTIONS,
    },
    keyword_profile: {
      frequent_words: frequentWords,
      topic_bias: topicBias,
    },
  };
};

/**
 * Claude API를 사용한 스타일 프로필 생성
 * Claude Sonnet이 블로그 텍스트를 분석하여 JSON 반환
 */
export const generateStyleProfileWithClaude = async (
  blogText: string,
): Promise<StyleProfile> => {
  if (!blogText.trim()) {
    throw new StyleAnalysisError(
      '분석할 텍스트가 비어있습니다. 먼저 RSS를 불러와주세요.',
    );
  }

  try {
    // Claude Sonnet API 호출
    const responseText = await analyzeStyleWithClaude(
      blogText,
      STYLE_ANALYSIS_PROMPT,
      STYLE_USER_PROMPT,
    );

    console.log('\n[스타일 분석] Claude 응답 (첫 500자):');
    console.log(responseText.substring(0, 500));
    console.log('...\n');

    // JSON 추출 - 여러 방법 시도
    let cleanedJson = responseText;

    // 1. 코드 블록 마커 제거
    cleanedJson = cleanedJson.replace(/```json\s*/g, '').replace(/```\s*/g, '');

    // 2. JSON 객체만 추출 (가장 바깥쪽 {} 사이의 내용)
    const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedJson = jsonMatch[0];
    }

    cleanedJson = cleanedJson.trim();

    console.log('[스타일 분석] 정제된 JSON (첫 300자):');
    console.log(cleanedJson.substring(0, 300));
    console.log('...\n');

    const styleProfile = JSON.parse(cleanedJson) as StyleProfile;

    // 기본 구조 검증
    if (
      !styleProfile.writing_style ||
      !styleProfile.structure_pattern ||
      !styleProfile.keyword_profile
    ) {
      throw new StyleAnalysisError(
        'Claude API 응답이 올바른 형식이 아닙니다.',
      );
    }

    return styleProfile;
  } catch (error) {
    // 원본 에러 로깅 (디버깅용)
    console.error('스타일 분석 상세 에러:', error);

    if (error instanceof StyleAnalysisError) {
      throw error;
    }

    if (error instanceof SyntaxError) {
      throw new StyleAnalysisError(
        'Claude API 응답을 JSON으로 파싱할 수 없습니다. 다시 시도해주세요.',
      );
    }

    // 에러 메시지를 포함하여 더 자세한 정보 제공
    const errorMessage =
      error instanceof Error
        ? `스타일 분석 중 오류: ${error.message}`
        : 'Claude API를 사용한 스타일 분석 중 오류가 발생했습니다.';

    throw new StyleAnalysisError(errorMessage);
  }
};
