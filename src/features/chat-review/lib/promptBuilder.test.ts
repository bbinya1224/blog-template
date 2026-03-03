import { describe, it, expect } from 'vitest';
import {
  buildReviewSystemPrompt,
  buildReviewUserPrompt,
  formatCollectedInfo,
  parseQuestions,
} from './promptBuilder';
import type { StyleProfile } from '@/entities/style-profile';
import type { ReviewPayload } from '@/shared/types/review';

function createStyleProfile(): StyleProfile {
  return {
    writing_style: {
      formality: '존댓말',
      tone: '친근한 톤',
      emotion: '긍정적',
      sentence_length: '보통',
      pacing: '보통',
      habitual_phrases: [],
      emoji_usage: '적당히',
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
  };
}

function createReviewPayload(overrides: Partial<ReviewPayload> = {}): ReviewPayload {
  return {
    name: '맛있는 식당',
    location: '서울 강남',
    date: '2024-12-15',
    menu: '파스타',
    companion: '친구',
    ...overrides,
  };
}

describe('buildReviewSystemPrompt', () => {
  it('basePrompt의 스타일 프로필 플레이스홀더를 styleProfile JSON으로 교체한다', () => {
    const basePrompt = '당신은 리뷰어입니다. 스타일: {스타일 프로필 JSON}';
    const profile = createStyleProfile();

    const result = buildReviewSystemPrompt(basePrompt, profile);

    expect(result).toContain(JSON.stringify(profile, null, 2));
    expect(result).not.toContain('{스타일 프로필 JSON}');
  });

  it('styleProfile이 null이면 플레이스홀더를 빈 객체 {}로 교체한다', () => {
    const basePrompt = '스타일: {스타일 프로필 JSON}';

    const result = buildReviewSystemPrompt(basePrompt, null);

    expect(result).toBe('스타일: {}');
  });
});

describe('buildReviewUserPrompt', () => {
  it('모든 플레이스홀더를 payload 값으로 교체한다', () => {
    const basePrompt =
      '{스타일 프로필 JSON} {name} {location} {date} {menu} {companion} {pros} {cons} {extra} {kakao_place_info} {tavily_search_result_context} {writing_samples} {user_draft}';
    const payload = createReviewPayload({
      pros: '맛있음',
      cons: '가격이 비쌈',
      extra: '주차 가능',
      user_draft: '초안입니다',
    });

    const result = buildReviewUserPrompt(
      basePrompt,
      payload,
      null,
      '카카오 장소 정보',
      '타빌리 검색 결과',
      '작성 샘플',
    );

    expect(result).toContain('맛있는 식당');
    expect(result).toContain('서울 강남');
    expect(result).toContain('파스타');
    expect(result).toContain('친구');
    expect(result).toContain('맛있음');
    expect(result).toContain('가격이 비쌈');
    expect(result).toContain('주차 가능');
    expect(result).toContain('카카오 장소 정보');
    expect(result).toContain('타빌리 검색 결과');
    expect(result).toContain('작성 샘플');
    expect(result).toContain('초안입니다');
    expect(result).not.toContain('{name}');
    expect(result).not.toContain('{location}');
    expect(result).not.toContain('{menu}');
  });

  it('optional 필드가 없으면 빈 문자열로 교체하고 검색 결과/샘플은 기본 메시지를 사용한다', () => {
    const basePrompt =
      '{pros} {cons} {extra} {user_draft} {tavily_search_result_context} {writing_samples}';
    const payload = createReviewPayload();

    const result = buildReviewUserPrompt(basePrompt, payload, null, '', '', '');

    expect(result).toContain('검색된 정보가 없습니다. 일반적인 맛집 리뷰처럼 작성해주세요.');
    expect(result).toContain('샘플 데이터가 없습니다. 스타일 프로필을 참고해주세요.');
    expect(result).not.toContain('{pros}');
    expect(result).not.toContain('{cons}');
    expect(result).not.toContain('{extra}');
    expect(result).not.toContain('{user_draft}');
  });

  it('styleProfile이 있으면 해당 JSON을 포함한다', () => {
    const basePrompt = '{스타일 프로필 JSON}';
    const profile = createStyleProfile();

    const result = buildReviewUserPrompt(basePrompt, createReviewPayload(), profile, '', '', '');

    expect(result).toContain(JSON.stringify(profile, null, 2));
  });
});

describe('formatCollectedInfo', () => {
  it('모든 필드가 있으면 각 항목을 올바르게 포맷팅한다', () => {
    const info: Partial<ReviewPayload> = {
      name: '파스타집',
      location: '홍대',
      date: '2024-12-15',
      companion: '혼자',
      menu: '크림파스타',
      pros: '부드럽고 맛있음',
      cons: '양이 적음',
      extra: '포장 가능',
    };

    const result = formatCollectedInfo(info);

    expect(result).toContain('매장: 파스타집');
    expect(result).toContain('위치: 홍대');
    expect(result).toContain('방문일: 2024-12-15');
    expect(result).toContain('동행: 혼자');
    expect(result).toContain('메뉴: 크림파스타');
    expect(result).toContain('맛/느낌: 부드럽고 맛있음');
    expect(result).toContain('아쉬운 점: 양이 적음');
    expect(result).toContain('기타: 포장 가능');
  });

  it('빈 객체를 입력하면 빈 문자열을 반환한다', () => {
    const result = formatCollectedInfo({});

    expect(result).toBe('');
  });

  it('일부 필드만 있으면 해당 필드만 포함한다', () => {
    const result = formatCollectedInfo({ name: '카페', menu: '아메리카노' });

    expect(result).toContain('매장: 카페');
    expect(result).toContain('메뉴: 아메리카노');
    expect(result).not.toContain('위치:');
    expect(result).not.toContain('동행:');
  });
});

describe('parseQuestions', () => {
  it('유효한 JSON 문자열에서 questions 배열을 반환한다', () => {
    const text = JSON.stringify({ questions: ['어떤 메뉴를 드셨나요?', '맛은 어떠셨나요?'] });

    const result = parseQuestions(text);

    expect(result).toEqual(['어떤 메뉴를 드셨나요?', '맛은 어떠셨나요?']);
  });

  it('마크다운 코드블럭으로 감싼 JSON에서 questions 배열을 반환한다', () => {
    const text = '다음 질문입니다:\n```json\n{"questions": ["방문 날짜는 언제인가요?"]}\n```';

    const result = parseQuestions(text);

    expect(result).toEqual(['방문 날짜는 언제인가요?']);
  });

  it('JSON 내에 questions 키가 없으면 빈 배열을 반환한다', () => {
    const text = JSON.stringify({ other: '데이터' });

    const result = parseQuestions(text);

    expect(result).toEqual([]);
  });

  it('파싱할 수 없는 무효한 JSON이면 빈 배열을 반환한다', () => {
    const result = parseQuestions('이것은 JSON이 아닙니다');

    expect(result).toEqual([]);
  });

  it('빈 문자열이면 빈 배열을 반환한다', () => {
    const result = parseQuestions('');

    expect(result).toEqual([]);
  });
});
