import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import mammoth from 'mammoth';
import sanitizeHtml from 'sanitize-html';

// Deterministic export of user-approved documents; never modify source Word files.
const source = process.argv[2];
if (!source) throw new Error('Pass the directory containing the two final Word reports.');
const files = await fs.readdir(source);
await fs.mkdir('public/reports', { recursive: true });
await fs.mkdir('lib/generated', { recursive: true });
const reports = [];
for (const [slug, phrase, title, pages] of [
  ['day-du', 'báo cáo tổng hợp', 'Báo cáo tổng hợp đầy đủ', 80],
  ['rut-gon', 'báo cáo sơ bộ', 'Báo cáo sơ bộ rút gọn', 19],
]) {
  const matches = files.filter(name => name.normalize('NFC').toLowerCase().includes(phrase) && name.normalize('NFC').toLowerCase().endsWith('hoàn thiện.docx'));
  if (matches.length !== 1) throw new Error(`Expected one source for ${slug}, found ${matches.length}`);
  const buffer = await fs.readFile(path.join(source, matches[0]));
  const output = await mammoth.convertToHtml({ buffer }, { styleMap: [
    "p[style-name='Title'] => h1:fresh",
    "p[style-name='Heading 1'] => h2:fresh",
    "p[style-name='Heading 2'] => h3:fresh",
    "p[style-name='Heading 3'] => h4:fresh",
    "p[style-name='Heading 4'] => h5:fresh",
  ] });
  const headings = [];
  let html = output.value.replace(/<(h[1-6])([^>]*)>([\s\S]*?)<\/\1>/g, (_, tag, attrs, inner) => {
    const text = sanitizeHtml(inner, { allowedTags: [], allowedAttributes: {} });
    const id = `de-muc-${headings.length + 1}`;
    headings.push({ id, text, level: Number(tag.slice(1)) });
    return `<${tag}${attrs} id="${id}">${inner}</${tag}>`;
  });
  html = sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'h1', 'h2'],
    allowedAttributes: { '*': ['id'], a: ['href'], img: ['src', 'alt'], td: ['colspan', 'rowspan'], th: ['colspan', 'rowspan'] },
    allowedSchemes: ['https', 'http', 'mailto'], allowedSchemesByTag: { img: ['data'] },
  });
  const fileBase = `nhom-13-bao-cao-${slug}`;
  await fs.copyFile(path.join(source, matches[0]), `public/reports/${fileBase}.docx`);
  reports.push({ slug, title, pages, fileBase, sourceName: matches[0].normalize('NFC'), sha256: createHash('sha256').update(buffer).digest('hex'), headings, html });
  console.log(`${slug}: ${headings.length} headings, ${html.length} HTML chars; ${output.messages.length} conversion notices`);
  for (const msg of output.messages) console.log(msg.message);
}
await fs.writeFile('lib/generated/reports.json', JSON.stringify(reports));
