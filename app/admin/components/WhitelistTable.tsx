import type { ApprovedUser } from '../hooks/useWhitelist';

type Props = {
  users: ApprovedUser[];
  loading: boolean;
  onRefresh: () => void;
  onDelete: (email: string) => Promise<boolean | undefined>;
};

export function WhitelistTable({ users, loading, onRefresh, onDelete, onUpdateStatus }: Props & { onUpdateStatus: (email: string, updates: { is_preview?: boolean; usage_count?: number }) => Promise<boolean | undefined> }) {
  const handleDelete = async (email: string) => {
    const success = await onDelete(email);
    if (success) {
      alert(`❌ ${email} 삭제 완료`);
    }
  };

  const handleUpgrade = async (email: string) => {
      if (!confirm(`${email}님을 정식(Premium) 유저로 승급합니까?`)) return;
      const success = await onUpdateStatus(email, { is_preview: false });
      if (success) alert(`✅ 승급 완료`);
  }

  const handleReset = async (email: string) => {
      if (!confirm(`${email}님의 사용 횟수를 초기화합니까?`)) return;
      const success = await onUpdateStatus(email, { usage_count: 0 });
      if (success) alert(`✅ 초기화 완료`);
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          승인된 사용자 ({users.length}명)
        </h2>
        <button
          onClick={onRefresh}
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
                  등급
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  사용량
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  승인일
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  메모 / TX ID
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
                  <td className="px-4 py-3 text-sm">
                    {user.is_preview !== false ? (
                      <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800">
                        Preview
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                        Premium
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.is_preview !== false ? `${user.usage_count || 0} / 2` : '무제한'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(user.approved_at).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    <div>{user.notes || '-'}</div>
                    <div className="font-mono text-[10px]">{user.bmac_transaction_id}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                        {user.is_preview !== false && (
                            <button
                                onClick={() => handleUpgrade(user.email)}
                                disabled={loading}
                                className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                            >
                                승급
                            </button>
                        )}
                        <button
                            onClick={() => handleReset(user.email)}
                            disabled={loading}
                            className="text-xs text-gray-600 hover:text-gray-800 disabled:text-gray-400"
                        >
                            초기화
                        </button>
                        <button
                        onClick={() => handleDelete(user.email)}
                        disabled={loading}
                        className="text-xs text-red-600 hover:text-red-800 disabled:text-gray-400"
                        >
                        삭제
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
