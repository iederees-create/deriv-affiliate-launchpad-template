import type { LabBoard } from '../lib/labApi';
import { StrategyDownload } from './StrategyDownload';

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

  return (
    <div className={`lab-live ${live ? 'is-live' : ''}`}>
      <div>
        <span className="status-pill">
          {live ? (board?.paused ? 'Short break · practice run still on' : 'Live practice run') : 'Waiting to start'}
        </span>
        {live ? (
          <>
            <h3>{board?.strategy?.title === 'V75 1s impulse follow' ? 'Volatility 75, 1-second practice' : board?.strategy?.title}</h3>
            <p>
              Everyone here is watching the same practice test. It uses <strong>demo funds only</strong> — this does not spend real money.
              When four 1-second prices go the same way and the last one is the strongest, it tries that direction for five ticks.
            </p>
            <p className="lab-money-note">Practice dollars, not cash. The website was already running; this extra test does not open a new paid service.</p>
            {board?.paused ? (
              <p className="lab-pause">
                Taking a short break after three losses in a row. It will start placing practice trades again at {when(run?.pauseUntil)}.
              </p>
            ) : null}
            <div className="lab-stats">
              <div><span>Latest price</span><strong>{run?.lastTick ?? '—'}</strong></div>
              <div><span>Finished trades</span><strong>{run?.tradeCount ?? 0}</strong></div>
              <div><span>Won / lost</span><strong>{run?.winCount ?? 0} / {run?.lossCount ?? 0}</strong></div>
              <div><span>Win rate</span><strong>{run?.winRate ?? 0}%</strong></div>
              <div><span>Practice result</span><strong className={pnl >= 0 ? 'is-up' : 'is-down'}>{pnl >= 0 ? '+' : ''}{money(pnl)}</strong></div>
              <div><span>Runs until</span><strong>{when(run?.scheduledEndAt)}</strong></div>
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
            <p>When it is on, everyone in the members area will see the same Volatility 75 (1 second) test, using demo funds only.</p>
          </>
        )}
      </div>
    </div>
  );
}
