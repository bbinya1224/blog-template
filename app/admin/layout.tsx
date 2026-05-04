'use client';

import type { ReactNode } from 'react';
import { AdminAuthProvider, useAdminAuth } from '@/features/admin/model';
import { AdminLoginForm, AdminSidebar } from '@/features/admin/ui';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const auth = useAdminAuth();

  if (!auth.isAuthenticated) {
    return (
      <AdminLoginForm
        password={auth.password}
        setPassword={auth.setPassword}
        loading={auth.loading}
        error={auth.error}
        onSubmit={auth.login}
      />
    );
  }

  return (
    <AdminAuthProvider password={auth.password} onLogout={auth.logout}>
      <div className="flex min-h-screen bg-stone-50">
        <AdminSidebar onLogout={auth.logout} />
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </AdminAuthProvider>
  );
}
