export const metadata = {
  title: 'Privacy Policy — Rebuilt',
};

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }} dangerouslySetInnerHTML={{ __html: `<div class="legal-page">
    <a href="/" class="back-home">← Back to home</a>
    <h1>Privacy Policy</h1>
    <p class="updated">Last updated: [DATE] — DRAFT, pending legal review</p>

    <div class="callout">
      <p><strong>This is a starting draft, not final legal advice.</strong> Have a lawyer review this before it governs real user data, especially the health-data sections.</p>
    </div>

    <h2>1. What we collect</h2>
    <p>When you create an account and use the Rebuilt program, we collect:</p>
    <ul>
      <li>Account info: name, email address, password (encrypted)</li>
      <li>Intake screening answers (health-related questions used to check you're safe to start the program)</li>
      <li>Daily pain logs and exercise progress (which level you're on, per movement)</li>
      <li>Payment information, processed and stored by Stripe — we do not store your card details ourselves</li>
    </ul>

    <h2>2. Why we collect it</h2>
    <p>We use this information to run the program itself: screening you before you start, showing you the right exercises at the right level, tracking your progress, and processing payment. We do not sell your data to third parties.</p>

    <h2>3. Where your data lives</h2>
    <p>Account and program data is stored with Supabase (our database provider). Payment data is handled by Stripe. Both are standard, widely used infrastructure providers with their own security practices.</p>

    <h2>4. Health-related data</h2>
    <p>Your intake answers and pain logs are health-related information. We treat this data with extra care: it is only used to run your program, is not shared with third parties for marketing, and is never sold. If you are located somewhere with specific health-data protections (for example, the EU), you may have additional rights over this data — contact us to exercise them.</p>

    <h2>5. Your rights</h2>
    <p>You can request a copy of your data, ask us to correct it, or request deletion of your account and associated data at any time by emailing us.</p>

    <h2>6. Cookies and analytics</h2>
    <p>[TODO: list any analytics tools you add later, e.g. Google Analytics, Vercel Analytics, and what they track.]</p>

    <h2>7. Changes to this policy</h2>
    <p>We may update this policy as the program grows. Material changes will be communicated by email or in-app notice.</p>

    <h2>8. Contact</h2>
    <p>Questions about this policy or your data: [YOUR REAL CONTACT EMAIL]</p>
  </div>
</div>` }} />
    </main>
  );
}
