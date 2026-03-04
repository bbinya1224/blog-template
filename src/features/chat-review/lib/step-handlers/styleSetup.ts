import type {
  ConversationState,
  StepHandlerResult,
  StyleSetupContext,
  StyleSetupMethod,
  UserInput,
} from '../../model/types';
import { MESSAGES } from '../../constants/messages';
import { CHOICE_OPTIONS } from '../../constants/choiceOptions';
import { classifyIntent } from '../conversation/conversationEngine';

export function handleStyleSetup(
  input: UserInput,
  state: ConversationState,
  context: StyleSetupContext = {},
): StepHandlerResult {
  if (!context.method && input.optionId) {
    const methodMap: Record<string, StyleSetupMethod> = {
      'blog-url': 'blog-url',
      'paste-text': 'paste-text',
      'questionnaire': 'questionnaire',
    };
    if (methodMap[input.optionId]) {
      return handleMethodSelection(input.optionId, state);
    }
  }

  if (!context.method && input.text.includes('blog.naver.com')) {
    return handleBlogUrlInput(input.text, state);
  }

  if (!context.method) {
    return handleMethodSelection(input.text, state);
  }

  switch (context.method) {
    case 'blog-url':
      return handleBlogUrlInput(input.text, state);
    case 'paste-text':
      return handlePasteText(input.text, state, context);
    case 'questionnaire':
      return handleQuestionnaire(input.text, state, context);
    default:
      return handleMethodSelection(input.text, state);
  }
}

function handleMethodSelection(
  userInput: string,
  state: ConversationState,
): StepHandlerResult {
  const methodId = userInput.toLowerCase();

  if (
    methodId === 'blog-url' ||
    methodId === '1' ||
    userInput.includes('블로그') ||
    userInput.includes('주소')
  ) {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'text',
          content: MESSAGES.styleSetup.urlInput,
        },
      ],
      actions: [{ type: 'SET_STYLE_SETUP_CONTEXT', payload: { method: 'blog-url' } }],
      sideEffect: { type: 'none' },
    };
  }

  if (
    methodId === 'paste-text' ||
    methodId === '2' ||
    userInput.includes('첨부') ||
    userInput.includes('붙여')
  ) {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'text',
          content: MESSAGES.styleSetup.pastePrompt,
        },
      ],
      actions: [{ type: 'SET_STYLE_SETUP_CONTEXT', payload: { method: 'paste-text' } }],
      sideEffect: { type: 'none' },
    };
  }

  if (
    methodId === 'questionnaire' ||
    methodId === '3' ||
    userInput.includes('직접') ||
    userInput.includes('설정')
  ) {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'text',
          content: MESSAGES.styleSetup.questionnaireStart,
        },
        {
          role: 'assistant',
          type: 'choice',
          content: MESSAGES.styleSetup.questionTone,
          options: CHOICE_OPTIONS.toneOptions,
        },
      ],
      actions: [{ type: 'SET_STYLE_SETUP_CONTEXT', payload: { method: 'questionnaire', questionnaireStep: 0 } }],
      sideEffect: { type: 'none' },
    };
  }

  return {
    messages: [
      {
        role: 'assistant',
        type: 'choice',
        content: MESSAGES.styleCheck.noStyle(state.userName || ''),
        options: CHOICE_OPTIONS.styleSetupMethod,
      },
    ],
    actions: [],
    sideEffect: { type: 'none' },
  };
}

function handleBlogUrlInput(
  userInput: string,
  _state: ConversationState,
): StepHandlerResult {
  const urlPattern =
    /https?:\/\/(blog\.naver\.com|m\.blog\.naver\.com)\/[a-zA-Z0-9_-]+/;

  if (!urlPattern.test(userInput)) {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'text',
          content:
            '올바른 네이버 블로그 URL을 입력해주세요! 📝\n예: https://blog.naver.com/블로그아이디',
        },
      ],
      actions: [],
      sideEffect: { type: 'none' },
    };
  }

  return {
    messages: [
      {
        role: 'assistant',
        type: 'loading',
        content: MESSAGES.styleSetup.urlAnalyzing,
      },
    ],
    actions: [],
    sideEffect: { type: 'blog-analysis', url: userInput },
  };
}

