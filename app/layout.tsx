import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FreeWord',
  description: 'Language learning app',
  other: {
    'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self' blob:; img-src 'self' data:; font-src 'self';",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}