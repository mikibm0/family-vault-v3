import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'Family Vault v3',
  description: 'Ben Moshe Family Wealth OS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" className="h-full">
      <body className="h-full" style={{ background: '#0f172a' }}>
        {/* Sidebar takes 56 (14rem), content takes the rest */}
        <Sidebar />
        <main
          className="min-h-full overflow-auto"
          style={{ marginLeft: '14rem', padding: '2rem' }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
