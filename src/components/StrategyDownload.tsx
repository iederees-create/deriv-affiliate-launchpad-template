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
      const save = (name: string, text: string, type: string) => {
        const blob = new Blob([text], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = name;
        link.click();
        URL.revokeObjectURL(url);
      };
      save(pack.eaFilename || 'ApexV75SpikeFade.mq5', pack.mq5, 'text/plain');
      save(pack.installFilename || 'ApexV75SpikeFade-INSTALL.txt', pack.markdown, 'text/plain');
      setMessage('Downloaded the MT5 Expert Advisor and the install steps. Use a Deriv MT5 demo first.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Download is locked until your Deriv account is on this partner downline.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="lab-download">
      <h4>Want the MT5 Expert Advisor?</h4>
      <p>
        Downline members can download the same spike-fade rule as an .mq5 file plus install steps.
        Demo first. It can lose money. Enter the ID from Deriv account settings.
      </p>
      {canDownload ? (
        <button className="cta cta-primary" type="button" disabled={busy} onClick={download}>
          {busy ? 'Preparing…' : 'Download MT5 EA + install steps'}
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
