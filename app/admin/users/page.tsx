'use client';

import { useEffect } from 'react';
import { useAdminAuthContext, useWhitelist } from '@/features/admin/model';
import { AddEmailForm, WhitelistTable } from '@/features/admin/ui';

export default function AdminUsersPage() {
  const { password } = useAdminAuthContext();
  const { users, loading, error, fetchUsers, addUser, updateUserStatus, deleteUser } =
    useWhitelist(password);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-stone-900">사용자 관리</h2>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      <AddEmailForm onAdd={addUser} loading={loading} />
      <WhitelistTable
        users={users}
        loading={loading}
        onRefresh={fetchUsers}
        onDelete={deleteUser}
        onUpdateStatus={updateUserStatus}
      />
    </div>
  );
}
