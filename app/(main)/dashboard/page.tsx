import Link from 'next/link';
import { requireAuth } from '@/shared/lib/auth-utils';
import { SectionCard } from '@/shared/ui/section-card';

const quickActions = [
  {
    title: "1단계 · 스타일 분석",
    body: "RSS 주소와 최근 글 수를 입력하면 내 말투를 JSON 프로필로 추출합니다.",
    href: "/analyze",
    cta: "스타일 분석 시작",
  },
  {
    title: "2단계 · 리뷰 생성",
    body: "가게 정보와 템플릿 요소를 입력하면 1500자 리뷰 초안을 만듭니다.",
    href: "/generate",
    cta: "리뷰 생성하기",
  },
  {
    title: "3단계 · 리뷰 보관함",
    body: "생성된 리뷰들을 확인하고 관리할 수 있습니다.",
    href: "/reviews",
    cta: "리뷰 보관함 열기",
  },
];

export default async function DashboardPage() {
  // 인증 체크 - 로그인하지 않은 경우 자동 리다이렉트
  const session = await requireAuth();

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
          Dashboard
        </p>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold leading-tight text-gray-900 md:text-4xl">
            안녕하세요, {session.user?.name || '블로거'}님!
          </h1>
          <p className="text-lg text-gray-600">
            내 블로그 톤 그대로 리뷰를 자동으로 만들어보세요.
          </p>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => (
          <SectionCard key={action.title} title={action.title}>
            <p className="text-gray-600">{action.body}</p>
            <Link
              href={action.href}
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
            >
              {action.cta}
            </Link>
          </SectionCard>
        ))}
      </div>

      <SectionCard
        title="💡 사용 팁"
        description="효과적으로 사용하는 방법"
      >
        <ul className="list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>
            <strong>스타일 분석</strong>은 한 번만 하면 됩니다.
            분석 결과는 자동으로 저장됩니다.
          </li>
          <li>
            <strong>리뷰 생성</strong>은 무제한으로 가능합니다.
            여러 가게의 리뷰를 만들어보세요!
          </li>
          <li>
            <strong>리뷰 보관함</strong>에서 생성된 리뷰를 확인하고
            수정할 수 있습니다.
          </li>
        </ul>
      </SectionCard>
    </div>
  );
}
