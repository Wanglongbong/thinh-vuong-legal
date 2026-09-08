import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

// Real PostgreSQL engine in an isolated, in-memory database; never touches live data.
const db = new PGlite();
try {
  await db.exec('create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users (id uuid primary key);');
  await db.exec(await fs.readFile('supabase/migrations/202609080001_forum.sql', 'utf8'));
  const alice = randomUUID(); const bob = randomUUID(); const admin = randomUUID();
  for (const id of [alice, bob, admin]) await db.query('insert into auth.users(id) values($1)', [id]);
  const ipA = 'a'.repeat(64); const ipB = 'b'.repeat(64);
  async function mutate(actor, action, target = null, payload = {}, elevated = false, ip = ipA) {
    const { rows } = await db.query('select public.forum_mutate($1,$2,$3,$4,$5,$6) as id', [actor, ip, action, target, JSON.stringify(payload), elevated]);
    return rows[0].id;
  }
  const content = { title: 'Câu hỏi thử nghiệm hợp đồng', body: 'Nội dung dùng riêng cho kiểm thử dữ liệu.', category: 'Hợp đồng' };
  const post = await mutate(alice, 'create_post', null, content);
  assert.equal((await db.query('select nickname from forum_posts where id=$1', [post])).rows[0].nickname, 'Ẩn danh');
  assert.equal((await db.query('select count(*)::int as n from forum_posts where status=\'published\'')).rows[0].n, 1);
  await assert.rejects(mutate(bob, 'edit_post', post, content), /FORBIDDEN/);
  await assert.rejects(mutate(bob, 'remove_post', post), /FORBIDDEN/);
  await assert.rejects(mutate(bob, 'moderate_post', post, { status: 'hidden' }), /FORBIDDEN/);
  await mutate(alice, 'edit_post', post, { ...content, title: 'Tiêu đề đã được chỉnh sửa' });
  const comment = await mutate(bob, 'create_comment', post, { body: 'Bình luận từ người dùng thứ hai.' }, false, ipB);
  await assert.rejects(mutate(alice, 'edit_comment', comment, { body: 'Không có quyền sửa.' }), /FORBIDDEN/);
  await mutate(bob, 'edit_comment', comment, { body: 'Bình luận đã chỉnh sửa.' });
  await mutate(admin, 'lock_post', post, { locked: true }, true);
  await assert.rejects(mutate(bob, 'create_comment', post, { body: 'Bài đã khóa bình luận.' }), /UNAVAILABLE/);
  await mutate(admin, 'lock_post', post, { locked: false }, true);
  const flag = await mutate(bob, 'flag', post, { kind: 'post', reason: 'Lý do kiểm thử báo cáo vi phạm.' });
  await assert.rejects(mutate(bob, 'resolve_flag', flag), /FORBIDDEN/);
  await mutate(admin, 'resolve_flag', flag, {}, true);
  await mutate(admin, 'moderate_comment', comment, { status: 'hidden' }, true);
  await mutate(admin, 'moderate_comment', comment, { status: 'published' }, true);
  await mutate(admin, 'moderate_post', post, { status: 'hidden' }, true);
  await assert.rejects(mutate(bob, 'create_comment', post, { body: 'Bài đang bị ẩn khỏi diễn đàn.' }), /UNAVAILABLE/);
  await mutate(admin, 'moderate_post', post, { status: 'published' }, true);
  await assert.rejects(mutate(alice, 'create_post', null, { ...content, body: 'x'.repeat(10001) }), /INVALID/);
  await assert.rejects(mutate(alice, 'create_post', null, { ...content, category: 'Không hợp lệ' }), /INVALID/);
  await mutate(alice, 'create_post', null, content);
  await mutate(alice, 'create_post', null, content);
  await assert.rejects(mutate(alice, 'create_post', null, content, false, ipB), /RATE_LIMIT/);
  await assert.rejects(mutate(bob, 'create_post', null, content), /RATE_LIMIT/);
  for (let n = 1; n < 15; n++) await mutate(bob, 'create_comment', post, { body: 'Bình luận kiểm thử giới hạn theo giờ.' }, false, ipB);
  await assert.rejects(mutate(bob, 'create_comment', post, { body: 'Bình luận vượt giới hạn cho phép.' }, false, ipB), /RATE_LIMIT/);
  await mutate(bob, 'remove_comment', comment);
  await mutate(alice, 'remove_post', post);
  await assert.rejects(mutate(admin, 'moderate_post', post, { status: 'published' }, true), /UNAVAILABLE/);
  const privileges = await db.query("select has_function_privilege('anon','public.forum_mutate(uuid,text,text,uuid,jsonb,boolean)','execute') as anon, has_function_privilege('authenticated','public.forum_mutate(uuid,text,text,uuid,jsonb,boolean)','execute') as authenticated");
  assert.deepEqual(privileges.rows[0], { anon: false, authenticated: false });
  await db.exec('set role anon');
  await assert.rejects(db.query('select * from public.forum_posts'), /permission denied/);
  await db.exec('reset role');
  console.log('PASS: migration, shared persistence, ownership, validation, moderation, locking, flags, soft deletion, per-user and per-IP limits, RLS and RPC permissions.');
} finally { await db.close(); }
