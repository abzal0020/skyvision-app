-- Company portal v1. Additive; existing catalogue is untouched.
begin;
create schema if not exists sv_private;
revoke all on schema sv_private from public, anon;
grant usage on schema sv_private to authenticated;

create table public.sv_companies (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid() references auth.users(id),
 name text not null check(length(trim(name)) between 2 and 160),
 name_zh text not null default '' check(length(name_zh)<=160),
 country text not null default 'KZ' check(country in ('KZ','CN','UZ','KG','RU','OTHER')),
 city text not null default '' check(length(city)<=120),
 activities text[] not null check(cardinality(activities)>0 and activities <@ array['factory','forwarder','buyer']),
 created_at timestamptz not null default now()
);
create table public.sv_company_members (
 company_id uuid not null references public.sv_companies(id),
 user_id uuid not null references auth.users(id),
 role text not null check(role in ('owner','manager','viewer')),
 display_name text not null default '' check(length(display_name)<=160),
 primary key(company_id,user_id)
);
create index sv_members_user on public.sv_company_members(user_id,company_id);
create index sv_companies_owner on public.sv_companies(owner_id);
create table public.sv_company_invites (
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null references public.sv_companies(id),
 email text not null check(length(email) between 3 and 254 and email=lower(trim(email))),
 role text not null check(role in ('manager','viewer')),
 token text not null unique default (replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-','')),
 expires_at timestamptz not null default (now()+interval '7 days'),
 accepted_at timestamptz,
 created_at timestamptz not null default now()
);
create index sv_invites_company on public.sv_company_invites(company_id);

create table public.sv_listings (
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null references public.sv_companies(id),
 kind text not null check(kind in ('product','logistics')),
 title text not null check(length(trim(title)) between 3 and 180),
 title_zh text not null default '' check(length(title_zh)<=180),
 description text not null default '' check(length(description)<=10000),
 description_zh text not null default '' check(length(description_zh)<=10000),
 origin text not null check(length(trim(origin)) between 1 and 160),
 destination text not null default '' check(length(destination)<=160),
 price numeric(16,2) check(price>=0),
 currency text not null default 'USD' check(currency in ('USD','KZT','CNY')),
 unit text not null default 'tonne' check(unit in ('tonne','container','trip')),
 basis text not null default 'FCA' check(basis in ('FCA','DAP','route')),
 transport text not null default 'rail' check(transport in ('rail','road','container')),
 valid_until date,
 status text not null default 'draft' check(status in ('draft','published','archived')),
 version integer not null default 1,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check(kind<>'logistics' or (basis='route' and length(trim(destination))>0)),
 check(basis<>'DAP' or length(trim(destination))>0)
);
create index sv_listings_company on public.sv_listings(company_id);
create index sv_listings_feed on public.sv_listings(kind,updated_at desc) where status='published';

create table public.sv_requests (
 id uuid primary key default gen_random_uuid(),
 listing_id uuid not null references public.sv_listings(id),
 from_company uuid not null references public.sv_companies(id),
 to_company uuid not null references public.sv_companies(id),
 subject text not null check(length(trim(subject)) between 3 and 200),
 body text not null check(length(trim(body)) between 3 and 5000),
 status text not null default 'new' check(status in ('new','discussing','closed')),
 created_at timestamptz not null default now(),
 check(from_company<>to_company)
);
create index sv_requests_from on public.sv_requests(from_company,created_at desc);
create index sv_requests_to on public.sv_requests(to_company,created_at desc);
create index sv_requests_listing on public.sv_requests(listing_id);
create table public.sv_messages (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null references public.sv_requests(id),
 company_id uuid not null references public.sv_companies(id),
 sender_id uuid not null default auth.uid() references auth.users(id),
 body text not null check(length(trim(body)) between 1 and 5000),
 created_at timestamptz not null default now()
);
create index sv_messages_thread on public.sv_messages(request_id,created_at,id);
create index sv_messages_company on public.sv_messages(company_id);
create index sv_messages_sender on public.sv_messages(sender_id);

-- Definer helpers are private and expose only the current user's membership.
create function sv_private.role_in(c uuid) returns text
language sql stable security definer set search_path='' as $$
 select role from public.sv_company_members where company_id=c and user_id=(select auth.uid())
$$;
revoke all on function sv_private.role_in(uuid) from public,anon;
grant execute on function sv_private.role_in(uuid) to authenticated;

-- Atomic owner membership, no client can assign itself a role.
create function sv_private.company_owner() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or new.owner_id<>auth.uid() then raise exception 'FORBIDDEN'; end if;
 insert into public.sv_company_members(company_id,user_id,role,display_name)
 values(new.id,new.owner_id,'owner','');
 return new;
end $$;
revoke all on function sv_private.company_owner() from public,anon,authenticated;
create trigger sv_company_owner after insert on public.sv_companies for each row execute function sv_private.company_owner();

create function sv_private.listing_version() returns trigger
language plpgsql set search_path='' as $$
begin new.version=old.version+1; new.updated_at=now(); return new; end $$;
revoke all on function sv_private.listing_version() from public,anon,authenticated;
create trigger sv_listing_version before update on public.sv_listings for each row execute function sv_private.listing_version();

alter table public.sv_companies enable row level security;
alter table public.sv_company_members enable row level security;
alter table public.sv_company_invites enable row level security;
alter table public.sv_listings enable row level security;
alter table public.sv_requests enable row level security;
alter table public.sv_messages enable row level security;
revoke all on public.sv_companies,public.sv_company_members,public.sv_company_invites,public.sv_listings,public.sv_requests,public.sv_messages from anon,authenticated;
grant select on public.sv_companies,public.sv_listings to anon,authenticated;
grant select on public.sv_company_members,public.sv_company_invites,public.sv_requests,public.sv_messages to authenticated;
grant insert(name,name_zh,country,city,activities) on public.sv_companies to authenticated;
grant update(name,name_zh,country,city,activities) on public.sv_companies to authenticated;
grant update(role) on public.sv_company_members to authenticated;
grant delete on public.sv_company_members,public.sv_company_invites to authenticated;
grant insert(company_id,email,role) on public.sv_company_invites to authenticated;
grant insert(id,company_id,kind,title,title_zh,description,description_zh,origin,destination,price,currency,unit,basis,transport,valid_until,status) on public.sv_listings to authenticated;
grant update(kind,title,title_zh,description,description_zh,origin,destination,price,currency,unit,basis,transport,valid_until,status) on public.sv_listings to authenticated;
grant insert(id,listing_id,from_company,to_company,subject,body) on public.sv_requests to authenticated;
grant update(status) on public.sv_requests to authenticated;
grant insert(id,request_id,company_id,body) on public.sv_messages to authenticated;

create policy listings_public on public.sv_listings for select to anon,authenticated using(status='published');
create policy listings_team on public.sv_listings for select to authenticated using(sv_private.role_in(company_id) is not null);
create policy listings_create on public.sv_listings for insert to authenticated with check(sv_private.role_in(company_id) in ('owner','manager'));
create policy listings_edit on public.sv_listings for update to authenticated using(sv_private.role_in(company_id) in ('owner','manager')) with check(sv_private.role_in(company_id) in ('owner','manager'));
create policy companies_public on public.sv_companies for select to anon,authenticated using(exists(select 1 from public.sv_listings l where l.company_id=sv_companies.id and l.status='published'));
create policy companies_team on public.sv_companies for select to authenticated using(owner_id=(select auth.uid()) or sv_private.role_in(id) is not null);
create policy companies_partners on public.sv_companies for select to authenticated using(exists(select 1 from public.sv_requests r where (r.from_company=sv_companies.id or r.to_company=sv_companies.id) and (sv_private.role_in(r.from_company) is not null or sv_private.role_in(r.to_company) is not null)));
create policy companies_create on public.sv_companies for insert to authenticated with check(owner_id=(select auth.uid()));
create policy companies_edit on public.sv_companies for update to authenticated using(sv_private.role_in(id)='owner') with check(sv_private.role_in(id)='owner');
create policy members_read on public.sv_company_members for select to authenticated using(sv_private.role_in(company_id) is not null);
create policy members_edit on public.sv_company_members for update to authenticated using(sv_private.role_in(company_id)='owner' and role<>'owner') with check(sv_private.role_in(company_id)='owner' and role<>'owner');
create policy members_remove on public.sv_company_members for delete to authenticated using(sv_private.role_in(company_id)='owner' and role<>'owner');
create policy invites_read on public.sv_company_invites for select to authenticated using(sv_private.role_in(company_id)='owner');
create policy invites_create on public.sv_company_invites for insert to authenticated with check(sv_private.role_in(company_id)='owner');
create policy invites_remove on public.sv_company_invites for delete to authenticated using(sv_private.role_in(company_id)='owner');
create policy requests_read on public.sv_requests for select to authenticated using(sv_private.role_in(from_company) is not null or sv_private.role_in(to_company) is not null);
create policy requests_create on public.sv_requests for insert to authenticated with check(
 sv_private.role_in(from_company) in ('owner','manager')
 and exists(select 1 from public.sv_listings l where l.id=listing_id and l.company_id=to_company and l.status='published' and (l.valid_until is null or l.valid_until>=current_date))
);
create policy requests_edit on public.sv_requests for update to authenticated using(sv_private.role_in(from_company) in ('owner','manager') or sv_private.role_in(to_company) in ('owner','manager')) with check(sv_private.role_in(from_company) in ('owner','manager') or sv_private.role_in(to_company) in ('owner','manager'));
create policy messages_read on public.sv_messages for select to authenticated using(exists(select 1 from public.sv_requests r where r.id=sv_messages.request_id and (sv_private.role_in(r.from_company) is not null or sv_private.role_in(r.to_company) is not null)));
create policy messages_create on public.sv_messages for insert to authenticated with check(
 sender_id=(select auth.uid()) and sv_private.role_in(company_id) in ('owner','manager')
 and exists(select 1 from public.sv_requests r where r.id=request_id and r.status<>'closed' and company_id in (r.from_company,r.to_company))
);

-- Email-bound, expiring, single-use invitations; never sends email itself.
create function sv_private.accept_invite(p_token text) returns uuid
language plpgsql security definer set search_path='' as $$
declare inv public.sv_company_invites; uid uuid=auth.uid(); user_email text;
begin
 if uid is null then raise exception 'FORBIDDEN'; end if;
 select lower(email) into user_email from auth.users where id=uid and email_confirmed_at is not null;
 select * into inv from public.sv_company_invites where token=p_token for update;
 if inv.id is null or inv.accepted_at is not null or inv.expires_at<now() or user_email is null or inv.email<>user_email then raise exception 'INVITE_INVALID'; end if;
 insert into public.sv_company_members(company_id,user_id,role,display_name)
 values(inv.company_id,uid,inv.role,user_email) on conflict(company_id,user_id) do nothing;
 update public.sv_company_invites set accepted_at=now() where id=inv.id;
 return inv.company_id;
end $$;
revoke all on function sv_private.accept_invite(text) from public,anon;
grant execute on function sv_private.accept_invite(text) to authenticated;
create function public.sv_accept_invite(p_token text) returns uuid
language sql security invoker set search_path='' as $$select sv_private.accept_invite(p_token)$$;
revoke all on function public.sv_accept_invite(text) from public,anon;
grant execute on function public.sv_accept_invite(text) to authenticated;

notify pgrst,'reload schema';
commit;
