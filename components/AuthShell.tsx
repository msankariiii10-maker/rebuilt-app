import '@/app/auth.css';

// Shared dark page frame for sign in / create password / reset password.
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="au-bg" aria-hidden="true" />
      <main className="au-root">
        <div className="au-card">{children}</div>
      </main>
    </>
  );
}
