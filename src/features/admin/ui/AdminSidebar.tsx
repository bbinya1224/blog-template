'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, BarChart3, LogOut } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const NAV_ITEMS = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/users', label: '사용자 관리', icon: Users },
  { href: '/admin/prompts', label: '프롬프트 관리', icon: FileText },
  { href: '/admin/usage', label: '사용량 분석', icon: BarChart3 },
] as const;

interface Props {
  onLogout: () => void;
}

export function AdminSidebar({ onLogout }: Props) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-stone-200 bg-white">
      <div className="border-b border-stone-200 px-6 py-5">
        <h1 className="text-lg font-bold text-stone-900">관리자</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-stone-100 text-stone-900'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900',
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-stone-200 px-3 py-4">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-900"
        >
          <LogOut className="size-4" />
          로그아웃
        </button>
      </div>
    </aside>
  );
}
