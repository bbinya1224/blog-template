import { useState } from 'react';

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
      const response = await fetch('/api/admin/whitelist', {
        headers: {
          'X-Admin-Password': password,
        },
      });

      if (response.status === 401) {
        throw new Error('비밀번호가 틀립니다');
      }

      if (!response.ok) {
        throw new Error('인증 실패');
      }

      setIsAuthenticated(true);
      return true; // 성공 시그널 반환
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
