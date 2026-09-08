import { NextResponse } from 'next/server';
import {
  forumAuth,
  forumConfigured,
  forumDatabase,
  forumIpHash,
  isForumAdmin,
} from '@/lib/forum-server';
import { forumCategories, forumUnavailable } from '@/lib/forum-shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const respond = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  });
const fields =
  'id,title,body,category,nickname,created_at,updated_at,status,locked,author_id';
function publicRow(row: Record<string, unknown>, userId?: string) {
  const { author_id, ...safe } = row;
  return { ...safe, mine: Boolean(userId && author_id === userId) };
}

export async function GET(request: Request) {
  if (!forumConfigured())
    return respond({ ready: false, error: forumUnavailable }, 503);
  try {
    const auth = await forumAuth();
    const {
      data: { user },
    } = await auth.auth.getUser();
    const admin = isForumAdmin(user);
    const db = forumDatabase();
    const params = new URL(request.url).searchParams;
    if (params.get('admin') === '1' && !admin)
      return respond({ error: 'Chỉ quản trị viên được truy cập.' }, 403);
    const moderation = admin && params.get('admin') === '1';
    const postId = params.get('post');
    if (postId) {
      if (!uuid.test(postId))
        return respond({ error: 'Bài viết không hợp lệ.' }, 400);
      const { data: post, error } = await db
        .from('forum_posts')
        .select(fields)
        .eq('id', postId)
        .maybeSingle();
      if (error) throw error;
      if (!post || (post.status !== 'published' && !admin))
        return respond(
          { error: 'Bài viết không tồn tại hoặc đã được gỡ.' },
          404,
        );
      let query = db
        .from('forum_comments')
        .select('id,post_id,body,nickname,created_at,status,author_id')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        .order('id', { ascending: true });
      if (!admin) query = query.eq('status', 'published');
      const commentPage = Math.max(
        1,
        Math.min(10000, Number(params.get('commentPage')) || 1),
      );
      const { data: comments, error: commentsError } = await query.range(
        (commentPage - 1) * 50,
        commentPage * 50,
      );
      if (commentsError) throw commentsError;
      return respond({
        ready: true,
        admin,
        post: publicRow(post, user?.id),
        comments: (comments || [])
          .slice(0, 50)
          .map((row) => publicRow(row, user?.id)),
        hasMoreComments: (comments?.length || 0) > 50,
      });
    }
    const page = Math.max(
      1,
      Math.min(10000, Math.floor(Number(params.get('page')) || 1)),
    );
    let query = db
      .from('forum_posts')
      .select(fields, { count: 'exact' })
      .order('created_at', { ascending: false })
      .order('id', { ascending: false });
    if (!moderation) query = query.eq('status', 'published');
    const category = params.get('category');
    if (
      category &&
      forumCategories.includes(category as (typeof forumCategories)[number])
    )
      query = query.eq('category', category);
    const q = (params.get('q') || '').slice(0, 160).replace(/[\\%_]/g, '\\$&');
    if (q) query = query.ilike('title', `%${q}%`);
    const { data, error, count } = await query.range(
      (page - 1) * 12,
      page * 12 - 1,
    );
    if (error) throw error;
    let flags: unknown[] = [];
    if (moderation) {
      const result = await db
        .from('forum_flags')
        .select('id,post_id,comment_id,reason,resolved,created_at')
        .eq('resolved', false)
        .order('created_at', { ascending: false })
        .limit(100);
      if (result.error) throw result.error;
      const commentIds = (result.data || []).flatMap((flag) =>
        flag.comment_id ? [flag.comment_id] : [],
      );
      const parents = new Map<string, string>();
      if (commentIds.length) {
        const related = await db
          .from('forum_comments')
          .select('id,post_id')
          .in('id', commentIds);
        if (related.error) throw related.error;
        for (const row of related.data || []) parents.set(row.id, row.post_id);
      }
      flags = (result.data || []).map((flag) => ({
        ...flag,
        post_id: flag.post_id || parents.get(flag.comment_id || '') || null,
      }));
    }
    return respond({
      ready: true,
      admin,
      posts: (data || []).map((row) => publicRow(row, user?.id)),
      total: count || 0,
      page,
      flags,
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
    const auth = await forumAuth();
    if (input.action === 'login') {
      if (
        typeof input.email !== 'string' ||
        typeof input.password !== 'string' ||
        input.password.length > 200
      )
        return respond({ error: 'Thông tin đăng nhập không hợp lệ.' }, 400);
      const { data, error } = await auth.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });
      if (error || !isForumAdmin(data.user)) {
        await auth.auth.signOut();
        return respond(
          { error: 'Tài khoản hoặc mật khẩu quản trị chưa đúng.' },
          401,
        );
      }
      return respond({ ok: true });
    }
    if (input.action === 'logout') {
      await auth.auth.signOut();
      return respond({ ok: true });
    }
    const allowed = [
      'create_post',
      'edit_post',
      'remove_post',
      'create_comment',
      'edit_comment',
      'remove_comment',
      'flag',
      'moderate_post',
      'moderate_comment',
      'lock_post',
      'resolve_flag',
    ];
    if (!allowed.includes(input.action))
      return respond({ error: 'Thao tác không hợp lệ.' }, 400);
    if (
      input.action !== 'create_post' &&
      (typeof input.target !== 'string' || !uuid.test(input.target))
    )
      return respond({ error: 'Mã nội dung không hợp lệ.' }, 400);
    const payload: Record<string, string | boolean> = {};
    for (const key of [
      'title',
      'body',
      'nickname',
      'category',
      'reason',
      'kind',
      'status',
    ])
      if (typeof input[key] === 'string') payload[key] = input[key].trim();
    if (typeof input.locked === 'boolean') payload.locked = input.locked;
    if (input.action === 'create_post' || input.action === 'edit_post') {
      if (
        typeof payload.title !== 'string' ||
        payload.title.length < 5 ||
        payload.title.length > 160 ||
        !forumCategories.includes(
          payload.category as (typeof forumCategories)[number],
        )
      )
        return respond(
          { error: 'Tiêu đề cần 5–160 ký tự và chuyên mục hợp lệ.' },
          400,
        );
    }
    if (
      ['create_post', 'edit_post', 'create_comment', 'edit_comment'].includes(
        input.action,
      )
    ) {
      const max = input.action.includes('comment') ? 2000 : 10000;
      if (
        typeof payload.body !== 'string' ||
        payload.body.length < 5 ||
        payload.body.length > max ||
        (typeof payload.nickname === 'string' && payload.nickname.length > 50)
      )
        return respond(
          {
            error: `Nội dung cần 5–${max} ký tự; tên hiển thị tối đa 50 ký tự.`,
          },
          400,
        );
    }
    let {
      data: { user },
    } = await auth.auth.getUser();
    if (!user) {
      if (!['create_post', 'create_comment', 'flag'].includes(input.action))
        return respond({ error: 'Bạn không có quyền sửa nội dung này.' }, 403);
      const result = await auth.auth.signInAnonymously();
      if (result.error || !result.data.user)
        return respond(
          { error: 'Chưa thể tạo phiên ẩn danh. Vui lòng thử lại sau.' },
          503,
        );
      user = result.data.user;
    }
    const { data, error } = await forumDatabase().rpc('forum_mutate', {
      p_actor: user.id,
      p_ip: forumIpHash(request),
      p_action: input.action,
      p_target: input.target || null,
      p_payload: payload,
      p_admin: isForumAdmin(user),
    });
    if (error) {
      if (error.message.includes('RATE_LIMIT'))
        return respond(
          {
            error:
              'Bạn đã đạt giới hạn trong một giờ (3 bài viết, 15 bình luận hoặc 10 báo cáo). Vui lòng quay lại sau.',
          },
          429,
        );
      if (error.message.includes('FORBIDDEN'))
        return respond(
          { error: 'Bạn không có quyền thực hiện thao tác này.' },
          403,
        );
      if (error.message.includes('UNAVAILABLE'))
        return respond(
          { error: 'Bài viết đã bị gỡ hoặc đã khóa bình luận.' },
          409,
        );
      if (error.message.includes('INVALID'))
        return respond(
          { error: 'Nội dung không hợp lệ. Vui lòng kiểm tra lại.' },
          400,
        );
      throw error;
    }
    return respond({ ok: true, id: data });
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
