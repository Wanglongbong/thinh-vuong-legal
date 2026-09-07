'use client';

import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';

function safeFileName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLocaleLowerCase();
}

export async function downloadLegalDocx(title: string, content: string) {
  const paragraphs = content.split('\n').map((line) => {
    const trimmed = line.trim();
    const isTitle =
      trimmed.length > 0 &&
      trimmed.length < 100 &&
      trimmed === trimmed.toLocaleUpperCase('vi');
    return new Paragraph({
      heading: isTitle ? HeadingLevel.HEADING_1 : undefined,
      alignment: isTitle ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
      spacing: { after: 120, line: 360 },
      children: [
        new TextRun({
          text: line || ' ',
          bold: isTitle,
          font: 'Times New Roman',
          size: 26,
        }),
      ],
    });
  });

  const document = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Times New Roman', size: 26 },
          paragraph: { spacing: { line: 360 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1701 },
          },
        },
        children: paragraphs,
      },
    ],
  });
  const blob = await Packer.toBlob(document);
  const url = URL.createObjectURL(blob);
  const link = documentGlobal().createElement('a');
  link.href = url;
  link.download = `${safeFileName(title) || 'van-ban-phap-ly'}.docx`;
  link.click();
  URL.revokeObjectURL(url);
}

function documentGlobal() {
  return window.document;
}
