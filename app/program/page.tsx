import Link from 'next/link';

export const metadata = {
  title: 'Rebuilt Program',
};

export default function ProgramCoverPage() {
  return (
    <Link
      href="/program/week"
      className="screen active"
      id="screen-cover"
      style={{
        display: 'flex',
        minHeight: 'calc(100vh - 70px)',
        textDecoration: 'none',
      }}
    >
      <div className="cover-tap">
        <div className="cover-mark">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="9.5" y="3" width="5" height="18" rx="2" fill="#F8F0EE" />
          </svg>
        </div>
        <h1>Rebuilt Program</h1>
        <p>Not fixed. Rebuilt.</p>
        <div className="tap-hint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8C8A83" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          Tap to enter
        </div>
      </div>
    </Link>
  );
}
