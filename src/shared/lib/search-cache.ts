/**
 * Search Result Cache
 * 24시간 TTL로 Tavily 검색 결과 캐싱
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

class SearchCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * 캐시에서 값 조회
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // TTL 체크
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * 캐시에 값 저장
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * 캐시 키 생성 (쿼리 정규화)
   */
  static createKey(query: string): string {
    // 공백 정규화, 소문자 변환
    return query.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  /**
   * 캐시 통계
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * 만료된 캐시 정리
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > CACHE_TTL_MS) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * 캐시 전체 삭제
   */
  clear(): void {
    this.cache.clear();
  }
}

// 싱글톤 인스턴스
export const searchCache = new SearchCache();
