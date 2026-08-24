import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
type AuthState={session:Session|null;user:User|null;loading:boolean;signOut:()=>Promise<void>};
const AuthContext=createContext<AuthState|undefined>(undefined);
export function AuthProvider({children}:{children:ReactNode}){
 const [session,setSession]=useState<Session|null>(null),[loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;supabase.auth.getSession().then(({data})=>{if(active){setSession(data.session);setLoading(false)}});const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>{if(active){setSession(next);setLoading(false)}});return()=>{active=false;subscription.unsubscribe()}},[]);
 const value=useMemo<AuthState>(()=>({session,user:session?.user??null,loading,signOut:async()=>{await supabase.auth.signOut()}}),[session,loading]);
 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error('useAuth must be used inside AuthProvider');return value}
