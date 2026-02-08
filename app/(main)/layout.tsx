import { requireAuth } from '@/shared/lib/auth-utils';
import { getUserStatus } from '@/shared/api/data-files';
import { USAGE_LIMITS } from '@/shared/config';
import { AppShell } from '@/widgets/app-shell';

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireAuth();

  const userStatus = session?.user?.email ? await getUserStatus(session.user.email) : null;
  const isPreview = userStatus?.is_preview ?? false;
  const usageCount = userStatus?.usage_count || 0;

  return (
    <AppShell>
      <div className="px-6 py-8 pb-16 md:px-12 max-w-5xl mx-auto w-full">
        {isPreview && (
          <div className="mb-6">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                usageCount >= USAGE_LIMITS.PREVIEW_MAX_USES
                  ? 'bg-red-100 text-red-600'
                  : 'bg-orange-100 text-(--primary)'
              }`}
            >
              무료 체험 중 ({usageCount}/{USAGE_LIMITS.PREVIEW_MAX_USES})
            </span>
          </div>
        )}
        {children}
      </div>
    </AppShell>
  );
}
