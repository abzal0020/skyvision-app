begin;
create table public.sv_people (
 user_id uuid primary key default auth.uid() references auth.users(id),
 full_name text not null check(length(trim(full_name)) between 2 and 120),
 headline text not null default '' check(length(headline)<=160),
 city text not null default '' check(length(city)<=120),
 about text not null default '' check(length(about)<=3000),
 listed boolean not null default true,
 created_at timestamptz not null default now()
);
create table public.sv_friendships (
 id uuid primary key default gen_random_uuid(),
 sender_id uuid not null default auth.uid() references public.sv_people(user_id),
 recipient_id uuid not null references public.sv_people(user_id),
 status text not null default 'pending' check(status in ('pending','accepted')),
 created_at timestamptz not null default now(),
 check(sender_id<>recipient_id)
);
create unique index sv_friend_pair on public.sv_friendships(least(sender_id,recipient_id),greatest(sender_id,recipient_id));
create index sv_friend_recipient on public.sv_friendships(recipient_id);
create table public.sv_blocks (
 blocker_id uuid not null default auth.uid() references auth.users(id),
 blocked_id uuid not null references auth.users(id),
 primary key(blocker_id,blocked_id),check(blocker_id<>blocked_id)
);
create index sv_blocks_target on public.sv_blocks(blocked_id);
create table public.sv_direct_messages (
 id uuid primary key default gen_random_uuid(),
 sender_id uuid not null default auth.uid() references public.sv_people(user_id),
 recipient_id uuid not null references public.sv_people(user_id),
 body text not null check(length(trim(body)) between 1 and 5000),
 created_at timestamptz not null default now(),
 check(sender_id<>recipient_id)
);
create index sv_dm_sender on public.sv_direct_messages(sender_id,created_at desc);
create index sv_dm_recipient on public.sv_direct_messages(recipient_id,created_at desc);

