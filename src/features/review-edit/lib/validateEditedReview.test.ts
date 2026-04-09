import { describe, expect, it } from 'vitest';
import { validateEditedReview } from './validateEditedReview';

describe('validateEditedReview', () => {
  it('passes a local tone-only edit that preserves facts', () => {
    const result = validateEditedReview({
      originalReview:
        '5월 3일에 마카오 하이디라오에서 친구와 훠궈를 먹었어요. 가격은 48,000원이었고 분위기가 정말 좋았어요.',
      editedReview:
        '5월 3일에 마카오 하이디라오에서 친구와 훠궈를 먹었어요. 가격은 48,000원이었고 분위기가 참 좋더라고요.',
      editRequest: '끝 문장을 조금 더 부드럽게 바꿔줘',
    });

    expect(result.isValid).toBe(true);
  });

  it('fails when protected facts disappear without a fact-change request', () => {
    const result = validateEditedReview({
      originalReview:
        '5월 3일에 마카오 하이디라오에서 친구와 훠궈를 먹었어요. 가격은 48,000원이었어요.',
      editedReview:
        '친구와 식사했는데 전반적으로 만족스러운 경험이었어요.',
      editRequest: '문장을 조금만 자연스럽게 다듬어줘',
    });

    expect(result.isValid).toBe(false);
    expect(result.issues.join(' ')).toContain('핵심 사실');
  });

  it('fails when the result includes explanation text', () => {
    const result = validateEditedReview({
      originalReview: '하이디라오에 다녀왔어요. 국물이 진했어요.',
      editedReview:
        '수정된 리뷰입니다.\n하이디라오에 다녀왔어요. 국물이 진해서 만족스러웠어요.',
      editRequest: '조금 더 자연스럽게 수정해줘',
    });

    expect(result.isValid).toBe(false);
    expect(result.issues.join(' ')).toContain('설명문');
  });

  it('allows larger length changes when explicitly requested', () => {
    const result = validateEditedReview({
      originalReview: '하이디라오에 다녀왔어요. 국물이 진했어요.',
      editedReview:
        '하이디라오에 다녀왔어요. 국물이 진했고, 재료를 넣을수록 맛이 더 깊어져서 끝까지 맛있게 먹을 수 있었어요.',
      editRequest: '조금 더 길고 자세하게 늘려줘',
    });

    expect(result.isValid).toBe(true);
  });
});
