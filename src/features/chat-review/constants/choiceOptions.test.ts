import { describe, it, expect } from 'vitest';
import { getCompanionLabel, getDateLabel, CHOICE_OPTIONS } from './choiceOptions';

describe('getCompanionLabel', () => {
  it('returns label for known id', () => {
    expect(getCompanionLabel('friend')).toBe('친구');
    expect(getCompanionLabel('family')).toBe('가족');
    expect(getCompanionLabel('alone')).toBe('혼자');
  });

  it('returns id as-is for unknown id', () => {
    expect(getCompanionLabel('unknown-person')).toBe('unknown-person');
  });
});

describe('getDateLabel', () => {
  it('returns label for known id', () => {
    expect(getDateLabel('today')).toBe('오늘');
    expect(getDateLabel('yesterday')).toBe('어제');
  });

  it('returns id as-is for unknown id', () => {
    expect(getDateLabel('2024-01-01')).toBe('2024-01-01');
  });
});

describe('CHOICE_OPTIONS', () => {
  it('all options have id and label', () => {
    for (const [key, options] of Object.entries(CHOICE_OPTIONS)) {
      for (const option of options) {
        expect(option.id, `${key} option missing id`).toBeTruthy();
        expect(option.label, `${key} option missing label`).toBeTruthy();
      }
    }
  });
});
