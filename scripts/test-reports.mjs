import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import mammoth from 'mammoth';
import { decodeHTML } from 'entities';

const reports = JSON.parse(await fs.readFile('lib/generated/reports.json', 'utf8'));
const normalize = text => text.normalize('NFC').replace(/\s+/g, ' ').trim();
for (const report of reports) {
  const buffer = await fs.readFile(`public/reports/${report.fileBase}.docx`);
  assert.equal(createHash('sha256').update(buffer).digest('hex'), report.sha256);
  const raw = await mammoth.extractRawText({ buffer });
  const visible = normalize(decodeHTML(report.html.replace(/<[^>]*>/g, ' ')));
  const missing = raw.value.split(/\n+/).map(normalize).filter(text => text.length > 1 && !visible.includes(text));
  assert.deepEqual(missing, [], `${report.slug}: paragraphs missing from online reader`);
  assert(report.html.includes('KẾT LUẬN'));
  assert(!/<script|javascript:|onerror=/i.test(report.html));
  assert.equal(new Set(report.headings.map(h => h.id)).size, report.headings.length);
  for (const heading of report.headings) assert(report.html.includes(`id="${heading.id}"`));
  console.log(`PASS ${report.slug}: original checksum, all text paragraphs, conclusion, ${report.headings.length} working heading targets, sanitized HTML.`);
}

if (process.argv[2]) {
  const base = process.argv[2].replace(/\/$/, '');
  for (const pathname of ['/bao-cao-so-bo', '/bao-cao-so-bo/day-du', '/bao-cao-so-bo/rut-gon', '/dien-dan', '/dien-dan/tao-bai', '/dien-dan/quan-tri']) {
    const response = await fetch(base + pathname); assert.equal(response.status, 200, pathname); console.log(`PASS HTTP 200 ${pathname}`);
  }
  for (const report of reports) {
    const response = await fetch(`${base}/reports/${report.fileBase}.docx`);
    assert.equal(response.status, 200);
    assert.equal(createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex'), report.sha256);
    console.log(`PASS downloadable original ${report.slug}`);
  }
  assert.equal((await fetch(base + '/bao-cao-so-bo/khong-ton-tai')).status, 404);
  const forged = await fetch(base + '/api/forum', { method: 'POST', headers: { origin: 'https://untrusted.example', 'content-type': 'application/json' }, body: JSON.stringify({ action: 'create_post' }) });
  assert.equal(forged.status, 403);
  const forum = await fetch(base + '/api/forum');
  const data = await forum.json();
  if (forum.status === 503) {
    assert.equal(data.ready, false);
    const post = await fetch(base + '/api/forum', { method: 'POST', headers: { origin: base, 'content-type': 'application/json' }, body: JSON.stringify({ action: 'create_post' }) });
    assert.equal(post.status, 503);
    console.log('PASS forum fails closed without configuration; no fake successful posts.');
  } else { assert.equal(forum.status, 200); assert.equal(data.ready, true); console.log('PASS forum backend connected.'); }
}
