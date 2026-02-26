'use client';

import { useState } from 'react';
import { createAdminClient } from '@/shared/api/adminClient';

export function useAdminAuth() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setError('비밀번호를 입력하세요');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const client = createAdminClient(password);
      await client.get('/api/admin/whitelist');

      setIsAuthenticated(true);
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '인증 실패');
      setPassword('');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  return {
    password,
    setPassword,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
  };
}
