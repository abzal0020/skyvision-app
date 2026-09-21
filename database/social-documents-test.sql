begin;

insert into auth.users(id,email,email_confirmed_at) values
('ab210000-0000-4000-8000-000000000001','social-a@example.invalid',now()),
('ab210000-0000-4000-8000-000000000002','social-b@example.invalid',now()),
('ab210000-0000-4000-8000-000000000003','social-c@example.invalid',now());
set local role authenticated;
select set_config('request.jwt.claim.sub','ab210000-0000-4000-8000-000000000001',true);
insert into public.sv_people(full_name) values('Social A');
insert into public.sv_companies(name,activities) values('Social Factory',array['factory']);
select set_config('qa.a',(select id::text from public.sv_companies where name='Social Factory'),true);
insert into public.sv_listings(company_id,kind,title,origin,status) values(current_setting('qa.a')::uuid,'product','SOCIAL TEST FLOUR','Astana','published');
select set_config('qa.listing',(select id::text from public.sv_listings where title='SOCIAL TEST FLOUR'),true);
select set_config('request.jwt.claim.sub','ab210000-0000-4000-8000-000000000002',true);
insert into public.sv_people(full_name) values('Social B');
insert into public.sv_companies(name,activities) values('Social Buyer',array['buyer']);
select set_config('qa.b',(select id::text from public.sv_companies where name='Social Buyer'),true);
insert into public.sv_requests(listing_id,from_company,to_company,subject,body) values(current_setting('qa.listing')::uuid,current_setting('qa.b')::uuid,current_setting('qa.a')::uuid,'Test shipment','100 tonnes');
select set_config('qa.request',(select id::text from public.sv_requests where subject='Test shipment'),true);
select set_config('qa.deal',public.sv_open_deal(current_setting('qa.request')::uuid)::text,true);
insert into public.sv_friendships(recipient_id) values('ab210000-0000-4000-8000-000000000001');
insert into public.sv_direct_messages(recipient_id,body) values('ab210000-0000-4000-8000-000000000001','Private test message');
insert into public.sv_documents(deal_id,owner_company,reviewer_company,audience,title,category) values(current_setting('qa.deal')::uuid,current_setting('qa.b')::uuid,current_setting('qa.a')::uuid,array[current_setting('qa.a')::uuid,current_setting('qa.b')::uuid],'Test contract','contract') returning id;
select set_config('qa.doc',(select id::text from public.sv_documents where title='Test contract'),true);
insert into public.sv_deal_messages(deal_id,company_id,body) values(current_setting('qa.deal')::uuid,current_setting('qa.b')::uuid,'Before logistics joined');
reset role;
insert into storage.objects(bucket_id,name,owner_id,metadata) values('skyvision-documents',current_setting('qa.doc')||'/test.pdf','ab210000-0000-4000-8000-000000000002','{"mimetype":"application/pdf"}');
set local role authenticated;
select set_config('request.jwt.claim.sub','ab210000-0000-4000-8000-000000000002',true);
select public.sv_document_action(current_setting('qa.doc')::uuid,current_setting('qa.b')::uuid,0,'original','',jsonb_build_object('path',current_setting('qa.doc')||'/test.pdf','name','test.pdf','sha256',repeat('a',64)));
select public.sv_document_action(current_setting('qa.doc')::uuid,current_setting('qa.b')::uuid,1,'submit');
do $$begin
 begin perform public.sv_document_action(current_setting('qa.doc')::uuid,current_setting('qa.b')::uuid,2,'approve'); raise exception 'self approval allowed'; exception when raise_exception then if sqlerrm<>'INVALID_TRANSITION' then raise; end if; end;
end$$;
select set_config('request.jwt.claim.sub','ab210000-0000-4000-8000-000000000001',true);
update public.sv_friendships set status='accepted' where recipient_id=auth.uid();
select public.sv_document_action(current_setting('qa.doc')::uuid,current_setting('qa.a')::uuid,2,'request_changes','Correct amount');
do $$begin
 begin perform public.sv_document_action(current_setting('qa.doc')::uuid,current_setting('qa.a')::uuid,2,'comment','stale'); raise exception 'stale action allowed'; exception when raise_exception then if sqlerrm<>'CONFLICT' then raise; end if; end;
end$$;
insert into public.sv_blocks(blocked_id) values('ab210000-0000-4000-8000-000000000002');
select set_config('request.jwt.claim.sub','ab210000-0000-4000-8000-000000000002',true);
do $$begin
 begin insert into public.sv_direct_messages(recipient_id,body) values('ab210000-0000-4000-8000-000000000001','Blocked'); raise exception 'block bypassed'; exception when insufficient_privilege then null; end;
end$$;
select set_config('request.jwt.claim.sub','ab210000-0000-4000-8000-000000000003',true);
insert into public.sv_people(full_name) values('Social C');
insert into public.sv_companies(name,activities) values('Social Logistics',array['forwarder']);
select set_config('qa.c',(select id::text from public.sv_companies where name='Social Logistics'),true);
do $$begin
 if exists(select 1 from public.sv_direct_messages where body='Private test message') then raise exception 'DM leaked'; end if;
 if exists(select 1 from public.sv_documents where title='Test contract') then raise exception 'document leaked'; end if;
 if exists(select 1 from storage.objects where name=current_setting('qa.doc')||'/test.pdf') then raise exception 'file leaked'; end if;
 begin perform public.sv_open_deal(current_setting('qa.request')::uuid); raise exception 'outsider opens deal'; exception when raise_exception then if sqlerrm<>'FORBIDDEN' then raise; end if; end;
end$$;
select set_config('request.jwt.claim.sub','ab210000-0000-4000-8000-000000000001',true);
insert into public.sv_deal_invites(deal_id,company_id) values(current_setting('qa.deal')::uuid,current_setting('qa.c')::uuid);
select set_config('qa.invite',(select id::text from public.sv_deal_invites where deal_id=current_setting('qa.deal')::uuid),true);
-- Separate timestamps so the late-join assertion is meaningful in one transaction.
reset role;
update public.sv_deal_messages set created_at=now()-interval '1 minute' where deal_id=current_setting('qa.deal')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub','ab210000-0000-4000-8000-000000000003',true);
select public.sv_respond_deal_invite(current_setting('qa.invite')::uuid,true);
do $$begin
 if not exists(select 1 from public.sv_deals where id=current_setting('qa.deal')::uuid) then raise exception 'accepted partner denied'; end if;
 if exists(select 1 from public.sv_deal_messages where body='Before logistics joined') then raise exception 'old group chat leaked'; end if;
 if exists(select 1 from public.sv_documents where title='Test contract') then raise exception 'private contract leaked to logistics'; end if;
 if exists(select 1 from storage.objects where name=current_setting('qa.doc')||'/test.pdf') then raise exception 'private file leaked to logistics'; end if;
end$$;
set local role anon;
do $$begin
 begin perform count(*) from public.sv_people; raise exception 'anonymous people allowed'; exception when insufficient_privilege then null; end;
 begin perform count(*) from public.sv_documents; raise exception 'anonymous documents allowed'; exception when insufficient_privilege then null; end;
end$$;
reset role;
select 'PASS: friends, direct-message privacy, blocking, deals, document versions, reviewer-only decisions, conflicts, private storage, logistics joining without historic/private access, anonymous denial' as result;
rollback;
