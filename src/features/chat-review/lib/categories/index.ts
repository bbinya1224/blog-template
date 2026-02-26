// 타입 및 레지스트리 함수 re-export
export * from './types';
export * from './registry';

// 카테고리 설정 import 및 등록
import { registerCategory } from './registry';
import { restaurantConfig } from './restaurant.config';
import { bookConfig } from './book.config';

// 카테고리 등록
registerCategory(restaurantConfig);
registerCategory(bookConfig);

// 개별 설정 export (필요시 직접 접근용)
export { restaurantConfig } from './restaurant.config';
export { bookConfig } from './book.config';
