export const metadata = {
  title: 'Medical Disclaimer & Waiver — Rebuilt',
};

export default function MedicalPage() {
  return (
    <main style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }} dangerouslySetInnerHTML={{ __html: `<div class="legal-page">
    <a href="/" class="back-home">← Back to home</a>
    <h1>Medical Disclaimer &amp; Liability Waiver</h1>
    <p class="updated">Last updated: [DATE] — DRAFT, pending legal review</p>

    <div class="callout">
      <p><strong>This is the most important legal page on this site.</strong> Have a lawyer review it before launch, and consider requiring an active checkbox acknowledgment at signup rather than just a footer link.</p>
    </div>

    <h2>1. Not medical advice</h2>
    <p>Rebuilt is an educational strength and mobility program built from real recovery experience. It is not medical advice, diagnosis, or treatment, and it is not a substitute for evaluation by a licensed physician, physical therapist, or other qualified healthcare provider.</p>

    <h2>2. Screening has limits</h2>
    <p>The intake screening in this program is designed to flag common warning signs that mean you should see a professional before starting. It is not a comprehensive medical evaluation and cannot catch every condition. If something about your pain feels unusual, sudden, or severe, see a doctor regardless of what the screening says.</p>

    <h2>3. Consult a professional first if...</h2>
    <ul>
      <li>You have not been evaluated by a doctor or physical therapist for your current pain</li>
      <li>You have any of the red-flag symptoms listed in the intake screening</li>
      <li>You are pregnant, recovering from recent surgery, or managing another diagnosed condition that affects movement</li>
      <li>Your pain is worsening, not improving, after starting the program</li>
    </ul>

    <h2>4. Assumption of risk</h2>
    <p>Exercise carries inherent risk of injury, even when performed correctly. By using this program, you acknowledge this risk and voluntarily choose to participate. You are responsible for stopping any exercise that causes sharp, worsening, or unusual pain and for seeking medical attention if needed.</p>

    <h2>5. No practitioner-patient relationship</h2>
    <p>Using this program does not create a physical therapist-patient relationship between you and the program's creator. Guidance is general and program-based, not individualized clinical care.</p>

    <h2>6. Creator's credentials</h2>
    <p>Rebuilt is built by a physical therapy student, based on personal recovery experience and PT training, not by a licensed practicing physical therapist providing you individual care. [TODO: keep this accurate and update once/if licensure changes.]</p>

    <h2>7. Emergency situations</h2>
    <p>This program is not for emergencies. If you are experiencing a medical emergency, contact emergency services immediately — do not rely on this program or website.</p>

    <h2>8. Acknowledgment</h2>
    <p>By creating an account and starting the program, you confirm you have read and understood this disclaimer and waiver, and that you are participating voluntarily and at your own risk.</p>

    <h2>9. Contact</h2>
    <p>Questions about this disclaimer: [YOUR REAL CONTACT EMAIL]</p>
  </div>
</div>` }} />
    </main>
  );
}
