-- Apex Managed Strategy Access: non-secret references only.
-- Apply with Supabase CLI after assigning admin role in auth.users.raw_app_meta_data.
create type public.affiliate_verification_status as enum ('not_submitted','pending','verified','not_verified','more_information_required');
create type public.strategy_access_status as enum ('not_available','awaiting_verification','eligible','active','paused','stopped');

create table public.managed_strategy_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  deriv_account_type text not null check (deriv_account_type = 'MT5 Standard'),
  environment text not null check (environment in ('demo','real')),
  broker_entity text not null check (char_length(broker_entity) between 1 and 100),
  mt5_server text not null check (char_length(mt5_server) between 1 and 100),
  mt5_login_id text not null check (mt5_login_id ~ '^[0-9]{4,20}$'),
  currency text not null check (currency ~ '^[A-Z]{3,5}$'),
  country text not null check (char_length(country) between 1 and 80),
  funding_range text check (funding_range is null or funding_range in ('Under 100 USD','100–499 USD','500–1,999 USD','2,000 USD or more')),
  experience_range text not null check (experience_range in ('beginner','intermediate','experienced')),
  referral_confirmation text not null check (referral_confirmation in ('not_submitted','member_confirmed')),
  affiliate_status public.affiliate_verification_status not null default 'pending',
  strategy_access_status public.strategy_access_status not null default 'awaiting_verification',
  nakala_connected boolean not null default false,
  risk_acknowledged boolean not null check (risk_acknowledged),
  controls_acknowledged boolean not null check (controls_acknowledged),
  consent_version text not null check (char_length(consent_version) between 1 and 80),
  consented_at timestamptz not null default now(),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.managed_strategy_admin_notes (
  account_id uuid primary key references public.managed_strategy_accounts(id) on delete cascade,
  notes text not null default '' check (char_length(notes) <= 4000),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table public.managed_strategy_audit (
  id bigint generated always as identity primary key,
  account_id uuid not null,
  actor_id uuid not null references auth.users(id),
  action text not null,
  from_affiliate_status public.affiliate_verification_status,
  to_affiliate_status public.affiliate_verification_status,
  from_access_status public.strategy_access_status,
  to_access_status public.strategy_access_status,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.managed_strategy_rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  occurred_at timestamptz not null default now()
);
create index managed_strategy_rate_limit_idx on public.managed_strategy_rate_limits(user_id,occurred_at);
create index managed_strategy_search_idx on public.managed_strategy_accounts(country,affiliate_status,strategy_access_status,updated_at desc);

alter table public.managed_strategy_accounts enable row level security;
alter table public.managed_strategy_admin_notes enable row level security;
alter table public.managed_strategy_audit enable row level security;
alter table public.managed_strategy_rate_limits enable row level security;

create function public.is_strategy_admin() returns boolean language sql stable security definer set search_path='' as $$
  select coalesce((auth.jwt()->'app_metadata'->>'role') in ('admin','strategy_admin'),false);
$$;
revoke all on function public.is_strategy_admin() from public;
grant execute on function public.is_strategy_admin() to authenticated;

create policy member_reads_own_strategy_account on public.managed_strategy_accounts for select to authenticated using (user_id=auth.uid());
create policy admin_reads_strategy_accounts on public.managed_strategy_accounts for select to authenticated using (public.is_strategy_admin());
create policy admin_reads_notes on public.managed_strategy_admin_notes for select to authenticated using (public.is_strategy_admin());
create policy admin_reads_audit on public.managed_strategy_audit for select to authenticated using (public.is_strategy_admin());

revoke insert,update,delete on public.managed_strategy_accounts from anon,authenticated;
revoke all on public.managed_strategy_admin_notes,public.managed_strategy_audit,public.managed_strategy_rate_limits from anon,authenticated;
grant select on public.managed_strategy_accounts to authenticated;
grant select on public.managed_strategy_admin_notes,public.managed_strategy_audit to authenticated;

create function public.enforce_strategy_rate_limit() returns void language plpgsql security definer set search_path='' as $$
begin
 delete from public.managed_strategy_rate_limits where occurred_at<now()-interval '24 hours';
 if (select count(*) from public.managed_strategy_rate_limits where user_id=auth.uid() and occurred_at>now()-interval '1 hour')>=5 then raise exception 'Too many submissions. Try again later.'; end if;
 insert into public.managed_strategy_rate_limits(user_id) values(auth.uid());
end $$;

create function public.get_own_strategy_account() returns setof public.managed_strategy_accounts language sql stable security definer set search_path='' as $$
 select * from public.managed_strategy_accounts where user_id=auth.uid();
$$;

create function public.upsert_own_strategy_account(payload jsonb) returns public.managed_strategy_accounts language plpgsql security definer set search_path='' as $$
declare result public.managed_strategy_accounts;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 perform public.enforce_strategy_rate_limit();
 if payload ?| array['password','mt5_password','investor_password','api_token','auth_code','banking_details'] then raise exception 'Credential fields are prohibited'; end if;
 insert into public.managed_strategy_accounts(user_id,display_name,deriv_account_type,environment,broker_entity,mt5_server,mt5_login_id,currency,country,funding_range,experience_range,referral_confirmation,risk_acknowledged,controls_acknowledged,consent_version)
 values(auth.uid(),trim(payload->>'display_name'),payload->>'deriv_account_type',payload->>'environment',trim(payload->>'broker_entity'),trim(payload->>'mt5_server'),trim(payload->>'mt5_login_id'),upper(trim(payload->>'currency')),trim(payload->>'country'),nullif(payload->>'funding_range',''),payload->>'experience_range',payload->>'referral_confirmation',(payload->>'risk_acknowledged')::boolean,(payload->>'controls_acknowledged')::boolean,trim(payload->>'consent_version'))
 on conflict(user_id) do update set display_name=excluded.display_name,deriv_account_type=excluded.deriv_account_type,environment=excluded.environment,broker_entity=excluded.broker_entity,mt5_server=excluded.mt5_server,mt5_login_id=excluded.mt5_login_id,currency=excluded.currency,country=excluded.country,funding_range=excluded.funding_range,experience_range=excluded.experience_range,referral_confirmation=excluded.referral_confirmation,risk_acknowledged=excluded.risk_acknowledged,controls_acknowledged=excluded.controls_acknowledged,consent_version=excluded.consent_version,consented_at=now(),updated_at=now()
 returning * into result;
 return result;
end $$;

create function public.delete_own_strategy_account() returns void language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 perform public.enforce_strategy_rate_limit();
 delete from public.managed_strategy_accounts where user_id=auth.uid();
end $$;

create function public.admin_update_strategy_status(account uuid,new_affiliate public.affiliate_verification_status,new_access public.strategy_access_status,new_notes text,action_detail text default '') returns public.managed_strategy_accounts language plpgsql security definer set search_path='' as $$
declare old public.managed_strategy_accounts; result public.managed_strategy_accounts;
begin
 if not public.is_strategy_admin() then raise exception 'Administrator role required'; end if;
 select * into old from public.managed_strategy_accounts where id=account for update;
 if not found then raise exception 'Account not found'; end if;
 if new_access in ('eligible','active') and new_affiliate<>'verified' then raise exception 'Affiliate verification is required'; end if;
 update public.managed_strategy_accounts set affiliate_status=new_affiliate,strategy_access_status=new_access,updated_at=now() where id=account returning * into result;
 insert into public.managed_strategy_admin_notes(account_id,notes,updated_by) values(account,left(coalesce(new_notes,''),4000),auth.uid()) on conflict(account_id) do update set notes=excluded.notes,updated_by=excluded.updated_by,updated_at=now();
 insert into public.managed_strategy_audit(account_id,actor_id,action,from_affiliate_status,to_affiliate_status,from_access_status,to_access_status,detail) values(account,auth.uid(),'admin_status_change',old.affiliate_status,new_affiliate,old.strategy_access_status,new_access,jsonb_build_object('reason',left(coalesce(action_detail,''),500)));
 return result;
end $$;

revoke all on function public.enforce_strategy_rate_limit(),public.get_own_strategy_account(),public.upsert_own_strategy_account(jsonb),public.delete_own_strategy_account(),public.admin_update_strategy_status(uuid,public.affiliate_verification_status,public.strategy_access_status,text,text) from public,anon;
grant execute on function public.get_own_strategy_account(),public.upsert_own_strategy_account(jsonb),public.delete_own_strategy_account(),public.admin_update_strategy_status(uuid,public.affiliate_verification_status,public.strategy_access_status,text,text) to authenticated;

-- Audit is append-only: no client grants and no delete/update policies.
comment on table public.managed_strategy_accounts is 'Non-secret account references only. Passwords, auth codes, tokens and banking credentials are prohibited.';
