-- Profiles: one row per Clerk user.
--
-- Auth is handled by Clerk. Supabase trusts Clerk session tokens through the
-- third-party auth integration, so `auth.jwt() ->> 'sub'` is the Clerk user id
-- (e.g. "user_2abc..."). That is why ids are text, not uuid.

create extension if not exists moddatetime schema extensions;

create schema if not exists private;
revoke all on schema private from public;

create type public.app_role as enum ('user', 'admin');

create table public.profiles (
  id text primary key default (auth.jwt() ->> 'sub'),
  bio text not null default '' check (char_length(bio) <= 300),
  date_of_birth date check (date_of_birth >= date '1900-01-01'),
  avatar_url text,
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  locale text not null default 'en' check (locale ~ '^[a-z]{2}$'),
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'App-specific user data. Identity (name, email) lives in Clerk.';
comment on column public.profiles.id is 'Clerk user id (JWT sub claim).';
comment on column public.profiles.role is 'Only changeable with the service role. Never granted to clients.';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function extensions.moddatetime (updated_at);

-- Current Clerk user id, or null for anonymous requests.
create or replace function private.current_user_id()
returns text
language sql
stable
set search_path = ''
as $$
  select nullif(auth.jwt() ->> 'sub', '')
$$;

-- Security definer so policies can check the caller's role without recursing into profiles RLS.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = private.current_user_id()
      and role = 'admin'
  )
$$;

grant usage on schema private to authenticated;
revoke all on function private.current_user_id() from public;
revoke all on function private.is_admin() from public;
grant execute on function private.current_user_id() to authenticated;
grant execute on function private.is_admin() to authenticated;

-- Privileges --------------------------------------------------------------
-- Table-level grants are the first line of defence: clients may only ever
-- touch these columns, whatever the RLS policies say. `role` is deliberately
-- missing from both lists, so users cannot promote themselves.

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant insert (id) on table public.profiles to authenticated;
grant update (bio, date_of_birth, avatar_url, theme, locale) on table public.profiles to authenticated;

-- Row level security ------------------------------------------------------

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using (id = (select private.current_user_id()));

create policy "Admins can read all profiles"
  on public.profiles for select
  to authenticated
  using ((select private.is_admin()));

-- Lets the app create the row on first visit, so it never depends on the
-- Clerk webhook arriving first. Only the id column is insertable (see grants).
create policy "Users can create their own profile"
  on public.profiles for insert
  to authenticated
  with check (id = (select private.current_user_id()));

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = (select private.current_user_id()))
  with check (id = (select private.current_user_id()));

-- Avatars storage ---------------------------------------------------------
-- Public-read bucket. Each user may only write inside a folder named after
-- their own user id: avatars/<user_id>/<file>.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "Users can read their own avatar objects"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select private.current_user_id())
  );

create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select private.current_user_id())
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select private.current_user_id())
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select private.current_user_id())
  );
