import { ChevronDown, FileText } from 'lucide-react';
import type { ContractReportContent } from '@/lib/contract-report-content';

export function ContractReport({
  content,
}: {
  content: ContractReportContent;
}) {
  return (
    <section className="report-content-section">
      <span className="article-kicker">06 · Nội dung từ báo cáo tổng hợp</span>
      <h2>Phạm vi tư vấn chi tiết</h2>
      <p className="report-intro">
        Nội dung dưới đây được trích từ đúng đề mục tương ứng trong bản báo cáo
        tổng hợp và sắp xếp lại để nhà đầu tư tra cứu theo từng dịch vụ.
      </p>
      <div className="report-accordions">
        {content.sections.map((section, index) => (
          <details
            className="report-accordion"
            key={section.heading}
            open={index === 0}
          >
            <summary>
              <span className="report-summary-icon">
                <FileText aria-hidden="true" />
              </span>
              <strong>{section.heading}</strong>
              <span>{section.paragraphs.length} nội dung</span>
              <ChevronDown className="report-chevron" aria-hidden="true" />
            </summary>
            <div className="report-prose">
              {section.paragraphs.map((paragraph, paragraphIndex) => {
                const isList =
                  paragraph.startsWith('- ') || paragraph.startsWith('+ ');
                return isList ? (
                  <div
                    className="report-list-line"
                    key={`${section.heading}-${paragraphIndex}`}
                  >
                    <span aria-hidden="true">{paragraph.slice(0, 1)}</span>
                    <p>{paragraph.slice(2)}</p>
                  </div>
                ) : (
                  <p key={`${section.heading}-${paragraphIndex}`}>
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </details>
        ))}
      </div>
      <p className="source-note">
        Nguồn nội bộ: Báo cáo tổng hợp dịch vụ pháp lý ví điện tử của Nhóm 13.
        Cần rà soát hiệu lực pháp luật và thông tin giao dịch trước khi sử dụng.
      </p>
    </section>
  );
}
