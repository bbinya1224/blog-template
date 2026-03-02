interface InjectionPattern {
  pattern: RegExp;
  label: string;
}

interface DetectionResult {
  isSuspicious: boolean;
  matchedPatterns: string[];
}

const INJECTION_PATTERNS: InjectionPattern[] = [
  {
    pattern: /^\s*(system|assistant|human|user)\s*:/im,
    label: 'Role impersonation',
  },
  {
    pattern:
      /ignore\s+(previous|above|all\s+previous|all\s+above|prior)|disregard|forget\s+your\s+instructions|new\s+instructions/i,
    label: 'Instruction override',
  },
  {
    pattern:
      /repeat\s+your\s+instructions|show\s+your\s+prompt|what\s+are\s+your\s+instructions|print\s+your\s+system/i,
    label: 'Prompt leak attempt',
  },
  {
    pattern: /(#{3,}|---{3,})/,
    label: 'Delimiter injection',
  },
  {
    pattern:
      /<\/(system|user|assistant)>|<\|im_start\|>|<\|im_end\|>|<\|endoftext\|>/i,
    label: 'XML/tag manipulation',
  },
] as const;

const PROMPT_STRUCTURE_TAGS =
  /<\/(system|user|assistant)>|<\|im_start\|>|<\|im_end\|>|<\|endoftext\|>/gi;

export function detectPromptInjection(input: string): DetectionResult {
  const matchedPatterns: string[] = [];

  for (const { pattern, label } of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      matchedPatterns.push(label);
    }
  }

  return {
    isSuspicious: matchedPatterns.length > 0,
    matchedPatterns,
  };
}

export function sanitizeUserInput(input: string): string {
  const detection = detectPromptInjection(input);

  if (detection.isSuspicious) {
    console.warn('[sanitizeInput] Suspicious input detected:', {
      matchedPatterns: detection.matchedPatterns,
      inputPreview: input.slice(0, 100),
    });
  }

  return input.replace(PROMPT_STRUCTURE_TAGS, (match) =>
    match.replace(/</g, '\uFF1C').replace(/>/g, '\uFF1E'),
  );
}

export function wrapInXmlTag(
  tag: string,
  content: string,
  attributes?: Record<string, string>,
): string {
  const attrs = attributes
    ? ' ' +
      Object.entries(attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ')
    : '';

  return `<${tag}${attrs}>${content}</${tag}>`;
}
