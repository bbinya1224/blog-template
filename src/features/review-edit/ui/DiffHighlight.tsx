import { diffSentences } from 'diff';

interface DiffHighlightProps {
  content: string;
  oldContent?: string;
  newContent?: string;
  mode: 'before' | 'after';
}

/**
 * 텍스트 diff를 시각적으로 표시하는 컴포넌트
 * - before 모드: 삭제된 문장을 빨간색으로 표시
 * - after 모드: 추가된 문장을 초록색으로 표시
 * - 문장 단위로 비교하여 표시
 */
export function DiffHighlight({
  content,
  oldContent,
  newContent,
  mode,
}: DiffHighlightProps) {
  const compareWith = mode === 'before' ? newContent : oldContent;

  if (!compareWith) {
    return <pre className='whitespace-pre-wrap font-sans'>{content}</pre>;
  }

  const diff = diffSentences(
    mode === 'before' ? content : compareWith,
    mode === 'before' ? compareWith : content,
  );

  return (
    <pre className='whitespace-pre-wrap font-sans'>
      {diff.map((part, index) => {
        const keyType = part.added ? 'add' : part.removed ? 'rem' : 'same';
        const key = `${index}-${keyType}-${part.value.substring(0, 20)}`;

        if (part.added && mode === 'after') {
          return (
            <span
              key={key}
              className='bg-green-100 text-green-800 rounded px-1'
            >
              {part.value}
            </span>
          );
        }

        if (part.removed && mode === 'before') {
          return (
            <span key={key} className='bg-red-100 text-red-700 rounded px-1'>
              {part.value}
            </span>
          );
        }

        if (!part.added && !part.removed) {
          return (
            <span key={key} className='text-gray-700'>
              {part.value}
            </span>
          );
        }

        return null;
      })}
    </pre>
  );
}
