begin;

-- Isolated fixtures and assertions, always rolled back.
insert into auth.users(id,email,email_confirmed_at) values
 ('11111111-1111-4111-8111-111111111111','portal-a@example.invalid',now()),
 ('22222222-2222-4222-8222-222222222222','portal-b@example.invalid',now()),
 ('33333333-3333-4333-8333-333333333333','portal-c@example.invalid',now()),
 ('44444444-4444-4444-8444-444444444444','portal-view@example.invalid',now());
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
insert into public.sv_companies(name,activities) values('TEST A',array['factory']);
insert into public.sv_listings(company_id,kind,title,origin,status) select id,'product','Test flour','Astana','published' from public.sv_companies where name='TEST A';
insert into public.sv_listings(company_id,kind,title,origin) select id,'product','Private draft','Astana' from public.sv_companies where name='TEST A';
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
insert into public.sv_companies(name,activities) values('TEST B',array['buyer']);
insert into public.sv_requests(listing_id,from_company,to_company,subject,body)
 select l.id,c.id,l.company_id,'Order flour','Need 100 tonnes' from public.sv_listings l,public.sv_companies c where l.title='Test flour' and c.name='TEST B';
insert into public.sv_messages(request_id,company_id,body) select id,from_company,'Hello A' from public.sv_requests;
do $$begin
 if (select count(*) from public.sv_listings where title='Private draft')<>0 then raise exception 'draft leaked'; end if;
 if (select count(*) from public.sv_messages)<>1 then raise exception 'participant missing message'; end if;
end$$;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
insert into public.sv_companies(name,activities) values('TEST C',array['forwarder']);
do $$begin
 if (select count(*) from public.sv_requests)<>0 then raise exception 'request leaked'; end if;
 if (select count(*) from public.sv_messages)<>0 then raise exception 'message leaked'; end if;
 if (select count(*) from public.sv_company_members where user_id<>'33333333-3333-4333-8333-333333333333')<>0 then raise exception 'members leaked'; end if;
 begin
  insert into public.sv_company_members(company_id,user_id,role) select id,auth.uid(),'owner' from public.sv_companies where name='TEST A';
  raise exception 'membership escalation allowed';
 exception when insufficient_privilege then null; end;
end$$;
reset role;
insert into public.sv_company_members(company_id,user_id,role) select id,'44444444-4444-4444-8444-444444444444','viewer' from public.sv_companies where name='TEST A';
set local role authenticated;
select set_config('request.jwt.claim.sub','44444444-4444-4444-8444-444444444444',true);
do $$begin
 if (select count(*) from public.sv_messages)<>1 then raise exception 'viewer cannot read'; end if;
 begin
  insert into public.sv_messages(request_id,company_id,body) select r.id,r.to_company,'Forbidden' from public.sv_requests r;
  raise exception 'viewer wrote message';
 exception when insufficient_privilege then null; end;
end$$;
set local role anon;
do $$begin
 if (select count(*) from public.sv_listings)<>1 then raise exception 'anonymous catalogue wrong'; end if;
 begin perform count(*) from public.sv_messages; raise exception 'anonymous messages allowed'; exception when insufficient_privilege then null; end;
end$$;
reset role;
select 'PASS: public listings, private drafts, participants, outsiders, viewers, membership escalation, anonymous denial' as result;

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
insert into public.sv_company_invites(company_id,email,role) select id,'portal-b@example.invalid','manager' from public.sv_companies where name='TEST A';
select set_config('qa.invite',(select token from public.sv_company_invites limit 1),true);
select set_config('qa.company_a',(select id::text from public.sv_companies where name='TEST A'),true);
select set_config('qa.request',(select id::text from public.sv_requests limit 1),true);
select set_config('qa.listing',(select id::text from public.sv_listings where title='Test flour'),true);
do $$declare n integer; begin
 update public.sv_listings set title='Test flour revised' where id=current_setting('qa.listing')::uuid and version=1;
 get diagnostics n=row_count; if n<>1 then raise exception 'version update failed'; end if;
 update public.sv_listings set title='Stale overwrite' where id=current_setting('qa.listing')::uuid and version=1;
 get diagnostics n=row_count; if n<>0 then raise exception 'stale overwrite allowed'; end if;
end$$;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
do $$begin
 begin perform public.sv_accept_invite(current_setting('qa.invite')); raise exception 'wrong email accepted'; exception when raise_exception then if sqlerrm<>'INVITE_INVALID' then raise; end if; end;
 begin
 insert into public.sv_messages(request_id,company_id,body) values(current_setting('qa.request')::uuid,current_setting('qa.company_a')::uuid,'Forged message');
 raise exception 'forged company accepted'; exception when insufficient_privilege then null; end;
 begin
 insert into public.sv_listings(company_id,kind,title,origin) values(current_setting('qa.company_a')::uuid,'product','Forged listing','Astana');
 raise exception 'forged listing accepted'; exception when insufficient_privilege then null; end;
end$$;
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
select public.sv_accept_invite(current_setting('qa.invite'));
do $$begin
 if (select role from public.sv_company_members where company_id=current_setting('qa.company_a')::uuid and user_id=auth.uid())<>'manager' then raise exception 'invitation role wrong'; end if;
 begin perform public.sv_accept_invite(current_setting('qa.invite')); raise exception 'replay accepted'; exception when raise_exception then if sqlerrm<>'INVITE_INVALID' then raise; end if; end;
end$$;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
delete from public.sv_company_members where company_id=current_setting('qa.company_a')::uuid and user_id='22222222-2222-4222-8222-222222222222';
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
do $$begin if (select count(*) from public.sv_listings where title='Private draft')<>0 then raise exception 'revocation failed'; end if; end$$;
reset role;
select 'PASS: tenant isolation, spoofing denied, role restrictions, email-bound invites, replay denied, revocation, optimistic version conflict' as result;
rollback;
