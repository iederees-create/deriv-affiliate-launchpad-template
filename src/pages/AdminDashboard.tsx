import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle, FlaskConical, Search, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import { maskLogin, statusLabel } from '../lib/managedStrategy';
import { fetchOperatorBoard, startOperatorRun, stopOperatorRun, fetchAffiliateClaims, verifyAffiliateClaim, type AffiliateClaim, type LabBoard, type LabStrategy } from '../lib/labApi';
import { LiveResults } from '../components/LiveResults';


type Row = {
  user_id: string;
  member_email: string;
  broker_entity: string;
  mt5_server: string;
  masked_mt5_login: string;
  affiliate_status: string;
  strategy_status: string;
  risk_acknowledged: boolean;
  submitted_at: string;
  updated_at: string;
};

export function AdminDashboard() {
  const { user, session, signOut } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [board, setBoard] = useState<LabBoard | null>(null);
  const [labError, setLabError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [openScript, setOpenScript] = useState<number | null>(null);
  const [affiliates, setAffiliates] = useState<AffiliateClaim[]>([]);

  const loadReviews = async () => {
    const { data, error } = await supabase.rpc('admin_list_strategy_applications', { query: search });
    if (error) setMessage(error.message);
    else setRows(data || []);
  };

  const loadLab = async () => {
    if (!session?.access_token) return;
    try {
      setBoard(await fetchOperatorBoard(session.access_token));
      setLabError('');
    } catch (err) {
      setLabError(err instanceof Error ? err.message : 'Could not load the strategy lab.');
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const loadAffiliates = async () => {
    if (!session?.access_token) return;
    try {
      const result = await fetchAffiliateClaims(session.access_token);
      setAffiliates(result.affiliates || []);
    } catch (_err) {
      setAffiliates([]);
    }
  };

  useEffect(() => {
    loadLab();
    loadAffiliates();
    const timer = setInterval(loadLab, 5000);
    return () => clearInterval(timer);
  }, [session?.access_token]);

  const update = async (row: Row, affiliate: string, strategy: string) => {
    const reason = prompt('Reason for this status change (recorded in the immutable audit log):');
    if (reason === null) return;
    const { error } = await supabase.rpc('admin_set_strategy_status', {
      member: row.user_id,
      affiliate,
      strategy,
      detail: reason,
    });
    if (error) setMessage(error.message);
    else {
      setMessage('Status updated and audited.');
      loadReviews();
    }
  };

  const searchReviews = (event: FormEvent) => {
    event.preventDefault();
    loadReviews();
  };

  const startRun = async (strategyId: number) => {
    if (!session?.access_token) return;
    setBusyId(strategyId);
    try {
      setBoard(await startOperatorRun(session.access_token, strategyId));
      setLabError('');
    } catch (err) {
      setLabError(err instanceof Error ? err.message : 'Could not start the demo run.');
    } finally {
      setBusyId(null);
    }
  };

  const stopRun = async () => {
    if (!session?.access_token) return;
    setBusyId(-1);
    try {
      setBoard(await stopOperatorRun(session.access_token, `Stopped by ${user?.email}`));
      setLabError('');
    } catch (err) {
      setLabError(err instanceof Error ? err.message : 'Could not stop the demo run.');
    } finally {
      setBusyId(null);
    }
  };

  const leave = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  const strategies: LabStrategy[] = board?.strategies || board?.queue || [];
  const live = Boolean(board?.live && board.strategy);

  return (
    <>
      <Seo title="Administrator Oversight | Apex Trade Network" description="Protected administrator console for member reviews and the shared demo lab." />
      <section className="section admin-strategy">
        <header className="admin-console-head">
          <div>
            <p className="eyebrow">Protected administrator area</p>
            <h1>Complete oversight</h1>
            <p><ShieldAlert size={16} /> Signed in as {user?.email}. Lab control, member submissions, and managed-strategy reviews all live here.</p>
          </div>
          <div className="member-menu">
            <Link className="cta cta-secondary" to="/members">VIP dashboard</Link>
            <button className="cta cta-secondary" onClick={leave}>Sign out</button>
          </div>
        </header>

        <section className="admin-lab-panel" aria-labelledby="lab-oversight-heading">
          <div className="strategy-hero">
            <div>
              <p className="eyebrow">Shared demo lab</p>
              <h2 id="lab-oversight-heading">Live strategy testing</h2>
              <p>One demo run at a time. Uploaded scripts stay here for review and are never executed. Real-money mode is blocked.</p>
            </div>
            <FlaskConical />
          </div>

          <LiveResults board={board} />
          {live ? (
            <div className="strategy-actions" style={{ margin: '12px 0 22px' }}>
              <button className="danger-button" onClick={stopRun} disabled={busyId !== null}>Stop live demo</button>
            </div>
          ) : null}

          <div className="admin-records">
            {strategies.map((item) => (
              <article key={item.id}>
                <div className="admin-record-head">
                  <div>
                    <h2>{item.title}</h2>
                    <p>{item.memberName}{item.memberEmail ? ` · ${item.memberEmail}` : ''} · {item.kind} · {item.symbol}</p>
                  </div>
                  <span className="status-pill">{item.status}</span>
                </div>
                <dl>
                  <div><dt>Lookback / duration</dt><dd>{item.lookback} / {item.durationTicks} ticks</dd></div>
                  <div><dt>Demo stake</dt><dd>{item.stake}</dd></div>
                  <div><dt>Executable</dt><dd>{item.executable ? 'Yes — parameterized tick strategy' : 'No — stored for review only'}</dd></div>
                  <div><dt>Submitted</dt><dd>{item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}</dd></div>
                </dl>
                {item.description ? <p>{item.description}</p> : null}
                {item.scriptText ? (
                  <div>
                    <button className="cta cta-secondary" type="button" onClick={() => setOpenScript(openScript === item.id ? null : item.id)}>
                      {openScript === item.id ? 'Hide script' : `Review script${item.scriptFilename ? ` (${item.scriptFilename})` : ''}`}
                    </button>
                    {openScript === item.id ? <pre className="admin-script">{item.scriptText}</pre> : null}
                  </div>
                ) : null}
                <div className="strategy-actions">
                  {item.executable && !live ? (
                    <button className="cta" onClick={() => startRun(item.id)} disabled={busyId !== null}>
                      {busyId === item.id ? 'Starting…' : 'Start live demo'}
                    </button>
                  ) : null}
                  {!item.executable ? <span className="fine-print">Stored for review. This submission is never executed.</span> : null}
                </div>
              </article>
            ))}
            {!strategies.length && <p className="fine-print">No member strategy submissions yet.</p>}
          </div>
          {labError ? <p className="tool-error" role="status">{labError}</p> : null}
        </section>

        <section className="admin-lab-panel">
          <p className="eyebrow">Strategy pack access</p>
          <h2>Confirm Deriv downline</h2>
          <p>Only verified Partner Hub clients can download the written practice rules. If Deriv’s partner API cannot tag them automatically, confirm the ID in Partner Hub My Clients, then verify here.</p>
          <div className="admin-records">
            {affiliates.map((item) => (
              <article key={item.id}>
                <div className="admin-record-head">
                  <div>
                    <h2>{item.memberEmail || 'Member'}</h2>
                    <p>Deriv ID {item.derivLoginid} · {item.derivClientId}</p>
                  </div>
                  <span className="status-pill">{item.status}</span>
                </div>
                <p>{item.note}</p>
                <div className="strategy-actions">
                  <button className="cta" type="button" onClick={async () => {
                    if (!session?.access_token) return;
                    await verifyAffiliateClaim(session.access_token, item.id, 'verified', 'Confirmed in Partner Hub.');
                    loadAffiliates();
                  }}>Verify downline</button>
                  <button className="danger-button" type="button" onClick={async () => {
                    if (!session?.access_token) return;
                    await verifyAffiliateClaim(session.access_token, item.id, 'rejected', 'Not on this partner downline.');
                    loadAffiliates();
                  }}>Reject</button>
                </div>
              </article>
            ))}
            {!affiliates.length && <p className="fine-print">No Deriv ID claims yet.</p>}
          </div>
        </section>

        <header>
          <p className="eyebrow">Managed strategy</p>
          <h2>Affiliate and MT5 reviews</h2>
          <p>Authorization is checked from your signed-in admin account and enforced by database RPCs.</p>
        </header>
        <form className="admin-filters" onSubmit={searchReviews}>
          <label>
            <span>Search member email, broker or server</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} maxLength={100} />
          </label>
          <button className="cta"><Search size={15} /> Search</button>
        </form>
        <p role="status">{message}</p>
        <div className="admin-records">
          {rows.map((row) => (
            <article key={row.user_id}>
              <div className="admin-record-head">
                <div>
                  <h2>{row.member_email}</h2>
                  <p>{row.broker_entity} · {row.mt5_server}</p>
                </div>
                <span className="status-pill">{statusLabel(row.affiliate_status)}</span>
              </div>
              <dl>
                <div><dt>MT5 Login</dt><dd>{row.masked_mt5_login || maskLogin('')}</dd></div>
                <div><dt>Strategy</dt><dd>{statusLabel(row.strategy_status)}</dd></div>
                <div><dt>Risk acknowledgement</dt><dd>{row.risk_acknowledged ? 'Accepted' : 'Missing'}</dd></div>
                <div><dt>Submitted / updated</dt><dd>{new Date(row.submitted_at).toLocaleString()} · {new Date(row.updated_at).toLocaleString()}</dd></div>
              </dl>
              <div className="strategy-actions">
                <button className="cta" onClick={() => update(row, 'verified', 'mt5_account_ready')}><CheckCircle size={15} /> Verify affiliate</button>
                <button className="cta cta-secondary" onClick={() => update(row, 'pending', 'affiliate_verification_pending')}>Request information</button>
                <button className="danger-button" onClick={() => update(row, 'not_verified', 'affiliate_not_verified')}>Reject</button>
                <button className="cta" onClick={() => update(row, 'verified', 'strategy_active')}>Activate strategy</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
