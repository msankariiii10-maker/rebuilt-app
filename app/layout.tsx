import './globals.css';
import Nav from '@/components/Nav';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'Rebuilt — Not fixed. Rebuilt.',
  description:
    'A progressive strength recovery program built from real recovery experience. Not fixed. Rebuilt.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
        {/* Vercel Web Analytics: page visits across the site (switch on under Analytics in Vercel) */}
        <Analytics />
      </body>
    </html>
  );
}
