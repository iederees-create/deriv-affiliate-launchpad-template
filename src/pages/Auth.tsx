import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import { Seo } from '../components/Seo';
import { useAuth } from '../components/AuthProvider';
import { affiliateConfig } from '../config/affiliateConfig';

export function Auth() {
  const [searchParams] = useSearchParams();
  const {session,loading:sessionLoading}=useAuth();
  const navigate = useNavigate();
  const location=useLocation();
  const destination=typeof location.state?.from==='string'?location.state.from:'/members';
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [remember,setRemember]=useState(true);

  useEffect(() => {
    if(session){navigate(destination,{replace:true});return}
    // If they came from the quiz/exit intent with an email, default to Sign Up
    if (searchParams.get('email')) {
      setIsLogin(false);
    }
  }, [searchParams,session]);

  if(sessionLoading)return <div className="member-loading" role="status">Checking your session…</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        navigate(destination,{replace:true});
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // We can optionally pass data here, but basic signup is fine
          }
        });

        if (signUpError) throw signUpError;

        // Note: Supabase might require email confirmation depending on settings.
        // Assuming it's turned off for instant access, or they just get logged in.
        setMessage('Account created! Logging you in...');
        setTimeout(() => navigate(destination,{replace:true}), 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo title={`${isLogin ? 'Log In' : 'Sign Up'} | ${affiliateConfig.brandName} VIP`} description="Access the VIP Members Area for premium trading indicators and guides." />

      <section className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: -1
        }} />
        <div style={{
          borderRadius: '16px',
          padding: '40px',
          background: 'var(--surface)',
          border: '1px solid var(--line)',
          maxWidth: '450px',
          width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          backdropFilter: 'blur(10px)'
        }}>

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', color: 'var(--primary)' }}>
            <Shield size={48} />
          </div>

          <h1 style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '8px' }}>
            {isLogin ? 'Welcome Back' : 'Create VIP Account'}
          </h1>
          <p style={{ color: 'var(--muted)', textAlign: 'center', marginBottom: '32px', fontSize: '0.95rem' }}>
            {isLogin ? 'Log in to access your premium downloads.' : 'Create a free account to unlock your trading guides and indicators.'}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  disabled={loading}
                  style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', outline: 'none', fontSize: '1rem' }}
                />
                <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} size={20} />
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  disabled={loading}
                  style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--surface-2)', color: 'var(--text)', outline: 'none', fontSize: '1rem' }}
                />
                <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} size={20} />
              </div>
              <label style={{display:'flex',gap:'8px',alignItems:'center',fontSize:'.9rem'}}><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/> Remember me on this device</label>

              {error && <p style={{ color: 'var(--primary)', fontSize: '0.85rem', margin: 0 }}>{error}</p>}
              {message && <p style={{ color: 'var(--primary)', fontSize: '0.85rem', margin: 0 }}>{message}</p>}

              <button
                type="submit"
                className="cta cta-primary"
                disabled={loading}
                style={{ border: 'none', cursor: loading ? 'wait' : 'pointer', width: '100%', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}
              >
                {loading ? "Processing..." : (isLogin ? "Log In" : "Create Account")} <ArrowRight size={18}/>
              </button>
           </form>

           <div style={{ marginTop: '24px', textAlign: 'center' }}>
             <button
               onClick={() => { setIsLogin(!isLogin); setError(''); }}
               style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
             >
               {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
             </button>
           </div>
        </div>
      </section>
    </>
  );
}
