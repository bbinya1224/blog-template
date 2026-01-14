'use client';

import { useState } from 'react';

type Props = {
  onAdd: (email: string, notes: string) => Promise<boolean | undefined>;
  loading: boolean;
};

export function AddEmailForm({ onAdd, loading }: Props) {
  const [newEmail, setNewEmail] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onAdd(newEmail, newNotes);
    if (success) {
      alert(`${newEmail} 추가 완료`);
      setNewEmail('');
      setNewNotes('');
    }
  };

  return (
    <div className="mb-8 rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">이메일 추가</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
  );
}
