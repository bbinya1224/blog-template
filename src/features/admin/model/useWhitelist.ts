'use client';

import { useState, useCallback } from 'react';

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

/**
 * Manages whitelist state and provides CRUD operations against the admin whitelist API using the given admin password.
 *
 * @param password - Admin password sent as `X-Admin-Password` header for API requests; if falsy, fetch and mutation operations are no-ops.
 * @returns An object with:
 *  - `users`: current array of approved whitelist entries,
 *  - `loading`: `true` while an API operation is in progress,
 *  - `error`: localized error message when an operation fails (empty string otherwise),
 *  - `fetchUsers`: function to load the whitelist from the server,
 *  - `addUser`: function `(email, notes)` to add an entry; returns `true` on success and `false` on failure,
 *  - `updateUserStatus`: function `(email, updates)` to modify an entry; returns `true` on success and `false` on failure,
 *  - `deleteUser`: function `(email)` to remove an entry after confirmation; returns `true` on success and `false` on failure.
 */
export function useWhitelist(password: string) {
  const [users, setUsers] = useState<ApprovedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    if (!password) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/whitelist', {
        headers: {
          'X-Admin-Password': password,
        },
      });

      if (!response.ok) {
        throw new Error('조회 실패');
      }

      const data = await response.json();
 
      const usersArray = data.data?.users || [];
      setUsers(usersArray);
    } catch (error) {
      console.error('[useWhitelist] 에러 발생:', error);
      setError('화이트리스트를 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  }, [password]);

  const addUser = async (email: string, notes: string) => {
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/whitelist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify({
          email: email.trim(),
          notes: notes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '추가 실패');
      }

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
      const response = await fetch('/api/admin/whitelist', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify({
          email,
          ...updates,
        }),
      });

      if (!response.ok) {
        throw new Error('업데이트 실패');
      }

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
      const response = await fetch('/api/admin/whitelist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': password,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('삭제 실패');
      }

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