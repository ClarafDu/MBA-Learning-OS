-- V1.2.1: apply to an explicitly approved Supabase project, once.
-- Raw materials are never served by GitHub Pages.
begin;
create table public.mba_os_members (
 user_id uuid primary key references auth.users(id) on delete cascade,
 joined_at timestamptz not null default now()
);
alter table public.mba_os_members enable row level security;
revoke all on public.mba_os_members from anon, authenticated;
grant select on public.mba_os_members to authenticated;
create policy "mba_members_read_self" on public.mba_os_members for select to authenticated
 using (user_id=(select auth.uid()));

create table public.mba_os_records (
 id uuid primary key default gen_random_uuid(),
 owner uuid not null references auth.users(id) on delete cascade,
 key text not null check (length(key) between 1 and 200),
 kind text not null check (kind in ('event','note','capture','review')),
 visibility text not null default 'private' check (visibility in ('private','class')),
 data jsonb not null check (jsonb_typeof(data)='object' and octet_length(data::text)<=500000),
 revision integer not null default 1 check (revision>0),
 updated_at timestamptz not null default now(),
 unique(owner,key),
 check (visibility='private' or not (kind='capture' and data->>'category' in ('路上随想 / Thought','错题记录 / Mistake','个人总结 / Summary'))),
 check (kind<>'review' or visibility='private')
);
create index mba_records_owner_updated on public.mba_os_records(owner,updated_at desc);
create index mba_records_class_updated on public.mba_os_records(updated_at desc) where visibility='class';
create index mba_records_file on public.mba_os_records((data->>'file')) where kind='capture';
alter table public.mba_os_records enable row level security;
revoke all on public.mba_os_records from anon, authenticated;
grant select,insert,update,delete on public.mba_os_records to authenticated;
create policy "mba_records_read" on public.mba_os_records for select to authenticated
 using(owner=(select auth.uid()) or (visibility='class' and exists
   (select 1 from public.mba_os_members m where m.user_id=(select auth.uid()))));
create policy "mba_records_insert" on public.mba_os_records for insert to authenticated
 with check(owner=(select auth.uid()) and (visibility='private' or exists
   (select 1 from public.mba_os_members m where m.user_id=(select auth.uid())))
   and (coalesce(data->>'file','')='' or split_part(data->>'file','/',1)=(select auth.uid())::text));
create policy "mba_records_update" on public.mba_os_records for update to authenticated
 using(owner=(select auth.uid()))
 with check(owner=(select auth.uid()) and (visibility='private' or exists
   (select 1 from public.mba_os_members m where m.user_id=(select auth.uid())))
   and (coalesce(data->>'file','')='' or split_part(data->>'file','/',1)=(select auth.uid())::text));
create policy "mba_records_delete" on public.mba_os_records for delete to authenticated
 using(owner=(select auth.uid()));
create function public.mba_record_revision() returns trigger
 language plpgsql security invoker set search_path='' as $$
 begin
   if new.owner<>old.owner or new.key<>old.key or new.id<>old.id then
     raise exception 'Record identity cannot change';
   end if;
   new.revision=old.revision+1; new.updated_at=now(); return new;
 end; $$;
create trigger mba_record_revision before update on public.mba_os_records
 for each row execute function public.mba_record_revision();
revoke all on function public.mba_record_revision() from public,anon,authenticated;
-- Small-class live refresh. Row-level security still decides which records each subscriber may read.
alter publication supabase_realtime add table public.mba_os_records;

insert into storage.buckets(id,name,public,file_size_limit)
 values('mba-materials','mba-materials',false,20971520);
create policy "mba_files_upload_own" on storage.objects for insert to authenticated
 with check(bucket_id='mba-materials' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "mba_files_read" on storage.objects for select to authenticated
 using(bucket_id='mba-materials' and (
   (storage.foldername(name))[1]=(select auth.uid())::text or
   (exists(select 1 from public.mba_os_members m where m.user_id=(select auth.uid()))
    and exists(select 1 from public.mba_os_records r where r.visibility='class'
      and r.kind='capture' and r.data->>'file'=name))));
create policy "mba_files_delete_own" on storage.objects for delete to authenticated
 using(bucket_id='mba-materials' and (storage.foldername(name))[1]=(select auth.uid())::text);
-- No object update policy: immutable names avoid accidentally replacing a shared file.

create table public.mba_ai_quota (
 user_id uuid not null references auth.users(id) on delete cascade,
 day date not null default current_date,
 used integer not null default 0 check(used between 0 and 50),
 primary key(user_id,day)
);
alter table public.mba_ai_quota enable row level security;
revoke all on public.mba_ai_quota from anon,authenticated;
-- Service-only counter. The edge function supplies an auth-verified user ID.
create function public.mba_claim_ai_request(request_user uuid) returns boolean
 language plpgsql security definer set search_path='' as $$
 declare amount integer;
 begin
   if not exists(select 1 from public.mba_os_members where user_id=request_user) then return false; end if;
   insert into public.mba_ai_quota(user_id,day,used) values(request_user,current_date,1)
   on conflict(user_id,day) do update set used=public.mba_ai_quota.used+1
   where public.mba_ai_quota.used<50 returning used into amount;
   return amount is not null;
 end; $$;
revoke all on function public.mba_claim_ai_request(uuid) from public,anon,authenticated;
grant execute on function public.mba_claim_ai_request(uuid) to service_role;
commit;
