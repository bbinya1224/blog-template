'use client';

import { useCallback } from 'react';
import { useChatStore } from './store';
import { analyzeStyle } from '@/shared/api/styleAnalysisClient';
import { MESSAGES, CHOICE_OPTIONS } from '../constants/messages';
import { formatStyleForDisplay } from '../lib/formatStyleForDisplay';

function convertBlogUrlToRss(blogUrl: string): string {
  const match = blogUrl.match(/blog\.naver\.com\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://rss.blog.naver.com/${match[1]}.xml`;
  }
  return blogUrl;
}

export function useBlogAnalysis(userName: string | null) {
  const setStyleProfile = useChatStore((s) => s.setStyleProfile);
  const setHasExistingStyle = useChatStore((s) => s.setHasExistingStyle);
  const setStep = useChatStore((s) => s.setStep);
  const addAssistantMessage = useChatStore((s) => s.addAssistantMessage);

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
          setStep('style-check');
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
      setStep,
      addAssistantMessage,
    ],
  );

  return { analyzeBlogUrl };
}
