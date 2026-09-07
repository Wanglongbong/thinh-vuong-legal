'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot,
  ChevronDown,
  ClipboardCheck,
  Files,
  FileSignature,
  FolderKanban,
  GitCompareArrows,
  LayoutDashboard,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import {
  DemoSessionProvider,
  useDemoSession,
} from '@/components/demo-session-provider';

const nav = [
  ['Tổng quan', '/cong-cu', LayoutDashboard],
  ['Hỏi đáp pháp lý', '/cong-cu/hoi-dap', Bot],
  ['Tạo hợp đồng', '/cong-cu/tao-hop-dong', FileSignature],
  ['Review hợp đồng', '/cong-cu/review', ClipboardCheck],
  ['So sánh hợp đồng', '/cong-cu/so-sanh', GitCompareArrows],
  ['Hồ sơ dự án', '/cong-cu/ho-so', FolderKanban],
  ['Quản lý tệp', '/cong-cu/tep', Files],
] as const;

function PlatformFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { files, clearSession } = useDemoSession();
  return (
    <div className="platform-shell">
      <aside className="platform-sidebar">
        <div className="platform-product">
          <span className="platform-product-icon">
            <ShieldCheck />
          </span>
          <span>
            <strong>Trung tâm pháp lý</strong>
            <small>Ví điện tử · AI</small>
          </span>
        </div>
        <nav aria-label="Công cụ pháp lý">
          {nav.map(([label, href, Icon]) => {
            const active =
              pathname === href ||
              (href !== '/cong-cu' && pathname.startsWith(href));
            return (
              <Link className={active ? 'active' : ''} href={href} key={href}>
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="platform-account">
          <details>
            <summary>
              <span className="demo-avatar">TV</span>
              <span>
                <strong>Thịnh Vượng Legal</strong>
                <small>Demo · {files.length} tệp tạm</small>
              </span>
              <ChevronDown />
            </summary>
            <div className="platform-account-menu">
              <p>Dữ liệu chỉ tồn tại trong phiên trình duyệt này.</p>
              <button type="button" onClick={clearSession}>
                <RotateCcw /> Xóa dữ liệu demo
              </button>
            </div>
          </details>
        </div>
      </aside>
      <div className="platform-main">
        <div
          className="platform-mobile-nav"
          aria-label="Điều hướng công cụ trên di động"
        >
          {nav.map(([label, href, Icon]) => (
            <Link href={href} key={href} aria-label={label}>
              <Icon />
            </Link>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}

export function PlatformShell({ children }: { children: React.ReactNode }) {
  return (
    <DemoSessionProvider>
      <PlatformFrame>{children}</PlatformFrame>
    </DemoSessionProvider>
  );
}
