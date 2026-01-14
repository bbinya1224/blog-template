'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from './hooks/useAdminAuth';
import { useWhitelist } from './hooks/useWhitelist';
import { usePrompts } from './hooks/usePrompts';
import { AdminLoginForm } from './components/AdminLoginForm';
import { AddEmailForm } from './components/AddEmailForm';
import { WhitelistTable } from './components/WhitelistTable';
import { PromptList } from './components/PromptList';

type Tab = 'whitelist' | 'prompts';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('whitelist');

  const {
    password,
    setPassword,
    isAuthenticated,
    loading: authLoading,
    error: authError,
    login,
    logout,
  } = useAdminAuth();

  const {
    users,
    loading: listLoading,
    error: listError,
    fetchUsers,
    addUser,
    updateUserStatus,
    deleteUser,
  } = useWhitelist(password);

  const {
    prompts,
    categories,
    loading: promptsLoading,
    error: promptsError,
    fetchCategories,
    fetchPrompts,
    updatePrompt,
  } = usePrompts(password);

  const [selectedCategory, setSelectedCategory] = useState('');

  // 인증 후 데이터 로드
  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      fetchCategories();
      fetchPrompts();
    }
  }, [isAuthenticated, fetchUsers, fetchCategories, fetchPrompts]);

  // 카테고리 변경 시 프롬프트 리로드
  useEffect(() => {
    if (isAuthenticated) {
      fetchPrompts(selectedCategory || undefined);
    }
  }, [selectedCategory, isAuthenticated, fetchPrompts]);

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

  const error = listError || promptsError;

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='mx-auto max-w-6xl'>
        {/* 헤더 */}
        <div className='mb-8 flex items-center justify-between'>
          <h1 className='text-3xl font-bold'>관리자 페이지</h1>
          <button
            onClick={logout}
            className='text-sm text-gray-600 hover:text-gray-900'
          >
            로그아웃
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className='mb-4 rounded border border-red-200 bg-red-50 p-4 text-red-700'>
            {error}
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className='mb-6 border-b'>
          <nav className='-mb-px flex gap-4'>
            <button
              onClick={() => setActiveTab('whitelist')}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'whitelist'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              화이트리스트
            </button>
            <button
              onClick={() => setActiveTab('prompts')}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'prompts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              프롬프트 관리
            </button>
          </nav>
        </div>

        {/* 탭 컨텐츠 */}
        {activeTab === 'whitelist' && (
          <>
            <AddEmailForm onAdd={addUser} loading={listLoading} />
            <WhitelistTable
              users={users}
              loading={listLoading}
              onRefresh={fetchUsers}
              onDelete={deleteUser}
              onUpdateStatus={updateUserStatus}
            />
          </>
        )}

        {activeTab === 'prompts' && (
          <PromptList
            prompts={prompts}
            categories={categories}
            loading={promptsLoading}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onUpdate={updatePrompt}
            onRefresh={() => fetchPrompts(selectedCategory || undefined)}
          />
        )}
      </div>
    </div>
  );
}
