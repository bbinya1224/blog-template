/**
 * CSS 모듈 타입 선언
 * TypeScript가 CSS 파일 import를 인식하도록 설정
 */

// CSS 파일 import
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// SCSS 파일 import
declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

// SVG 파일을 React 컴포넌트로 import
declare module '*.svg' {
  import type * as React from 'react';
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement>
  >;
  const src: string;
  export default src;
}

// 이미지 파일
declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.ico' {
  const content: string;
  export default content;
}
