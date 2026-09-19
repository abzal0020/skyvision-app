-- Independent catalog tables leave existing factories/data intact for rollback.
begin;
create table public.sv_catalog_admins(user_id uuid primary key references auth.users(id));
alter table public.sv_catalog_admins enable row level security;
revoke all on public.sv_catalog_admins from anon, authenticated;
grant select on public.sv_catalog_admins to authenticated;
create policy own_admin_membership on public.sv_catalog_admins for select to authenticated using(user_id=(select auth.uid()));
insert into public.sv_catalog_admins(user_id) select id from auth.users where email='abzalkojaixan3@gmail.com';

create table public.sv_catalog_drafts(
  id uuid primary key, slug text unique not null check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  content jsonb not null check(jsonb_typeof(content)='object'),
  version integer not null default 1, published boolean not null default false,
  published_version integer, deleted_at timestamptz, updated_at timestamptz not null default now()
);
create table public.sv_catalog(
  id uuid primary key references public.sv_catalog_drafts(id), slug text unique not null,
  content jsonb not null, updated_at timestamptz not null default now()
);
alter table public.sv_catalog_drafts enable row level security;
alter table public.sv_catalog enable row level security;
revoke all on public.sv_catalog_drafts,public.sv_catalog from anon,authenticated;
grant select,insert,update,delete on public.sv_catalog_drafts,public.sv_catalog to authenticated;
grant select on public.sv_catalog to anon;
create policy admin_drafts on public.sv_catalog_drafts for all to authenticated
using ((select auth.uid()) in (select user_id from public.sv_catalog_admins))
with check ((select auth.uid()) in (select user_id from public.sv_catalog_admins));
create policy catalog_public on public.sv_catalog for select to anon,authenticated using(true);
create policy admin_catalog on public.sv_catalog for all to authenticated
using ((select auth.uid()) in (select user_id from public.sv_catalog_admins))
with check ((select auth.uid()) in (select user_id from public.sv_catalog_admins));

create function public.sv_save_factory(factory_id uuid,factory_slug text,document jsonb,expected_version integer,operation text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare current_row public.sv_catalog_drafts; result_row public.sv_catalog_drafts;
begin
  if auth.uid() is null or not exists(select 1 from public.sv_catalog_admins where user_id=auth.uid()) then raise exception 'Нет доступа к редактору'; end if;
  if operation not in ('draft','publish','unpublish','trash','restore') then raise exception 'Неизвестное действие'; end if;
  if coalesce(trim(document#>>'{name,ru}'),'')='' or jsonb_typeof(document->'products') is distinct from 'array' or jsonb_typeof(document->'assets') is distinct from 'array' or jsonb_typeof(document->'routes') is distinct from 'array' then raise exception 'Некорректная карточка'; end if;
  if octet_length(document::text)>1000000 then raise exception 'Карточка слишком большая'; end if;
  if operation='publish' and coalesce(trim(document#>>'{city,ru}'),'')='' then raise exception 'Укажите город'; end if;
  select * into current_row from public.sv_catalog_drafts where id=factory_id for update;
  if found then
    if current_row.version<>expected_version then raise exception 'Карточка изменена в другой вкладке. Обновите страницу перед сохранением.'; end if;
    if current_row.deleted_at is not null and operation<>'restore' then raise exception 'Сначала восстановите завод из корзины'; end if;
    update public.sv_catalog_drafts set slug=factory_slug,content=document,version=version+1,updated_at=now(),
      deleted_at=case when operation='trash' then now() when operation='restore' then null else deleted_at end,
      published=case when operation='publish' then true when operation in ('unpublish','trash','restore') then false else published end,
      published_version=case when operation='publish' then version+1 else published_version end
    where id=factory_id returning * into result_row;
  else
    if expected_version<>0 or operation not in ('draft','publish') then raise exception 'Завод не найден'; end if;
    insert into public.sv_catalog_drafts(id,slug,content,published,published_version) values(factory_id,factory_slug,document,operation='publish',case when operation='publish' then 1 else null end) returning * into result_row;
  end if;
  if operation='publish' then
    insert into public.sv_catalog(id,slug,content) values(factory_id,factory_slug,document)
    on conflict(id) do update set slug=excluded.slug,content=excluded.content,updated_at=now();
  elsif operation in ('trash','unpublish','restore') then delete from public.sv_catalog where id=factory_id;
  end if;
  return to_jsonb(result_row);
end; $$;
revoke execute on function public.sv_save_factory(uuid,text,jsonb,integer,text) from public,anon;
grant execute on function public.sv_save_factory(uuid,text,jsonb,integer,text) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('skyvision-catalog','skyvision-catalog',false,52428800,array['image/webp','image/jpeg','image/png','application/pdf','video/mp4','video/webm']);
create policy sv_upload_admin on storage.objects for insert to authenticated with check(bucket_id='skyvision-catalog' and (select auth.uid()) in (select user_id from public.sv_catalog_admins));
create policy sv_read_admin on storage.objects for select to authenticated using(bucket_id='skyvision-catalog' and (select auth.uid()) in (select user_id from public.sv_catalog_admins));
create policy sv_read_published on storage.objects for select to anon,authenticated using(bucket_id='skyvision-catalog' and exists(select 1 from public.sv_catalog c cross join lateral jsonb_array_elements(c.content->'assets') a where a->>'path'=name));
commit;
