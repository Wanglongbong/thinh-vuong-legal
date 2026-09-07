import Link from 'next/link';
import { Mail, Menu, MessageCircle, Scale } from 'lucide-react';

const nav = [
  ['Dịch vụ', '/dich-vu'],
  ['Hợp đồng', '/hop-dong'],
  ['Nền tảng AI', '/cong-cu'],
  ['Kiến thức', '/kien-thuc'],
  ['Đội ngũ', '/doi-ngu'],
] as const;

export function SiteHeader() {
  return (
    <>
      <div className="academic-bar">
        <div className="site-shell academic-bar-inner">
          <span>Dự án mô phỏng phục vụ học tập</span>
          <span className="hidden sm:inline">
            Không thay thế ý kiến tư vấn cho vụ việc cụ thể
          </span>
        </div>
      </div>
      <header className="site-header">
        <div className="site-shell header-inner">
          <Link
            href="/"
            className="brand"
            aria-label="Thịnh Vượng Legal — Trang chủ"
          >
            <span className="brand-mark">
              <Scale aria-hidden="true" />
            </span>
            <span>
              <strong>THỊNH VƯỢNG</strong>
              <small>LEGAL · FINTECH</small>
            </span>
          </Link>
          <nav className="desktop-nav" aria-label="Điều hướng chính">
            {nav.map(([label, href]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <a
              className="icon-link"
              href="mailto:vuanhquan160205@gmail.com"
              aria-label="Gửi email"
            >
              <Mail />
            </a>
            <Link className="primary-link" href="/lien-he">
              <MessageCircle /> Liên hệ
            </Link>
          </div>
          <details className="mobile-menu">
            <summary aria-label="Mở danh mục">
              <Menu />
            </summary>
            <div className="mobile-menu-panel">
              {nav.map(([label, href]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
              <Link href="/lien-he">Liên hệ</Link>
            </div>
          </details>
        </div>
      </header>
    </>
  );
}
