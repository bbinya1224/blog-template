'use client';

import { useState, useEffect, useRef } from 'react';

export function useTypingEffect(
  text: string,
  enabled: boolean,
  speed: number = 15,
) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!enabled || !text) {
      setDisplayedText(text);
      return;
    }

    setIsTyping(true);
    setDisplayedText('');
    let index = 0;

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, enabled, speed]);

  return { displayedText, isTyping, fullText: text };
}

export function useStreamingText(
  targetText: string,
  enabled: boolean,
  speed: number = 16,
) {
  const [displayedText, setDisplayedText] = useState('');
  const targetRef = useRef(targetText);

  useEffect(() => {
    targetRef.current = targetText;
  }, [targetText]);

  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(() => {
      setDisplayedText((prev) => {
        const target = targetRef.current;
        if (prev.length >= target.length) return prev;
        const step = Math.min(2, target.length - prev.length);
        return target.slice(0, prev.length + step);
      });
    }, speed);

    return () => clearInterval(timer);
  }, [enabled, speed]);

  return {
    displayedText: enabled ? displayedText : targetText,
    isAnimating: enabled && displayedText.length < targetText.length,
  };
}
