import { cn } from '@/shared/lib/utils';
import type { ReactNode } from "react";

type SectionCardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function SectionCard({
  title,
  description,
  children,
  footer,
  className,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8",
        className,
      )}
    >
      {(title || description) && (
        <header className="mb-6 space-y-2">
          {title && (
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          )}
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </header>
      )}
      <div className="space-y-4">{children}</div>
      {footer && <div className="mt-6">{footer}</div>}
    </section>
  );
}
