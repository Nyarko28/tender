interface ProcurEaseLogoProps {
  /** Size of the logo in pixels (default 36). Icon scales with this. */
  size?: number;
  /** Optional class for the wrapper (e.g. for layout). */
  className?: string;
}

/**
 * ProcurEase logo: document with checkmark (procurement made easy).
 * Use on landing navbar, footer, and any branded header.
 */
export function ProcurEaseLogo({ size = 36, className = '' }: ProcurEaseLogoProps) {
  const s = size;
  const stroke = '#fff';
  const bg = '#2563eb';

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg ${className}`}
      style={{
        width: s,
        height: s,
        backgroundColor: bg,
      }}
      aria-hidden
    >
      <svg
        width={s * 0.6}
        height={s * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Document */}
        <path
          d="M6 4h7l4 4v11H6V4z"
          stroke={stroke}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
        {/* Checkmark */}
        <path
          d="M9 12l3 3 6-6"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
