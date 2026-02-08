/**
 * 스타일 분석 페이지 헤더
 */

import { ANALYSIS_CONFIG } from '@/shared/config/constants';

export const AnalysisPageHeader = () => (
  <section className="space-y-3">
    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--primary)]">
      Step 1 · Analyze
    </p>
    <div className="space-y-2">
      <h1 className="text-3xl font-semibold text-gray-900">
        RSS 기반으로 내 블로그 톤을 추출해요.
      </h1>
      <p className="text-gray-600">
        최근 {ANALYSIS_CONFIG.RECOMMENDED_MIN}~{ANALYSIS_CONFIG.RECOMMENDED_MAX}개의
        포스트를 읽고 문체, 말투, 문단 구조를 JSON으로 정리합니다.
      </p>
    </div>
  </section>
);
