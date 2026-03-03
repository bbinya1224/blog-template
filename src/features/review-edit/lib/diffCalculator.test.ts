import { describe, it, expect } from 'vitest';
import { calculateDiffStats } from './diffCalculator';

describe('calculateDiffStats', () => {
  it('동일한 텍스트는 added, removed, changed 모두 0이다', () => {
    const text = '맛있는 파스타였습니다. 분위기도 좋았어요.';

    const result = calculateDiffStats(text, text);

    expect(result.added).toBe(0);
    expect(result.removed).toBe(0);
    expect(result.changed).toBe(0);
  });

  it('텍스트를 추가하면 added가 0보다 크다', () => {
    const original = '맛있었습니다.';
    const edited = '맛있었습니다. 다음에 또 방문하고 싶어요.';

    const result = calculateDiffStats(original, edited);

    expect(result.added).toBeGreaterThan(0);
  });

  it('텍스트를 제거하면 removed가 0보다 크다', () => {
    const original = '맛있었습니다. 다음에 또 방문하고 싶어요.';
    const edited = '맛있었습니다.';

    const result = calculateDiffStats(original, edited);

    expect(result.removed).toBeGreaterThan(0);
  });

  it('텍스트를 수정하면 changed가 0보다 크다', () => {
    const original = '음식이 맛있었습니다.';
    const edited = '음식이 정말 훌륭했습니다.';

    const result = calculateDiffStats(original, edited);

    expect(result.changed).toBeGreaterThan(0);
  });

  it('빈 문자열 두 개를 비교하면 added, removed, changed 모두 0이다', () => {
    const result = calculateDiffStats('', '');

    expect(result.added).toBe(0);
    expect(result.removed).toBe(0);
    expect(result.changed).toBe(0);
  });

  it('빈 문자열에서 텍스트를 추가하면 added가 0보다 크고 removed는 0이다', () => {
    const result = calculateDiffStats('', '새로운 내용입니다.');

    expect(result.added).toBeGreaterThan(0);
    expect(result.removed).toBe(0);
  });

  it('텍스트를 빈 문자열로 바꾸면 removed가 0보다 크고 added는 0이다', () => {
    const result = calculateDiffStats('삭제될 내용입니다.', '');

    expect(result.removed).toBeGreaterThan(0);
    expect(result.added).toBe(0);
  });
});
