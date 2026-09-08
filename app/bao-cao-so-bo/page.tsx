import Link from 'next/link';
import { BookOpen, Download, ArrowUpRight } from 'lucide-react';
import reports from '@/lib/generated/reports.json';
export const metadata = { title: 'Báo cáo sơ bộ' };
export default function ReportsPage() {
  return (
    <main className="site-shell publication-page">
      <span className="publication-kicker">THƯ VIỆN BÁO CÁO · NHÓM 13</span>
      <header className="publication-heading">
        <h1>Báo cáo sơ bộ</h1>
      </header>
      <p className="publication-lead">
        Dịch vụ pháp lý hỗ trợ thành lập và vận hành doanh nghiệp cung ứng ví
        điện tử. Đọc trọn nội dung, đối chiếu từng chương hoặc tải tài liệu để
        nghiên cứu.
      </p>
      <div className="report-cards">
        {reports.map((report, i) => (
          <article className="report-card" key={report.slug}>
            <div className="report-cover">
              <BookOpen />
              <span>NHÓM 13</span>
              <strong>{i === 0 ? 'BẢN ĐẦY ĐỦ' : 'BẢN RÚT GỌN'}</strong>
              <small>{report.pages} trang theo bản Word nguồn</small>
            </div>
            <div className="report-card-body">
              <h2>{report.title}</h2>
              <p>
                {i === 0
                  ? 'Toàn bộ sáu chương, phân tích dịch vụ và các tài liệu demo, dành cho đọc và nhận xét chi tiết.'
                  : 'Nội dung sơ bộ cô đọng, thuận tiện để tác giả, nhóm và giảng viên nắm tổng thể.'}
              </p>
              <Link
                className="publication-primary"
                href={`/bao-cao-so-bo/${report.slug}`}
              >
                Đọc trực tuyến <ArrowUpRight size={18} />
              </Link>
              <div className="publication-actions">
                <a download href={`/reports/${report.fileBase}.docx`}>
                  <Download size={16} /> Tải Word
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
      <p className="publication-note">
        Tệp Word là bản gốc của nhóm. Bản đọc trên web tự điều chỉnh theo màn
        hình nên không chia trang giống Word.
      </p>
    </main>
  );
}
