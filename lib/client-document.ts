import type { DemoFile } from '@/components/demo-session-provider';

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_TEXT_LENGTH = 50_000;

function cleanText(value: string) {
  return value
    .split(String.fromCharCode(0))
    .join('')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim()
    .slice(0, MAX_TEXT_LENGTH);
}

export async function readLegalDocument(file: File): Promise<DemoFile> {
  if (file.size > MAX_FILE_SIZE)
    throw new Error('Tệp vượt quá giới hạn 20 MB.');

  const extension = file.name.split('.').pop()?.toLocaleLowerCase();
  if (extension !== 'pdf' && extension !== 'docx')
    throw new Error('Chỉ hỗ trợ tệp PDF hoặc DOCX.');

  const arrayBuffer = await file.arrayBuffer();
  let text = '';

  if (extension === 'docx') {
    const mammoth = await import('mammoth/mammoth.browser');
    const result = await mammoth.extractRawText({ arrayBuffer });
    text = result.value;
  } else {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString();
    const document = await pdfjs.getDocument({
      data: new Uint8Array(arrayBuffer),
    }).promise;
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      pages.push(
        content.items.map((item) => ('str' in item ? item.str : '')).join(' '),
      );
    }
    text = pages.join('\n\n');
  }

  const normalized = cleanText(text);
  if (!normalized)
    throw new Error('Không đọc được nội dung chữ trong tệp này.');

  return {
    id: `${Date.now()}-${file.name}`,
    name: file.name,
    format: extension,
    size: file.size,
    text: normalized,
    addedAt: new Date().toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

export function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
