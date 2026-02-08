/**
 * Category Registry
 * 카테고리 등록 및 조회
 */

import type { ReviewTopic } from '../../model/types';
import type { CategoryConfig, RegisteredCategory } from './types';

/** 카테고리 레지스트리 */
const categoryRegistry = new Map<ReviewTopic, RegisteredCategory>();

/**
 * 카테고리 등록
 */
export function registerCategory<TPayload, TStep extends string>(
  config: CategoryConfig<TPayload, TStep>
): void {
  categoryRegistry.set(config.id, config as RegisteredCategory);
}

/**
 * 카테고리 조회
 */
export function getCategory(topic: ReviewTopic): RegisteredCategory | undefined {
  return categoryRegistry.get(topic);
}

/**
 * 카테고리 존재 여부 확인
 */
export function hasCategory(topic: ReviewTopic): boolean {
  return categoryRegistry.has(topic);
}

/**
 * 등록된 모든 카테고리 ID 조회
 */
export function getRegisteredCategories(): ReviewTopic[] {
  return Array.from(categoryRegistry.keys());
}

/**
 * 카테고리 설정으로 다음 스텝 결정
 */
export function determineNextStepForCategory<TPayload>(
  topic: ReviewTopic,
  collectedInfo: Partial<TPayload>
): string | null {
  const config = getCategory(topic);
  if (!config) return null;

  for (const step of config.stepOrder) {
    const stepDef = config.steps.find(s => s.id === step);
    if (!stepDef) continue;

    const fieldValue = (collectedInfo as Record<string, unknown>)[stepDef.field];

    // 필수 필드가 비어있으면 해당 스텝 반환
    if (stepDef.isRequired && (fieldValue === undefined || fieldValue === null)) {
      return step;
    }

    // 선택 필드도 아직 처리되지 않았으면 반환
    if (!stepDef.isRequired && fieldValue === undefined) {
      return step;
    }
  }

  return null;
}

/**
 * 카테고리 정보 수집 완료 여부 확인
 */
export function isCategoryComplete<TPayload>(
  topic: ReviewTopic,
  collectedInfo: Partial<TPayload>
): boolean {
  const config = getCategory(topic);
  if (!config) return false;

  return config.isComplete(collectedInfo as Partial<unknown>);
}

/**
 * 카테고리별 수집 정보 요약 생성
 */
export function generateCategorySummary<TPayload>(
  topic: ReviewTopic,
  collectedInfo: Partial<TPayload>
): string[] {
  const config = getCategory(topic);
  if (!config) return [];

  const summaryLines: string[] = [];
  const info = collectedInfo as Record<string, unknown>;

  // Add collected info based on steps
  for (const step of config.stepOrder) {
    const stepDef = config.steps.find(s => s.id === step);
    if (!stepDef || step === 'additional') continue;

    const value = info[stepDef.field];
    if (value) {
      summaryLines.push(`• ${stepDef.field}: ${value}`);
    }
  }

  // Add pros/cons/extra if present
  if (info.pros) {
    summaryLines.push(`\n✨ 좋았던 점`);
    summaryLines.push(`• ${info.pros}`);
  }

  if (info.cons) {
    summaryLines.push(`\n😅 아쉬웠던 점`);
    summaryLines.push(`• ${info.cons}`);
  }

  if (info.extra) {
    summaryLines.push(`\n📝 기타`);
    summaryLines.push(`• ${info.extra}`);
  }

  return summaryLines;
}
