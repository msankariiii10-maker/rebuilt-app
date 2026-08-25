// app/page.tsx
//
// The marketing homepage — hero, video, testimonials, footer. Ported
// directly from the original design file via dangerouslySetInnerHTML
// (it's static marketing content with a lot of one-off inline styles;
// converting every one to JSX style objects wasn't worth the risk of
// introducing visual regressions). The one bit of real interactivity —
// scroll-reveal animation — is handled by the RevealAnimations client
// component below, same as it works on every other page.

import RevealAnimations from '@/components/RevealAnimations';

export default function HomePage() {
  return (
    <>
      <RevealAnimations />
      <div dangerouslySetInnerHTML={{ __html: `<section class="hero" style="padding:88px 0 100px;">
  <div class="wrap" style="max-width:800px; text-align:center;">
    <p class="reveal" style="transition-delay:0s; font-family:var(--sans); font-weight:800; font-size:clamp(38px,5.5vw,58px); color:var(--text); margin-bottom:20px; line-height:1.05; letter-spacing:-1.2px;">Welcome to the Rebuilt program</p>

    <p class="reveal" style="transition-delay:0.05s; font-family:var(--serif); font-style:italic; font-weight:500; font-size:clamp(20px,2.6vw,28px); line-height:1.45; color:var(--text); max-width:640px; margin:0 auto 28px;">For three years, two herniated discs turned getting out of bed, tying my shoes, even sitting through dinner into something I had to brace for. <span style="color:var(--primary);">If that sounds familiar, I built this for you — two months in, 90% of that pain was gone.</span></p>
    <div style="display:inline-flex; align-items:center; gap:10px; background:var(--bg-card); border:1px solid var(--primary); border-radius:30px; padding:12px 24px; margin:0 auto 36px;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;">
        <circle cx="12" cy="12" r="11" fill="var(--primary)"/>
        <path d="M7 12.5l3 3 7-7" stroke="#F8F0EE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span style="font-family:var(--sans); font-weight:700; font-size:clamp(17px,2vw,20px); color:var(--text);">Built by a PT student who lived it.</span>
    </div>

    <div class="video-frame reveal" style="transition-delay:0.1s; max-width:720px; margin:0 auto;" onclick="const v=this.querySelector('video'), p=this.querySelector('.video-placeholder-inner'); if(v){v.play(); p.style.display='none'; v.style.display='block';}">
      <!-- Replace src below with your uploaded video file once recorded -->
      <video style="display:none;" controls playsinline poster="">
        <source src="your-intro-video.mp4" type="video/mp4">
      </video>
      <div class="video-placeholder-inner">
        <div class="play-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#F8F0EE"><path d="M8 5v14l11-7z"/></svg>
        </div>
        <div class="video-placeholder-text">
          <p class="title">Watch: why Rebuilt is different</p>
          <p class="sub">2–3 MIN · RECORDED BY THE PT STUDENT WHO BUILT IT</p>
        </div>
      </div>
    </div>

    <h1 class="headline reveal" style="transition-delay:0.2s; margin:40px auto 16px; max-width:600px;">Build yourself<br>from the <em>ground up.</em></h1>

    <div class="hero-ctas reveal" style="transition-delay:0.3s; justify-content:center;">
      <a href="/checkout" class="btn-primary">Join our community</a>
    </div>
  </div>
</section>

<section class="testimonials" id="reviews" style="padding-top:0;">
  <div class="wrap">
    <div class="section-head reveal" style="margin-bottom:0;">
      <h2><span style="color:var(--text); text-decoration:underline; text-decoration-color:var(--primary); text-decoration-thickness:3px; text-underline-offset:6px;">Real results</span> within the community!</h2>
    </div>

    <div class="t-grid reveal-stagger">
      <div class="t-card">
        <div class="t-verified"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M7 12.5l3 3 7-7"/></svg></div>
        <p class="t-quote">My job requires me to sit for hours, and my back pain was always something I had to worry about. After trying the REBUILT program, sitting for long periods feels completely different. I don’t have to constantly think about when my back is going to start hurting anymore. Thank you!</p>
        <div class="t-person">
          <p class="t-name">Emily Carter</p>
        </div>
      </div>

      <div class="t-card">
        <div class="t-verified"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M7 12.5l3 3 7-7"/></svg></div>
        <p class="t-quote">I’ve suffered from sciatica going down my leg for a couple of years. I always thought stretching was what I needed, but REBUILT taught me how important strengthening my body was too. I’m only one month into the program and I already feel 10x better. Thank you so much!</p>
        <div class="t-person">
          <p class="t-name">Sophie Bennett</p>
        </div>
      </div>

      <div class="t-card">
        <div class="t-verified"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M7 12.5l3 3 7-7"/></svg></div>
        <p class="t-quote">I’d been dealing with back pain for months whenever I went to the gym. After working on my hip mobility with the program, my deadlifts became way easier and, most importantly, pain-free. I can actually focus on lifting instead of worrying about my back.</p>
        <div class="t-person">
          <p class="t-name">Daniel Brooks</p>
        </div>
      </div>

      <div class="t-card">
        <div class="t-verified"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M7 12.5l3 3 7-7"/></svg></div>
        <p class="t-quote">Honestly, the first session felt like heaven. Everything felt loose and smooth afterward. But the best part was sitting down after the workout without feeling like my whole body was cramping up. That feeling alone made such a difference.</p>
        <div class="t-person">
          <p class="t-name">Ryan Mitchell</p>
        </div>
      </div>
    </div>

  </div>
</section>

<footer>
  <div class="wrap">
    <div class="footer-top reveal">
      <div class="logo" style="font-size:16px;">
        <span>Rebu<span class="vert" style="height:8px;"></span>lt</span>
      </div>
      <div class="footer-contact">
        <a href="mailto:hello@rebuiltprogram.com" class="footer-email">hello@rebuiltprogram.com</a>
        <div class="footer-socials">
          <a href="#" aria-label="Instagram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>
          </a>
          <a href="#" aria-label="TikTok">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 3c.3 2.3 1.7 3.9 4 4.2v2.7c-1.4.1-2.7-.3-4-1.1v6.4c0 3.2-2.3 5.8-5.6 5.8-3.2 0-5.6-2.6-5.6-5.8 0-3.1 2.5-5.7 5.6-5.7.3 0 .6 0 .9.1v2.8c-.3-.1-.6-.2-.9-.2-1.6 0-2.9 1.3-2.9 2.9 0 1.7 1.3 3 2.9 3 1.7 0 3-1.3 3-3.1V3h2.6z"/></svg>
          </a>
        </div>
      </div>
    </div>
    <div class="footer-bottom" style="border-top:1px solid #1E1E1B; padding-top:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
      <p style="font-family:var(--sans); font-size:12px; color:#6E6E68;">Not a substitute for medical diagnosis. Built by a PT student.</p>
      <div style="display:flex; gap:20px;">
        <a href="/legal/privacy" style="font-size:12px; color:#8C8A83; text-decoration:none;">Privacy Policy</a>
        <a href="/legal/terms" style="font-size:12px; color:#8C8A83; text-decoration:none;">Terms</a>
        <a href="/legal/medical" style="font-size:12px; color:#8C8A83; text-decoration:none;">Medical Disclaimer</a>
      </div>
    </div>
  </div>
</footer>` }} />
    </>
  );
}
