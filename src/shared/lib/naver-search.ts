import { AppError } from '@/shared/lib/errors';

/**
 * 네이버 지역 검색 API 응답 타입
 */
export interface NaverPlaceItem {
  title: string; // 장소명 (HTML 태그 포함 가능)
  link: string; // 네이버 지도 링크
  category: string; // 카테고리 (예: 음식점>카페)
  description: string; // 설명
  telephone: string; // 전화번호
  address: string; // 지번 주소
  roadAddress: string; // 도로명 주소
  mapx: string; // X 좌표
  mapy: string; // Y 좌표
}

interface NaverSearchResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverPlaceItem[];
}

/**
 * 정제된 네이버 장소 정보
 */
export interface NaverPlaceInfo {
  name: string;
  category: string;
  phone: string;
  roadAddress: string;
  address: string;
  mapLink: string;
}

/**
 * HTML 태그 제거 유틸리티
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * 네이버 지역 검색 API 클라이언트
 */
export async function searchNaverPlace(
  query: string
): Promise<NaverPlaceInfo | null> {
  try {
    console.log(`\n[Naver] 지역 검색 시작: "${query}"`);

    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.warn(
        '[Naver] API 키가 설정되지 않았습니다. 네이버 검색을 건너뜁니다.'
      );
      return null;
    }

    // 네이버 지역 검색 API 호출
    const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=1&sort=random`;

    const response = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) {
      throw new AppError(
        `네이버 API 호출 실패: ${response.status} ${response.statusText}`,
        'NAVER_API_ERROR',
        response.status
      );
    }

    const data: NaverSearchResponse = await response.json();

    console.log(`[Naver] 검색 완료: ${data.total}개 결과 (${data.items.length}개 반환)`);

    if (!data.items || data.items.length === 0) {
      console.warn('[Naver] 검색 결과가 없습니다.');
      return null;
    }

    // 첫 번째 결과 사용
    const item = data.items[0];

    const placeInfo: NaverPlaceInfo = {
      name: stripHtml(item.title),
      category: item.category,
      phone: item.telephone || '정보 없음',
      roadAddress: item.roadAddress || '정보 없음',
      address: item.address || '정보 없음',
      mapLink: item.link,
    };

    console.log(`[Naver] 장소명: ${placeInfo.name}`);
    console.log(`[Naver] 전화번호: ${placeInfo.phone}`);
    console.log(`[Naver] 도로명 주소: ${placeInfo.roadAddress}`);

    return placeInfo;
  } catch (error) {
    console.error('❌ [Naver] 검색 실패:', error);
    return null; // 검색 실패 시 null 반환 (다른 검색은 계속 진행)
  }
}

/**
 * 네이버 장소 정보를 문자열로 포맷팅
 */
export function formatNaverPlaceInfo(info: NaverPlaceInfo | null): string {
  if (!info) {
    return '네이버 검색 결과 없음';
  }

  return `
**장소명**: ${info.name}
**카테고리**: ${info.category}
**전화번호**: ${info.phone}
**도로명 주소**: ${info.roadAddress}
**지번 주소**: ${info.address}
**네이버 지도**: ${info.mapLink}
  `.trim();
}
