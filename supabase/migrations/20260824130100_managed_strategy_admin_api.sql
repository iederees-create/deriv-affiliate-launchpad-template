create function public.admin_list_strategy_accounts(search_text text default '',affiliate_filter text default '',access_filter text default '')
returns table(id uuid,member_name text,member_email text,country text,display_name text,deriv_account_type text,environment text,broker_entity text,mt5_server text,masked_mt5_login text,currency text,funding_range text,experience_range text,affiliate_status public.affiliate_verification_status,strategy_access_status public.strategy_access_status,nakala_connected boolean,risk_acknowledged boolean,controls_acknowledged boolean,submitted_at timestamptz,updated_at timestamptz,internal_notes text)
language plpgsql security definer set search_path='' as $$
begin
 if not public.is_strategy_admin() then raise exception 'Administrator role required'; end if;
 return query select a.id,coalesce(u.raw_user_meta_data->>'full_name',a.display_name),u.email,a.country,a.display_name,a.deriv_account_type,a.environment,a.broker_entity,a.mt5_server,'•••• '||right(a.mt5_login_id,4),a.currency,a.funding_range,a.experience_range,a.affiliate_status,a.strategy_access_status,a.nakala_connected,a.risk_acknowledged,a.controls_acknowledged,a.submitted_at,a.updated_at,coalesce(n.notes,'')
 from public.managed_strategy_accounts a join auth.users u on u.id=a.user_id left join public.managed_strategy_admin_notes n on n.account_id=a.id
 where (coalesce(search_text,'')='' or a.display_name ilike '%'||search_text||'%' or u.email ilike '%'||search_text||'%' or a.country ilike '%'||search_text||'%')
 and (coalesce(affiliate_filter,'')='' or a.affiliate_status::text=affiliate_filter)
 and (coalesce(access_filter,'')='' or a.strategy_access_status::text=access_filter)
 order by a.updated_at desc limit 250;
end $$;
revoke all on function public.admin_list_strategy_accounts(text,text,text) from public,anon;
grant execute on function public.admin_list_strategy_accounts(text,text,text) to authenticated;
