-- Expand the business classification only; existing grants and RLS remain intact.
begin;
alter table public.sv_companies drop constraint sv_companies_activities_check;
alter table public.sv_companies add constraint sv_companies_activities_check
  check(cardinality(activities)>0 and activities <@ array['factory','forwarder','buyer','other']);
commit;
