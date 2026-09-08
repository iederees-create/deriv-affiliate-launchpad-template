import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { affiliateConfig } from '../config/affiliateConfig';
import { claimAffiliate, downloadStrategyPack, fetchAffiliateStatus, type AffiliateClaim } from '../lib/labApi';

export function StrategyDownload() {
  const { session } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [claim, setClaim] = useState<AffiliateClaim | null>(null);
  const [canDownload, setCanDownload] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!session?.access_token) return;
    fetchAffiliateStatus(session.access_token)
      .then((result) => {
        setClaim(result.claim);
        setCanDownload(result.canDownload);
      })
      .catch(() => {});
  }, [session?.access_token]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!session?.access_token) {
      setMessage('Sign in first, then we can check your Deriv ID.');
      return;
    }
    setBusy(true);
    try {
      const result = await claimAffiliate(session.access_token, loginId);
      setClaim(result.claim);
      setCanDownload(result.canDownload);
      setMessage(result.claim?.note || (result.canDownload ? 'Unlocked.' : ''));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not check that Deriv ID.');
    } finally {
      setBusy(false);
    }
  };

  const download = async () => {
    if (!session?.access_token) return;
    setBusy(true);
    try {
      const pack = await downloadStrategyPack(session.access_token);
      const blob = new Blob([pack.markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'v75-1s-impulse-follow.md';
      link.click();
      URL.revokeObjectURL(url);
      setMessage('Downloaded. Follow it on a Deriv demo. It does not place trades for you.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Download is locked until your Deriv account is on this partner downline.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="lab-download">
      <h4>Want the written rules?</h4>
      <p>
        The pack is only for people who opened a Deriv account through this partner link.
        Enter the ID from Deriv account settings. If it is not on the downline yet, open the account through the link first.
      </p>
      {canDownload ? (
        <button className="cta cta-primary" type="button" disabled={busy} onClick={download}>
          {busy ? 'Preparing…' : 'Download the practice rules'}
        </button>
      ) : (
        <form onSubmit={submit}>
          <label>
            <span>Your Deriv ID</span>
            <input value={loginId} onChange={(event) => setLoginId(event.target.value)} placeholder="From Deriv account settings" maxLength={32} required />
          </label>
          <div className="strategy-actions">
            <button className="cta" disabled={busy || !session}>{busy ? 'Checking…' : 'Check my downline status'}</button>
            <a className="cta cta-secondary" href={affiliateConfig.primaryAffiliateLink} target="_blank" rel="noreferrer">Open Deriv with this partner link</a>
          </div>
        </form>
      )}
      {claim && !canDownload ? <p className="fine-print">Status: {claim.status}. {claim.note}</p> : null}
      {message ? <p role="status" className="fine-print">{message}</p> : null}
    </div>
  );
}
