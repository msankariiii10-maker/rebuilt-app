import './globals.css';
import Nav from '@/components/Nav';

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
      </body>
    </html>
  );
}
