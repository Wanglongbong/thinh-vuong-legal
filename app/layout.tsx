import type { Metadata } from 'next';
import './globals.css';
import './publications.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { LegalAssistant } from '@/components/legal-assistant';
import { SelectionAssistant } from '@/components/selection-assistant';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thinh-vuong-legal.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Thịnh Vượng Legal | Pháp lý Ví điện tử & Fintech', template: '%s | Thịnh Vượng Legal' },
  description: 'Dự án mô phỏng hệ thống dịch vụ pháp lý hỗ trợ thành lập và vận hành doanh nghiệp cung ứng ví điện tử tại Việt Nam.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <a className="skip-link" href="#main-content">Bỏ qua điều hướng</a>
        <SiteHeader />
        <div id="main-content">{children}</div>
        <SiteFooter />
        <SelectionAssistant />
        <LegalAssistant />
      </body>
    </html>
  );
}
