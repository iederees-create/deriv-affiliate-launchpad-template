create function public.admin_get_strategy_audit(account uuid)
returns table(id bigint,action text,from_affiliate_status public.affiliate_verification_status,to_affiliate_status public.affiliate_verification_status,from_access_status public.strategy_access_status,to_access_status public.strategy_access_status,detail jsonb,created_at timestamptz)
language plpgsql security definer set search_path='' as $$
begin
 if not public.is_strategy_admin() then raise exception 'Administrator role required'; end if;
 return query select a.id,a.action,a.from_affiliate_status,a.to_affiliate_status,a.from_access_status,a.to_access_status,a.detail,a.created_at from public.managed_strategy_audit a where a.account_id=account order by a.created_at desc;
end $$;
revoke all on function public.admin_get_strategy_audit(uuid) from public,anon;
grant execute on function public.admin_get_strategy_audit(uuid) to authenticated;
