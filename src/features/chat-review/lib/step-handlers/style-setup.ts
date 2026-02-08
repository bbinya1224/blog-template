import type {
  ConversationState,
  StyleSetupMethod,
} from '../../model/types';
import type { StyleProfile } from '@/entities/style-profile';
import { MESSAGES, CHOICE_OPTIONS } from '../../constants/messages';
import type { StepHandlerResult } from './onboarding';

export interface StyleSetupContext {
  method?: StyleSetupMethod;
  blogUrl?: string;
  pastedTexts?: string[];
  questionnaireStep?: number;
}

export interface StyleSetupHandlerResult extends StepHandlerResult {
  asyncAction?: () => Promise<{ styleProfile?: StyleProfile; error?: string }>;
}

export function handleStyleSetup(
  userInput: string,
  state: ConversationState,
  context: StyleSetupContext = {}
): StyleSetupHandlerResult {
  if (!context.method) {
    return handleMethodSelection(userInput, state);
  }

  switch (context.method) {
    case 'blog-url':
      return handleBlogUrlInput(userInput, state);
    case 'paste-text':
      return handlePasteText(userInput, state, context);
    case 'questionnaire':
      return handleQuestionnaire(userInput, state, context);
    default:
      return handleMethodSelection(userInput, state);
  }
}

function handleMethodSelection(
  userInput: string,
  state: ConversationState
): StyleSetupHandlerResult {
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
      actions: [],
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
      actions: [],
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
      actions: [],
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
  };
}

function handleBlogUrlInput(
  userInput: string,
  _state: ConversationState
): StyleSetupHandlerResult {
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
    asyncAction: async () => {
      return { styleProfile: undefined };
    },
  };
}

function handlePasteText(
  userInput: string,
  _state: ConversationState,
  context: StyleSetupContext
): StyleSetupHandlerResult {
  const texts = context.pastedTexts || [];
  texts.push(userInput);

  if (texts.length < 5) {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'text',
          content: `좋아요! ${texts.length}개 받았어요.\n${5 - texts.length}개 더 붙여넣어 주세요! 📋`,
        },
      ],
      actions: [],
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
    actions: [],
  };
}

function handleQuestionnaire(
  userInput: string,
  _state: ConversationState,
  context: StyleSetupContext
): StyleSetupHandlerResult {
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
      actions: [],
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
    nextStep: 'topic-select',
  };
}

export function handleStyleCheck(
  userInput: string,
  state: ConversationState
): StepHandlerResult {
  const lowered = userInput.toLowerCase();

  if (state.hasExistingStyle) {
    if (lowered === 'yes' || lowered.includes('좋아') || lowered.includes('네')) {
      return {
        messages: [],
        actions: [{ type: 'GO_TO_STEP', payload: 'topic-select' }],
        nextStep: 'topic-select',
      };
    }
    if (lowered === 'no' || lowered.includes('수정') || lowered.includes('아니')) {
      return {
        messages: [
          {
            role: 'assistant',
            type: 'text',
            content: MESSAGES.styleCheck.styleModifyRequest,
          },
        ],
        actions: [],
      };
    }
  }

  if (state.styleProfile && userInput.length > 5) {
    return {
      messages: [
        {
          role: 'assistant',
          type: 'text',
          content: `알겠어요! "${userInput}" 스타일로 수정할게요! ✨`,
        },
      ],
      actions: [{ type: 'GO_TO_STEP', payload: 'topic-select' }],
      nextStep: 'topic-select',
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
    actions: [{ type: 'GO_TO_STEP', payload: 'style-setup' }],
    nextStep: 'style-setup',
  };
}
