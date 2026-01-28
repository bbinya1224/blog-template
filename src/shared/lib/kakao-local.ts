import { AppError, RateLimitError } from '@/shared/lib/errors';
import { withTimeoutAndRetry } from '@/shared/lib/timeout';

/**
 * 카카오 로컬 검색 API 응답 타입
 */
export interface KakaoPlaceDocument {
  place_name: string; // 장소명
  category_name: string; // 카테고리 (예: 음식점 > 한식 > 냉면)
  category_group_code: string; // 카테고리 그룹 코드
  category_group_name: string; // 카테고리 그룹명
  phone: string; // 전화번호
  address_name: string; // 지번 주소
  road_address_name: string; // 도로명 주소
  id: string; // 장소 ID
  place_url: string; // 카카오맵 URL
  x: string; // X 좌표 (경도)
  y: string; // Y 좌표 (위도)
  distance: string; // 중심 좌표까지의 거리 (meter)
}

interface KakaoLocalMeta {
  total_count: number;
  pageable_count: number;
  is_end: boolean;
  same_name: {
    region: string[];
    keyword: string;
    selected_region: string;
  };
}

interface KakaoLocalSearchResponse {
  meta: KakaoLocalMeta;
  documents: KakaoPlaceDocument[];
}

/**
 * 정제된 카카오 장소 정보
 */
export interface KakaoPlaceInfo {
  name: string;
  category: string;
  phone: string;
  roadAddress: string;
  address: string;
  mapLink: string;
}

const KAKAO_TIMEOUT_MS = 10000;
const KAKAO_RETRY_OPTIONS = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 5000,
  onRetry: (attempt: number, error: unknown) => {
    console.warn(`[Kakao] 재시도 ${attempt}회:`, error);
  },
};

/**
 * 카카오 로컬 검색 API 클라이언트
 */
export async function searchKakaoPlace(
  query: string,
): Promise<KakaoPlaceInfo | null> {
  try {
    console.log(`\n[Kakao] 로컬 검색 시작: "${query}"`);

    const apiKey = process.env.KAKAO_REST_API_KEY;

    if (!apiKey) {
      console.warn(
        '[Kakao] API 키가 설정되지 않았습니다. 카카오 검색을 건너뜁니다.',
      );
      return null;
    }

    // 카카오 로컬 검색 API 호출
    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=1`;

    const response = await withTimeoutAndRetry(
      () =>
        fetch(url, {
          headers: {
            Authorization: `KakaoAK ${apiKey}`,
          },
        }),
      KAKAO_TIMEOUT_MS,
      KAKAO_RETRY_OPTIONS,
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new RateLimitError(
          '카카오 API 요청 한도 초과. 잠시 후 다시 시도해주세요.',
        );
      }
      throw new AppError(
        `카카오 API 호출 실패: ${response.status} ${response.statusText}`,
        'KAKAO_API_ERROR',
        response.status,
      );
    }

    const data: KakaoLocalSearchResponse = await response.json();

    console.log(
      `[Kakao] 검색 완료: ${data.meta.total_count}개 결과 (${data.documents.length}개 반환)`,
    );

    if (!data.documents || data.documents.length === 0) {
      console.warn('[Kakao] 검색 결과가 없습니다.');
      return null;
    }

    // 첫 번째 결과 사용
    const doc = data.documents[0];

    const placeInfo: KakaoPlaceInfo = {
      name: doc.place_name,
      category: doc.category_name,
      phone: doc.phone || '정보 없음',
      roadAddress: doc.road_address_name || '정보 없음',
      address: doc.address_name || '정보 없음',
      mapLink: doc.place_url,
    };

    console.log(`[Kakao] 장소명: ${placeInfo.name}`);
    console.log(`[Kakao] 전화번호: ${placeInfo.phone}`);
    console.log(`[Kakao] 도로명 주소: ${placeInfo.roadAddress}`);

    return placeInfo;
  } catch (error) {
    console.error('❌ [Kakao] 검색 실패 (재시도 후):', error);
    return null; // 검색 실패 시 null 반환 (다른 검색은 계속 진행)
  }
}

/**
 * 카카오 장소 정보를 문자열로 포맷팅
 */
export function formatKakaoPlaceInfo(info: KakaoPlaceInfo | null): string {
  if (!info) {
    return '카카오 검색 결과 없음';
  }

  return `
**장소명**: ${info.name}
**카테고리**: ${info.category}
**전화번호**: ${info.phone}
**도로명 주소**: ${info.roadAddress}
**지번 주소**: ${info.address}
**카카오맵**: ${info.mapLink}
  `.trim();
}
