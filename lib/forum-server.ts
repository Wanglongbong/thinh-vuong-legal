import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createHmac } from 'node:crypto';

export function forumConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.FORUM_RATE_LIMIT_SALT,
  );
}
export function forumDatabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export async function forumAuth() {
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookieOptions: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      },
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (values) => {
          for (const { name, value, options } of values)
            jar.set(name, value, options);
        },
      },
    },
  );
}
export function isForumAdmin(
  user: { id: string; is_anonymous?: boolean } | null,
) {
  return Boolean(
    user &&
    !user.is_anonymous &&
    process.env.FORUM_ADMIN_USER_ID &&
    user.id === process.env.FORUM_ADMIN_USER_ID,
  );
}
export function forumIpHash(request: Request) {
  // Vercel overwrites this header. Never trust arbitrary forwarded headers on another host.
  const ip = process.env.VERCEL
    ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
    : 'local-development';
  if (!ip) throw new Error('IP_UNAVAILABLE');
  return createHmac('sha256', process.env.FORUM_RATE_LIMIT_SALT!)
    .update(ip)
    .digest('hex');
}
