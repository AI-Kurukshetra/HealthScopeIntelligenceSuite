-- Backfill public.users from existing auth.users to avoid missing profile rows for legacy accounts.
insert into public.users (id, email, full_name, status)
select
  au.id,
  au.email,
  coalesce(
    au.raw_user_meta_data ->> 'full_name',
    au.raw_user_meta_data ->> 'name',
    au.raw_user_meta_data ->> 'user_name',
    au.email
  ) as full_name,
  'active'
from auth.users au
on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, public.users.full_name),
      status = 'active',
      updated_at = now();
