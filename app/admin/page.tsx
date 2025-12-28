'use client';

import { useState, useEffect } from 'react';

type ApprovedUser = {
  id: string;
  email: string;
  approved_at: string;
  bmac_transaction_id: string | null;
  notes: string | null;
  created_at: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<ApprovedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 새 이메일 입력
  const [newEmail, setNewEmail] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // 화이트리스트 불러오기
  const fetchUsers = async () => {
    // 이미 로딩중이면 실행 안 함 (중복 호출 방지)
    if (loading) return;
    
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
  };

  // 이메일 추가
  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail.trim()) {
      setError('이메일을 입력하세요');
      return;
    }

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
          email: newEmail.trim(),
          notes: newNotes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '추가 실패');
      }

      alert(`✅ ${newEmail} 추가 완료`);
      setNewEmail('');
      setNewNotes('');
      // fetchUsers 호출 대신 직접 상태 업데이트를 하거나, 
      // fetchUsers가 완료된 후 실행되도록 해야 함.
      // 여기서는 목록 갱신을 위해 별도 호출
      const refreshResponse = await fetch('/api/admin/whitelist', {
        headers: {
          'X-Admin-Password': password,
        },
      });
      if(refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setUsers(refreshData.users);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 이메일 삭제
  const handleDeleteEmail = async (email: string) => {
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

      alert(`❌ ${email} 삭제 완료`);
      
      const refreshResponse = await fetch('/api/admin/whitelist', {
        headers: {
          'X-Admin-Password': password,
        },
      });
      if(refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setUsers(refreshData.users);
      }

    } catch (err) {
      setError('삭제할 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  // 로그인
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setError('비밀번호를 입력하세요');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 비밀번호 검증 (화이트리스트 조회로)
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
      const data = await response.json();
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message);
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  // 인증 전: 로그인 폼
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
          <h1 className="mb-6 text-center text-2xl font-bold">
            관리자 로그인
          </h1>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="ADMIN_PASSWORD"
              />
            </div>

            {error && (
              <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? '확인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 인증 후: 관리자 페이지
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">화이트리스트 관리</h1>
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setPassword('');
              setUsers([]);
            }}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            로그아웃
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* 이메일 추가 폼 */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">이메일 추가</h2>
          <form onSubmit={handleAddEmail} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                이메일 *
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full rounded border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="user@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                메모 (선택)
              </label>
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full rounded border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="예: 친구 요청"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? '추가 중...' : '추가'}
            </button>
          </form>
        </div>

        {/* 화이트리스트 테이블 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              승인된 사용자 ({users.length}명)
            </h2>
            <button
              onClick={() => {
                  fetchUsers(); 
                  // 강제로 상태 갱신을 위해 loading을 false로 하고 호출 (위의 fetchUsers가 loading 체크하므로)
                  // 하지만 여기서는 간단히 새로고침 로직
                  const refresh = async () => {
                      setLoading(true);
                      try {
                        const response = await fetch('/api/admin/whitelist', {
                            headers: { 'X-Admin-Password': password },
                        });
                        const data = await response.json();
                        setUsers(data.users);
                      } finally {
                          setLoading(false);
                      }
                  };
                  refresh();
              }}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              {loading ? '새로고침 중...' : '🔄 새로고침'}
            </button>
          </div>

          {users.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              아직 승인된 사용자가 없습니다
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      이메일
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      승인일
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      메모
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      트랜잭션 ID
                    </th>
                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(user.approved_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.notes || '-'}
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-600">
                        {user.bmac_transaction_id || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleDeleteEmail(user.email)}
                          disabled={loading}
                          className="text-sm text-red-600 hover:text-red-800 disabled:text-gray-400"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
