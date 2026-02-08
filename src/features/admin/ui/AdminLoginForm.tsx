'use client';

type Props = {
  password: string;
  setPassword: (pwd: string) => void;
  loading: boolean;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
};

export function AdminLoginForm({
  password,
  setPassword,
  loading,
  error,
  onSubmit,
}: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">관리자 로그인</h1>

        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-sm border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="ADMIN_PASSWORD"
            />
          </div>

          {error && (
            <div className="mb-4 rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? '확인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
