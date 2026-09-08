import 'server-only';
import { Pool } from 'pg';
import { cookies } from 'next/headers';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

const cookieName = 'tv_forum_session';
let pool: Pool | undefined;

export function forumConfigured() {
  return Boolean(
    process.env.FORUM_DATABASE_URL &&
    process.env.FORUM_SESSION_SECRET &&
    process.env.FORUM_RATE_LIMIT_SALT,
  );
}

export function forumDatabase() {
  if (!pool)
    pool = new Pool({
      connectionString: process.env.FORUM_DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 4,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    });
  return pool;
}

function signature(id: string) {
  return createHmac('sha256', process.env.FORUM_SESSION_SECRET!)
    .update(id)
    .digest('hex');
}

export async function forumIdentity(create = false) {
  const jar = await cookies();
  const [id, supplied] = (jar.get(cookieName)?.value || '').split('.');
  if (/^[0-9a-f-]{36}$/i.test(id || '') && supplied) {
    const expected = signature(id);
    if (
      supplied.length === expected.length &&
      timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))
    )
      return { id, admin: id === process.env.FORUM_ADMIN_SESSION_ID };
  }
  if (!create) return { id: null, admin: false };
  const newId = randomUUID();
  jar.set(cookieName, `${newId}.${signature(newId)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  return { id: newId, admin: false };
}

export function forumIpHash(request: Request) {
  const ip = process.env.VERCEL
    ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
    : 'local-development';
  if (!ip) throw new Error('IP_UNAVAILABLE');
  return createHmac('sha256', process.env.FORUM_RATE_LIMIT_SALT!)
    .update(ip)
    .digest('hex');
}
