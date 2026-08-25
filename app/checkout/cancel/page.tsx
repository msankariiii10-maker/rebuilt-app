export default function CheckoutCancelPage() {
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
            fontSize: 26,
            marginBottom: 14,
            color: '#1A1A18',
          }}
        >
          No worries.
        </h1>
        <p style={{ color: '#5C5B56', fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>
          Checkout was cancelled — nothing was charged.
        </p>
        <a
          href="/checkout"
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
          Back to checkout
        </a>
      </div>
    </main>
  );
}
