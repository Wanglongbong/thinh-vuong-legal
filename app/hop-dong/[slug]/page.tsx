import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleAlert,
  FileCheck2,
  Scale,
} from 'lucide-react';
import { contracts, getContract, getService } from '@/lib/site-data';
import { contractReportContent } from '@/lib/contract-report-content';
import { ContractReport } from '@/components/contract-report';

export function generateStaticParams() {
  return contracts.map((item) => ({ slug: item.slug }));
}
export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getContract(slug);
  if (!item) notFound();
  const service = getService(item.group);
  const report = contractReportContent[item.slug];
  return (
    <main className="contract-detail-page">
      <section className="contract-detail-hero">
        <div className="site-shell">
          <Link className="back-link" href="/hop-dong">
            <ArrowLeft /> Thư viện hợp đồng
          </Link>
          <div className="contract-detail-heading">
            <div>
              <span className={item.minimum ? 'tier minimum' : 'tier advanced'}>
                {item.minimum ? 'Tối thiểu (*)' : 'Nâng cao'}
              </span>
              <span className="contract-group-label">
                Phần {service?.number} · {service?.title}
              </span>
              <h1>{item.title}</h1>
              <p>{item.summary}</p>
            </div>
            <aside>
              <span>Phụ trách nội dung</span>
              <strong>{item.owner}</strong>
              <small>
                {report
                  ? 'Có nội dung chi tiết từ báo cáo'
                  : 'Bản giới thiệu phục vụ học tập'}
              </small>
            </aside>
          </div>
        </div>
      </section>
      <section className="content-section">
        <div className="site-shell contract-detail-grid">
          <article className="legal-article">
            <section>
              <span className="article-kicker">01 · Đối tượng áp dụng</span>
              <h2>Quan hệ pháp lý được điều chỉnh</h2>
              <p>{item.audience}</p>
            </section>
            <section>
              <span className="article-kicker">02 · Vấn đề cần giải quyết</span>
              <h2>Rủi ro trọng tâm</h2>
              <p>{item.solves}</p>
              <div className="legal-warning">
                <CircleAlert />
                <p>
                  Phạm vi hợp đồng phải thống nhất với giấy phép, quy trình kỹ
                  thuật và thực tế vận hành. Tên gọi giao dịch không thay thế
                  việc xác định đúng bản chất pháp lý.
                </p>
              </div>
            </section>
            <section>
              <span className="article-kicker">03 · Sản phẩm bàn giao</span>
              <h2>Bộ tài liệu dự kiến</h2>
              <ul className="check-list">
                {item.deliverables.map((entry) => (
                  <li key={entry}>
                    <Check />
                    {entry}
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <span className="article-kicker">04 · Nội dung cốt lõi</span>
              <h2>Điều khoản cần ưu tiên</h2>
              <div className="clause-grid">
                {item.clauses.map((entry, index) => (
                  <div key={entry}>
                    <span>0{index + 1}</span>
                    <strong>{entry}</strong>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <span className="article-kicker">05 · Căn cứ tham chiếu</span>
              <h2>Khung pháp luật liên quan</h2>
              <ul className="law-list">
                {item.legalBases.map((law) => (
                  <li key={law}>
                    <Scale />
                    {law}
                  </li>
                ))}
              </ul>
              <p className="source-note">
                Hiệu lực và văn bản sửa đổi cần được kiểm tra lại tại thời điểm
                áp dụng thực tế.
              </p>
            </section>
            {report && <ContractReport content={report} />}
          </article>
          <aside className="detail-sidebar">
            <div className="sticky-card">
              <FileCheck2 />
              <h2>Tạo bản dự thảo theo thông tin của bạn</h2>
              <p>
                Điền tên nhà đầu tư, thông tin doanh nghiệp ví và đối tác để
                nhận bản dự thảo có cấu trúc từ mẫu này.
              </p>
              {report ? (
                <Link
                  className="gold-button dark"
                  href={`/tao-hop-dong?mau=${item.slug}`}
                >
                  Tạo hợp đồng <ArrowRight />
                </Link>
              ) : (
                <Link className="gold-button dark" href="/lien-he">
                  Trao đổi phạm vi <ArrowRight />
                </Link>
              )}
            </div>
            <div className="selection-tip">
              <strong>Mẹo tra cứu</strong>
              <p>
                Bôi đen một đoạn rồi chọn “Hỏi trợ lý” để được giải thích theo
                bối cảnh ví điện tử.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
