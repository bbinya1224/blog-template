import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { SectionCard } from '@/shared/ui/SectionCard';


const quickActions = [
  {
    title: '1단계 · 스타일 분석',
    body: 'RSS 주소와 최근 글 수를 입력하면 내 말투를 JSON 프로필로 추출합니다.',
    href: '/analyze',
    cta: '스타일 분석 시작',
  },
  {
    title: '2단계 · 리뷰 생성',
    body: '가게 정보와 템플릿 요소를 입력하면 1500자 리뷰 초안을 만듭니다.',
    href: '/generate',
    cta: '리뷰 생성하기',
  },
  {
    title: '3단계 · 리뷰 보관함',
    body: '생성된 리뷰들을 확인하고 관리할 수 있습니다.',
    href: '/reviews',
    cta: '리뷰 보관함 열기',
  },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className='space-y-10'>
      <section className='space-y-4'>
        <div className='flex items-center justify-between'>
          <p className='text-sm font-semibold uppercase tracking-[0.3em] text-(--primary)'>
            Dashboard
          </p>
        </div>

        <div className='space-y-3'>
          <h1 className='text-3xl/tight font-semibold text-stone-800 md:text-4xl'>
            안녕하세요, {session?.user?.name || '기록자'}님!
          </h1>
          <p className='text-lg text-stone-500'>
            오늘은 어떤 경험을 기록해볼까요?
          </p>
        </div>
      </section>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {quickActions.map((action) => (
          <SectionCard key={action.title} title={action.title}>
            <p className='text-gray-600 h-20'>{action.body}</p>
            <Link
              href={action.href}
              className='mt-4 inline-flex items-center justify-center rounded-lg bg-(--primary) px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-(--primary-hover)'
            >
              {action.cta}
            </Link>
          </SectionCard>
        ))}
      </div>

      <SectionCard title='💡 사용 팁' description='효과적으로 사용하는 방법'>
        <ul className='list-disc space-y-2 pl-5 text-sm text-gray-600'>
          <li>
            <strong>스타일 분석</strong>은 한 번만 하면 됩니다. 분석 결과는
            자동으로 저장됩니다.
          </li>
          <li>
            <strong>리뷰 생성</strong>은 무제한으로 가능합니다. 여러 가게의
            리뷰를 만들어보세요!
          </li>
          <li>
            <strong>리뷰 보관함</strong>에서 생성된 리뷰를 확인하고 수정할 수
            있습니다.
          </li>
          <li>
            문의사항 이나 버그 리포트는 언제나 환영입니다! <br />
            <strong>bbinya1224@gmail.com</strong> 으로 언제든지 남겨주세요.
          </li>
        </ul>
      </SectionCard>
    </div>
  );
}
