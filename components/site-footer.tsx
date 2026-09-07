import Link from 'next/link';
import { ArrowUpRight, Mail, MessageCircle, Scale } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-shell footer-grid">
        <div>
          <div className="footer-brand">
            <Scale />
            <span>THỊNH VƯỢNG LEGAL</span>
          </div>
          <p>
            Hệ thống dịch vụ pháp lý mô phỏng dành cho dự án thành lập và vận
            hành doanh nghiệp cung ứng ví điện tử tại Việt Nam.
          </p>
          <span className="footer-disclaimer">
            Dự án học tập · Không phải tổ chức hành nghề luật sư
          </span>
        </div>
        <div>
          <h2>Khám phá</h2>
          <Link href="/dich-vu">Sáu nhóm dịch vụ</Link>
          <Link href="/hop-dong">Thư viện hợp đồng</Link>
          <Link href="/tao-hop-dong">Tạo dự thảo hợp đồng</Link>
          <Link href="/kien-thuc">Cơ sở pháp lý</Link>
          <Link href="/doi-ngu">Đội ngũ dự án</Link>
        </div>
        <div>
          <h2>Liên hệ dự án</h2>
          <a href="mailto:vuanhquan160205@gmail.com">
            <Mail /> vuanhquan160205@gmail.com
          </a>
          <a href="https://zalo.me/0961621602" target="_blank" rel="noreferrer">
            <MessageCircle /> Zalo 0961 621 602 <ArrowUpRight />
          </a>
          <Link href="/tuyen-bo-phap-ly">Tuyên bố pháp lý</Link>
        </div>
      </div>
      <div className="site-shell copyright">
        © 2026 Thịnh Vượng Legal · Bản mô phỏng học thuật.
      </div>
    </footer>
  );
}
