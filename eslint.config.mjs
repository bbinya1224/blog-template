import eslintPluginBetterTailwindcss from "eslint-plugin-better-tailwindcss";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    extends: [eslintPluginBetterTailwindcss.configs["recommended-warn"]],
    settings: {
      "better-tailwindcss": {
        entryPoint: "src/app/style/globals.css",
      },
    },
    rules: {
      // Prettier가 처리하는 영역 — 충돌 방지를 위해 끔
      "better-tailwindcss/enforce-consistent-line-wrapping": "off",
      "better-tailwindcss/enforce-consistent-class-order": "off",
      "better-tailwindcss/no-unnecessary-whitespace": "off",
      // 커스텀 CSS·Radix UI·애니메이션 플러그인 클래스 오탐이 많아 끔
      "better-tailwindcss/no-unknown-classes": "off",
    },
  },
  {
    rules: {
      // _접두사 변수는 의도적 미사용 허용
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // React Compiler 규칙 — localStorage 하이드레이션 등 표준 패턴까지 잡아서 warn으로 완화
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Claude Code hook scripts (CJS, require() 필수)
    ".claude/scripts/**",
  ]),
]);

export default eslintConfig;
