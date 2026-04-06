const GENERATE_INTENT_PATTERN = /생성|만들어|써줘|작성해/;

export function isGenerateIntent(text: string): boolean {
  return GENERATE_INTENT_PATTERN.test(text.toLowerCase());
}
