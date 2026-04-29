import {
  reviewPayloadSchema,
  reviewMinimumSchema,
} from '@/shared/types/review';
import { isGenerateIntent } from './isGenerateIntent';
import type { ReviewPayload } from '@/shared/types/review';

interface ConversationResult {
  parsedInfo: Partial<ReviewPayload>;
  nextResponse: string;
  isReady: boolean;
  confidence: number;
}

export function normalizeConversationResult(
  result: ConversationResult,
  userMessage: string,
  collectedInfo: Partial<ReviewPayload>,
) {
  const mergedInfo = { ...collectedInfo, ...result.parsedInfo };
  const wantsGenerate = isGenerateIntent(userMessage);
  const isReady = computeIsReady(mergedInfo, wantsGenerate);

  if (wantsGenerate && !isReady) {
    const missing = getMissingFields(mergedInfo);
    return {
      ...result,
      isReady: false,
      nextResponse: buildMissingFieldsMessage(missing),
    };
  }

  return { ...result, isReady };
}

export function computeIsReady(
  info: Partial<ReviewPayload>,
  wantsGenerate: boolean,
): boolean {
  if (reviewPayloadSchema.safeParse(info).success) return true;
  if (wantsGenerate) return reviewMinimumSchema.safeParse(info).success;
  return false;
}

const FIELD_LABELS: Record<string, string> = {
  name: '매장명/장소 이름',
};

export function getMissingFields(info: Partial<ReviewPayload>): string[] {
  return Object.entries(FIELD_LABELS)
    .filter(([key]) => !info[key as keyof ReviewPayload])
    .map(([, label]) => label);
}

export function buildMissingFieldsMessage(missing: string[]): string {
  if (missing.length === 0) return '';
  return `리뷰를 생성하려면 ${missing.join(', ')} 정보가 필요해요! 알려주시면 바로 만들어 드릴게요.`;
}