function handlePasteText(
  userInput: string,
  _state: ConversationState,
  context: StyleSetupContext,
): StepHandlerResult {
  const texts = [...(context.pastedTexts || []), userInput];

  if (texts.length < 5) {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'text',
          content: `좋아요! ${texts.length}개 받았어요.\n${5 - texts.length}개 더 붙여넣어 주세요! 📋`,
        },
      ],
      actions: [{ type: 'SET_STYLE_SETUP_CONTEXT', payload: { method: 'paste-text', pastedTexts: texts } }],
      sideEffect: { type: 'none' },
    };
  }

  return {
    messages: [
      {
        role: 'assistant',
        type: 'loading',
        content: MESSAGES.styleSetup.pasteReceived,
      },
    ],
    actions: [{ type: 'SET_STYLE_SETUP_CONTEXT', payload: { method: 'paste-text', pastedTexts: texts } }],
    sideEffect: { type: 'none' },
  };
}

function handleQuestionnaire(
  userInput: string,
  _state: ConversationState,
  context: StyleSetupContext,
): StepHandlerResult {
  const step = context.questionnaireStep || 0;

  const questions = [
    {
      message: MESSAGES.styleSetup.questionEmoji,
      options: CHOICE_OPTIONS.emojiOptions,
    },
    {
      message: MESSAGES.styleSetup.questionMood,
      options: CHOICE_OPTIONS.moodOptions,
    },
    {
      message: MESSAGES.styleSetup.questionLength,
      options: CHOICE_OPTIONS.lengthOptions,
    },
  ];

  if (step < questions.length) {
    const nextQuestion = questions[step];
    return {
      messages: [
        {
          role: 'assistant',
          type: 'choice',
          content: nextQuestion.message,
          options: nextQuestion.options,
        },
      ],
      actions: [{ type: 'SET_STYLE_SETUP_CONTEXT', payload: { method: 'questionnaire', questionnaireStep: step + 1 } }],
      sideEffect: { type: 'none' },
    };
  }

  return {
    messages: [
      {
        role: 'assistant',
        type: 'text',
        content: MESSAGES.styleCheck.styleUpdated,
      },
    ],
    actions: [{ type: 'GO_TO_STEP', payload: 'topic-select' }],
    sideEffect: { type: 'none' },
  };
}

export function handleStyleCheck(
  input: UserInput,
  state: ConversationState,
): StepHandlerResult {
  if (input.optionId === 'yes') {
    if (state.hasExistingStyle) {
      return { messages: [], actions: [{ type: 'GO_TO_STEP', payload: 'topic-select' }], sideEffect: { type: 'none' } };
    }
  }
  if (input.optionId === 'no') {
    if (state.hasExistingStyle) {
      return { messages: [{ role: 'assistant', type: 'text', content: MESSAGES.styleCheck.styleModifyRequest }], actions: [], sideEffect: { type: 'none' } };
    }
  }

  const intent = classifyIntent(input.text);

  if (state.hasExistingStyle) {
    if (intent === 'confirm_yes') {
      return {
        messages: [],
        actions: [{ type: 'GO_TO_STEP', payload: 'topic-select' }],
        sideEffect: { type: 'none' },
      };
    }
    if (intent === 'confirm_no') {
      return {
        messages: [
          {
            role: 'assistant',
            type: 'text',
            content: MESSAGES.styleCheck.styleModifyRequest,
          },
        ],
        actions: [],
        sideEffect: { type: 'none' },
      };
    }
    if (intent === 'modify_previous' && !(state.styleProfile && input.text.length > 5)) {
      return {
        messages: [
          {
            role: 'assistant',
            type: 'text',
            content: MESSAGES.styleCheck.styleModifyRequest,
          },
        ],
        actions: [],
        sideEffect: { type: 'none' },
      };
    }
  }

  if (state.styleProfile && input.text.length > 5) {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'text',
          content: `알겠어요! "${input.text}" 스타일로 수정할게요! ✨`,
        },
      ],
      actions: [{ type: 'GO_TO_STEP', payload: 'topic-select' }],
      sideEffect: { type: 'none' },
    };
  }

  return {
    messages: [
      {
        role: 'assistant',
        type: 'choice',
        content: MESSAGES.styleCheck.noStyle(state.userName || ''),
        options: CHOICE_OPTIONS.styleSetupMethod,
      },
    ],
    actions: [
      { type: 'GO_TO_STEP', payload: 'style-setup' },
      { type: 'SET_STYLE_SETUP_CONTEXT', payload: {} },
    ],
    sideEffect: { type: 'none' },
  };
}
