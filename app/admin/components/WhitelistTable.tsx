import type { ApprovedUser } from '../hooks/useWhitelist';

type Props = {
  users: ApprovedUser[];
  loading: boolean;
  onRefresh: () => void;
  onDelete: (email: string) => Promise<boolean | undefined>;
};

export function WhitelistTable({ users, loading, onRefresh, onDelete }: Props) {
  const handleDelete = async (email: string) => {
    const success = await onDelete(email);
    if (success) {
      alert(`❌ ${email} 삭제 완료`);
    }
  };

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
                      onClick={() => handleDelete(user.email)}
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
  );
}
