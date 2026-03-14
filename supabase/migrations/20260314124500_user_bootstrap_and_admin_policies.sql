create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, status)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    'active'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        status = 'active',
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_auth_user_created();

drop policy if exists organizations_manage on public.organizations;
create policy organizations_manage
on public.organizations
for all
to authenticated
using (public.has_compliance_access(tenant_id))
with check (public.has_compliance_access(tenant_id));

drop policy if exists facilities_manage on public.facilities;
create policy facilities_manage
on public.facilities
for all
to authenticated
using (public.has_compliance_access(tenant_id))
with check (public.has_compliance_access(tenant_id));

drop policy if exists memberships_manage on public.tenant_memberships;
create policy memberships_manage
on public.tenant_memberships
for all
to authenticated
using (public.has_compliance_access(tenant_id))
with check (public.has_compliance_access(tenant_id));
