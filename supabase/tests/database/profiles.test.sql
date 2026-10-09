-- Run with `npm run test:db` (needs the local stack: `npm run db:start`).
begin;
create extension if not exists pgtap with schema extensions;

select plan(16);

-- Fixtures (as the table owner, bypassing RLS).
insert into public.profiles (id, bio, role) values
  ('user_alice', 'alice', 'user'),
  ('user_bob', 'bob', 'user'),
  ('user_root', 'root', 'admin');

select has_table('public', 'profiles', 'profiles table exists');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  'RLS is enabled on profiles'
);

-- Anonymous visitors see nothing.
set local role anon;
select throws_ok(
  'select * from public.profiles',
  '42501',
  null,
  'anon has no table privileges'
);
reset role;

-- Alice, a regular user.
set local role authenticated;
set local request.jwt.claims to '{"sub": "user_alice", "role": "authenticated"}';

select results_eq(
  'select id from public.profiles order by id',
  array['user_alice'],
  'a user only sees their own profile'
);

select lives_ok(
  $$update public.profiles set bio = 'updated' where id = 'user_alice'$$,
  'a user can update their own bio'
);
select is(
  (select bio from public.profiles where id = 'user_alice'),
  'updated',
  'the bio update was persisted'
);

update public.profiles set bio = 'hacked' where id = 'user_bob';
select is(
  (select count(*)::int from public.profiles where bio = 'hacked'),
  0,
  'a user cannot update someone else''s profile'
);

select throws_ok(
  $$update public.profiles set role = 'admin' where id = 'user_alice'$$,
  '42501',
  null,
  'a user cannot change their own role'
);

select throws_ok(
  $$delete from public.profiles where id = 'user_alice'$$,
  '42501',
  null,
  'a user cannot delete profiles'
);

select throws_ok(
  $$insert into public.profiles (id) values ('user_mallory')$$,
  '42501',
  null,
  'a user cannot create a profile for someone else'
);

select throws_ok(
  $$insert into public.profiles (id, role) values ('user_alice', 'admin')$$,
  '42501',
  null,
  'a user cannot insert a role'
);

-- A brand new user can create their own row.
set local request.jwt.claims to '{"sub": "user_new", "role": "authenticated"}';
select lives_ok(
  'insert into public.profiles default values',
  'a new user can create their own profile with defaults'
);
select results_eq(
  'select id, role::text from public.profiles',
  $$values ('user_new', 'user')$$,
  'the new profile is owned by the caller and has the user role'
);

-- Admins can read everyone.
set local request.jwt.claims to '{"sub": "user_root", "role": "authenticated"}';
select is(
  (select count(*)::int from public.profiles
   where id in ('user_alice', 'user_bob', 'user_root', 'user_new')),
  4,
  'an admin can read all profiles'
);

-- Avatars: users may only write inside their own folder.
set local request.jwt.claims to '{"sub": "user_alice", "role": "authenticated"}';
select lives_ok(
  $$insert into storage.objects (bucket_id, name) values ('avatars', 'user_alice/avatar.webp')$$,
  'a user can upload into their own avatar folder'
);
select throws_ok(
  $$insert into storage.objects (bucket_id, name) values ('avatars', 'user_bob/avatar.webp')$$,
  '42501',
  null,
  'a user cannot upload into someone else''s avatar folder'
);

select * from finish();
rollback;
