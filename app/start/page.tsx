// /start — the page behind the QR code on MSK Rebuilt apparel.
// Self-contained: its own styles (start.css) and client experience (StartExperience).
// Links only to pages that already exist: the homepage and /checkout.

import './start.css';
import StartExperience from '@/components/StartExperience';

export const metadata = {
  title: 'MSK Rebuilt — Your comeback starts here',
  description: 'You didn’t just scan a QR code. You took the first step toward rebuilding.',
  robots: { index: false, follow: true },
};

export const viewport = {
  themeColor: '#0A0A0A',
};

export default function StartPage() {
  return <StartExperience />;
}
