import Link from 'next/link';
import { SectionCard } from '@/shared/ui/section-card';

const quickActions = [
  {
    title: "1단계 · 스타일 분석",
    body: "RSS 주소와 최근 글 수를 입력하면 내 말투를 JSON 프로필로 추출합니다. (PDF 분석도 가능)",
    href: "/analyze",
    cta: "스타일 분석 시작",
  },
  {
    title: "2단계 · 리뷰 생성",
    body: "가게 정보와 템플릿 요소를 입력하면 1500자 리뷰 초안을 만듭니다.",
    href: "/generate",
    cta: "리뷰 생성하기",
  },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
          Setup Guide
        </p>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold leading-tight text-gray-900 md:text-4xl">
            내 블로그 톤 그대로 리뷰를 자동으로 만들어보세요.
          </h1>
          <p className="text-lg text-gray-600">
            먼저 RSS를 기반으로 스타일을 학습시키고, 이후에는 가게 정보를
            입력하기만 하면 1500자 이상의 리뷰가 완성됩니다.
          </p>
        </div>
      </section>
      <div className="grid gap-6 md:grid-cols-2">
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
      <SectionCard title="폴더 구조" description="로컬 파일 기반 저장 위치 요약">
        <ul className="list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
              /data/rss-content/blog-posts.txt
            </code>
            · RSS에서 정제된 원본 글
          </li>
          <li>
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
              /data/styles/my-style.json
            </code>
            · 스타일 분석 결과
          </li>
          <li>
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
              /data/reviews/&lt;가게명&gt;_&lt;날짜&gt;.md
            </code>
            · 생성된 리뷰 보관소
          </li>
        </ul>
      </SectionCard>
    </div>
  );
}
