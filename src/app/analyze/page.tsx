"use client";

import type { FormEvent } from "react";
import { useCallback, useMemo, useState } from "react";
import { SectionCard } from "@/components/section-card";
import { StepIndicator } from "@/components/step-indicator";
import type { StyleProfile } from "@/lib/types";

const steps = [
  { label: "스타일 분석", status: "current" as const },
  { label: "리뷰 생성", status: "upcoming" as const },
  { label: "수정/보관", status: "upcoming" as const },
];

type Status = "idle" | "running" | "success" | "error";

export default function AnalyzePage() {
  const [rssUrl, setRssUrl] = useState("");
  const [maxPosts, setMaxPosts] = useState(25);
  const [status, setStatus] = useState<Status>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [styleProfile, setStyleProfile] = useState<StyleProfile | null>(null);

  const isDisabled = useMemo(
    () => status === "running" || rssUrl.trim().length === 0,
    [rssUrl, status],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setStatus("running");
      setStatusMessage("RSS에서 글을 읽어오는 중입니다…");

      try {
        const fetchResponse = await fetch("/api/fetch-rss", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rssUrl, maxPosts }),
        });

        if (!fetchResponse.ok) {
          throw new Error("RSS를 읽어오지 못했습니다.");
        }

        setStatusMessage("스타일 분석을 시작합니다…");
        const analysisResponse = await fetch("/api/analyze-style", {
          method: "POST",
        });

        if (!analysisResponse.ok) {
          throw new Error("스타일 분석에 실패했습니다.");
        }

        const data = (await analysisResponse.json()) as {
          styleProfile: StyleProfile;
          message: string;
        };

        setStyleProfile(data.styleProfile);
        setStatus("success");
        setStatusMessage(data.message);
      } catch (error) {
        console.error(error);
        setStatus("error");
        setStatusMessage(
          error instanceof Error ? error.message : "예상치 못한 오류가 발생했습니다.",
        );
      }
    },
    [rssUrl, maxPosts],
  );

  return (
    <div className="space-y-10">
      <StepIndicator steps={steps} />
      <section className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-500">
          Step 1 · Analyze
        </p>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-gray-900">
            RSS 기반으로 내 블로그 톤을 추출해요.
          </h1>
          <p className="text-gray-600">
            최근 20~30개의 포스트를 읽고 문체, 말투, 문단 구조를 JSON으로 정리합니다.
          </p>
        </div>
      </section>

      <SectionCard
        title="RSS 정보 입력"
        description="네이버 블로그 주소 형식: https://blog.naver.com/rss/{블로그ID}"
        footer={
          statusMessage && (
            <p
              className={`text-sm ${
                status === "error" ? "text-red-600" : "text-blue-600"
              }`}
            >
              {statusMessage}
            </p>
          )
        }
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="rssUrl"
              className="text-sm font-medium text-gray-700"
            >
              RSS URL
            </label>
            <input
              id="rssUrl"
              name="rssUrl"
              type="url"
              required
              value={rssUrl}
              onChange={(event) => setRssUrl(event.target.value)}
              placeholder="https://blog.naver.com/rss/블로그ID"
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="maxPosts"
                className="text-sm font-medium text-gray-700"
              >
                최근 글 개수
              </label>
              <input
                id="maxPosts"
                name="maxPosts"
                type="number"
                min={5}
                max={40}
                value={maxPosts}
                onChange={(event) => setMaxPosts(Number(event.target.value))}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <p className="mt-2 text-sm text-gray-500">
                추천 범위 20~30개, 글이 많을수록 정확도가 높아집니다.
              </p>
            </div>
          </div>
          <button
            type="submit"
            disabled={isDisabled}
            className="w-full rounded-xl bg-blue-500 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-200"
          >
            {status === "running" ? "분석 중…" : "스타일 분석하기"}
          </button>
        </form>
      </SectionCard>

      {styleProfile && (
        <SectionCard
          title="스타일 요약"
          description="Claude Sonnet이 추출한 스타일 프로필입니다."
        >
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-gray-500">문체 & 톤</p>
              <ul className="mt-3 space-y-1 text-sm text-gray-700">
                <li>문체: {styleProfile.writing_style.formality}</li>
                <li>톤: {styleProfile.writing_style.tone}</li>
                <li>감정: {styleProfile.writing_style.emotion}</li>
                <li>문장 길이: {styleProfile.writing_style.sentence_length}</li>
                <li>리듬: {styleProfile.writing_style.pacing}</li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">자주 쓰는 표현</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {styleProfile.writing_style.habitual_phrases.map((phrase) => (
                  <span
                    key={phrase}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs text-gray-700"
                  >
                    {phrase}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">구조 패턴</p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-700">
                <li>{styleProfile.structure_pattern.overall_flow}</li>
                <li>{styleProfile.structure_pattern.paragraph_pattern}</li>
                {styleProfile.structure_pattern.frequent_sections.map(
                  (section) => (
                    <li key={section}>{section}</li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
