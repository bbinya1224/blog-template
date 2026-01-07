'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const STEPS = [
  { label: '스타일 분석', link: '/analyze' },
  { label: '리뷰 생성', link: '/generate' },
  { label: '수정/보관', link: '/reviews' },
];

export function StepIndicator() {
  const pathname = usePathname();

  // 현재 경로가 어떤 step에 속하는지 확인 (단순 포함 여부로 판단)
  // 예: /analyze/result 도 /analyze 단계로 인식
  const currentStepIndex = STEPS.findIndex((step) =>
    pathname.startsWith(step.link)
  );
  return (
    <ol className='flex flex-wrap gap-3 text-sm font-medium text-gray-500'>
      {STEPS.map((step, index) => {
        let status: 'completed' | 'current' | 'upcoming' = 'upcoming';

        if (currentStepIndex !== -1) {
          if (index < currentStepIndex) status = 'completed';
          else if (index === currentStepIndex) status = 'current';
        } else {
          // 홈('/') 등 다른 경로일 때 처리.
          // 일단 모두 upcoming으로 두거나, 필요하면 첫 단계를 current로 할 수도 있음.
          // 여기서는 경로 매칭 안되면 모두 upcoming(회색)으로 둠.
        }

        const isLast = index === STEPS.length - 1;
        const badgeStyles =
          status === 'completed'
            ? 'bg-blue-500 text-white'
            : status === 'current'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-500';

        const content = (
          <>
            <span
              className={`mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${badgeStyles}`}
            >
              {index + 1}
            </span>
            <span
              className={status === 'current' ? 'text-gray-900' : undefined}
            >
              {step.label}
            </span>
          </>
        );

        return (
          <li key={step.label} className='flex items-center text-sm'>
            <Link
              href={step.link}
              className='flex items-center hover:opacity-80'
            >
              {content}
            </Link>
            {!isLast && <span className='mx-3 text-gray-300'>—</span>}
          </li>
        );
      })}
    </ol>
  );
}
