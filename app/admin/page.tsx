'use client';

import { useEffect } from 'react';
import { useAdminAuth } from './hooks/useAdminAuth';
import { useWhitelist } from './hooks/useWhitelist';
import { AdminLoginForm } from './components/AdminLoginForm';
import { AddEmailForm } from './components/AddEmailForm';
import { WhitelistTable } from './components/WhitelistTable';

export default function AdminPage() {
  const { 
    password, 
    setPassword, 
    isAuthenticated, 
    loading: authLoading, 
    error: authError, 
    login, 
    logout 
  } = useAdminAuth();

  const { 
    users, 
    loading: listLoading, 
    error: listError, 
    fetchUsers, 
    addUser, 
    deleteUser 
  } = useWhitelist(password);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated, fetchUsers]);

  if (!isAuthenticated) {
    return (
      <AdminLoginForm 
        password={password}
        setPassword={setPassword}
        loading={authLoading}
        error={authError}
        onSubmit={login}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">화이트리스트 관리</h1>
          <button
            onClick={logout}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            로그아웃
          </button>
        </div>

        {listError && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-red-700">
            {listError}
          </div>
        )}

        <AddEmailForm onAdd={addUser} loading={listLoading} />

        <WhitelistTable 
          users={users} 
          loading={listLoading} 
          onRefresh={fetchUsers} 
          onDelete={deleteUser} 
        />
      </div>
    </div>
  );
}
