'use client';

import { useCallback } from 'react';
import { useConversationActions } from './useConversationActions';
import { useChatMessages } from './useChatMessages';
import { analyzeStyle } from '@/features/analyze-style';
import { MESSAGES, CHOICE_OPTIONS } from '../constants/messages';
import type { StyleProfile } from '@/shared/types/style-profile';

function convertBlogUrlToRss(blogUrl: string): string {
  const match = blogUrl.match(/blog\.naver\.com\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://rss.blog.naver.com/${match[1]}.xml`;
  }
  return blogUrl;
}

function formatStyleForDisplay(profile: StyleProfile): Record<string, unknown> {
  return {
    writingStyle: profile.writing_style?.tone || '친근한 톤',
    emojiUsage: profile.writing_style?.emoji_usage || '적당히 사용',
    sentenceLength: profile.writing_style?.sentence_length || '보통',
    tone: profile.writing_style?.formality || '존댓말',
  };
}

export function useBlogAnalysis(userName: string | null) {
  const { setStyleProfile, setHasExistingStyle, goToStep } =
    useConversationActions();
  const { addAssistantMessage } = useChatMessages();

  const analyzeBlogUrl = useCallback(
    async (url: string) => {
      addAssistantMessage(MESSAGES.styleSetup.urlAnalyzing, 'loading');

      try {
        const rssUrl = convertBlogUrlToRss(url);
        const styleProfile = await analyzeStyle(rssUrl, 10);

        if (styleProfile) {
          setStyleProfile(styleProfile);
          setHasExistingStyle(true);
          addAssistantMessage(
            MESSAGES.styleSetup.urlAnalyzed(userName || ''),
            'style-summary',
            CHOICE_OPTIONS.styleConfirm,
            formatStyleForDisplay(styleProfile),
          );
          goToStep('style-check');
        } else {
          throw new Error('Analysis failed');
        }
      } catch {
        addAssistantMessage(MESSAGES.styleSetup.urlError, 'text');
        addAssistantMessage(
          MESSAGES.styleCheck.noStyle(userName || ''),
          'choice',
          CHOICE_OPTIONS.styleSetupMethod,
        );
      }
    },
    [
      userName,
      setStyleProfile,
      setHasExistingStyle,
      goToStep,
      addAssistantMessage,
    ],
  );

  return { analyzeBlogUrl };
}
