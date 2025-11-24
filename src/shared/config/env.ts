/**
 * 환경 변수 검증 및 관리
 */

/**
 * 필수 환경 변수 목록
 */
const REQUIRED_ENV_VARS = [
  'ANTHROPIC_API_KEY',
  'TAVILY_API_KEY',
] as const;

/**
 * 선택적 환경 변수 목록 (미래 확장용)
 */
const OPTIONAL_ENV_VARS = [] as const;

/**
 * 환경 변수 타입 정의
 */
export type RequiredEnvVar = (typeof REQUIRED_ENV_VARS)[number];
export type OptionalEnvVar = (typeof OPTIONAL_ENV_VARS)[number];
export type EnvVar = RequiredEnvVar | OptionalEnvVar;

/**
 * 환경 변수 검증 결과
 */
export type EnvValidationResult =
  | { success: true }
  | { success: false; missing: string[]; message: string };

/**
 * 필수 환경 변수 검증
 *
 * @returns 검증 결과 객체
 *
 * @example
 * const result = validateRequiredEnv();
 * if (!result.success) {
 *   console.error(result.message);
 * }
 */
export const validateRequiredEnv = (): EnvValidationResult => {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    return {
      success: false,
      missing,
      message: `필수 환경 변수가 설정되지 않았습니다: ${missing.join(', ')}\n.env.local 파일을 확인해주세요.`,
    };
  }

  return { success: true };
};

/**
 * 환경 변수 검증 및 에러 발생
 * 검증 실패 시 Error를 throw합니다.
 *
 * @throws {Error} 필수 환경 변수가 누락된 경우
 *
 * @example
 * // 애플리케이션 시작 시점에 호출
 * validateEnvOrThrow();
 */
export const validateEnvOrThrow = (): void => {
  const result = validateRequiredEnv();

  if (!result.success) {
    throw new Error(result.message);
  }
};

/**
 * 특정 환경 변수 가져오기 (타입 안전)
 *
 * @param key - 환경 변수 키
 * @returns 환경 변수 값 또는 undefined
 */
export const getEnv = (key: EnvVar): string | undefined => {
  return process.env[key];
};

/**
 * 필수 환경 변수 가져오기
 * 값이 없으면 에러를 발생시킵니다.
 *
 * @param key - 환경 변수 키
 * @returns 환경 변수 값
 * @throws {Error} 환경 변수가 설정되지 않은 경우
 */
export const getRequiredEnv = (key: RequiredEnvVar): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(
      `필수 환경 변수 '${key}'가 설정되지 않았습니다.\n.env.local 파일을 확인해주세요.`
    );
  }

  return value;
};

/**
 * 환경 변수 검증 상태 로깅 (개발용)
 */
export const logEnvStatus = (): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log('\n[환경 변수 검증]');
    REQUIRED_ENV_VARS.forEach((key) => {
      const isSet = !!process.env[key];
      const status = isSet ? '✓' : '✗';
      const masked = isSet ? '****' : '미설정';
      console.log(`  ${status} ${key}: ${masked}`);
    });
    console.log('');
  }
};
