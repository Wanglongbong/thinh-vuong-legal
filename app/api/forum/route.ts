import { NextResponse } from 'next/server';
import {
  forumConfigured,
  forumDatabase,
  forumIdentity,
  forumIpHash,
} from '@/lib/forum-server';
import { forumCategories, forumUnavailable } from '@/lib/forum-shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fields =
  'id,title,body,category,nickname,created_at,updated_at,status,locked,author_id';
const respond = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  });

function publicRow(row: Record<string, unknown>, actor?: string) {
  const { author_id, ...safe } = row;
  return { ...safe, mine: Boolean(actor && author_id === actor) };
}

export async function GET(request: Request) {
  if (!forumConfigured())
    return respond({ ready: false, error: forumUnavailable }, 503);
  try {
    const identity = await forumIdentity();
    const db = forumDatabase();
    const params = new URL(request.url).searchParams;
    if (params.get('admin') === '1' && !identity.admin)
      return respond({ error: 'Tài khoản quản trị chưa được cấu hình.' }, 403);
    const postId = params.get('post');
    if (postId) {
      if (!uuid.test(postId))
        return respond({ error: 'Bài viết không hợp lệ.' }, 400);
      const postResult = await db.query(
        `select ${fields} from public.forum_posts where id = $1`,
        [postId],
      );
      const post = postResult.rows[0];
      if (!post || (post.status !== 'published' && !identity.admin))
        return respond(
          { error: 'Bài viết không tồn tại hoặc đã được gỡ.' },
          404,
        );
      const commentPage = Math.max(
        1,
        Math.min(10000, Math.floor(Number(params.get('commentPage')) || 1)),
      );
      const comments = await db.query(
        `select id,post_id,body,nickname,created_at,status,author_id from public.forum_comments where post_id = $1 ${identity.admin ? '' : "and status = 'published'"} order by created_at asc, id asc limit 51 offset $2`,
        [postId, (commentPage - 1) * 50],
      );
      return respond({
        ready: true,
        admin: identity.admin,
        post: publicRow(post, identity.id || undefined),
        comments: comments.rows
          .slice(0, 50)
          .map((row) => publicRow(row, identity.id || undefined)),
        hasMoreComments: comments.rows.length > 50,
      });
    }

    const page = Math.max(
      1,
      Math.min(10000, Math.floor(Number(params.get('page')) || 1)),
    );
    const conditions = ["status = 'published'"];
    const values: unknown[] = [];
    const category = params.get('category');
    if (
      category &&
      forumCategories.includes(category as (typeof forumCategories)[number])
    ) {
      values.push(category);
      conditions.push(`category = $${values.length}`);
    }
    const q = (params.get('q') || '').slice(0, 160).replace(/[\\%_]/g, '\\$&');
    if (q) {
      values.push(`%${q}%`);
      conditions.push(`title ilike $${values.length} escape '\\'`);
    }
    const where = `where ${conditions.join(' and ')}`;
    const countResult = await db.query(
      `select count(*)::int as count from public.forum_posts ${where}`,
      values,
    );
    const listResult = await db.query(
      `select ${fields} from public.forum_posts ${where} order by created_at desc, id desc limit $${values.length + 1} offset $${values.length + 2}`,
      [...values, 12, (page - 1) * 12],
    );
    return respond({
      ready: true,
      admin: identity.admin,
      posts: listResult.rows.map((row) =>
        publicRow(row, identity.id || undefined),
      ),
      total: countResult.rows[0]?.count || 0,
      page,
      flags: [],
    });
  } catch {
    return respond(
      {
        ready: false,
        error:
          'Không kết nối được diễn đàn. Vui lòng thử lại sau; dữ liệu chưa được thay đổi.',
      },
      503,
    );
  }
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin)
    return respond({ error: 'Nguồn yêu cầu không hợp lệ.' }, 403);
  if (!forumConfigured()) return respond({ error: forumUnavailable }, 503);
  try {
    if (!request.headers.get('content-type')?.includes('application/json'))
      return respond({ error: 'Định dạng không hợp lệ.' }, 415);
    const raw = await request.text();
    if (raw.length > 32000) return respond({ error: 'Nội dung quá dài.' }, 413);
    const input = JSON.parse(raw);
    if (!input || typeof input !== 'object' || Array.isArray(input))
      return respond({ error: 'Dữ liệu không hợp lệ.' }, 400);
    if (input.action === 'login')
      return respond(
        {
          error:
            'Tài khoản quản trị chưa được cấu hình. Diễn đàn công khai vẫn hoạt động bình thường.',
        },
        503,
      );
    if (input.action === 'logout') return respond({ ok: true });
    const allowed = [
      'create_post',
      'edit_post',
      'remove_post',
      'create_comment',
      'edit_comment',
      'remove_comment',
      'flag',
    ];
    if (!allowed.includes(input.action))
      return respond({ error: 'Thao tác không hợp lệ.' }, 400);
    if (
      input.action !== 'create_post' &&
      (typeof input.target !== 'string' || !uuid.test(input.target))
    )
      return respond({ error: 'Mã nội dung không hợp lệ.' }, 400);
    const payload: Record<string, string> = {};
    for (const key of [
      'title',
      'body',
      'nickname',
      'category',
      'reason',
      'kind',
    ])
      if (typeof input[key] === 'string') payload[key] = input[key].trim();
    if (input.action === 'create_post' || input.action === 'edit_post') {
      if (
        !payload.title ||
        payload.title.length < 5 ||
        payload.title.length > 160 ||
        !forumCategories.includes(
          payload.category as (typeof forumCategories)[number],
        )
      )
        return respond({ error: 'Nội dung cần ít nhất 5 ký tự.' }, 400);
    }
    if (
      ['create_post', 'edit_post', 'create_comment', 'edit_comment'].includes(
        input.action,
      )
    ) {
      const max = input.action.includes('comment') ? 2000 : 10000;
      if (
        !payload.body ||
        payload.body.length < 5 ||
        payload.body.length > max ||
        (payload.nickname && payload.nickname.length > 50)
      )
        return respond(
          {
            error: `Nội dung cần 5–${max} ký tự; tên hiển thị tối đa 50 ký tự.`,
          },
          400,
        );
    }
    if (
      input.action === 'flag' &&
      (!payload.reason ||
        payload.reason.length < 5 ||
        payload.reason.length > 500 ||
        !['post', 'comment'].includes(payload.kind))
    )
      return respond({ error: 'Lý do báo cáo cần 5–500 ký tự.' }, 400);

    const identity = await forumIdentity(
      ['create_post', 'create_comment', 'flag'].includes(input.action),
    );
    if (!identity.id)
      return respond({ error: 'Bạn không có quyền sửa nội dung này.' }, 403);
    try {
      const result = await forumDatabase().query(
        'select public.forum_mutate($1,$2,$3,$4,$5,$6) as id',
        [
          identity.id,
          forumIpHash(request),
          input.action,
          input.target || null,
          payload,
          false,
        ],
      );
      return respond({ ok: true, id: result.rows[0].id });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('RATE_LIMIT'))
        return respond(
          {
            error:
              'Bạn đã đạt giới hạn trong một giờ (3 bài viết, 15 bình luận hoặc 10 báo cáo). Vui lòng quay lại sau.',
          },
          429,
        );
      if (message.includes('FORBIDDEN'))
        return respond(
          { error: 'Bạn không có quyền thực hiện thao tác này.' },
          403,
        );
      if (message.includes('UNAVAILABLE'))
        return respond(
          { error: 'Bài viết đã bị gỡ hoặc đã khóa bình luận.' },
          409,
        );
      if (message.includes('INVALID'))
        return respond(
          { error: 'Nội dung không hợp lệ. Vui lòng kiểm tra lại.' },
          400,
        );
      throw error;
    }
  } catch (error) {
    if (error instanceof SyntaxError)
      return respond({ error: 'Dữ liệu không hợp lệ.' }, 400);
    return respond(
      {
        error: 'Chưa lưu được nội dung. Vui lòng giữ bản nháp và thử lại sau.',
      },
      503,
    );
  }
}
