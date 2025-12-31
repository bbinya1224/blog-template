'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FAQ_ITEMS } from '@/shared/config/constants';

export default function LandingPage() {
  const { status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-transparent bg-white/80 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 md:px-12">
          <span className="text-xl font-bold tracking-tight text-gray-900">BlogLab</span>
          <div className="flex items-center gap-4">
            <a href="https://www.buymeacoffee.com/bbinya" target="_blank" rel="noreferrer" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              후원하기
            </a>
            <button
              onClick={() => signIn('google')}
              className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95"
            >
              로그인
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        <section className="relative overflow-hidden px-6 pb-20 pt-16 md:pt-32">
          <div className="mx-auto max-w-4xl text-center animate-fade-in-up">
            <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-7xl">
              블로그 포스팅,<br />
              <span className="text-blue-600">AI</span>에게 맡기세요.
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-xl font-medium leading-relaxed text-gray-500 md:text-2xl">
              내 말투를 완벽하게 학습한 AI가<br className="md:hidden lg:block" />
              1,500자 리뷰를 3초 만에 완성해드립니다.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={() => signIn('google')}
                className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-blue-600 px-8 py-4 text-xl font-bold text-white shadow-xl transition-all hover:bg-blue-700 hover:shadow-2xl active:scale-95"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="G"
                  className="h-6 w-6 rounded-full bg-white p-0.5"
                />
                지금 바로 시작하기
              </button>
              <a
                href="https://www.buymeacoffee.com/bbinya"
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-gray-100 px-8 py-4 text-lg font-bold text-gray-700 transition hover:bg-gray-200 active:scale-95"
              >
                $3 커피 한 잔 값으로 평생 소장 ☕️
              </a>
            </div>
            
            <p className="mt-6 text-sm text-gray-400">
              * 가입비 없음 · 평생 무료 업데이트
            </p>
          </div>
        </section>

        <section className="bg-gray-50 px-6 py-24 md:py-32">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 md:text-center">
              <span className="mb-4 inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm font-bold text-blue-600">
                왜 BlogLab인가요?
              </span>
              <h2 className="text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
                매번 &quot;1,500자 채우기&quot;<br />
                너무 힘들지 않으셨나요?
              </h2>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-3xl bg-white p-8 shadow-sm transition hover:shadow-md md:p-12">
                <div className="mb-6 text-4xl">😫</div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900">Before</h3>
                <ul className="space-y-3 text-lg text-gray-500">
                  <li className="flex items-center gap-2">
                    <span className="text-red-400">✕</span>
                    글자 수 세느라 스트레스
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-400">✕</span>
                    비슷한 표현 반복 사용
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-red-400">✕</span>
                    평균 작성 시간 1시간 이상
                  </li>
                </ul>
              </div>
              <div className="rounded-3xl bg-blue-600 p-8 shadow-xl transition transform md:scale-105 md:p-12">
                <div className="mb-6 text-4xl">🤩</div>
                <h3 className="mb-3 text-2xl font-bold text-white">After</h3>
                <ul className="space-y-3 text-lg text-blue-100">
                  <li className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-500 p-1 text-xs text-white">✓</span>
                    키워드만 넣으면 끝
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-500 p-1 text-xs text-white">✓</span>
                    내 말투 100% 반영
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-500 p-1 text-xs text-white">✓</span>
                    작성 시간 단 3초
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-24 md:py-32">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-16 text-3xl font-bold leading-tight text-gray-900 md:text-center md:text-5xl">
              블로거를 위한<br />
              모든 기능을 담았습니다.
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  emoji: "🧬",
                  title: "스타일 DNA 분석",
                  desc: "내 블로그 RSS만 입력하세요. AI가 문체, 톤앤매너, 자주 쓰는 표현을 정밀하게 분석합니다."
                },
                {
                  emoji: "🔎",
                  title: "자동 정보 검색",
                  desc: "가게 이름만 알려주세요. 영업시간, 위치, 메뉴 가격까지 최신 정보를 자동으로 찾아옵니다."
                },
                {
                  emoji: "✨",
                  title: "완벽한 포스팅",
                  desc: "검색 정보와 내 스타일을 결합해, 바로 발행 가능한 고품질 원고를 만들어냅니다."
                }
              ].map((feature, idx) => (
                <div key={idx} className="group rounded-3xl border border-gray-100 bg-white p-8 transition hover:border-blue-100 hover:bg-blue-50/50 hover:shadow-lg">
                  <div className="mb-6 text-5xl transition group-hover:scale-110">{feature.emoji}</div>
                  <h3 className="mb-3 text-xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="leading-relaxed text-gray-500">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-900 px-6 py-24 text-white md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-3xl font-bold md:text-5xl">
              커피 한 잔 값이면 충분합니다.
            </h2>
            <p className="mb-12 text-xl text-gray-400">
              복잡한 구독료는 잊으세요. 단 한 번 결제로 평생 이용하세요.
            </p>

            <div className="relative mx-auto max-w-md overflow-hidden rounded-3xl bg-gray-800 p-10 shadow-2xl transition hover:scale-105">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500 blur-3xl opacity-20" />
              
              <div className="mb-2 text-sm font-bold uppercase tracking-widest text-blue-400">One-Time Pass</div>
              <div className="mb-6 flex items-baseline justify-center gap-1">
                <span className="text-6xl font-extrabold text-white">$3</span>
                <span className="text-xl text-gray-400">/ 평생</span>
              </div>

              <ul className="mb-10 space-y-4 text-left text-gray-300">
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">✓</span>
                  무제한 리뷰 생성
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">✓</span>
                  블로그 스타일 분석 무제한
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">✓</span>
                  모든 기능 평생 업데이트
                </li>
              </ul>

              <a
                href="https://www.buymeacoffee.com/bbinya"
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded-xl bg-yellow-400 py-4 text-lg font-bold text-gray-900 transition hover:bg-yellow-300"
              >
                ☕️ $3 후원하고 시작하기
              </a>
              <p className="mt-4 text-xs text-gray-500">
                * 후원 시 메시지에 <strong>이메일</strong>을 꼭 남겨주세요!
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              자주 묻는 질문
            </h2>
            <div className="space-y-4">
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className="rounded-2xl border border-gray-100 bg-gray-50 p-6 transition hover:bg-white hover:shadow-md">
                  <h3 className="mb-2 text-lg font-bold text-gray-900">Q. {item.q}</h3>
                  <p className="text-gray-600">A. {item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 bg-white py-12">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <p className="mb-2 text-sm">© 2025 BlogLab. All rights reserved.</p>
          <p className='mb-4 text-sm hover:text-amber-500'><a href="https://bbinya1224.github.io/blog" target='_blank'>Bbinya&apos;s Blog</a></p>
        </div>
      </footer>
    </div>
  );
}
