import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import { Seo } from '../components/Seo';
import { affiliateConfig } from '../config/affiliateConfig';

export function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // If they came from the quiz/exit intent with an email, default to Sign Up
    if (searchParams.get('email')) {
      setIsLogin(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        navigate('/members');
      } else {
        const { error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            // We can optionally pass data here, but basic signup is fine
          }
        });
        
        if (signUpError) throw signUpError;
        
        // Also add them to deriv_subscribers so the Admin Dashboard sees them immediately
        await supabase.from('deriv_subscribers').insert([{ email }]).catch(() => {});
        
        // Note: Supabase might require email confirmation depending on settings.
        // Assuming it's turned off for instant access, or they just get logged in.
        setMessage('Account created! Logging you in...');
        setTimeout(() => navigate('/members'), 1000);
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
      
      <section className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          background: 'rgba(20, 20, 20, 0.6)',
          border: '1px solid var(--line)',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '450px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
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
                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--muted)' }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address" 
                  required 
                  disabled={loading}
                  style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '8px', border: '1px solid var(--line)', background: 'rgba(0,0,0,0.3)', color: 'var(--text)', outline: 'none', fontSize: '1rem' }} 
                />
              </div>
              
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--muted)' }} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 6 chars)" 
                  required 
                  disabled={loading}
                  minLength={6}
                  style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '8px', border: '1px solid var(--line)', background: 'rgba(0,0,0,0.3)', color: 'var(--text)', outline: 'none', fontSize: '1rem' }} 
                />
              </div>

              {error && <p style={{ color: '#ff6b6b', fontSize: '0.85rem', margin: 0 }}>{error}</p>}
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
