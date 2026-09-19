import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LabBoard } from '../lib/labApi';
import { affiliateConfig } from '../config/affiliateConfig';
import { StrategyDownload } from './StrategyDownload';
import { useAuth } from './AuthProvider';
import { ShareBar } from './ShareBar';
import { RsiEclipse } from './RsiEclipse';
import {
  MARKET_ORDER,
  TIMEFRAME_ORDER,
  TIMEFRAME_SHORT,
  durationLabel,
  formatRsi,
  hottestMarket,
  marketLabel,
  parseOpenedEvent,
  rsiZone,
  timeframeLabel,
  zoneCopy,
} from '../lib/liveBoard';

const SHARE_URL = 'https://iederees-create.github.io/deriv-affiliate-launchpad-template/lab';
const SHARE_TITLE = 'Watch Apex Eclipse Guard — a live Deriv practice desk';
const SHARE_TEXT = 'RSI must already be extreme and then turn. Bounce candle, range filter, slower-chart check. Demo funds only.';

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
  const opened = parseOpenedEvent(event.message);
  if (opened) {
    const dir = opened.side === 'CALL' ? 'up' : 'down';
    return `Tried ${dir} on ${marketLabel(opened.symbol)} from the ${timeframeLabel(opened.timeframe)} chart.`;
  }
  if (event.type === 'run_paused') return event.message.replace('demo losses', 'losses on practice money');
  if (event.type === 'trade_closed') {
    if (event.message.includes('+')) return 'That move finished in profit on practice money.';
    if (event.message.includes('-')) return 'That move finished as a loss on practice money.';
  }
  if (event.type === 'run_started') return 'The shared practice run started.';
  if (event.type === 'run_resumed') return 'The practice run started placing trades again.';
  return event.message;
}

function tradeHint(trade: { contractType: string; symbol: string; timeframe?: string }, events: Array<{ message: string }>) {
  if (trade.timeframe) return `${marketLabel(trade.symbol)} · ${TIMEFRAME_SHORT[trade.timeframe] || trade.timeframe}`;
  const match = events.map((event) => parseOpenedEvent(event.message)).find((parsed) => parsed && parsed.symbol === trade.symbol && parsed.side === trade.contractType);
  if (!match) return marketLabel(trade.symbol);
  return `${marketLabel(match.symbol)} · ${TIMEFRAME_SHORT[match.timeframe] || match.timeframe}`;
}

