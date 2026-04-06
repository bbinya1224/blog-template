import { describe, expect, it } from 'vitest';
import { isGenerateIntent } from './isGenerateIntent';

describe('isGenerateIntent', () => {
  it('강한 생성 의도 표현은 true를 반환한다', () => {
    expect(isGenerateIntent('이제 리뷰 생성해줘')).toBe(true);
    expect(isGenerateIntent('리뷰 작성해줘')).toBe(true);
    expect(isGenerateIntent('이제 만들어')).toBe(true);
  });

  it('재시작 표현은 false를 반환한다', () => {
    expect(isGenerateIntent('다시 시작해')).toBe(false);
    expect(isGenerateIntent('처음부터 시작해')).toBe(false);
  });
});
