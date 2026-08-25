export const metadata = {
  title: 'Join Rebuilt',
};

export default function CheckoutPage() {
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
      }}
    >
      <div
        style={{
          background: '#F6F3EC',
          border: '1px solid #DEDBD3',
          borderRadius: 20,
          padding: '36px 32px',
          maxWidth: 440,
          width: '100%',
          boxShadow: '0 8px 40px 4px rgba(20,18,15,0.10)',
        }}
      >
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#C0392B',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 10,
          }}
        >
          Rebuilt Program
        </p>
        <h1
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 500,
            fontSize: 26,
            marginBottom: 20,
            color: '#1A1A18',
          }}
        >
          Join the community
        </h1>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 24 }}>
          <span
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 44,
              fontWeight: 500,
              color: '#1A1A18',
            }}
          >
            $19.99
          </span>
          <span style={{ fontSize: 15, color: '#8C8A83' }}>/ month</span>
        </div>

        <ul style={{ listStyle: 'none', margin: '0 0 28px', padding: 0 }}>
          {[
            'Full access to your progressive strength program',
            'Level-based exercises that grow with you',
            'Daily pain tracking to see your real progress',
            'Cancel anytime, no long-term contract',
          ].map((item) => (
            <li
              key={item}
              style={{
                display: 'flex',
                gap: 10,
                fontSize: 14,
                color: '#5C5B56',
                marginBottom: 12,
                lineHeight: 1.5,
              }}
            >
              <span style={{ color: '#C0392B', flexShrink: 0 }}>✓</span>
              {item}
            </li>
          ))}
        </ul>

        {/*
          This is a plain HTML form, same as Stripe's own quickstart —
          it POSTs to our API route, which creates a real Checkout
          Session server-side and redirects to Stripe's hosted page.
          No client-side Stripe.js needed for this simple flow.
        */}
        <form action="/api/create-checkout-session" method="POST">
          <input
            type="hidden"
            name="lookup_key"
            value={process.env.NEXT_PUBLIC_STRIPE_PRICE_LOOKUP_KEY ?? 'rebuilt_monthly'}
          />
          <button
            type="submit"
            style={{
              width: '100%',
              background: '#C0392B',
              color: '#1A1A18',
              padding: '14px 30px',
              borderRadius: 50,
              fontSize: 15,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Continue to payment
          </button>
        </form>

        <p
          style={{
            fontSize: 12,
            color: '#8C8A83',
            textAlign: 'center',
            marginTop: 16,
            lineHeight: 1.5,
          }}
        >
          Secure payment powered by Stripe. You'll be screened with a few
          quick safety questions right after checkout, before your program
          begins.
        </p>
      </div>
    </main>
  );
}
