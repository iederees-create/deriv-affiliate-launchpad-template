import { useEffect, useState } from 'react';
import { X, Mail, DownloadCloud } from 'lucide-react';

export function ExitIntent() {
  const [show, setShow] = useState(false);
  const [hasFired, setHasFired] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // If mouse leaves top of window (indicates trying to close tab or change URL)
      if (e.clientY <= 0 && !hasFired) {
        setShow(true);
        setHasFired(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    
    // Cleanup
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hasFired]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    // Redirect to VIP sign up page instead of just inserting to DB
    window.location.href = `/deriv-affiliate-launchpad-template/auth?email=${encodeURIComponent(email)}`;
  };

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(5px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#111',
        border: '1px solid var(--line)',
        borderRadius: '16px',
        maxWidth: '450px',
        width: '100%',
        padding: '32px',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <button 
          onClick={() => setShow(false)}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: 'var(--primary)' }}>
            <DownloadCloud size={48} />
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', lineHeight: 1.2 }}>Wait! Don't leave empty-handed.</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '0.95rem' }}>
            Download our <strong>Ultimate Crash & Boom Cheat Sheet</strong> (PDF) for free before you go. Learn the exact entry and exit triggers professionals use on Deriv.
          </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--muted)' }} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Where should we send it?" 
                  required 
                  disabled={loading}
                  style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '8px', border: '1px solid var(--line)', background: 'rgba(0,0,0,0.3)', color: 'var(--text)', outline: 'none', fontSize: '1rem' }} 
                />
              </div>
              <button 
                type="submit" 
                className="cta cta-primary" 
                disabled={loading}
                style={{ border: 'none', cursor: loading ? 'wait' : 'pointer', width: '100%', opacity: loading ? 0.7 : 1, padding: '14px', fontSize: '1rem' }}
              >
                {loading ? "Redirecting..." : "Yes, Send Me The Cheat Sheet"}
              </button>
            </form>
          
          <button 
            onClick={() => setShow(false)}
            style={{ marginTop: '16px', background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            No thanks, I don't want free strategies
          </button>
        </div>
      </div>
    </div>
  );
}
