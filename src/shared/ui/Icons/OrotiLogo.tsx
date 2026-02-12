export function OrotiLogo({ className = 'size-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 36"
      fill="none"
      className={className}
      aria-label="오롯이 로고"
    >
      <line
        x1="8"
        y1="8"
        x2="24"
        y2="8"
        stroke="#E8825C"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1="16"
        y1="8"
        x2="16"
        y2="12"
        stroke="#E8825C"
        strokeWidth="5"
        strokeLinecap="round"
      />

      <ellipse cx="16" cy="24" rx="13" ry="11" fill="#E8825C" />
      <ellipse cx="16" cy="24" rx="9" ry="7" fill="#FFFBF7" />
      <ellipse cx="16" cy="24" rx="5" ry="4" fill="#F4A261" />
    </svg>
  );
}
