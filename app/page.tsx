'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  FileCheck2,
  FileCode2,
  FileText,
  Landmark,
  Layers,
  Lock,
  MessageCircle,
  Network,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { contracts, legalSources, services, team } from '@/lib/site-data';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'all' | 'minimum' | 'advanced'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContracts = useMemo(() => {
    return contracts.filter((item) => {
      const matchTab =
        activeTab === 'all'
          ? true
          : activeTab === 'minimum'
            ? item.minimum
            : !item.minimum;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchTab;

      const matchSearch =
        item.title.toLowerCase().includes(q) ||
        item.shortTitle.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.solves.toLowerCase().includes(q) ||
        item.owner.toLowerCase().includes(q);

      return matchTab && matchSearch;
    });
  }, [activeTab, searchQuery]);

  return (
    <main>
      {/* 1. HERO SECTION - PURE WHITE & WARM IMPERIAL GOLD WITH LADY JUSTICE */}
      <section className="home-hero">
        <div className="hero-overlay" />

        {/* TƯỢNG NỮ THẦN CÔNG LÝ PHÓNG TO XUYÊN SUỐT NỀN HERO (NÉT VIỀN VÀNG KIM) */}
        <div className="themis-grand-backdrop" aria-hidden="true">
          <Image
            src="/themis-outline.png"
            alt="Nữ thần Công lý Themis nét vẽ viền vàng kim hoàng gia"
            width={720}
            height={860}
            priority
            className="themis-grand-backdrop-img"
          />
        </div>

        <div className="site-shell hero-content">
          <div className="hero-copy">
            <span className="eyebrow">
              <Scale className="w-4 h-4 text-[#8C6B18]" />
              Hệ thống Pháp lý Ví điện tử & Trung gian Thanh toán
            </span>
            <h1>
              Nền tảng pháp lý chuẩn mực cho{' '}
              <em className="text-gold-gradient font-normal not-italic">
                Ví điện tử vươn xa.
              </em>
            </h1>
            <p>
              Đồng bộ toàn diện từ mô hình cấp phép theo Nghị định 52/2024/NĐ-CP,
              tài khoản bảo đảm thanh toán đến 20 mẫu hợp đồng API và chính sách
              bảo vệ dữ liệu cá nhân theo chuẩn 2024–2026.
            </p>
            <div className="hero-actions">
              <Link className="gold-button" href="/tao-hop-dong">
                <Wand2 className="w-4 h-4" /> Khởi tạo dự thảo (60s) <ArrowRight />
              </Link>
              <Link className="ghost-button" href="/hop-dong">
                <FileText className="w-4 h-4 text-[#8C6B18]" /> Tra cứu 20 hồ sơ
              </Link>
              <Link className="ghost-button" href="/cong-cu">
                <Sparkles className="w-4 h-4 text-[#8C6B18]" /> Nền tảng AI
              </Link>
            </div>

            <div className="flex flex-wrap gap-8 mt-10 pt-8 border-t border-[rgba(197,155,39,0.25)]">
              <div>
                <strong className="block font-serif text-3xl font-normal text-[#8C6B18]">
                  20
                </strong>
                <span className="text-xs text-slate-600 font-medium">
                  Hợp đồng & bộ hồ sơ chuẩn
                </span>
              </div>
              <div>
                <strong className="block font-serif text-3xl font-normal text-[#8C6B18]">
                  06
                </strong>
                <span className="text-xs text-slate-600 font-medium">
                  Lớp bảo vệ dự án xuyên suốt
                </span>
              </div>
              <div>
                <strong className="block font-serif text-3xl font-normal text-[#8C6B18]">
                  100%
                </strong>
                <span className="text-xs text-slate-600 font-medium">
                  Cập nhật luật mới 2024–2026
                </span>
              </div>
            </div>
          </div>

          {/* KHUNG KHÁCH HÀNG KÍNH TRONG SUỐT VIỀN VÀNG */}
          <div className="themis-customer-card">
            <div className="card-badge-top">
              <ShieldCheck className="w-4 h-4 text-[#8C6B18]" />
              <span>CHUẨN MỰC THẨM ĐỊNH PHÁP LÝ</span>
            </div>
            <h3 className="card-title">Bộ Hồ Sơ Pháp Lý Toàn Diện Dành Cho Doanh Nghiệp Ví Điện Tử</h3>

            <div className="card-items">
              <div className="card-item">
                <div className="item-icon">
                  <Scale />
                </div>
                <div>
                  <strong>Điều Kiện Cấp Phép 2024–2026</strong>
                  <p>Chuẩn hóa theo Nghị định 52/2024/NĐ-CP & Thông tư 40/2024/TT-NHNN.</p>
                </div>
              </div>

              <div className="card-item">
                <div className="item-icon">
                  <Lock />
                </div>
                <div>
                  <strong>Tài Khoản Đảm Bảo Thanh Toán</strong>
                  <p>Kiểm soát dòng tiền ký quỹ và cơ chế phong tỏa an toàn tại NHTM hợp tác.</p>
                </div>
              </div>

              <div className="card-item">
                <div className="item-icon">
                  <FileCheck2 />
                </div>
                <div>
                  <strong>Kho 20 Hợp Đồng & Thỏa Thuận API</strong>
                  <p>Bảo vệ dữ liệu cá nhân, xác thực eKYC, chống rửa tiền và phân định trách nhiệm.</p>
                </div>
              </div>
            </div>

            <div className="card-footer-action">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#8C6B18]">
                <CheckCircle2 className="w-4 h-4 text-[#8C6B18]" />
                <span>Đã kiểm chứng thực tiễn</span>
              </div>
              <Link
                href="/hop-dong"
                className="text-xs font-bold text-[#684F0E] hover:text-[#8C6B18] inline-flex items-center gap-1 transition-colors"
              >
                Tra cứu danh mục <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK COMMAND & SEARCH BAR */}
      <section className="site-shell quick-command-wrap">
        <div className="quick-command-bar">
          <Search />
          <input
            type="text"
            placeholder="Tra cứu nhanh 20 hợp đồng: gõ 'API', 'eKYC', 'bảo đảm', 'cổ đông', 'dữ liệu', 'sự cố'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 font-semibold"
            >
              Xóa
            </button>
          )}
        </div>
        <div className="quick-tags">
          <span>Gợi ý tìm kiếm:</span>
          {[
            'Tích hợp API',
            'Điều lệ công ty',
            'Tài khoản bảo đảm',
            'Bảo vệ dữ liệu',
            'Khiếu nại tra soát',
            'Thuê ngoài CNTT',
          ].map((tag) => (
            <button
              key={tag}
              type="button"
              className="quick-tag-btn"
              onClick={() => setSearchQuery(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* 3. SECTION 1: 6-PILLAR ARCHITECTURE (BENTO GRID) */}
      <section className="services-section">
        <div className="site-shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Hành trình pháp lý toàn diện</span>
              <h2>Sáu lớp bảo vệ dự án Ví điện tử</h2>
            </div>
            <p>
              Tổ chức theo trình tự logic chặt chẽ: kết quả pháp lý của giai đoạn
              trước là đầu vào kỹ thuật và vận hành cho giai đoạn tiếp theo.
            </p>
          </div>

          <div className="bento-pillar-grid">
            {services.map((service, index) => {
              const icons = [
                <Layers key="0" />,
                <Landmark key="1" />,
                <Lock key="2" />,
                <FileCode2 key="3" />,
                <ShieldCheck key="4" />,
                <ShieldAlert key="5" />,
              ];
              return (
                <article className="bento-pillar-card" key={service.id}>
                  <div className="bento-pillar-head">
                    <span className="bento-pillar-num">{service.number}</span>
                    <div className="bento-pillar-icon">{icons[index]}</div>
                  </div>
                  <div>
                    {service.minimum && (
                      <span className="tier minimum mb-2">Tối thiểu (*)</span>
                    )}
                    {service.advanced && (
                      <span className="tier advanced mb-2">Nâng cao</span>
                    )}
                    <h3>{service.title}</h3>
                  </div>
                  <p>{service.description}</p>
                  <div className="bento-outcome-box">
                    <CheckCircle2 />
                    <span>
                      <strong>Bàn giao:</strong> {service.outcome}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <Link className="text-link" href="/dich-vu">
              Xem chi tiết lộ trình 6 lớp dịch vụ <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. SECTION 2: 20 CONTRACTS & ESSENTIAL DOCUMENTS VAULT */}
      <section className="positioning-section">
        <div className="site-shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Kho hồ sơ cốt lõi</span>
              <h2>20 Hợp đồng & Văn bản Pháp chế Then chốt</h2>
            </div>
            <p>
              Thiết kế chuẩn hóa cho toàn bộ các mối quan hệ: Nhà sáng lập, Ngân
              hàng liên kết, Đơn vị chấp nhận, Nhà thầu công nghệ và Người dùng.
            </p>
          </div>

          <div className="vault-filter-tabs">
            <button
              type="button"
              className={`vault-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Tất cả ({contracts.length})
            </button>
            <button
              type="button"
              className={`vault-tab ${activeTab === 'minimum' ? 'active' : ''}`}
              onClick={() => setActiveTab('minimum')}
            >
              Bắt buộc tối thiểu (
              {contracts.filter((c) => c.minimum).length})
            </button>
            <button
              type="button"
              className={`vault-tab ${activeTab === 'advanced' ? 'active' : ''}`}
              onClick={() => setActiveTab('advanced')}
            >
              Nâng cao & Mở rộng (
              {contracts.filter((c) => !c.minimum).length})
            </button>
          </div>

          <div className="vault-grid">
            {filteredContracts.slice(0, 9).map((item, idx) => (
              <article className="vault-card" key={item.slug}>
                <div className="vault-card-top">
                  <span className="vault-card-num">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`tier ${item.minimum ? 'minimum' : 'advanced'}`}
                  >
                    {item.minimum ? 'TỐI THIỂU (*)' : 'NÂNG CAO'}
                  </span>
                </div>
                <h3>{item.shortTitle}</h3>
                <p>{item.summary}</p>
                <div className="vault-solves">
                  <strong>Giải quyết rủi ro:</strong>
                  <span>{item.solves}</span>
                </div>
                <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100">
                  <Link
                    href={`/hop-dong/${item.slug}`}
                    className="vault-card-cta"
                  >
                    Xem chi tiết <ArrowUpRight />
                  </Link>
                  <Link
                    href={`/tao-hop-dong?template=${item.slug}`}
                    className="text-xs font-semibold text-[#8c6b18] hover:text-[#c59b27] flex items-center gap-1"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Tạo dự thảo
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link className="gold-button inline-flex" href="/hop-dong">
              Khám phá toàn bộ 20 tài liệu trong Thư viện <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. SECTION 3: AI DIGITAL LEGAL SUITE */}
      <section className="ai-suite-section">
        <div className="site-shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Công nghệ hỗ trợ pháp chế</span>
              <h2>Nền tảng AI Pháp lý Số 1-Chạm</h2>
            </div>
            <p>
              Tự động hóa công tác rà soát, soạn thảo và tra cứu pháp luật chuyên
              ngành ví điện tử với tốc độ vượt trội và độ chính xác cao.
            </p>
          </div>

          <div className="ai-suite-grid">
            <div className="ai-suite-card">
              <span className="ai-suite-badge">Tự động 60s</span>
              <div className="ai-suite-icon">
                <Wand2 />
              </div>
              <h3>Trình Tạo Dự Thảo Thông Minh</h3>
              <p>
                Điền tham số dự án 4 bước, tự động tính toán tỷ lệ vốn, thẩm
                quyền phê duyệt và xuất file DOCX chuẩn thể thức văn bản Việt Nam.
              </p>
              <Link className="ai-suite-btn primary" href="/tao-hop-dong">
                Tạo văn bản ngay <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="ai-suite-card">
              <span className="ai-suite-badge">Phân tích rủi ro</span>
              <div className="ai-suite-icon">
                <FileCheck2 />
              </div>
              <h3>So Sánh & Rà Soát Điều Khoản</h3>
              <p>
                Tải lên hợp đồng đối tác, phân tích chéo các điều khoản bất lợi
                về tài khoản bảo đảm, bồi thường thiệt hại và ranh giới API.
              </p>
              <Link className="ai-suite-btn secondary" href="/cong-cu">
                Rà soát điều khoản <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="ai-suite-card">
              <span className="ai-suite-badge">Trợ lý 24/7</span>
              <div className="ai-suite-icon">
                <Sparkles />
              </div>
              <h3>Trợ Lý AI Luật Ví Điện Tử</h3>
              <p>
                Hỏi đáp tức thì về điều kiện cấp phép trung gian thanh toán, quy
                trình đối soát, định danh eKYC và Luật Bảo vệ dữ liệu cá nhân mới
                nhất.
              </p>
              <Link className="ai-suite-btn secondary" href="/cong-cu">
                Hỏi đáp với AI <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION 4: 4 CORE PRINCIPLES & 2024-2026 LEGAL BASIS */}
      <section className="principles-section">
        <div className="site-shell principles-grid">
          <div>
            <span className="eyebrow">Nguyên tắc triển khai</span>
            <h2>Bốn câu hỏi phải trả lời trước khi ký kết.</h2>
            <p className="text-slate-600 mt-4 leading-relaxed text-sm">
              Mỗi thỏa thuận trong hệ sinh thái ví điện tử phải được bảo đảm bằng
              chứng cứ kiểm tra, ranh giới trách nhiệm và cơ chế bảo toàn quyền lợi
              khách hàng.
            </p>

            <div className="mt-8 p-6 bg-white border border-[#e3e7eb] rounded-lg shadow-sm">
              <span className="text-xs uppercase font-bold tracking-wider text-[#8c6b18] block mb-2">
                Bảo chứng pháp lý
              </span>
              <p className="text-xs text-slate-500 m-0">
                Toàn bộ hồ sơ được xây dựng và đối chiếu trực tiếp với các văn
                bản quy phạm pháp luật đang có hiệu lực thi hành của Quốc hội,
                Chính phủ và Ngân hàng Nhà nước Việt Nam.
              </p>
            </div>
          </div>

          <div className="principle-list">
            <div>
              <Landmark />
              <span>
                <strong>Chủ thể nào có giấy phép?</strong> Tên gọi “nền tảng
                công nghệ” hay “ứng dụng liên kết” không làm thay đổi bản chất
                pháp lý của dịch vụ trung gian thanh toán.
              </span>
            </div>
            <div>
              <Network />
              <span>
                <strong>Tiền và dữ liệu đi đâu?</strong> Phạm vi pháp lý trong
                hợp đồng phải khớp chính xác với luồng kỹ thuật API, tài khoản bảo
                đảm và quyền truy cập thực tế.
              </span>
            </div>
            <div>
              <FileText />
              <span>
                <strong>Hồ sơ nào chứng minh tuân thủ?</strong> Mọi nghĩa vụ pháp
                lý phải gắn liền với đầu mối chịu trách nhiệm, biểu mẫu ban hành
                và dấu vết kiểm tra lưu vết hệ thống.
              </span>
            </div>
            <div>
              <ShieldCheck />
              <span>
                <strong>Khi có sự cố, ai quyết định?</strong> Quy trình khẩn cấp
                phải quy định rõ thẩm quyền xử lý, phương án bảo toàn chứng cứ và
                thời hạn bắt buộc báo cáo cơ quan quản lý.
              </span>
            </div>
          </div>
        </div>

        {/* Legal citations cards */}
        <div className="site-shell mt-12 pt-10 border-t border-[#e3e7eb]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8c6b18] block mb-4">
            Căn cứ pháp lý cốt lõi (2024–2026)
          </span>
          <div className="legal-laws-strip">
            {legalSources.slice(0, 4).map(([title, time, url]) => (
              <a
                key={title}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="legal-law-card"
              >
                <div>
                  <strong>{title}</strong>
                  <span>{time}</span>
                </div>
                <ArrowUpRight />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 7. SECTION 5: TEAM & EXECUTIVE CTA */}
      <section className="positioning-section border-t border-[#e3e7eb]">
        <div className="site-shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Minh bạch học thuật</span>
              <h2>Đội ngũ Chuyên trách Dự án</h2>
            </div>
            <p>
              12 thành viên phụ trách chuyên sâu từng mảng: từ thành lập doanh
              nghiệp, hợp đồng thương mại đến tuân thủ dữ liệu cá nhân.
            </p>
          </div>

          <div className="team-strip">
            {team.map(([name, id, role]) => {
              const initials = name
                .split(' ')
                .slice(-2)
                .map((w) => w[0])
                .join('');
              return (
                <div className="team-member-card" key={id}>
                  <div className="team-member-avatar">{initials}</div>
                  <div>
                    <strong>{name}</strong>
                    <span>{role}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="cta-section">
        <div className="site-shell cta-inner">
          <div>
            <span className="eyebrow light">Khởi đầu vững chắc từ mô hình</span>
            <h2>Biến yêu cầu pháp luật thành lộ trình có thể thực hiện.</h2>
            <p className="text-[#d7e2e8] text-sm mt-3 max-w-xl">
              Hệ thống tài liệu và công cụ của Thịnh Vượng Legal giúp rút ngắn thời
              gian chuẩn bị hồ sơ từ vài tháng xuống vài giờ.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <a
              className="gold-button w-full justify-center"
              href="https://zalo.me/0961621602"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="w-4 h-4" /> Trao đổi trực tiếp qua Zalo
            </a>
            <span className="text-xs text-[#f7ebb8]">
              Dự án mô phỏng phục vụ nghiên cứu & học tập
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

