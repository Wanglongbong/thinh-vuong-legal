-- Run once in the Supabase SQL editor. All data access is through the Next.js server.
begin;
create table public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null,
  nickname text not null default 'Ẩn danh' check (char_length(nickname) between 1 and 50),
  title text not null check (char_length(title) between 5 and 160),
  body text not null check (char_length(body) between 5 and 10000),
  category text not null check (category in ('Ví điện tử và Fintech','Hợp đồng','Doanh nghiệp và đầu tư','Lao động','Pháp luật khác')),
  status text not null default 'published' check (status in ('published','hidden','deleted')),
  locked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index forum_posts_recent on public.forum_posts (status, created_at desc, id desc);
create table public.forum_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts(id) on delete cascade,
  author_id uuid not null,
  nickname text not null default 'Ẩn danh' check (char_length(nickname) between 1 and 50),
  body text not null check (char_length(body) between 5 and 2000),
  status text not null default 'published' check (status in ('published','hidden','deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index forum_comments_thread on public.forum_comments (post_id, created_at, id);
create table public.forum_flags (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null,
  post_id uuid references public.forum_posts(id),
  comment_id uuid references public.forum_comments(id),
  reason text not null check (char_length(reason) between 5 and 500),
  resolved boolean not null default false,
  created_at timestamptz not null default now(),
  check ((post_id is null) <> (comment_id is null))
);
create table public.forum_rate_events (
  id bigint generated always as identity primary key,
  actor uuid not null,
  ip_hash text not null,
  action text not null,
  created_at timestamptz not null default now()
);
create index forum_rate_actor on public.forum_rate_events (actor, action, created_at);
create index forum_rate_ip on public.forum_rate_events (ip_hash, action, created_at);
alter table public.forum_posts enable row level security;
alter table public.forum_comments enable row level security;
alter table public.forum_flags enable row level security;
alter table public.forum_rate_events enable row level security;
revoke all on public.forum_posts, public.forum_comments, public.forum_flags, public.forum_rate_events from anon, authenticated;
grant all on public.forum_posts, public.forum_comments, public.forum_flags, public.forum_rate_events to service_role;
grant usage, select on sequence public.forum_rate_events_id_seq to service_role;

create function public.forum_mutate(p_actor uuid, p_ip text, p_action text, p_target uuid, p_payload jsonb, p_admin boolean default false)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  result_id uuid;
  post_row public.forum_posts%rowtype;
  comment_row public.forum_comments%rowtype;
  cap integer;
  lock_a bigint;
  lock_b bigint;
  display_name text := coalesce(nullif(btrim(p_payload->>'nickname'), ''), 'Ẩn danh');
begin
  if p_actor is null or p_ip is null or char_length(p_ip) <> 64 then raise exception 'INVALID'; end if;
  if p_action in ('create_post','create_comment','flag') then
    cap := case p_action when 'create_post' then 3 when 'create_comment' then 15 else 10 end;
    lock_a := hashtextextended('forum-user-' || p_actor::text, 0);
    lock_b := hashtextextended('forum-ip-' || p_ip, 0);
    perform pg_advisory_xact_lock(least(lock_a, lock_b));
    perform pg_advisory_xact_lock(greatest(lock_a, lock_b));
    if (select count(*) from public.forum_rate_events where actor = p_actor and action = p_action and created_at > now() - interval '1 hour') >= cap
      or (select count(*) from public.forum_rate_events where ip_hash = p_ip and action = p_action and created_at > now() - interval '1 hour') >= cap then raise exception 'RATE_LIMIT'; end if;
    insert into public.forum_rate_events(actor, ip_hash, action) values(p_actor, p_ip, p_action);
    delete from public.forum_rate_events where created_at < now() - interval '1 day';
  end if;
  if p_action = 'create_post' then
    insert into public.forum_posts(author_id, nickname, title, body, category)
      values(p_actor, display_name, btrim(p_payload->>'title'), btrim(p_payload->>'body'), p_payload->>'category') returning id into result_id;
  elsif p_action in ('edit_post','remove_post','moderate_post','lock_post','create_comment') then
    select * into post_row from public.forum_posts where id = p_target for update;
    if not found then raise exception 'UNAVAILABLE'; end if;
    if p_action in ('moderate_post','lock_post') then
      if not p_admin then raise exception 'FORBIDDEN'; end if;
      if p_action = 'lock_post' then
        update public.forum_posts set locked = coalesce((p_payload->>'locked')::boolean, true), updated_at = now() where id = p_target;
      else
        if p_payload->>'status' not in ('published','hidden') or p_payload->>'status' is null then raise exception 'INVALID'; end if;
        if post_row.status = 'deleted' then raise exception 'UNAVAILABLE'; end if;
        update public.forum_posts set status = p_payload->>'status', updated_at = now() where id = p_target;
      end if;
      result_id := p_target;
    elsif p_action = 'create_comment' then
      if post_row.status <> 'published' or post_row.locked then raise exception 'UNAVAILABLE'; end if;
      insert into public.forum_comments(post_id, author_id, nickname, body) values(p_target, p_actor, display_name, btrim(p_payload->>'body')) returning id into result_id;
    else
      if post_row.author_id <> p_actor then raise exception 'FORBIDDEN'; end if;
      if post_row.status <> 'published' then raise exception 'UNAVAILABLE'; end if;
      if p_action = 'remove_post' then
        update public.forum_posts set status = 'deleted', updated_at = now() where id = p_target;
      else
        update public.forum_posts set title = btrim(p_payload->>'title'), body = btrim(p_payload->>'body'), category = p_payload->>'category', updated_at = now() where id = p_target;
      end if;
      result_id := p_target;
    end if;
  elsif p_action in ('edit_comment','remove_comment','moderate_comment') then
    -- Lock the parent before the comment, consistently with other thread mutations.
    select p.* into post_row from public.forum_posts p join public.forum_comments c on c.post_id = p.id where c.id = p_target for update of p;
    select * into comment_row from public.forum_comments where id = p_target for update;
    if not found then raise exception 'UNAVAILABLE'; end if;
    if p_action = 'moderate_comment' then
      if not p_admin then raise exception 'FORBIDDEN'; end if;
      if p_payload->>'status' not in ('published','hidden') or p_payload->>'status' is null then raise exception 'INVALID'; end if;
      if comment_row.status = 'deleted' then raise exception 'UNAVAILABLE'; end if;
      update public.forum_comments set status = p_payload->>'status', updated_at = now() where id = p_target;
    else
      if comment_row.author_id <> p_actor then raise exception 'FORBIDDEN'; end if;
      if post_row.status <> 'published' or comment_row.status <> 'published' or (post_row.locked and p_action = 'edit_comment') then raise exception 'UNAVAILABLE'; end if;
      if p_action = 'remove_comment' then
        update public.forum_comments set status = 'deleted', updated_at = now() where id = p_target;
      else
        update public.forum_comments set body = btrim(p_payload->>'body'), updated_at = now() where id = p_target;
      end if;
    end if;
    result_id := p_target;
  elsif p_action = 'flag' then
    if p_payload->>'kind' = 'post' then
      if not exists(select 1 from public.forum_posts where id = p_target and status = 'published') then raise exception 'UNAVAILABLE'; end if;
      insert into public.forum_flags(author_id, post_id, reason) values(p_actor, p_target, btrim(p_payload->>'reason')) returning id into result_id;
    elsif p_payload->>'kind' = 'comment' then
      if not exists(select 1 from public.forum_comments c join public.forum_posts p on p.id = c.post_id where c.id = p_target and c.status = 'published' and p.status = 'published') then raise exception 'UNAVAILABLE'; end if;
      insert into public.forum_flags(author_id, comment_id, reason) values(p_actor, p_target, btrim(p_payload->>'reason')) returning id into result_id;
    else raise exception 'INVALID'; end if;
  elsif p_action = 'resolve_flag' then
    if not p_admin then raise exception 'FORBIDDEN'; end if;
    update public.forum_flags set resolved = true where id = p_target returning id into result_id;
    if result_id is null then raise exception 'UNAVAILABLE'; end if;
  else raise exception 'INVALID'; end if;
  return result_id;
exception when check_violation or not_null_violation or invalid_text_representation then
  raise exception 'INVALID';
end;
$$;
revoke all on function public.forum_mutate(uuid,text,text,uuid,jsonb,boolean) from public, anon, authenticated;
grant execute on function public.forum_mutate(uuid,text,text,uuid,jsonb,boolean) to service_role;
commit;
