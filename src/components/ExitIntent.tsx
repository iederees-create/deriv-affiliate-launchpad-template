import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { affiliateConfig } from '../config/affiliateConfig';

export function ExitIntent() {
  const [show, setShow] = useState(false);
  const [hasFired, setHasFired] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (event: Event) => {
      const mouseEvent = event as MouseEvent;
      if (mouseEvent.clientY <= 0 && !hasFired) {
        setShow(true);
        setHasFired(true);
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasFired]);

  if (!show) return null;

  return (
    <div className="exit-intent" role="dialog" aria-modal="true" aria-labelledby="exit-title">
      <div className="exit-intent-card">
        <button type="button" aria-label="Close" onClick={() => setShow(false)}><X size={22} /></button>
        <p className="eyebrow">Before you go</p>
        <h2 id="exit-title">The practice run is still on this page.</h2>
        <p>It uses Deriv demo funds, not cash. If you want your own practice account, use this partner link. Referral code {affiliateConfig.referralCode}.</p>
        <a className="cta cta-primary" href={affiliateConfig.demoAccountLink} target="_blank" rel="noreferrer">Open a free Deriv demo</a>
        <button type="button" className="text-link" onClick={() => setShow(false)}>Stay and watch</button>
      </div>
    </div>
  );
}
