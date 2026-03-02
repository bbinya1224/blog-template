import { describe, it, expect } from 'vitest';
import {
  PROMPT_DEFENSE_INSTRUCTIONS,
  withPromptDefense,
} from './promptDefense';

describe('PROMPT_DEFENSE_INSTRUCTIONS', () => {
  it('should mention user_input XML tags', () => {
    expect(PROMPT_DEFENSE_INSTRUCTIONS).toContain('<user_input>');
  });

  it('should mention edit_request tags', () => {
    expect(PROMPT_DEFENSE_INSTRUCTIONS).toContain('<edit_request>');
  });

  it('should include data-only treatment instruction', () => {
    expect(PROMPT_DEFENSE_INSTRUCTIONS).toContain('데이터');
  });

  it('should include system instruction protection', () => {
    expect(PROMPT_DEFENSE_INSTRUCTIONS).toMatch(/공개|반복|수정/);
  });
});

describe('withPromptDefense', () => {
  it('should append defense instructions to system prompt', () => {
    const systemPrompt = '당신은 리뷰 작성 도우미입니다.';
    const result = withPromptDefense(systemPrompt);

    expect(result).toContain(systemPrompt);
    expect(result).toContain(PROMPT_DEFENSE_INSTRUCTIONS);
    expect(result.indexOf(systemPrompt)).toBeLessThan(
      result.indexOf(PROMPT_DEFENSE_INSTRUCTIONS),
    );
  });

  it('should separate with double newline', () => {
    const systemPrompt = '시스템 프롬프트';
    const result = withPromptDefense(systemPrompt);
    expect(result).toContain(`${systemPrompt}\n\n`);
  });

  it('should return only defense instructions when system prompt is empty', () => {
    const result = withPromptDefense('');
    expect(result).toBe(PROMPT_DEFENSE_INSTRUCTIONS);
  });

  it('should return only defense instructions when system prompt is whitespace', () => {
    const result = withPromptDefense('   ');
    expect(result).toBe(PROMPT_DEFENSE_INSTRUCTIONS);
  });

  it('should not double-add defense instructions', () => {
    const systemPrompt = '시스템 프롬프트';
    const once = withPromptDefense(systemPrompt);
    const occurrences = once.split(PROMPT_DEFENSE_INSTRUCTIONS).length - 1;
    expect(occurrences).toBe(1);
  });
});
