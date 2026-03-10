import { describe, it, expect } from 'vitest';
import { handleStyleCheck, handleStyleSetup } from './styleSetup';
import { initialConversationState } from '../../model/types';
import type { ConversationState, StyleSetupContext } from '../../model/types';
import { MESSAGES } from '../../constants/messages';

function createState(overrides: Partial<ConversationState> = {}): ConversationState {
  return { ...initialConversationState, ...overrides };
}

describe('handleStyleCheck', () => {
  describe('with existing style', () => {
    const state = createState({ step: 'style-check', hasExistingStyle: true, styleProfile: { tone: 'casual' } as any });

    describe('optionId routing', () => {
      it('yes → topic-select', () => {
        const result = handleStyleCheck({ text: '좋아요!', optionId: 'yes' }, state);
        expect(result.actions).toContainEqual({ type: 'GO_TO_STEP', payload: 'topic-select' });
      });

      it('no → style modify request', () => {
        const result = handleStyleCheck({ text: '수정할래요', optionId: 'no' }, state);
        expect(result.messages[0].content).toBe(MESSAGES.styleCheck.styleModifyRequest);
        expect(result.actions).toEqual([]);
      });
    });

    describe('text fallback', () => {
      it.each(['좋아요', '네 괜찮아요', 'yes', '확인해요', '완벽해요'])('%s → topic-select', (text) => {
        const result = handleStyleCheck({ text }, state);
        expect(result.actions).toContainEqual({ type: 'GO_TO_STEP', payload: 'topic-select' });
      });

      it.each(['수정하고 싶어', '아니요', '고쳐줘'])('%s → modify request', (text) => {
        const result = handleStyleCheck({ text }, state);
        expect(result.messages[0].content).toBe(MESSAGES.styleCheck.styleModifyRequest);
      });
    });

    it('long style description → applies and goes to topic-select', () => {
      const result = handleStyleCheck({ text: '좀 더 감성적인 느낌으로 바꿔줘' }, state);
      expect(result.actions).toContainEqual({ type: 'GO_TO_STEP', payload: 'topic-select' });
      expect(result.messages[0].content).toContain('감성적인 느낌');
    });
  });

  describe('without existing style', () => {
    const state = createState({ step: 'style-check', hasExistingStyle: false });

    it('→ style-setup with setup method choices', () => {
      const result = handleStyleCheck({ text: '아무거나' }, state);
      expect(result.actions).toContainEqual({ type: 'GO_TO_STEP', payload: 'style-setup' });
      expect(result.messages[0].type).toBe('choice');
    });
  });
});

describe('handleStyleSetup', () => {
  const state = createState({ step: 'style-setup' });

  describe('method selection via optionId', () => {
    it('blog-url → asks for URL', () => {
      const result = handleStyleSetup({ text: '', optionId: 'blog-url' }, state);
      expect(result.messages[0].content).toBe(MESSAGES.styleSetup.urlInput);
      expect(result.actions).toContainEqual({ type: 'SET_STYLE_SETUP_CONTEXT', payload: { method: 'blog-url' } });
    });

    it('paste-text → asks for paste', () => {
      const result = handleStyleSetup({ text: '', optionId: 'paste-text' }, state);
      expect(result.messages[0].content).toBe(MESSAGES.styleSetup.pastePrompt);
      expect(result.actions).toContainEqual({ type: 'SET_STYLE_SETUP_CONTEXT', payload: { method: 'paste-text' } });
    });

    it('questionnaire → starts with tone question and choice', () => {
      const result = handleStyleSetup({ text: '', optionId: 'questionnaire' }, state);
      expect(result.messages[0].content).toBe(MESSAGES.styleSetup.questionnaireStart);
      expect(result.messages[1].type).toBe('choice');
    });
  });

  describe('blog URL auto-detection', () => {
    it('detects naver blog URL without method set', () => {
      const result = handleStyleSetup({ text: 'https://blog.naver.com/testuser' }, state);
      expect(result.sideEffect).toEqual({ type: 'blog-analysis', url: 'https://blog.naver.com/testuser' });
    });
  });

  describe('blog-url method', () => {
    const context: StyleSetupContext = { method: 'blog-url' };

    it('valid URL → blog-analysis side effect', () => {
      const result = handleStyleSetup({ text: 'https://blog.naver.com/myid' }, state, context);
      expect(result.sideEffect).toEqual({ type: 'blog-analysis', url: 'https://blog.naver.com/myid' });
      expect(result.messages[0].type).toBe('loading');
    });

    it('invalid URL → error message', () => {
      const result = handleStyleSetup({ text: 'not-a-url' }, state, context);
      expect(result.messages[0].content).toContain('올바른 네이버 블로그 URL');
      expect(result.sideEffect).toEqual({ type: 'none' });
    });
  });

  describe('paste-text method', () => {
    const context: StyleSetupContext = { method: 'paste-text' };

    it('first paste → asks for more', () => {
      const result = handleStyleSetup({ text: '첫번째 글입니다' }, state, context);
      expect(result.messages[0].content).toContain('1개 받았어요');
      expect(result.messages[0].content).toContain('4개 더');
    });

    it('5th paste → analysis start', () => {
      const ctx: StyleSetupContext = { method: 'paste-text', pastedTexts: ['1', '2', '3', '4'] };
      const result = handleStyleSetup({ text: '다섯번째 글' }, state, ctx);
      expect(result.messages[0].content).toBe(MESSAGES.styleSetup.pasteReceived);
    });
  });

  describe('questionnaire method', () => {
    it('progresses through questions (step 0 → emoji question)', () => {
      const ctx: StyleSetupContext = { method: 'questionnaire', questionnaireStep: 0 };
      const result = handleStyleSetup({ text: '존댓말' }, state, ctx);
      expect(result.messages[0].type).toBe('choice');
      expect(result.actions).toContainEqual({
        type: 'SET_STYLE_SETUP_CONTEXT',
        payload: { method: 'questionnaire', questionnaireStep: 1 },
      });
    });

    it('last question (step 3) → topic-select', () => {
      const ctx: StyleSetupContext = { method: 'questionnaire', questionnaireStep: 3 };
      const result = handleStyleSetup({ text: '짧게' }, state, ctx);
      expect(result.actions).toContainEqual({ type: 'GO_TO_STEP', payload: 'topic-select' });
    });
  });
});