export function LiveResults({ board }: { board: LabBoard | null }) {
  const live = Boolean(board?.live && board.strategy);
  const run = board?.run;
  const strategy = board?.strategy;
  const oversold = strategy?.rsiOversold ?? 20;
  const overbought = strategy?.rsiOverbought ?? 80;
  const period = strategy?.rsiPeriod ?? 14;
  const closed = (board?.trades || []).filter((trade) => trade.status === 'closed');
  const open = (board?.trades || []).find((trade) => trade.status === 'open');
  const rows = open ? [open, ...closed] : closed;
  const events = (board?.events || []).filter((event) => event.type !== 'tick').slice(0, 8);
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
  const scanned = strategy?.scannedSymbols?.length ? strategy.scannedSymbols : [...MARKET_ORDER];
  const timeframes = strategy?.timeframes?.length ? strategy.timeframes : [...TIMEFRAME_ORDER];
  const rsiByMarket = strategy?.rsiByMarket || {};
  const defaultMarket = hottestMarket(strategy?.rsiByMarket, oversold, overbought) || strategy?.symbol || scanned[0] || '1HZ75V';
  const [pinned, setPinned] = useState<string | null>(null);
  const selected = pinned && rsiByMarket[pinned] ? pinned : defaultMarket;
  const selectedFrames = rsiByMarket[selected] || strategy?.rsiByTimeframe || {};
  const openedHint = events.map((event) => parseOpenedEvent(event.message)).find(Boolean) || null;

  const scanSummary = useMemo(() => {
    let ready = 0;
    let buy = 0;
    let sell = 0;
    for (const symbol of scanned) {
      const frames = rsiByMarket[symbol];
      if (!frames) continue;
      for (const tf of timeframes) {
        const zone = rsiZone(frames[tf], oversold, overbought);
        if (zone === 'empty') continue;
        ready += 1;
        if (zone === 'buy') buy += 1;
        if (zone === 'sell') sell += 1;
      }
    }
    return { ready, buy, sell };
  }, [rsiByMarket, scanned, timeframes, oversold, overbought]);

  return (
    <div className={`eclipse-board lab-live ${live ? 'is-live' : ''}`}>
      <header className="eclipse-head">
        <div>
          <span className="status-pill">
            {live ? (board?.paused ? 'Short break · practice run still on' : 'Live practice run') : 'Waiting to start'}
          </span>
          <h3>{strategy?.title || 'Apex Eclipse Guard'}</h3>
          <p>
            One public demo watching <strong>{scanned.length} markets</strong> on
            {' '}<strong>{timeframes.map((id) => TIMEFRAME_SHORT[id] || id).join(', ')}</strong> charts.
            RSI({period}) below {oversold} tries up. RSI above {overbought} tries down. Fastest ready chart wins.
            At most one open contract per market. Demo funds only. Historical testing has not established a profitable edge.
          </p>
        </div>
        <ShareBar url={SHARE_URL} title={SHARE_TITLE} text={SHARE_TEXT} label="Share the desk" />
      </header>

      <div className="eclipse-howto" aria-label="How to read this board">
        <article>
          <span>01</span>
          <h4>What you are looking at</h4>
          <p>A shared Deriv demo. The wallet is practice money. Nothing here spends cash or places a trade on your account.</p>
        </article>
        <article>
          <span>02</span>
          <h4>What RSI means</h4>
          <p>RSI(14) is a 0–100 stretch meter. Below {oversold} the last {period} bars fell hard. Above {overbought} they rose hard. The desk fades those extremes.</p>
        </article>
        <article>
          <span>03</span>
          <h4>How to read a cell</h4>
          <p>Each cell is one market on one chart. Teal = buy zone. Copper = sell zone. Grey = waiting. Tap a row to park the gauges on that market.</p>
        </article>
      </div>

      <div className="eclipse-legend" aria-hidden="true">
        <span className="legend-chip is-buy">≤ {oversold} buy zone</span>
        <span className="legend-chip is-near-buy">near {oversold}</span>
        <span className="legend-chip">waiting</span>
        <span className="legend-chip is-near-sell">near {overbought}</span>
        <span className="legend-chip is-sell">≥ {overbought} sell zone</span>
        <span className="legend-note">{scanSummary.ready} live readings · {scanSummary.buy} buy · {scanSummary.sell} sell</span>
      </div>

      <section className="eclipse-gauges" aria-label={`${marketLabel(selected)} RSI across timeframes`}>
        <div className="eclipse-gauges-copy">
          <p className="eyebrow">{marketLabel(selected)}</p>
          <h4>Nine charts, one stretch meter</h4>
          <p>
            These dials belong to the highlighted row. The needle is RSI. The teal band is the buy zone.
            The copper band is the sell zone. Boom, Crash and Step are not scanned.
          </p>
        </div>
        <div className="eclipse-gauge-grid">
          {timeframes.map((tf) => (
            <RsiEclipse
              key={tf}
              rsi={selectedFrames[tf]}
              label={TIMEFRAME_SHORT[tf] || tf}
              caption={timeframeLabel(tf)}
              oversold={oversold}
              overbought={overbought}
              highlight={rsiZone(selectedFrames[tf], oversold, overbought) === 'buy' || rsiZone(selectedFrames[tf], oversold, overbought) === 'sell'}
            />
          ))}
        </div>
      </section>

      <section className="eclipse-scan" aria-label="RSI heatmap of scanned volatility markets">
        <div className="eclipse-scan-head">
          <div>
            <p className="eyebrow">Scan grid</p>
            <h4>Every market × every chart</h4>
          </div>
          <p>Numbers are RSI, not price. Empty cells are still warming up. Click a market name to pin the dials.</p>
        </div>
        <div className="scan-scroll">
          <table className="scan-grid">
            <caption className="visually-hidden">RSI readings for each scanned market across nine timeframes.</caption>
            <thead>
              <tr>
                <th scope="col">Market</th>
                {timeframes.map((tf) => (
                  <th key={tf} scope="col">{TIMEFRAME_SHORT[tf] || tf}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scanned.map((symbol) => {
                const frames = rsiByMarket[symbol] || {};
                const active = symbol === selected;
                return (
                  <tr key={symbol} className={active ? 'is-selected' : undefined}>
                    <th scope="row">
                      <button type="button" className="scan-market" onClick={() => setPinned(symbol)} aria-pressed={active}>
                        {marketLabel(symbol)}
                      </button>
                    </th>
                    {timeframes.map((tf) => {
                      const rsi = frames[tf];
                      const zone = rsiZone(rsi, oversold, overbought);
                      return (
                        <td key={tf} className={`scan-cell is-${zone}`}>
                          <span className="scan-dot" aria-hidden="true" />
                          <span>{formatRsi(rsi)}</span>
                          <span className="visually-hidden">{timeframeLabel(tf)}: {zoneCopy(zone)}</span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {live ? (
        <>
          {board?.recap ? (
            <div className="lab-recap">
              <p className="eyebrow">This week</p>
              <h3>{board.recap.headline}</h3>
              <p>{board.recap.body}</p>
            </div>
          ) : null}
          <p className="lab-money-note">Practice dollars, not cash. The wallet below is the Deriv demo account used for this test. Options cannot attach a 1,000 / 25,000 point stop — expiry follows the chart that signalled ({durationLabel(strategy?.durationTicks, strategy?.durationUnit || 'm')} as the 5-minute fallback).</p>
          {board?.paused ? (
            <p className="lab-pause">
              Taking a short break after three losses in a row. It will start placing practice trades again at {when(run?.pauseUntil)}.
            </p>
          ) : null}
          {open ? (
            <div className="eclipse-open" role="status">
              <span className="status-pill">Open now</span>
              <strong>{sideLabel(open.contractType)}</strong>
              <p>
                {tradeHint(open, events)} · stake ${money(open.stake)}
                {openedHint ? ` · ${timeframeLabel(openedHint.timeframe)} RSI` : ''}
              </p>
            </div>
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
            <div><span>Stake</span><strong>${money(strategy?.effectiveStake ?? strategy?.stake)}</strong></div>
            <div><span>Runs until</span><strong>{when(run?.scheduledEndAt)}</strong></div>
          </div>
          <div className="win-tape" aria-label="Recent wins and losses">
            {closed.slice(0, 24).map((trade) => (
              <span key={trade.id} className={Number(trade.profit) >= 0 ? 'is-up' : 'is-down'} title={resultLabel(trade)} />
            ))}
            {!closed.length ? <p className="fine-print">Win/loss tape fills after the first finished trade.</p> : null}
          </div>
          <div className="lab-join">
            <p>Anyone can watch this. To try the same markets on your own Deriv demo, open an account through this partner link. Referral code <strong>{referral}</strong>.</p>
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
                    <tr><th>Time</th><th>Market</th><th>Direction</th><th>Result</th></tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 12).map((trade) => (
                      <tr key={trade.id}>
                        <td>{when(trade.closedAt || trade.openedAt)}</td>
                        <td>{tradeHint(trade, events)}</td>
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
                {events.filter((event) => event.type !== 'trade_opened' || parseOpenedEvent(event.message)).slice(0, 6).map((event) => (
                  <li key={event.id}>{eventCopy(event)}</li>
                ))}
                {!events.length && <li className="fine-print">Waiting for the first practice result.</li>}
              </ul>
            </div>
          </div>
          <StrategyDownload strategy={strategy} />
        </>
      ) : (
        <div className="lab-join">
          <p>When the shared run is on, anyone can watch the same RSI scan using demo funds only.</p>
          <a className="cta cta-primary" href={joinHref} target="_blank" rel="noreferrer">Open a free Deriv demo</a>
        </div>
      )}
    </div>
  );
}
