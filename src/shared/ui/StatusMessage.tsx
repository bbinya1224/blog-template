/**
 * 상태 메시지 컴포넌트
 * - 공통으로 사용되는 상태/에러 메시지 표시
 */

interface StatusMessageProps {
  message: string;
  isError?: boolean;
}

export const StatusMessage = ({
  message,
  isError = false
}: StatusMessageProps) => (
  <p className={`text-sm ${isError ? 'text-red-600' : 'text-blue-600'}`}>
    {message}
  </p>
);
