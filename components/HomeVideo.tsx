'use client';

import { useRef, useState } from 'react';

// Click-to-play intro video. Put the recorded file at /public/your-intro-video.mp4
// (or change the src below) and it plays right here.
export default function HomeVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  function start() {
    if (playing) return;
    setPlaying(true);
    ref.current?.play().catch(() => {});
  }

  return (
    <div className="hm-video" onClick={start} role="button" tabIndex={0} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && start()}>
      <video ref={ref} controls playsInline style={{ display: playing ? 'block' : 'none' }}>
        <source src="your-intro-video.mp4" type="video/mp4" />
      </video>
      {!playing && (
        <div className="hm-play" aria-label="Play video">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      )}
    </div>
  );
}
