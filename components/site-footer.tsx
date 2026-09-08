import Link from 'next/link';
import { ArrowUpRight, Mail, MessageCircle, Scale } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-shell footer-grid">
        <div>
          <div className="footer-brand">
            <span className="w-8 h-8 rounded border border-[#c59b27] bg-gradient-to-br from-white to-[#FAF1D7] grid place-items-center text-[#8C6B18] shadow-sm">
              <Scale className="w-4 h-4 text-[#8C6B18]" />
            </span>
            <span className="text-[#0A131E] font-serif text-lg tracking-wider font-semibold">THỊNH VƯỢNG LEGAL</span>
          </div>
          <p className="mt-3 text-[#4A5868] text-sm leading-relaxed">
            Hệ thống kiến trúc dịch vụ pháp lý và tài liệu mẫu cho doanh nghiệp
            cung ứng dịch vụ ví điện tử & trung gian thanh toán tại Việt Nam.
          </p>
          <span className="footer-disclaimer">
            Dự án nghiên cứu học thuật · Tuân thủ NĐ 52/2024 & TT 40/2024
          </span>
        </div>
        <div>
          <h2>Khám phá</h2>
          <Link href="/dich-vu">Sáu nhóm dịch vụ</Link>
          <Link href="/hop-dong">Thư viện hợp đồng</Link>
          <Link href="/bao-cao-so-bo">Báo cáo sơ bộ</Link>
          <Link href="/dien-dan">Diễn đàn Luật</Link>
          <Link href="/cong-cu">Nền tảng pháp lý AI</Link>
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
