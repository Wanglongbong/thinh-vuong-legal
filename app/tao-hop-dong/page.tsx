import { FileSignature, ShieldCheck } from 'lucide-react';
import { ContractBuilder } from '@/components/contract-builder';
import { SectionHero } from '@/components/section-hero';

export const metadata = { title: 'Tạo dự thảo hợp đồng ví điện tử' };

export default async function ContractBuilderPage({
  searchParams,
}: {
  searchParams: Promise<{ mau?: string }>;
}) {
  const { mau } = await searchParams;
  return (
    <main>
      <SectionHero
        eyebrow="Công cụ dành cho nhà đầu tư"
        title="Tạo dự thảo hợp đồng pháp lý"
        description="Chọn một dịch vụ ví điện tử, nhập thông tin các bên và nhận bản dự thảo có cấu trúc để tiếp tục rà soát với luật sư."
      >
        <div className="hero-note">
          <ShieldCheck aria-hidden="true" />
          <span>
            <strong>09</strong> mẫu theo đúng nhóm hợp đồng trong báo cáo
          </span>
        </div>
      </SectionHero>
      <section className="builder-section">
        <div className="site-shell">
          <div className="builder-heading">
            <FileSignature aria-hidden="true" />
            <div>
              <h2>Thông tin lập dự thảo</h2>
              <p>
                Các trường chưa nhập sẽ được đánh dấu để hoàn thiện trước khi
                ký.
              </p>
            </div>
          </div>
          <ContractBuilder initialContractSlug={mau} />
        </div>
      </section>
    </main>
  );
}
