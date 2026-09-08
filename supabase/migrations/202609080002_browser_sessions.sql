begin;
alter table public.forum_posts drop constraint if exists forum_posts_author_id_fkey;
alter table public.forum_comments drop constraint if exists forum_comments_author_id_fkey;
alter table public.forum_flags drop constraint if exists forum_flags_author_id_fkey;
commit;