create function sv_private.contact_allowed(other uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and auth.uid()<>other and not exists(select 1 from public.sv_blocks b where (b.blocker_id=auth.uid() and b.blocked_id=other) or (b.blocker_id=other and b.blocked_id=auth.uid()))
$$;
revoke all on function sv_private.contact_allowed(uuid) from public,anon;
grant execute on function sv_private.contact_allowed(uuid) to authenticated;
create function sv_private.known_person(other uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and (other=auth.uid() or exists(select 1 from public.sv_friendships f where (f.sender_id=auth.uid() and f.recipient_id=other) or (f.recipient_id=auth.uid() and f.sender_id=other)) or exists(select 1 from public.sv_direct_messages m where (m.sender_id=auth.uid() and m.recipient_id=other) or (m.recipient_id=auth.uid() and m.sender_id=other)))
$$;
revoke all on function sv_private.known_person(uuid) from public,anon;
grant execute on function sv_private.known_person(uuid) to authenticated;

alter table public.sv_people enable row level security;
alter table public.sv_friendships enable row level security;
alter table public.sv_blocks enable row level security;
alter table public.sv_direct_messages enable row level security;
revoke all on public.sv_people,public.sv_friendships,public.sv_blocks,public.sv_direct_messages from anon,authenticated;
grant select on public.sv_people,public.sv_friendships,public.sv_blocks,public.sv_direct_messages to authenticated;
grant insert(full_name,headline,city,about,listed) on public.sv_people to authenticated;
grant update(full_name,headline,city,about,listed) on public.sv_people to authenticated;
grant insert(recipient_id) on public.sv_friendships to authenticated;
grant update(status) on public.sv_friendships to authenticated;
grant delete on public.sv_friendships to authenticated;
grant insert(blocked_id) on public.sv_blocks to authenticated;
grant delete on public.sv_blocks to authenticated;
grant insert(id,recipient_id,body) on public.sv_direct_messages to authenticated;
create policy people_read on public.sv_people for select to authenticated using(listed or sv_private.known_person(user_id));
create policy people_create on public.sv_people for insert to authenticated with check(user_id=(select auth.uid()));
create policy people_edit on public.sv_people for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy friends_read on public.sv_friendships for select to authenticated using((select auth.uid()) in(sender_id,recipient_id));
create policy friends_create on public.sv_friendships for insert to authenticated with check(sender_id=(select auth.uid()) and sv_private.contact_allowed(recipient_id) and exists(select 1 from public.sv_people p where p.user_id=recipient_id));
create policy friends_accept on public.sv_friendships for update to authenticated using(recipient_id=(select auth.uid()) and status='pending' and sv_private.contact_allowed(sender_id)) with check(recipient_id=(select auth.uid()) and status='accepted');
create policy friends_remove on public.sv_friendships for delete to authenticated using((select auth.uid()) in(sender_id,recipient_id));
create policy blocks_read on public.sv_blocks for select to authenticated using(blocker_id=(select auth.uid()));
create policy blocks_create on public.sv_blocks for insert to authenticated with check(blocker_id=(select auth.uid()));
create policy blocks_remove on public.sv_blocks for delete to authenticated using(blocker_id=(select auth.uid()));
create policy dm_read on public.sv_direct_messages for select to authenticated using((select auth.uid()) in(sender_id,recipient_id));
create policy dm_create on public.sv_direct_messages for insert to authenticated with check(sender_id=(select auth.uid()) and sv_private.contact_allowed(recipient_id) and exists(select 1 from public.sv_people p where p.user_id=recipient_id));

create table public.sv_deals (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null unique references public.sv_requests(id),
 title text not null,
 created_by uuid not null default auth.uid() references auth.users(id),
 created_at timestamptz not null default now()
);
create table public.sv_deal_parties (
 deal_id uuid not null references public.sv_deals(id),
 company_id uuid not null references public.sv_companies(id),
 joined_at timestamptz not null default now(),
 primary key(deal_id,company_id)
);
create index sv_parties_company on public.sv_deal_parties(company_id);
create table public.sv_deal_invites (
 id uuid primary key default gen_random_uuid(),
 deal_id uuid not null references public.sv_deals(id),
 company_id uuid not null references public.sv_companies(id),
 invited_by uuid not null default auth.uid() references auth.users(id),
 status text not null default 'pending' check(status in ('pending','accepted','declined')),
 created_at timestamptz not null default now(),
 unique(deal_id,company_id)
);
create index sv_deal_inv_company on public.sv_deal_invites(company_id);
create table public.sv_deal_messages (
 id uuid primary key default gen_random_uuid(),
 deal_id uuid not null references public.sv_deals(id),
 company_id uuid not null references public.sv_companies(id),
 sender_id uuid not null default auth.uid() references auth.users(id),
 body text not null check(length(trim(body)) between 1 and 5000),
 created_at timestamptz not null default now()
);
create index sv_deal_message_deal on public.sv_deal_messages(deal_id,created_at desc);
create index sv_deal_message_company on public.sv_deal_messages(company_id);
create index sv_deal_message_sender on public.sv_deal_messages(sender_id);

create function sv_private.deal_access(d uuid, editing boolean default false) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.sv_deal_parties p join public.sv_company_members m on m.company_id=p.company_id where p.deal_id=d and m.user_id=auth.uid() and (not editing or m.role in ('owner','manager')))
$$;
create function sv_private.deal_since(d uuid) returns timestamptz language sql stable security definer set search_path='' as $$
 select min(p.joined_at) from public.sv_deal_parties p join public.sv_company_members m on m.company_id=p.company_id where p.deal_id=d and m.user_id=auth.uid()
$$;
revoke all on function sv_private.deal_access(uuid,boolean),sv_private.deal_since(uuid) from public,anon;
grant execute on function sv_private.deal_access(uuid,boolean),sv_private.deal_since(uuid) to authenticated;

create function sv_private.open_deal(rid uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare r public.sv_requests; did uuid;
begin
 if auth.uid() is null then raise exception 'FORBIDDEN'; end if;
 select * into r from public.sv_requests where id=rid for update;
 if r.id is null or not(coalesce(sv_private.role_in(r.from_company) in ('owner','manager'),false) or coalesce(sv_private.role_in(r.to_company) in ('owner','manager'),false)) then raise exception 'FORBIDDEN'; end if;
 select id into did from public.sv_deals where request_id=rid;
 if did is not null then return did; end if;
 insert into public.sv_deals(request_id,title) values(r.id,r.subject) returning id into did;
 insert into public.sv_deal_parties(deal_id,company_id) values(did,r.from_company),(did,r.to_company);
 return did;
end $$;
create function sv_private.respond_deal_invite(iid uuid, accept boolean) returns uuid language plpgsql security definer set search_path='' as $$
declare inv public.sv_deal_invites;
begin
 if auth.uid() is null then raise exception 'FORBIDDEN'; end if;
 select * into inv from public.sv_deal_invites where id=iid for update;
 if inv.id is null or inv.status<>'pending' or not coalesce(sv_private.role_in(inv.company_id) in ('owner','manager'),false) then raise exception 'FORBIDDEN'; end if;
 if accept then insert into public.sv_deal_parties(deal_id,company_id) values(inv.deal_id,inv.company_id) on conflict do nothing; end if;
 update public.sv_deal_invites set status=case when accept then 'accepted' else 'declined' end where id=iid;
 return inv.deal_id;
end $$;
revoke all on function sv_private.open_deal(uuid),sv_private.respond_deal_invite(uuid,boolean) from public,anon;
grant execute on function sv_private.open_deal(uuid),sv_private.respond_deal_invite(uuid,boolean) to authenticated;
create function public.sv_open_deal(rid uuid) returns uuid language sql security invoker set search_path='' as $$select sv_private.open_deal(rid)$$;
create function public.sv_respond_deal_invite(iid uuid, accept boolean) returns uuid language sql security invoker set search_path='' as $$select sv_private.respond_deal_invite(iid,accept)$$;
revoke all on function public.sv_open_deal(uuid),public.sv_respond_deal_invite(uuid,boolean) from public,anon;
grant execute on function public.sv_open_deal(uuid),public.sv_respond_deal_invite(uuid,boolean) to authenticated;

alter table public.sv_deals enable row level security;
alter table public.sv_deal_parties enable row level security;
alter table public.sv_deal_invites enable row level security;
alter table public.sv_deal_messages enable row level security;
revoke all on public.sv_deals,public.sv_deal_parties,public.sv_deal_invites,public.sv_deal_messages from anon,authenticated;
grant select on public.sv_deals,public.sv_deal_parties,public.sv_deal_invites,public.sv_deal_messages to authenticated;
grant insert(deal_id,company_id) on public.sv_deal_invites to authenticated;
grant insert(id,deal_id,company_id,body) on public.sv_deal_messages to authenticated;
create policy deals_read on public.sv_deals for select to authenticated using(sv_private.deal_access(id));
create policy parties_read on public.sv_deal_parties for select to authenticated using(sv_private.deal_access(deal_id));
create policy deal_inv_read on public.sv_deal_invites for select to authenticated using(sv_private.deal_access(deal_id) or sv_private.role_in(company_id) is not null);
create policy deal_inv_create on public.sv_deal_invites for insert to authenticated with check(invited_by=(select auth.uid()) and sv_private.deal_access(deal_id,true) and not exists(select 1 from public.sv_deal_parties p where p.deal_id=sv_deal_invites.deal_id and p.company_id=sv_deal_invites.company_id));
create policy deal_chat_read on public.sv_deal_messages for select to authenticated using(sv_private.deal_access(deal_id) and created_at>=sv_private.deal_since(deal_id));
create policy deal_chat_create on public.sv_deal_messages for insert to authenticated with check(sender_id=(select auth.uid()) and sv_private.role_in(company_id) in ('owner','manager') and exists(select 1 from public.sv_deal_parties p where p.deal_id=sv_deal_messages.deal_id and p.company_id=sv_deal_messages.company_id));
create policy companies_deal on public.sv_companies for select to authenticated using(exists(select 1 from public.sv_deal_parties p where p.company_id=sv_companies.id and sv_private.deal_access(p.deal_id)));

create table public.sv_documents (
 id uuid primary key default gen_random_uuid(),
 deal_id uuid not null references public.sv_deals(id),
 owner_company uuid not null references public.sv_companies(id),
 reviewer_company uuid not null references public.sv_companies(id),
 audience uuid[] not null,
 title text not null check(length(trim(title)) between 3 and 200),
 category text not null check(category in ('contract','specification','invoice','product','shipping','closing','other')),
 number text not null default '' check(length(number)<=100),
 due_date date,
 status text not null default 'draft' check(status in ('draft','in_review','changes_requested','approved','scan_received')),
 revision integer not null default 0,
 created_by uuid not null default auth.uid() references auth.users(id),
 created_at timestamptz not null default now(),
 check(owner_company<>reviewer_company),
 check(owner_company=any(audience) and reviewer_company=any(audience))
);
create index sv_documents_deal on public.sv_documents(deal_id,created_at desc);
create index sv_documents_owner on public.sv_documents(owner_company);
create index sv_documents_reviewer on public.sv_documents(reviewer_company);
create index sv_documents_author on public.sv_documents(created_by);
create table public.sv_document_versions (
 id uuid primary key default gen_random_uuid(),
 document_id uuid not null references public.sv_documents(id),
 version integer not null,
 kind text not null check(kind in ('original','revision','signed_scan')),
 storage_path text not null unique,
 filename text not null check(length(filename)<=240),
 sha256 text not null check(sha256 ~ '^[0-9a-f]{64}$'),
 author_id uuid not null references auth.users(id),
 company_id uuid not null references public.sv_companies(id),
 created_at timestamptz not null default now(),
 unique(document_id,version)
);
create index sv_doc_versions_author on public.sv_document_versions(author_id);
create index sv_doc_versions_company on public.sv_document_versions(company_id);
create table public.sv_document_events (
 id uuid primary key default gen_random_uuid(),
 document_id uuid not null references public.sv_documents(id),
 actor_id uuid not null references auth.users(id),
 company_id uuid not null references public.sv_companies(id),
 action text not null,
 comment text not null default '' check(length(comment)<=5000),
 revision integer not null,
 created_at timestamptz not null default now()
);
create index sv_doc_events_doc on public.sv_document_events(document_id,created_at);
create index sv_doc_events_actor on public.sv_document_events(actor_id);
create index sv_doc_events_company on public.sv_document_events(company_id);

create function sv_private.document_access(did uuid,editing boolean default false) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.sv_documents d join public.sv_company_members m on m.company_id=any(d.audience) join public.sv_deal_parties p on p.company_id=m.company_id and p.deal_id=d.deal_id where d.id=did and m.user_id=auth.uid() and (not editing or m.role in ('owner','manager')))
$$;
revoke all on function sv_private.document_access(uuid,boolean) from public,anon;
grant execute on function sv_private.document_access(uuid,boolean) to authenticated;
alter table public.sv_documents enable row level security;
alter table public.sv_document_versions enable row level security;
alter table public.sv_document_events enable row level security;
revoke all on public.sv_documents,public.sv_document_versions,public.sv_document_events from anon,authenticated;
grant select on public.sv_documents,public.sv_document_versions,public.sv_document_events to authenticated;
grant insert(id,deal_id,owner_company,reviewer_company,audience,title,category,number,due_date) on public.sv_documents to authenticated;
create policy documents_read on public.sv_documents for select to authenticated using(sv_private.document_access(id));
create policy documents_create on public.sv_documents for insert to authenticated with check(
 created_by=(select auth.uid()) and sv_private.role_in(owner_company) in ('owner','manager')
 and exists(select 1 from public.sv_deal_parties p where p.deal_id=sv_documents.deal_id and p.company_id=sv_documents.owner_company)
 and not exists(select 1 from unnest(audience) a where not exists(select 1 from public.sv_deal_parties p where p.deal_id=sv_documents.deal_id and p.company_id=a))
);
create policy doc_versions_read on public.sv_document_versions for select to authenticated using(sv_private.document_access(document_id));
create policy doc_events_read on public.sv_document_events for select to authenticated using(sv_private.document_access(document_id));

create function sv_private.document_action(did uuid,cid uuid,expected integer,act text,note text default '',file_data jsonb default null) returns integer language plpgsql security definer set search_path='' as $$
declare d public.sv_documents; next_version integer; object_mime text;
begin
 if auth.uid() is null then raise exception 'FORBIDDEN'; end if;
 select * into d from public.sv_documents where id=did for update;
 if d.id is null or not coalesce(sv_private.role_in(cid) in ('owner','manager'),false) or not(cid=any(d.audience)) or not exists(select 1 from public.sv_deal_parties where deal_id=d.deal_id and company_id=cid) then raise exception 'FORBIDDEN'; end if;
 if expected is null or d.revision<>expected then raise exception 'CONFLICT'; end if;
 if length(coalesce(note,''))>5000 then raise exception 'INVALID_COMMENT'; end if;
 if act in ('original','revision','signed_scan') then
  if act<>'signed_scan' and cid<>d.owner_company then raise exception 'ONLY_AUTHOR_CAN_REVISE'; end if;
  if act='signed_scan' and cid not in (d.owner_company,d.reviewer_company) then raise exception 'FORBIDDEN'; end if;
  select metadata->>'mimetype' into object_mime from storage.objects where bucket_id='skyvision-documents' and name=file_data->>'path' and owner_id=auth.uid()::text and split_part(name,'/',1)=did::text;
  if object_mime is null then raise exception 'FILE_NOT_FOUND'; end if;
  if act='signed_scan' and object_mime not in ('application/pdf','image/jpeg','image/png') then raise exception 'SCAN_FORMAT'; end if;
  select coalesce(max(version),0)+1 into next_version from public.sv_document_versions where document_id=did;
  if act='original' and next_version<>1 then raise exception 'ORIGINAL_EXISTS'; end if;
  insert into public.sv_document_versions(document_id,version,kind,storage_path,filename,sha256,author_id,company_id) values(did,next_version,act,file_data->>'path',file_data->>'name',file_data->>'sha256',auth.uid(),cid);
  update public.sv_documents set status=case when act='signed_scan' then 'scan_received' else 'draft' end where id=did;
 elsif act='submit' then
  if cid<>d.owner_company or d.status not in ('draft','changes_requested') or not exists(select 1 from public.sv_document_versions where document_id=did) then raise exception 'INVALID_TRANSITION'; end if;
  update public.sv_documents set status='in_review' where id=did;
 elsif act in ('approve','request_changes') then
  if cid<>d.reviewer_company or d.status<>'in_review' then raise exception 'INVALID_TRANSITION'; end if;
  if act='request_changes' and length(trim(coalesce(note,'')))<3 then raise exception 'COMMENT_REQUIRED'; end if;
  update public.sv_documents set status=case when act='approve' then 'approved' else 'changes_requested' end where id=did;
 elsif act<>'comment' then raise exception 'INVALID_ACTION';
 end if;
 update public.sv_documents set revision=revision+1 where id=did;
 insert into public.sv_document_events(document_id,actor_id,company_id,action,comment,revision) values(did,auth.uid(),cid,act,coalesce(note,''),d.revision+1);
 return d.revision+1;
end $$;
revoke all on function sv_private.document_action(uuid,uuid,integer,text,text,jsonb) from public,anon;
grant execute on function sv_private.document_action(uuid,uuid,integer,text,text,jsonb) to authenticated;
create function public.sv_document_action(did uuid,cid uuid,expected integer,act text,note text default '',file_data jsonb default null) returns integer language sql security invoker set search_path='' as $$select sv_private.document_action(did,cid,expected,act,note,file_data)$$;
revoke all on function public.sv_document_action(uuid,uuid,integer,text,text,jsonb) from public,anon;
grant execute on function public.sv_document_action(uuid,uuid,integer,text,text,jsonb) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('skyvision-documents','skyvision-documents',false,26214400,array['application/pdf','image/jpeg','image/png','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
create policy sv_doc_upload on storage.objects for insert to authenticated with check(bucket_id='skyvision-documents' and exists(select 1 from public.sv_documents d where d.id::text=split_part(name,'/',1) and sv_private.document_access(d.id,true)));
create policy sv_doc_download on storage.objects for select to authenticated using(bucket_id='skyvision-documents' and exists(select 1 from public.sv_document_versions v where v.storage_path=name and sv_private.document_access(v.document_id)));
-- No UPDATE/DELETE policies: accepted files and history are immutable.

alter table public.sv_people add column avatar_path text not null default '' check(length(avatar_path)<=300);
grant insert(avatar_path),update(avatar_path) on public.sv_people to authenticated;
alter table public.sv_people add constraint sv_avatar_owner check(avatar_path='' or split_part(avatar_path,'/',1)=user_id::text);
create table public.sv_company_pages (
 company_id uuid primary key references public.sv_companies(id),
 about text not null default '' check(length(about)<=10000),
 about_zh text not null default '' check(length(about_zh)<=10000),
 capacity text not null default '' check(length(capacity)<=1000),
 website text not null default '' check(website='' or website ~ '^https://[^[:space:]]+$')
);
create table public.sv_company_assets (
 id uuid primary key default gen_random_uuid(),
 company_id uuid not null references public.sv_companies(id),
 title text not null check(length(title) between 1 and 240),
 kind text not null check(kind in ('photo','video','document')),
 storage_path text not null unique,
 created_at timestamptz not null default now(),
 check(split_part(storage_path,'/',1)=company_id::text)
);
create index sv_company_assets_company on public.sv_company_assets(company_id);
alter table public.sv_company_pages enable row level security;
alter table public.sv_company_assets enable row level security;
revoke all on public.sv_company_pages,public.sv_company_assets from anon,authenticated;
grant select on public.sv_company_pages,public.sv_company_assets to anon,authenticated;
grant insert(company_id,about,about_zh,capacity,website),update(about,about_zh,capacity,website) on public.sv_company_pages to authenticated;
grant insert(company_id,title,kind,storage_path),delete on public.sv_company_assets to authenticated;
create policy company_pages_read on public.sv_company_pages for select to anon,authenticated using(exists(select 1 from public.sv_companies c where c.id=company_id));
create policy company_pages_add on public.sv_company_pages for insert to authenticated with check(sv_private.role_in(company_id) in ('owner','manager'));
create policy company_pages_edit on public.sv_company_pages for update to authenticated using(sv_private.role_in(company_id) in ('owner','manager')) with check(sv_private.role_in(company_id) in ('owner','manager'));
create policy company_assets_read on public.sv_company_assets for select to anon,authenticated using(exists(select 1 from public.sv_companies c where c.id=company_id));
create policy company_assets_add on public.sv_company_assets for insert to authenticated with check(sv_private.role_in(company_id) in ('owner','manager'));
create policy company_assets_remove on public.sv_company_assets for delete to authenticated using(sv_private.role_in(company_id) in ('owner','manager'));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
('skyvision-people','skyvision-people',false,5242880,array['image/jpeg','image/png','image/webp']),
('skyvision-company','skyvision-company',false,52428800,array['image/jpeg','image/png','image/webp','video/mp4','video/webm','application/pdf']);
create policy sv_people_photo_upload on storage.objects for insert to authenticated with check(bucket_id='skyvision-people' and split_part(name,'/',1)=(select auth.uid())::text);
create policy sv_people_photo_read on storage.objects for select to authenticated using(bucket_id='skyvision-people' and exists(select 1 from public.sv_people p where p.avatar_path=name));
create policy sv_company_file_upload on storage.objects for insert to authenticated with check(bucket_id='skyvision-company' and exists(select 1 from public.sv_companies c where c.id::text=split_part(name,'/',1) and sv_private.role_in(c.id) in ('owner','manager')));
create policy sv_company_file_read on storage.objects for select to anon,authenticated using(bucket_id='skyvision-company' and exists(select 1 from public.sv_company_assets a where a.storage_path=name));

notify pgrst,'reload schema';
commit;
