import Link from 'next/link';
import { notFound } from 'next/navigation';
import reports from '@/lib/generated/reports.json';
export function generateStaticParams() {
  return reports.map((r) => ({ slug: r.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: reports.find((r) => r.slug === slug)?.title || 'Báo cáo' };
}
export default async function ReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const report = reports.find((r) => r.slug === slug);
  if (!report) notFound();
  return (
    <main className="site-shell publication-page">
      <Link href="/bao-cao-so-bo">← Tất cả báo cáo</Link>
      <header className="reader-header">
        <span className="publication-kicker">NHÓM 13 · TÀI LIỆU HỌC TẬP</span>
        <h1>{report.title}</h1>
        <div className="publication-actions">
          <a download href={`/reports/${report.fileBase}.docx`}>
            Tải bản Word gốc
          </a>
        </div>
      </header>
      <div className="report-reader">
        <aside className="reader-toc">
          <details open>
            <summary>Mục lục nội dung</summary>
            <nav aria-label="Mục lục báo cáo">
              {report.headings.map((h) => (
                <a
                  key={h.id}
                  href={`#${h.id}`}
                  className={`toc-level-${h.level}`}
                >
                  {h.text}
                </a>
              ))}
            </nav>
          </details>
        </aside>
        <article
          className="report-prose"
          dangerouslySetInnerHTML={{ __html: report.html }}
        />
      </div>
    </main>
  );
}
