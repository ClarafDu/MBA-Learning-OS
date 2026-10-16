import type { Metadata } from 'next';
import SiteShell from '@/app/components/SiteShell';
import './globals.css';
import './compact.css';
import './dashboard.css';
import './brand.css';
import { githubBase } from '@/scripts/github-base.mjs';

export const metadata: Metadata = {
  title: 'MBA Learning OS',
  icons: { icon: { url: githubBase() + '/class-logo.png', type: 'image/png' }, apple: githubBase() + '/class-logo.png' },
  description: 'Schedule, course materials, knowledge and private notes for Fudan IMBA students.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body><SiteShell>{children}</SiteShell></body>
    </html>
  );
}
