import { Link } from 'react-router-dom';
import type { LabBoard } from '../lib/labApi';
import { affiliateConfig } from '../config/affiliateConfig';
import { StrategyDownload } from './StrategyDownload';
import { useAuth } from './AuthProvider';

function money(value: number | null | undefined) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : '0.00';
}

function when(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}

function sideLabel(contractType?: string) {
  if (contractType === 'CALL') return 'Up';
  if (contractType === 'PUT') return 'Down';
  return contractType || '—';
}

function resultLabel(trade: { status: string; profit: number }) {
  if (trade.status === 'open') return 'Still running';
  const profit = Number(trade.profit);
  if (!Number.isFinite(profit) || profit === 0) return 'Even';
  return profit > 0 ? `Won ${money(profit)}` : `Lost ${money(Math.abs(profit))}`;
}

function eventCopy(event: { type: string; message: string }) {
  if (event.type === 'run_paused') return event.message.replace('demo losses', 'losses on practice money');
  if (event.type === 'trade_opened') {
    const up = /CALL/.test(event.message);
    const down = /PUT/.test(event.message);
    if (up) return 'Tried an up move.';
    if (down) return 'Tried a down move.';
  }
  if (event.type === 'trade_closed') {
    if (event.message.includes('+')) return 'That move finished in profit on practice money.';
    if (event.message.includes('-')) return 'That move finished as a loss on practice money.';
  }
  if (event.type === 'run_started') return 'The shared practice run started.';
  if (event.type === 'run_resumed') return 'The practice run started placing trades again.';
  return event.message;
}

export function LiveResults({ board }: { board: LabBoard | null }) {
  const live = Boolean(board?.live && board.strategy);
  const run = board?.run;
  const closed = (board?.trades || []).filter((trade) => trade.status === 'closed');
  const open = (board?.trades || []).find((trade) => trade.status === 'open');
  const rows = open ? [open, ...closed] : closed;
  const events = (board?.events || []).filter((event) => event.type !== 'trade_opened').slice(0, 6);
  const pnl = Number(run?.realizedPnl || 0);
  const startBal = Number(run?.startingBalance);
  const liveBal = Number(run?.currentBalance);
  const walletNow = Number.isFinite(liveBal) ? liveBal : (Number.isFinite(startBal) ? startBal + pnl : null);
  const walletStart = Number.isFinite(startBal) ? startBal : (walletNow != null ? walletNow - pnl : null);
  const percent = run?.percentReturn != null
    ? run.percentReturn
    : (walletStart && walletStart !== 0 ? Math.round((pnl / walletStart) * 10000) / 100 : null);
  const { session } = useAuth();
  const joinHref = board?.affiliateLink || affiliateConfig.primaryAffiliateLink;
  const referral = board?.referralCode || affiliateConfig.referralCode;

  return (
    <div className={`lab-live ${live ? 'is-live' : ''}`}>
      <div>
        <span className="status-pill">
          {live ? (board?.paused ? 'Short break · practice run still on' : 'Live practice run') : 'Waiting to start'}
        </span>
        {live ? (
          <>
            {board?.recap ? (
              <div className="lab-recap">
                <p className="eyebrow">This week</p>
                <h3>{board.recap.headline}</h3>
                <p>{board.recap.body}</p>
              </div>
            ) : (
              <h3>{board?.strategy?.title === 'V75 1s impulse follow' ? 'Volatility 75, 1-second practice' : board?.strategy?.title}</h3>
            )}
            <p className="fine-print">Volatility 75, 1-second practice. Four same-way ticks, strongest last tick, five-tick expiry.</p>
            <p>
              Everyone here is watching the same practice test. It uses <strong>demo funds only</strong> — this does not spend real money.
              When four 1-second prices go the same way and the last one is the strongest, it tries that direction for five ticks.
            </p>
            <p className="lab-money-note">Practice dollars, not cash. The wallet below is the Deriv demo account used for this test.</p>
            {board?.paused ? (
              <p className="lab-pause">
                Taking a short break after three losses in a row. It will start placing practice trades again at {when(run?.pauseUntil)}.
              </p>
            ) : null}
            <div className="lab-wallet">
              <div><span>Practice wallet at start</span><strong>{walletStart != null ? `$${money(walletStart)}` : '—'}</strong></div>
              <div><span>Practice wallet now</span><strong>{walletNow != null ? `$${money(walletNow)}` : '—'}</strong></div>
              <div><span>Made this week</span><strong className={pnl >= 0 ? 'is-up' : 'is-down'}>{pnl >= 0 ? '+' : ''}${money(pnl)}</strong></div>
              <div><span>Return</span><strong className={(percent || 0) >= 0 ? 'is-up' : 'is-down'}>{percent == null ? '—' : `${percent >= 0 ? '+' : ''}${percent}%`}</strong></div>
            </div>
            <div className="lab-stats">
              <div><span>Latest price</span><strong>{run?.lastTick ?? '—'}</strong></div>
              <div><span>Finished trades</span><strong>{run?.tradeCount ?? 0}</strong></div>
              <div><span>Won / lost</span><strong>{run?.winCount ?? 0} / {run?.lossCount ?? 0}</strong></div>
              <div><span>Win rate</span><strong>{run?.winRate ?? 0}%</strong></div>
              <div><span>Runs until</span><strong>{when(run?.scheduledEndAt)}</strong></div>
            </div>
            <div className="lab-join">
              <p>Anyone can watch this. To try the same market on your own Deriv demo, open an account through this partner link. Referral code <strong>{referral}</strong>.</p>
              <div className="strategy-actions">
                <a className="cta cta-primary" href={joinHref} target="_blank" rel="noreferrer">Open a free Deriv demo</a>
                {!session ? <Link className="cta cta-secondary" to="/auth">Create a free site login</Link> : null}
              </div>
            </div>
            <div className="lab-results-grid">
              <div>
                <h4>What just happened</h4>
                {rows.length ? (
                  <table className="lab-trades">
                    <thead>
                      <tr><th>Time</th><th>Direction</th><th>Result</th></tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 12).map((trade) => (
                        <tr key={trade.id}>
                          <td>{when(trade.closedAt || trade.openedAt)}</td>
                          <td>{sideLabel(trade.contractType)}</td>
                          <td className={trade.status === 'open' ? '' : (Number(trade.profit) >= 0 ? 'is-up' : 'is-down')}>{resultLabel(trade)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p className="fine-print">No finished trades yet. This list fills as the practice run continues.</p>}
              </div>
              <div>
                <h4>In plain words</h4>
                <ul className="lab-log">
                  {events.map((event) => (
                    <li key={event.id}>{eventCopy(event)}</li>
                  ))}
                  {!events.length && <li className="fine-print">Waiting for the first practice result.</li>}
                </ul>
              </div>
            </div>
            <StrategyDownload />
          </>
        ) : (
          <>
            <h3>The shared practice run has not started yet</h3>
            <p>When it is on, anyone can watch the same Volatility 75 (1 second) test, using demo funds only.</p>
            <div className="lab-join">
              <a className="cta cta-primary" href={joinHref} target="_blank" rel="noreferrer">Open a free Deriv demo</a>
              {!session ? <Link className="cta cta-secondary" to="/auth">Create a free site login</Link> : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
