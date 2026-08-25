export const metadata = {
  title: 'Terms of Service — Rebuilt',
};

export default function TermsPage() {
  return (
    <main style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }} dangerouslySetInnerHTML={{ __html: `<div class="legal-page">
    <a href="/" class="back-home">← Back to home</a>
    <h1>Terms of Service</h1>
    <p class="updated">Last updated: [DATE] — DRAFT, pending legal review</p>

    <div class="callout">
      <p><strong>This is a starting draft, not final legal advice.</strong> Have a lawyer review this, especially the liability and jurisdiction sections, before real money changes hands.</p>
    </div>

    <h2>1. Who this program is for</h2>
    <p>Rebuilt is intended for adults aged 18 and over. By creating an account, you confirm you meet this requirement.</p>

    <h2>2. What you're purchasing</h2>
    <p>Rebuilt gives you access to a structured, self-guided exercise program (Low Back, or Low Back + Knee) for the duration of your subscription or purchase. [TODO: specify exact plan — one-time purchase, monthly subscription, etc. — once pricing is finalized.]</p>

    <h2>3. Billing and cancellation</h2>
    <p>[TODO: fill in once pricing is live — billing cadence, how to cancel, whether cancellation is immediate or end-of-period.]</p>

    <h2>4. Refunds</h2>
    <p>[TODO: state your actual refund policy — e.g. "refunds available within 14 days of purchase if you haven't progressed past Phase 1" or similar. Be specific; vague refund policies cause disputes.]</p>

    <h2>5. Account responsibilities</h2>
    <p>You're responsible for keeping your login credentials secure and for the accuracy of the information you provide, including your intake screening answers. Providing false information during screening (for example, hiding a red-flag symptom) is at your own risk.</p>

    <h2>6. Program is not medical treatment</h2>
    <p>Rebuilt is an educational exercise program, not medical treatment, diagnosis, or physical therapy delivered by a licensed practitioner to you individually. See the <a href="/legal/medical" style="color:var(--primary);">Medical Disclaimer &amp; Waiver</a> for full detail — it's incorporated into these Terms.</p>

    <h2>7. Limitation of liability</h2>
    <p>To the fullest extent permitted by law, Rebuilt and its creator are not liable for injuries, damages, or losses arising from use of the program. You use the program voluntarily and at your own risk. [TODO: this section especially needs a lawyer's review — enforceability of liability limitations varies by jurisdiction.]</p>

    <h2>8. Governing law</h2>
    <p>[TODO: specify jurisdiction — likely Lebanon, but confirm with a lawyer, especially if you have international clients.]</p>

    <h2>9. Changes to these terms</h2>
    <p>We may update these Terms as the program evolves. Continued use after changes means you accept the updated Terms.</p>

    <h2>10. Contact</h2>
    <p>Questions about these Terms: [YOUR REAL CONTACT EMAIL]</p>
  </div>
</div>` }} />
    </main>
  );
}
