// components/Nav.tsx
//
// Shared site nav — same on every page. Uses raw HTML via
// dangerouslySetInnerHTML because it was ported directly from the
// original design file; the menu toggle button uses a plain inline
// onClick with document.getElementById, which works fine as real DOM
// regardless of React — no client-side state needed for this.

export default function Nav() {
  return (
    <div dangerouslySetInnerHTML={{ __html: `<nav>
  <div class="wrap">
    <div class="logo">
      <span>Rebu<span class="vert"></span>lt</span>
    </div>
    <div class="nav-links nav-mobile-hide" style="display:flex; align-items:center; gap:28px;">
      <div style="position:relative;">
        <button onClick="document.getElementById('site-menu').classList.toggle('open')" aria-label="Menu" style="background:none; border:none; cursor:pointer; padding:8px; display:flex; flex-direction:column; gap:5px; justify-content:center; align-items:flex-end;">
          <span style="display:block; width:22px; height:2px; background:#F2F2EE; border-radius:2px;"></span>
          <span style="display:block; width:16px; height:2px; background:#F2F2EE; border-radius:2px;"></span>
          <span style="display:block; width:22px; height:2px; background:#F2F2EE; border-radius:2px;"></span>
        </button>
        <div id="site-menu" class="menu-dropdown">
          <a href="/" style="border-bottom:1px solid #2A2A28; margin-bottom:6px; padding-bottom:12px;">← Back to home</a>
          <a href="/legal/privacy">Privacy Policy</a>
          <a href="/legal/terms">Terms of Service</a>
          <a href="/legal/medical">Medical Disclaimer &amp; Waiver</a>
        </div>
      </div>
    </div>
  </div>
</nav>` }} />
  );
}
