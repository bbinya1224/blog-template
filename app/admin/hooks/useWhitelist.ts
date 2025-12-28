import { useState, useCallback } from 'react';

export type ApprovedUser = {
  id: string;
  email: string;
  approved_at: string;
  bmac_transaction_id: string | null;
  notes: string | null;
  created_at: string;
};

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
      setUsers(data.users);
    } catch (err) {
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

      await fetchUsers(); // 목록 갱신
      return true;
    } catch (err: any) {
      setError(err.message);
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

      await fetchUsers(); // 목록 갱신
      return true;
    } catch (err) {
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
    deleteUser,
  };
}
