'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState, type SubmitEvent } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Plus, Search, ShieldCheck } from 'lucide-react';
import {
  forumCategories,
  type ForumPost,
  type ForumComment,
  type ForumFlag,
} from '@/lib/forum-shared';

type ForumData = {
  ready?: boolean;
  error?: string;
  admin?: boolean;
  posts?: ForumPost[];
  post?: ForumPost;
  comments?: ForumComment[];
  flags?: ForumFlag[];
  total?: number;
  hasMoreComments?: boolean;
};
async function requestForum(payload: Record<string, unknown>) {
  const response = await fetch('/api/forum', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as {
    error?: string;
    ok: boolean;
    id: string;
  };
  if (!response.ok)
    throw new Error(data.error || 'Chưa thực hiện được thao tác.');
  return data as { ok: boolean; id: string };
}
const displayDate = (date: string) =>
  new Date(date).toLocaleString('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  });
function ForumRules() {
  return (
    <aside className="forum-rules">
      <ShieldCheck aria-hidden="true" />
      <div>
        <strong>Trao đổi văn minh, bảo vệ thông tin cá nhân.</strong>
        <p>
          Không đăng CCCD, số tài khoản, hồ sơ khách hàng hoặc bí mật vụ việc.
          Bài viết hiển thị ngay và có thể được quản trị viên gỡ khi vi phạm. Ý
          kiến cộng đồng không thay thế tư vấn pháp lý cho trường hợp cụ thể.
        </p>
        <p>
          Không cần tài khoản. Bạn có thể sửa hoặc gỡ nội dung của mình trên
          cùng trình duyệt; xóa dữ liệu trình duyệt có thể làm mất quyền này.
        </p>
      </div>
    </aside>
  );
}
function useForum(query: string) {
  const [snapshot, setSnapshot] = useState<{ key: string; data: ForumData }>({
    key: '',
    data: {},
  });
  const [version, setVersion] = useState(0);
  const requestKey = `${query}:${version}`;
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/forum${query}`, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then((r) => r.json() as Promise<ForumData>)
      .then((data) => {
        if (!controller.signal.aborted) setSnapshot({ key: requestKey, data });
      })
      .catch((e) => {
        if (e.name !== 'AbortError')
          setSnapshot({
            key: requestKey,
            data: {
              error:
                'Không tải được diễn đàn. Vui lòng kiểm tra kết nối và thử lại.',
            },
          });
      });
    return () => controller.abort();
  }, [query, requestKey]);
  return { data: snapshot.data, loading: snapshot.key !== requestKey, reload };
}
function Failure({ error, retry }: { error: string; retry: () => void }) {
  return (
    <div className="forum-notice" aria-live="polite">
      <p>{error}</p>
      <button className="publication-secondary" onClick={retry}>
        Thử kết nối lại
      </button>
    </div>
  );
}

export function ForumIndex({ moderation = false }: { moderation?: boolean }) {
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, reload } = useForum(
    `?${new URLSearchParams({ q: search, category, page: String(page), ...(moderation ? { admin: '1' } : {}) })}`,
  );
  const [notice, setNotice] = useState('');
  async function resolve(id: string) {
    try {
      await requestForum({ action: 'resolve_flag', target: id });
      reload();
    } catch (e) {
      setNotice((e as Error).message);
    }
  }
  return (
    <main className="site-shell publication-page forum-page">
      <header className="publication-heading">
        <span className="publication-kicker">
          THỊNH VƯỢNG LEGAL · CỘNG ĐỒNG
        </span>
        <h1>{moderation ? 'Quản trị diễn đàn' : 'Diễn đàn Luật'}</h1>
        <p>
          Đặt câu hỏi, chia sẻ góc nhìn và cùng trao đổi về pháp luật. Bắt đầu
          từ một vấn đề bạn đang quan tâm.
        </p>
        <div className="publication-actions">
          {data.ready ? (
            <Link className="publication-primary" href="/dien-dan/tao-bai">
              <Plus size={18} />
              Viết bài mới
            </Link>
          ) : (
            <button className="publication-primary" disabled>
              Viết bài mới
            </button>
          )}
          {data.admin && !moderation && (
            <Link href="/dien-dan/quan-tri">Quản trị diễn đàn</Link>
          )}
          {moderation && (
            <button
              onClick={async () => {
                await requestForum({ action: 'logout' });
                location.href = '/dien-dan';
              }}
            >
              Đăng xuất quản trị
            </button>
          )}
        </div>
      </header>
      <ForumRules />
      <form
        className="forum-filters"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(q);
          setPage(1);
        }}
      >
        <label className="forum-search">
          <Search size={19} />
          <input
            aria-label="Tìm theo tiêu đề"
            placeholder="Tìm câu hỏi, chủ đề pháp lý…"
            maxLength={160}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <label>
          <span className="sr-only">Chuyên mục</span>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả chuyên mục</option>
            {forumCategories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <button className="publication-primary" type="submit">
          Tìm kiếm
        </button>
      </form>
      {notice && <p role="alert">{notice}</p>}
      {loading ? (
        <p aria-live="polite">Đang tải diễn đàn…</p>
      ) : data.error ? (
        <>
          {moderation && !data.ready && <AdminLogin onSuccess={reload} />}
          <Failure error={data.error} retry={reload} />
        </>
      ) : (
        <>
          {moderation && (
            <section className="forum-flags">
              <h2>Báo cáo vi phạm chưa xử lý</h2>
              {!data.flags?.length && <p>Chưa có báo cáo cần xử lý.</p>}
              {data.flags?.map((flag) => (
                <article key={flag.id}>
                  <p>{flag.reason}</p>
                  <small>{displayDate(flag.created_at)}</small>
                  <div className="publication-actions">
                    {flag.post_id && (
                      <Link href={`/dien-dan/${flag.post_id}`}>
                        Xem bài viết
                      </Link>
                    )}
                    {flag.comment_id && (
                      <span>Mã bình luận: {flag.comment_id}</span>
                    )}
                    <button onClick={() => resolve(flag.id)}>
                      Đánh dấu đã xử lý
                    </button>
                  </div>
                </article>
              ))}
            </section>
          )}
          {!data.posts?.length ? (
            <section className="forum-empty">
              <MessageSquare size={36} />
              <h2>
                {search || category
                  ? 'Chưa tìm thấy bài viết phù hợp'
                  : 'Cuộc trao đổi đầu tiên bắt đầu từ bạn'}
              </h2>
              <p>
                {search || category
                  ? 'Thử đổi từ khóa hoặc chuyên mục.'
                  : 'Hãy đặt một câu hỏi rõ ràng để mọi người cùng trao đổi.'}
              </p>
            </section>
          ) : (
            <div className="forum-post-list">
              {data.posts.map((post) => (
                <article key={post.id}>
                  <div className="forum-post-meta">
                    <span>{post.category}</span>
                    {post.locked && <span>Đã khóa bình luận</span>}
                    {post.status !== 'published' && (
                      <span>
                        {post.status === 'hidden' ? 'Đang ẩn' : 'Tác giả đã gỡ'}
                      </span>
                    )}
                  </div>
                  <h2>
                    <Link href={`/dien-dan/${post.id}`}>{post.title}</Link>
                  </h2>
                  <p className="forum-excerpt">
                    {post.body.slice(0, 220)}
                    {post.body.length > 220 && '…'}
                  </p>
                  <small>
                    {post.nickname} · {displayDate(post.created_at)}
                    {post.mine && ' · Bài của bạn'}
                  </small>
                </article>
              ))}
            </div>
          )}
          <nav className="forum-pagination" aria-label="Phân trang">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              ← Trang trước
            </button>
            <span>
              Trang {page} / {Math.max(1, Math.ceil((data.total || 0) / 12))}
            </span>
            <button
              disabled={page * 12 >= (data.total || 0)}
              onClick={() => setPage((p) => p + 1)}
            >
              Trang sau →
            </button>
          </nav>
        </>
      )}
    </main>
  );
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      await requestForum({
        action: 'login',
        email: form.get('email'),
        password: form.get('password'),
      });
      onSuccess();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="forum-form" onSubmit={submit}>
      <h2>Đăng nhập quản trị</h2>
      <label>
        Email
        <input
          name="email"
          type="email"
          autoComplete="username"
          defaultValue="vuanhquan160205@gmail.com"
          required
        />
      </label>
      <label>
        Mật khẩu
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={200}
        />
      </label>
      {error && <p role="alert">{error}</p>}
      <button disabled={busy} className="publication-primary">
        {busy ? 'Đang xác thực…' : 'Đăng nhập'}
      </button>
    </form>
  );
}

function PostForm({
  post,
  onDone,
  onCancel,
}: {
  post?: ForumPost;
  onDone: (id: string) => void;
  onCancel?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      const data = await requestForum({
        action: post ? 'edit_post' : 'create_post',
        target: post?.id,
        title: form.get('title'),
        category: form.get('category'),
        body: form.get('body'),
        nickname: form.get('nickname'),
      });
      onDone(data.id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="forum-form" onSubmit={submit}>
      <label>
        Tiêu đề
        <input
          name="title"
          minLength={5}
          maxLength={160}
          defaultValue={post?.title}
          placeholder="Nêu ngắn gọn vấn đề bạn muốn trao đổi"
          required
        />
      </label>
      <label>
        Chuyên mục
        <select
          name="category"
          defaultValue={post?.category || forumCategories[0]}
        >
          {forumCategories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      {!post && (
        <label>
          Tên hiển thị (không bắt buộc)
          <input
            name="nickname"
            maxLength={50}
            placeholder="Để trống để dùng tên Ẩn danh"
            autoComplete="off"
          />
        </label>
      )}
      <label>
        Nội dung
        <textarea
          name="body"
          minLength={5}
          maxLength={10000}
          rows={12}
          defaultValue={post?.body}
          placeholder="Mô tả vấn đề, bối cảnh và điều bạn muốn làm rõ. Không đăng dữ liệu cá nhân của mình hoặc người khác."
          required
        />
      </label>
      <small>
        Tối đa 10.000 ký tự. Nội dung hiển thị công khai ngay khi đăng.
      </small>
      {error && (
        <p className="forum-error" role="alert">
          {error}
        </p>
      )}
      <div className="publication-actions">
        <button className="publication-primary" disabled={busy}>
          {busy ? 'Đang lưu…' : post ? 'Lưu thay đổi' : 'Đăng bài công khai'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}>
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}
export function NewForumPost() {
  const { data, loading, reload } = useForum('');
  const router = useRouter();
  return (
    <main className="site-shell publication-page">
      <Link href="/dien-dan">← Diễn đàn Luật</Link>
      <header className="publication-heading">
        <h1>Viết bài trao đổi</h1>
        <p>Một câu hỏi cụ thể sẽ giúp cộng đồng trả lời sát vấn đề hơn.</p>
      </header>
      <ForumRules />
      {loading ? (
        <p>Đang kiểm tra kết nối…</p>
      ) : data.error ? (
        <Failure error={data.error} retry={reload} />
      ) : (
        <PostForm onDone={(id) => router.push(`/dien-dan/${id}`)} />
      )}
    </main>
  );
}

export function ForumThread({ id }: { id: string }) {
  const [commentPage, setCommentPage] = useState(1);
  const { data, loading, reload } = useForum(
    `?post=${encodeURIComponent(id)}&commentPage=${commentPage}`,
  );
  const [editing, setEditing] = useState(false);
  const [editComment, setEditComment] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState('');
  const [confirm, setConfirm] = useState<{
    action: string;
    target: string;
  } | null>(null);
  const [flag, setFlag] = useState<{ kind: string; target: string } | null>(
    null,
  );
  const router = useRouter();
  async function mutate(payload: Record<string, unknown>, done?: () => void) {
    setPending(true);
    setNotice('');
    try {
      await requestForum(payload);
      done?.();
      reload();
      return true;
    } catch (e) {
      setNotice((e as Error).message);
      return false;
    } finally {
      setPending(false);
    }
  }
  async function submitComment(
    event: SubmitEvent<HTMLFormElement>,
    comment?: ForumComment,
  ) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    if (
      await mutate({
        action: comment ? 'edit_comment' : 'create_comment',
        target: comment?.id || id,
        body: form.get('body'),
        nickname: form.get('nickname'),
      })
    ) {
      formElement.reset();
      setEditComment(null);
    }
  }
  const post = data.post;
  return (
    <main className="site-shell publication-page forum-thread">
      <Link href="/dien-dan">← Diễn đàn Luật</Link>
      {loading ? (
        <p aria-live="polite">Đang tải bài viết…</p>
      ) : data.error ? (
        <Failure error={data.error} retry={reload} />
      ) : (
        post && (
          <>
            {editing ? (
              <PostForm
                post={post}
                onDone={() => {
                  setEditing(false);
                  reload();
                }}
                onCancel={() => setEditing(false)}
              />
            ) : (
              <article className="forum-full-post">
                <div className="forum-post-meta">
                  <span>{post.category}</span>
                  {post.status !== 'published' && (
                    <span>
                      {post.status === 'hidden' ? 'Đang ẩn' : 'Tác giả đã gỡ'}
                    </span>
                  )}
                </div>
                <h1>{post.title}</h1>
                <p className="forum-byline">
                  {post.nickname} · {displayDate(post.created_at)}
                </p>
                <div className="forum-body">{post.body}</div>
                <div className="forum-tools">
                  {post.mine && post.status === 'published' && (
                    <>
                      <button onClick={() => setEditing(true)}>Sửa bài</button>
                      <button
                        onClick={() =>
                          setConfirm({ action: 'remove_post', target: id })
                        }
                      >
                        Gỡ bài
                      </button>
                    </>
                  )}
                  <button onClick={() => setFlag({ kind: 'post', target: id })}>
                    Báo cáo vi phạm
                  </button>
                  {data.admin && (
                    <>
                      <button
                        disabled={pending || post.status === 'deleted'}
                        onClick={() =>
                          mutate({
                            action: 'moderate_post',
                            target: id,
                            status:
                              post.status === 'published'
                                ? 'hidden'
                                : 'published',
                          })
                        }
                      >
                        {post.status === 'published'
                          ? 'Ẩn bài'
                          : 'Khôi phục bài'}
                      </button>
                      <button
                        disabled={pending}
                        onClick={() =>
                          mutate({
                            action: 'lock_post',
                            target: id,
                            locked: !post.locked,
                          })
                        }
                      >
                        {post.locked ? 'Mở bình luận' : 'Khóa bình luận'}
                      </button>
                    </>
                  )}
                </div>
              </article>
            )}
            {notice && (
              <p className="forum-notice" aria-live="polite">
                {notice}
              </p>
            )}
            {confirm && (
              <div className="forum-notice" role="alert">
                <p>
                  Bạn muốn gỡ nội dung này khỏi diễn đàn? Sau khi gỡ, nội dung
                  sẽ không hiển thị công khai.
                </p>
                <div className="publication-actions">
                  <button
                    disabled={pending}
                    onClick={() =>
                      mutate(confirm, () => {
                        if (confirm.action === 'remove_post')
                          router.push('/dien-dan');
                        setConfirm(null);
                      })
                    }
                  >
                    Xác nhận gỡ
                  </button>
                  <button onClick={() => setConfirm(null)}>Hủy</button>
                </div>
              </div>
            )}
            {flag && (
              <form
                className="forum-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  if (
                    await mutate({
                      action: 'flag',
                      ...flag,
                      reason: form.get('reason'),
                    })
                  ) {
                    setFlag(null);
                    setNotice('Đã gửi báo cáo cho quản trị viên.');
                  }
                }}
              >
                <label>
                  Lý do báo cáo
                  <textarea
                    name="reason"
                    minLength={5}
                    maxLength={500}
                    rows={3}
                    required
                  />
                </label>
                <div className="publication-actions">
                  <button disabled={pending}>Gửi báo cáo</button>
                  <button type="button" onClick={() => setFlag(null)}>
                    Hủy
                  </button>
                </div>
              </form>
            )}
            <section className="forum-comments">
              <h2>Trao đổi cộng đồng</h2>
              {!data.comments?.length && (
                <p>Chưa có bình luận. Bạn có thể bắt đầu cuộc trao đổi.</p>
              )}
              {data.comments?.map((comment) => (
                <article key={comment.id}>
                  <div className="forum-byline">
                    <strong>{comment.nickname}</strong> ·{' '}
                    {displayDate(comment.created_at)}
                    {comment.status !== 'published' && (
                      <span>
                        {' '}
                        · {comment.status === 'hidden' ? 'Đang ẩn' : 'Đã gỡ'}
                      </span>
                    )}
                  </div>
                  {editComment === comment.id ? (
                    <form
                      className="forum-form"
                      onSubmit={(e) => submitComment(e, comment)}
                    >
                      <label>
                        Sửa bình luận
                        <textarea
                          name="body"
                          minLength={5}
                          maxLength={2000}
                          defaultValue={comment.body}
                          rows={4}
                          required
                        />
                      </label>
                      <div className="publication-actions">
                        <button disabled={pending}>Lưu</button>
                        <button
                          type="button"
                          onClick={() => setEditComment(null)}
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="forum-body">{comment.body}</p>
                  )}
                  <div className="forum-tools">
                    {comment.mine && comment.status === 'published' && (
                      <>
                        {!post.locked && (
                          <button onClick={() => setEditComment(comment.id)}>
                            Sửa
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setConfirm({
                              action: 'remove_comment',
                              target: comment.id,
                            })
                          }
                        >
                          Gỡ
                        </button>
                      </>
                    )}
                    <button
                      onClick={() =>
                        setFlag({ kind: 'comment', target: comment.id })
                      }
                    >
                      Báo cáo
                    </button>
                    {data.admin && (
                      <button
                        disabled={pending || comment.status === 'deleted'}
                        onClick={() =>
                          mutate({
                            action: 'moderate_comment',
                            target: comment.id,
                            status:
                              comment.status === 'published'
                                ? 'hidden'
                                : 'published',
                          })
                        }
                      >
                        {comment.status === 'published'
                          ? 'Ẩn bình luận'
                          : 'Khôi phục'}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </section>
            {(commentPage > 1 || data.hasMoreComments) && (
              <nav
                className="forum-pagination"
                aria-label="Phân trang bình luận"
              >
                <button
                  disabled={commentPage === 1}
                  onClick={() => setCommentPage((p) => p - 1)}
                >
                  Trước
                </button>
                <span>Trang bình luận {commentPage}</span>
                <button
                  disabled={!data.hasMoreComments}
                  onClick={() => setCommentPage((p) => p + 1)}
                >
                  Sau
                </button>
              </nav>
            )}
            {post.locked || post.status !== 'published' ? (
              <p className="forum-notice">
                Bài viết hiện không nhận thêm bình luận.
              </p>
            ) : (
              <form className="forum-form" onSubmit={submitComment}>
                <h2>Gửi bình luận</h2>
                <label>
                  Tên hiển thị (không bắt buộc)
                  <input
                    name="nickname"
                    maxLength={50}
                    placeholder="Ẩn danh"
                    autoComplete="off"
                  />
                </label>
                <label>
                  Bình luận
                  <textarea
                    name="body"
                    minLength={5}
                    maxLength={2000}
                    rows={5}
                    required
                    placeholder="Chia sẻ ý kiến và nguồn tham khảo nếu có…"
                  />
                </label>
                <small>
                  Tối đa 2.000 ký tự. Không chia sẻ thông tin riêng tư.
                </small>
                <button className="publication-primary" disabled={pending}>
                  {pending ? 'Đang gửi…' : 'Đăng bình luận công khai'}
                </button>
              </form>
            )}
            <ForumRules />
          </>
        )
      )}
    </main>
  );
}
