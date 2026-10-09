-- Local development seed data. Runs on `npm run db:reset`.
-- Ids mimic Clerk user ids. Replace them with real ones from your Clerk
-- development instance if you want to sign in as these users.

insert into public.profiles (id, bio, locale, theme, role)
values
  ('user_seed_admin', 'Seeded admin account.', 'en', 'dark', 'admin'),
  ('user_seed_member', 'Seeded member account.', 'es', 'system', 'user')
on conflict (id) do nothing;
