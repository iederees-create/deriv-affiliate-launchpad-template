import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { DownloadCloud, Lock, CheckCircle, ExternalLink, Activity, Play } from 'lucide-react';
import { Seo } from '../components/Seo';
import { affiliateConfig } from '../config/affiliateConfig';

export function MembersDashboard() {
  const [user, setUser] = useState<any>(null);
  const [derivId, setDerivId] = useState('');
  const [hasDerivId, setHasDerivId] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Fetch their profile/member record
        const { data } = await supabase
          .from('profiles')
          .select('deriv_id')
          .eq('id', user.id)
          .single();
          
        if (data?.deriv_id) {
          setDerivId(data.deriv_id);
          setHasDerivId(true);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleSaveDerivId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!derivId.trim()) return;
    
    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user?.id,
        deriv_id: derivId,
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      setHasDerivId(true);
      setMessage('Account linked successfully! Premium downloads unlocked.');
    } catch (err: any) {
      setMessage(err.message || 'Failed to save account ID.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>;

  return (
    <>
      <Seo title={`VIP Dashboard | ${affiliateConfig.brandName}`} description="Your VIP downloads and indicators." />
      
      <section className="section" style={{ minHeight: '80vh', paddingTop: '100px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <header style={{ marginBottom: '40px', borderBottom: '1px solid var(--line)', paddingBottom: '24px' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>VIP Dashboard</h1>
            <p style={{ color: 'var(--muted)' }}>Welcome back, {user?.email}</p>
          </header>

          <div style={{ 
            background: hasDerivId ? 'rgba(255, 68, 79, 0.05)' : 'var(--surface-2)', 
            border: `1px solid ${hasDerivId ? 'var(--primary)' : 'var(--line)'}`, 
            borderRadius: '16px', 
            padding: '32px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {hasDerivId ? <CheckCircle className="text-[var(--primary)]" /> : <Lock style={{ color: 'var(--primary)' }} />} 
              VIP Premium Access
            </h2>
            
            {!hasDerivId ? (
              <>
                <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '0.95rem' }}>
                  To unlock your VIP downloads, proprietary MT5 Indicators, and Automated Trading Bots, you must link your Deriv account to this dashboard.
                </p>
                <div style={{ marginBottom: '24px', fontSize: '0.9rem' }}>
                  <strong>Step 1:</strong> Create a new Deriv account using our official partner link.<br/>
                  <strong>Step 2:</strong> Paste your Deriv Email Address below.
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <a href={affiliateConfig.primaryAffiliateLink} target="_blank" rel="noreferrer" className="cta cta-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    Create Deriv Account <ExternalLink size={16} />
                  </a>
                </div>

                <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--surface)', borderRadius: '8px', border: '1px dashed var(--line)' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Already have a Deriv account?</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>
                    If you signed up for Deriv without our link, you can easily link your account! 
                    Open a live chat with Deriv support and ask: <strong>"Please move my account under IB Apex Trade Network"</strong>.
                    Once they confirm, enter your Deriv Email Address below.
                  </p>
                </div>

                <form onSubmit={handleSaveDerivId} style={{ display: 'flex', gap: '12px', maxWidth: '400px' }}>
                  <input 
                    type="email"
                    value={derivId}
                    onChange={(e) => setDerivId(e.target.value)}
                    placeholder="Enter your Deriv Email Address..." 
                    required
                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--text)', outline: 'none' }}
                  />
                  <button type="submit" className="cta" disabled={saving} style={{ padding: '0 24px' }}>
                    {saving ? 'Linking...' : 'Unlock'}
                  </button>
                </form>
                {message && <p style={{ color: 'var(--primary)', fontSize: '0.85rem', marginTop: '12px' }}>{message}</p>}
              </>
            ) : (
              <>
                <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>Your Deriv account <strong>{derivId}</strong> is successfully linked. Enjoy your premium resources!</p>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  
                  {/* Basic Resources */}
                  <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)', flex: '1 1 300px' }}>
                    <h4 style={{ marginBottom: '8px' }}>Crash & Boom Ultimate Cheat Sheet (PDF)</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '16px' }}>Master the spikes with our exact entry criteria.</p>
                    <button className="cta" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <DownloadCloud size={16} /> Download PDF
                    </button>
                  </div>
                  <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)', flex: '1 1 300px' }}>
                    <h4 style={{ marginBottom: '8px' }}>Risk Management Calculator (Excel)</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '16px' }}>Never blow an account again. Calculate exact lot sizes.</p>
                    <button className="cta" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <DownloadCloud size={16} /> Download Tool
                    </button>
                  </div>

                  {/* Premium Resources */}
                  <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)', flex: '1 1 300px' }}>
                    <h4 style={{ marginBottom: '8px' }}>Apex Spike Detector (MT5)</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '16px' }}>Custom indicator that alerts you before massive spikes.</p>
                    <button className="cta cta-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <Activity size={16} /> Download .ex5
                    </button>
                  </div>
                  <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--line)', flex: '1 1 300px' }}>
                    <h4 style={{ marginBottom: '8px' }}>V75 Swing Bot</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '16px' }}>Automated EA for Volatility 75 index trading.</p>
                    <button className="cta cta-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <Play size={16} /> Download Bot
                    </button>
                  </div>

                </div>
              </>
            )}
          </div>

        </div>
      </section>
    </>
  );
}
