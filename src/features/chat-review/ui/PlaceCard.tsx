'use client';

import { cn } from '@/shared/lib/utils';
import type { PlaceCardMetadata } from '@/entities/chat-message';

interface PlaceCardProps {
  metadata: PlaceCardMetadata;
  onConfirm?: (confirmed: boolean) => void;
  className?: string;
}

export function PlaceCard({ metadata, onConfirm, className }: PlaceCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border-2 border-stone-100 overflow-hidden',
        'shadow-sm hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      {/* Header with place info */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-stone-800 text-lg leading-tight">
              {metadata.name}
            </h3>
            {metadata.category && (
              <p className="text-sm text-stone-400 mt-0.5">{metadata.category}</p>
            )}
          </div>
          {metadata.rating != null && (
            <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg">
              <svg
                className="size-4  text-amber-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium text-amber-600">
                {metadata.rating}
              </span>
            </div>
          )}
        </div>

        {/* Address and contact */}
        <div className="space-y-2 text-sm text-stone-500">
          <p className="flex items-start gap-2.5">
            <svg
              className="size-4  mt-0.5 shrink-0 text-stone-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{metadata.roadAddress || metadata.address}</span>
          </p>
          {metadata.phone && (
            <p className="flex items-center gap-2.5">
              <svg
                className="size-4  shrink-0 text-stone-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span>{metadata.phone}</span>
            </p>
          )}
        </div>

        {/* Tags */}
        {metadata.tags && metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {metadata.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-orange-50 text-orange-500 px-2.5 py-1 rounded-full font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {metadata.description && (
          <p className="text-sm text-stone-500 pt-1 leading-relaxed">
            {metadata.description}
          </p>
        )}
      </div>

      {/* Action buttons */}
      {onConfirm && (
        <div className="flex border-t border-stone-100">
          <button
            onClick={() => onConfirm(true)}
            className={cn(
              'flex-1 py-3.5 text-sm font-medium',
              'text-orange-500 hover:bg-orange-50',
              'transition-colors duration-150'
            )}
          >
            네, 맞아요!
          </button>
          <div className="w-px bg-stone-100" />
          <button
            onClick={() => onConfirm(false)}
            className={cn(
              'flex-1 py-3.5 text-sm font-medium',
              'text-stone-400 hover:bg-stone-50',
              'transition-colors duration-150'
            )}
          >
            아니에요
          </button>
        </div>
      )}
    </div>
  );
}
