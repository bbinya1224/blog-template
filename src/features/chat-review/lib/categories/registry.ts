import type { ReviewTopic } from '../../model/types';
import type { CategoryConfig, RegisteredCategory } from './types';

const categoryRegistry = new Map<ReviewTopic, RegisteredCategory>();

export function registerCategory<TPayload, TStep extends string>(
  config: CategoryConfig<TPayload, TStep>
): void {
  categoryRegistry.set(config.id, config as RegisteredCategory);
}

export function getCategory(topic: ReviewTopic): RegisteredCategory | undefined {
  return categoryRegistry.get(topic);
}

export function hasCategory(topic: ReviewTopic): boolean {
  return categoryRegistry.has(topic);
}

export function getRegisteredCategories(): ReviewTopic[] {
  return Array.from(categoryRegistry.keys());
}

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

export function isCategoryComplete<TPayload>(
  topic: ReviewTopic,
  collectedInfo: Partial<TPayload>
): boolean {
  const config = getCategory(topic);
  if (!config) return false;

  return config.isComplete(collectedInfo as Partial<unknown>);
}

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
