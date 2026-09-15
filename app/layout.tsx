import type { Metadata } from 'next';
import SiteShell from '@/app/components/SiteShell';
import './globals.css';
import { githubBase } from '@/scripts/github-base.mjs';

export const metadata: Metadata = {
  title: 'MBA Learning OS',
  icons: { icon: githubBase() + '/favicon.svg' },
  description: 'Schedule, course materials, knowledge and private notes for Fudan IMBA students.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body><SiteShell>{children}</SiteShell></body>
    </html>
  );
}
