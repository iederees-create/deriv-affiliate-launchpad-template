import type { LabBoard } from '../lib/labApi';

function money(value: number | null | undefined) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : '0.00';
}

function when(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}

export function LiveResults({ board }: { board: LabBoard | null }) {
  const live = Boolean(board?.live && board.strategy);
  const run = board?.run;
  const trades = board?.trades || [];
  const events = (board?.events || []).slice(0, 8);

  return (
    <div className={`lab-live ${live ? 'is-live' : ''}`}>
      <div>
        <span className="status-pill">{live ? (board?.paused ? 'Paused (demo still live)' : 'Live demo · Volatility 75 (1s)') : 'Waiting for a demo run'}</span>
        {live ? (
          <>
            <h3>{board?.strategy?.title}</h3>
            <p>
              Shared test of <strong>{board?.strategy?.memberName}</strong> on {board?.strategy?.symbol}. Demo only. No chart in this view — last tick, trades and PnL update as they happen.
            </p>
            {board?.paused && run?.pauseReason ? <p className="fine-print">{run.pauseReason} Resume {when(run.pauseUntil)}.</p> : null}
            <div className="lab-stats">
              <div><span>Last tick</span><strong>{run?.lastTick ?? '—'}</strong></div>
              <div><span>Trades</span><strong>{run?.tradeCount ?? 0}</strong></div>
              <div><span>Wins / losses</span><strong>{run?.winCount ?? 0} / {run?.lossCount ?? 0}</strong></div>
              <div><span>Win rate</span><strong>{run?.winRate ?? 0}%</strong></div>
              <div><span>Demo PnL</span><strong>{money(run?.realizedPnl)}</strong></div>
              <div><span>Ends</span><strong>{when(run?.scheduledEndAt)}</strong></div>
            </div>
            <div className="lab-results-grid">
              <div>
                <h4>Recent trades</h4>
                {trades.length ? (
                  <table className="lab-trades">
                    <thead>
                      <tr><th>When</th><th>Side</th><th>Stake</th><th>Result</th></tr>
                    </thead>
                    <tbody>
                      {trades.map((trade) => (
                        <tr key={trade.id}>
                          <td>{when(trade.closedAt || trade.openedAt)}</td>
                          <td>{trade.contractType}</td>
                          <td>{money(trade.stake)}</td>
                          <td>{trade.status === 'open' ? 'Open' : money(trade.profit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p className="fine-print">No trades yet. The board will fill as the demo places contracts.</p>}
              </div>
              <div>
                <h4>Live log</h4>
                <ul className="lab-log">
                  {events.map((event) => (
                    <li key={event.id}><strong>{event.type}</strong> {event.message}</li>
                  ))}
                  {!events.length && <li className="fine-print">Waiting for the first demo event.</li>}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <>
            <h3>No strategy is being live-tested right now</h3>
            <p>The shared Volatility 75 (1s) demo will appear here for every member once it is running.</p>
          </>
        )}
      </div>
    </div>
  );
}
