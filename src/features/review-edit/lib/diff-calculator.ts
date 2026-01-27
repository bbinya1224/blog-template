import { diffSentences } from 'diff';

export interface DiffStats {
  added: number;
  removed: number;
  changed: number;
}

/**
 * 두 텍스트의 차이를 문장 단위로 계산하여 통계 정보를 반환
 */
export function calculateDiffStats(
  originalContent: string,
  editedContent: string
): DiffStats {
  const diff = diffSentences(originalContent, editedContent);

  let added = 0;
  let removed = 0;
  let changed = 0;

  diff.forEach((part) => {
    if (part.added) {
      added += part.value.length;
      changed++;
    } else if (part.removed) {
      removed += part.value.length;
      changed++;
    }
  });

  return { added, removed, changed };
}
