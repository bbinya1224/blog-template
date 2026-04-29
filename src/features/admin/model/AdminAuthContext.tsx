'use client';

import { createContext, useContext, type ReactNode } from 'react';

type AdminAuthContextType = {
  password: string;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

interface Props {
  children: ReactNode;
  password: string;
  onLogout: () => void;
}

export function AdminAuthProvider({ children, password, onLogout }: Props) {
  return (
    <AdminAuthContext.Provider value={{ password, logout: onLogout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuthContext() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuthContext must be used within AdminAuthProvider');
  return ctx;
}
