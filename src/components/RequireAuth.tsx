import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
export function RequireAuth(){
 const {session,loading}=useAuth();const location=useLocation();
 if(loading)return <div className="member-loading" role="status">Restoring your secure session…</div>;
 if(!session)return <Navigate to="/auth" state={{from:location.pathname+location.search}} replace/>;
 return <Outlet/>;
}
