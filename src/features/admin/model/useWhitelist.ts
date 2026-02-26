'use client';

import { useState, useCallback, useMemo } from 'react';
import { createAdminClient } from '@/shared/api/adminClient';

export type ApprovedUser = {
  id: string;
  email: string;
  approved_at: string;
  bmac_transaction_id: string | null;
  notes: string | null;
  created_at: string;
  is_preview: boolean | null;
  usage_count: number | null;
};

export function useWhitelist(password: string) {
  const [users, setUsers] = useState<ApprovedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const client = useMemo(() => createAdminClient(password), [password]);

  const fetchUsers = useCallback(async () => {
    if (!password) return;

    setLoading(true);
    setError('');

    try {
      const data = await client.get<{ users: ApprovedUser[] }>('/api/admin/whitelist');
      setUsers(data.users || []);
    } catch (error) {
      console.error('[useWhitelist] 에러 발생:', error);
      setError('화이트리스트를 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  }, [password, client]);

  const addUser = async (email: string, notes: string) => {
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    try {
      await client.post('/api/admin/whitelist', {
        email: email.trim(),
        notes: notes.trim() || undefined,
      });

      await fetchUsers();
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '추가 실패');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (
    email: string,
    updates: { is_preview?: boolean; usage_count?: number }
  ) => {
    setLoading(true);
    setError('');

    try {
      await client.put('/api/admin/whitelist', { email, ...updates });

      await fetchUsers();
      return true;
    } catch {
      setError('업데이트할 수 없습니다');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (email: string) => {
    if (!confirm(`${email}을 삭제하시겠습니까?`)) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await client.delete('/api/admin/whitelist', { email });

      await fetchUsers();
      return true;
    } catch {
      setError('삭제할 수 없습니다');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    addUser,
    updateUserStatus,
    deleteUser,
  };
}