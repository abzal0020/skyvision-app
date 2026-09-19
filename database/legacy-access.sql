-- Protect old endpoints as well as the new editor.
begin;
alter table public.admins enable row level security;
create policy sv_legacy_admin_read on public.admins for select to authenticated using(user_id=(select auth.uid()));
create policy sv_legacy_admin_manage on public.admins for all to authenticated
using((select auth.uid()) in (select user_id from public.sv_catalog_admins))
with check((select auth.uid()) in (select user_id from public.sv_catalog_admins));
insert into public.admins(user_id) select user_id from public.sv_catalog_admins on conflict(user_id) do nothing;
alter table public.factory_documents enable row level security;
create policy sv_legacy_documents_read on public.factory_documents for select to anon,authenticated using(exists(select 1 from public.factories f where f.id=factory_id and f.published));
create policy sv_legacy_documents_manage on public.factory_documents for all to authenticated
using((select auth.uid()) in (select user_id from public.sv_catalog_admins))
with check((select auth.uid()) in (select user_id from public.sv_catalog_admins));
-- Self-profile edits must not allow setting role=admin.
revoke update on public.profiles from anon,authenticated;
grant update(full_name,company,phone,display_name) on public.profiles to authenticated;
commit;
