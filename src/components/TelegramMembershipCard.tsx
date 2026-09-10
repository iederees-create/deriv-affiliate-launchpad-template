import { useEffect, useState } from 'react';
import { createTelegramLinkToken, fetchTelegramStatus, requestTelegramGroup, type TelegramMembership } from '../lib/labApi';
import { useAuth } from './AuthProvider';

export function TelegramMembershipCard() {
  const { session } = useAuth();
  const [state, setState] = useState<TelegramMembership | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => { if (session?.access_token) fetchTelegramStatus(session.access_token).then(setState).catch((e) => setMessage(e.message)); }, [session?.access_token]);
  if (!session) return <article className="vip-panel"><h3>Follow the demo experiment in Telegram</h3><p>Sign in to check affiliate eligibility and connect Telegram.</p><LinkButton /></article>;
  const action = async () => { if (!session.access_token) return; setBusy(true); setMessage(''); try { if (!state?.eligible) { setMessage('Verify your affiliate signup first. A click or referral code is not proof of attribution.'); return; } if (!state.enabled) { setMessage(state.unavailableReason || 'Access is currently unavailable.'); return; } if (!state.linked) { const link = await createTelegramLinkToken(session.access_token); window.open(link.deepLink, '_blank', 'noopener,noreferrer'); setMessage('Open Telegram, press Start, then return here to request group access.'); } else { const invite = await requestTelegramGroup(session.access_token); window.open(invite.inviteLink, '_blank', 'noopener,noreferrer'); setMessage('Your expiring join request link is ready. Telegram will approve it only for the linked account.'); } } catch (e) { setMessage(e instanceof Error ? e.message : 'Telegram request failed.'); } finally { setBusy(false); } };
  const title = !state?.eligible ? 'Verify affiliate signup' : !state.linked ? 'Connect Telegram' : state.status === 'active' ? 'Access active' : 'Request group access';
  return <article className="vip-panel telegram-membership-card"><p className="eyebrow">Private Telegram Demo Updates</p><h3>Follow the demo experiment in Telegram</h3><p>Get practice-run summaries, daily recaps and pause alerts without keeping this page open. Included for verified affiliate members. Demo results are educational and do not predict future returns.</p><p className="fine-print">Current state: <strong>{state?.enabled ? title : 'Access unavailable'}</strong>{state?.unavailableReason ? ' — ' + state.unavailableReason : ''}</p><button className="cta cta-primary" disabled={busy} onClick={action}>{busy ? 'Working…' : title}</button>{message && <p className="fine-print">{message}</p>}<p className="fine-print">No trading password or full-access token is requested. Private admission limits entry; members can still copy content.</p></article>;
}
function LinkButton(){ return <a className="cta cta-primary" href="/auth">Sign in</a>; }
