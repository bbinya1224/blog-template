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
