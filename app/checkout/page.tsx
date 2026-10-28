import { PRICES, parsePlan } from '@/lib/plans';

export const metadata = {
  title: 'Join Rebuilt',
};

export default function CheckoutPage({ searchParams }: { searchParams: { plan?: string } }) {
  // ?plan=yearly comes from the homepage switch; anything else starts on monthly
  const plan = parsePlan(searchParams.plan);

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
          <fieldset className="co-plans">
            <legend>Choose your plan</legend>
            <label className="co-plan">
              <input type="radio" name="plan" value="monthly" defaultChecked={plan === 'monthly'} />
              <span className="co-plan-name">
                Monthly
                <small>Billed every month</small>
              </span>
              <span className="co-plan-price">
                {PRICES.monthly}
                <small>/ month</small>
              </span>
            </label>
            <label className="co-plan">
              <input type="radio" name="plan" value="yearly" defaultChecked={plan === 'yearly'} />
              <span className="co-plan-name">
                <span>
                  Yearly <span className="co-plan-badge">Save {PRICES.yearlySavePct}%</span>
                </span>
                <small>Billed {PRICES.yearly} once a year</small>
              </span>
              <span className="co-plan-price">
                {PRICES.yearlyPerMonth}
                <small>/ month</small>
              </span>
            </label>
          </fieldset>
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
          Secure payment powered by Stripe. After paying, you’ll create your password.
        </p>

        <p style={{ fontSize: 13, color: '#5C5B56', textAlign: 'center', marginTop: 14 }}>
          Already a member?{' '}
          <a href="/login" style={{ color: '#C0392B', fontWeight: 600 }}>
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}
