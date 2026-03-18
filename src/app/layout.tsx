import type { Metadata, Viewport } from 'next';
import './globals.css';
import TabBar from '@/components/TabBar';
import SeedProvider from '@/components/SeedProvider';

export const metadata: Metadata = {
  title: 'Gym45 Mobile',
  description: 'Application mobile Gym45 — gestion d\'équipe',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#6366f1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-bg text-slate-text antialiased">
        <SeedProvider />
        <main className="max-w-lg mx-auto pb-20 min-h-screen">
          {children}
        </main>
        <TabBar />
      </body>
    </html>
  );
}
