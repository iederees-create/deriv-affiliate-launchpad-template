import { FormEvent, useEffect, useState } from 'react';
import { Activity, FlaskConical, LoaderCircle } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { fetchLabBoard, submitLabStrategy, LAB_API_BASE, type LabBoard, type LabKind } from '../lib/labApi';
import { LiveResults } from './LiveResults';

const SYMBOLS = ['R_10', 'R_25', 'R_50', 'R_75', 'R_100', '1HZ10V', '1HZ25V', '1HZ50V', '1HZ75V', '1HZ100V'];

export function StrategyLab() {
  const { session } = useAuth();
  const [board, setBoard] = useState<LabBoard | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [kind, setKind] = useState<LabKind>('tick_rise_fall');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [symbol, setSymbol] = useState('1HZ75V');
  const [durationTicks, setDurationTicks] = useState(5);
  const [lookback, setLookback] = useState(3);
  const [stake, setStake] = useState(0.35);
  const [scriptFilename, setScriptFilename] = useState('');
  const [scriptText, setScriptText] = useState('');

  useEffect(() => {
    let active = true;
    const load = () => fetchLabBoard().then((next) => { if (active) { setBoard(next); setError(''); } }).catch((err) => { if (active) setError(err.message); });
    load();
    const timer = setInterval(load, 5000);
    let stream: EventSource | null = null;
    try {
      stream = new EventSource(`${LAB_API_BASE}/api/lab/stream`);
      stream.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (active && payload && payload.board) setBoard(payload.board);
        } catch (_err) { /* ignore */ }
      };
    } catch (_err) { /* polling remains */ }
    return () => {
      active = false;
      clearInterval(timer);
      if (stream) stream.close();
    };
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!session?.access_token) {
      setError('Sign in is required to submit a strategy.');
      return;
    }
    setBusy(true);
    try {
      await submitLabStrategy(session.access_token, {
        title,
        description,
        kind,
        symbol,
        durationTicks,
        lookback,
        stake,
        scriptFilename,
        scriptText,
      });
      setTitle('');
      setDescription('');
      setScriptText('');
      setScriptFilename('');
      setBoard(await fetchLabBoard());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="strategy-lab" aria-labelledby="lab-heading">
      <div className="strategy-hero">
        <div>
          <p className="eyebrow">Shared demo lab</p>
          <h2 id="lab-heading">Member Strategy Live Test</h2>
          <p>Everyone watches the same Volatility 75 (1s) demo for a week. Results update live. Uploaded scripts are stored and never executed. There is no chart in this view.</p>
        </div>
        <FlaskConical />
      </div>

      <LiveResults board={board} />

      <form className="strategy-form lab-form" onSubmit={submit}>
        <label>
          <span>Strategy title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required />
        </label>
        <label>
          <span>Submission type</span>
          <select value={kind} onChange={(e) => setKind(e.target.value as LabKind)}>
            <option value="tick_rise_fall">Parameterized tick strategy (can be live-tested)</option>
            <option value="text_notes">Text idea / notes (stored only)</option>
            <option value="script_upload">Script or bot paste (stored, never executed)</option>
          </select>
        </label>
        {kind === 'tick_rise_fall' && (
          <div className="premium-form-grid">
            <label>
              <span>Symbol</span>
              <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
                {SYMBOLS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label>
              <span>Duration ticks</span>
              <input type="number" min={1} max={10} value={durationTicks} onChange={(e) => setDurationTicks(Number(e.target.value))} />
            </label>
            <label>
              <span>Lookback ticks</span>
              <input type="number" min={2} max={10} value={lookback} onChange={(e) => setLookback(Number(e.target.value))} />
            </label>
            <label>
              <span>Demo stake</span>
              <input type="number" min={0.35} max={1} step={0.01} value={stake} onChange={(e) => setStake(Number(e.target.value))} />
            </label>
          </div>
        )}
        <label className="premium-wide">
          <span>Description</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={4000} rows={4} />
        </label>
        {kind === 'script_upload' && (
          <>
            <label>
              <span>Filename</span>
              <input value={scriptFilename} onChange={(e) => setScriptFilename(e.target.value)} maxLength={80} placeholder="bot.js" />
            </label>
            <label className="premium-wide">
              <span>Paste script (stored for review, never run)</span>
              <textarea value={scriptText} onChange={(e) => setScriptText(e.target.value)} rows={8} />
            </label>
          </>
        )}
        <button className="cta cta-primary" disabled={busy}>
          {busy ? <><LoaderCircle className="spin" size={16} /> Submitting...</> : 'Submit for demo testing'}
        </button>
      </form>

      <div className="lab-queue">
        <div className="vip-resources-heading">
          <div>
            <p className="eyebrow">Queue</p>
            <h3>Who is being tested</h3>
          </div>
          <p>Everyone sees the same live board. Real-money mode is blocked.</p>
        </div>
        <ul>
          {(board?.queue || []).map((item) => (
            <li key={item.id}>
              <Activity size={16} />
              <div>
                <strong>{item.title}</strong>
                <span>{item.memberName} · {item.kind} · {item.status}</span>
              </div>
            </li>
          ))}
          {!board?.queue?.length && <li className="fine-print">No submissions yet.</li>}
        </ul>
      </div>
      {error && <p className="tool-error" role="status">{error}</p>}
      <p className="fine-print">Educational demo testing only. Not financial advice. Trading involves risk.</p>
    </section>
  );
}
