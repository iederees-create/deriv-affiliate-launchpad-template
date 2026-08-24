create function public.confirm_own_nakala_connection(connected boolean) returns public.managed_strategy_accounts
language plpgsql security definer set search_path='' as $$
declare result public.managed_strategy_accounts;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 perform public.enforce_strategy_rate_limit();
 if connected and not exists(select 1 from public.managed_strategy_accounts where user_id=auth.uid() and affiliate_status='verified') then raise exception 'Affiliate verification is required first'; end if;
 update public.managed_strategy_accounts set nakala_connected=connected,updated_at=now() where user_id=auth.uid() returning * into result;
 if not found then raise exception 'Account record not found'; end if;
 insert into public.managed_strategy_audit(account_id,actor_id,action,detail) values(result.id,auth.uid(),'member_nakala_confirmation',jsonb_build_object('connected',connected));
 return result;
end $$;
revoke all on function public.confirm_own_nakala_connection(boolean) from public,anon;
grant execute on function public.confirm_own_nakala_connection(boolean) to authenticated;
