/**
 * LocalStorage를 React state처럼 사용하는 커스텀 훅
 * 타입 안전성과 SSR 호환성 보장
 */

import { useCallback, useState } from 'react';

type SetValue<T> = T | ((prev: T) => T);

export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
): [T, (value: SetValue<T>) => void, () => void] => {
  // SSR 대응: 서버에서는 initialValue 사용
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 값 설정 함수 (함수형 업데이트 지원)
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue],
  );

  // 값 삭제 함수
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};
