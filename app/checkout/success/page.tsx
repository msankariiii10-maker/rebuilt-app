export default function CheckoutSuccessPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#F8F6F1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'Inter', Helvetica, sans-serif",
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 420 }}>
        <h1
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 30,
            marginBottom: 14,
            color: '#1A1A18',
          }}
        >
          You're in.
        </h1>
        <p style={{ color: '#5C5B56', fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>
          Payment confirmed. Next, we'll ask a few quick safety questions
          before your program begins.
        </p>
        {/* TODO: link this to your real signup/intake flow once accounts
            are wired to Stripe subscriptions via webhook. */}
        <a
          href="/signup"
          style={{
            display: 'inline-block',
            background: '#C0392B',
            color: '#1A1A18',
            padding: '12px 28px',
            borderRadius: 50,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          Create your account
        </a>
      </div>
    </main>
  );
}
