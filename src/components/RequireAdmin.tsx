import { useEffect,useState } from 'react';
import { Navigate,Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';
export function RequireAdmin(){
 const [state,setState]=useState<'loading'|'allowed'|'denied'>('loading');
 useEffect(()=>{supabase.auth.getUser().then(({data:{user}})=>setState(['admin','strategy_admin'].includes(String(user?.app_metadata?.role))?'allowed':'denied'))},[]);
 if(state==='loading')return <div className="member-loading">Checking administrator access…</div>;
 return state==='allowed'?<Outlet/>:<Navigate to="/members" replace/>;
}
