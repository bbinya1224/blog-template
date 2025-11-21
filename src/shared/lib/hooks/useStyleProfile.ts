/**
 * 스타일 프로필 관리 커스텀 훅
 * - localStorage 우선 로딩
 * - API fallback
 * - 타입 안전성 보장
 */

import { useCallback, useEffect, useState } from 'react';
import type { StyleProfile } from '@/entities/style-profile/model/types';
import { STORAGE_KEYS, API_ENDPOINTS, STATUS_MESSAGES } from '@/shared/config/constants';

type LoadStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseStyleProfileReturn {
  styleProfile: StyleProfile | null;
  status: LoadStatus;
  message: string;
  loadProfile: () => Promise<void>;
  saveProfile: (profile: StyleProfile) => void;
  clearProfile: () => void;
}

export const useStyleProfile = (): UseStyleProfileReturn => {
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null);
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [message, setMessage] = useState('');

  // 스타일 프로필 로드 (localStorage → API fallback)
  const loadProfile = useCallback(async () => {
    setStatus('loading');

    try {
      // 1. localStorage 우선 확인
      if (typeof window !== 'undefined') {
        const savedProfile = localStorage.getItem(STORAGE_KEYS.STYLE_PROFILE);
        if (savedProfile) {
          const profile = JSON.parse(savedProfile) as StyleProfile;
          setStyleProfile(profile);
          setMessage(STATUS_MESSAGES.PROFILE_LOADED);
          setStatus('success');
          return;
        }
      }

      // 2. API에서 불러오기
      const response = await fetch(API_ENDPOINTS.STYLE_PROFILE);
      if (!response.ok) {
        throw new Error('Failed to fetch style profile');
      }

      const data = (await response.json()) as { styleProfile: StyleProfile };
      setStyleProfile(data.styleProfile);
      setMessage(STATUS_MESSAGES.PROFILE_LOADED);
      setStatus('success');
    } catch (error) {
      console.warn('Failed to load style profile:', error);
      setMessage(STATUS_MESSAGES.PROFILE_NOT_FOUND);
      setStatus('error');
    }
  }, []);

  // 스타일 프로필 저장
  const saveProfile = useCallback((profile: StyleProfile) => {
    setStyleProfile(profile);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.STYLE_PROFILE, JSON.stringify(profile));
      localStorage.setItem(
        STORAGE_KEYS.STYLE_PROFILE_DATE,
        new Date().toISOString(),
      );
    }
  }, []);

  // 스타일 프로필 삭제
  const clearProfile = useCallback(() => {
    setStyleProfile(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.STYLE_PROFILE);
      localStorage.removeItem(STORAGE_KEYS.STYLE_PROFILE_DATE);
    }
  }, []);

  // 마운트 시 자동 로드
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    styleProfile,
    status,
    message,
    loadProfile,
    saveProfile,
    clearProfile,
  };
};
