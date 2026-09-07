import Link from 'next/link';
import { ArrowRight, FileSignature } from 'lucide-react';
import { ContractExplorer } from '@/components/contract-explorer';
import { SectionHero } from '@/components/section-hero';

export const metadata = { title: 'Thư viện hợp đồng ví điện tử' };
export default function ContractsPage() {
  return (
    <main>
      <SectionHero
        eyebrow="Thư viện pháp lý"
        title="Hợp đồng đúng với từng mắt xích của ví điện tử"
        description="Tra cứu theo mức độ cần thiết hoặc giai đoạn hoạt động. Chín dịch vụ hợp đồng đã có nội dung chi tiết được trích từ báo cáo tổng hợp."
      >
        <div className="hero-stat">
          <strong>20</strong>
          <span>hợp đồng, chính sách và bộ hồ sơ</span>
        </div>
      </SectionHero>
      <section className="content-section">
        <div className="site-shell">
          <div className="generator-banner">
            <span className="generator-banner-icon">
              <FileSignature />
            </span>
            <div>
              <strong>Tạo dự thảo theo thông tin nhà đầu tư</strong>
              <p>
                Chọn một trong chín hợp đồng ví điện tử, nhập thông tin các bên
                và tải bản Word để tiếp tục rà soát.
              </p>
            </div>
            <Link className="gold-button dark" href="/tao-hop-dong">
              Tạo hợp đồng <ArrowRight />
            </Link>
          </div>
          <ContractExplorer />
        </div>
      </section>
    </main>
  );
}
