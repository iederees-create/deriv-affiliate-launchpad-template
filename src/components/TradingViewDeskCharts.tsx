import { TradingViewEmbed } from './TradingViewEmbed';
import {
  TRADINGVIEW_CHART_HOST,
  TRADINGVIEW_DERIV_CONNECT_URL,
  TRADINGVIEW_LAB_CHART_URL,
  TRADINGVIEW_PARTNER_URL,
  derivToTradingViewSymbol,
  tapeSymbolsFor,
  tradingViewInterval,
  tradingViewPartnerChartUrl,
} from '../lib/tradingView';
import { partnerCampaignUrl } from '../lib/relay';
import { marketLabel } from '../lib/liveBoard';

type Props = {
  selected: string;
  timeframe?: string;
  scanned: string[];
};

export function TradingViewDeskCharts({ selected, timeframe, scanned }: Props) {
  const chartSymbol = derivToTradingViewSymbol(selected);
  const tape = tapeSymbolsFor(scanned.length ? scanned : [selected]);

  return (
    <section className="tv-desk" aria-label="TradingView price charts for the selected volatility market">
      {tape.length ? (
        <TradingViewEmbed
          label="Volatility ticker tape"
          height={46}
          src="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"
          config={{
            symbols: tape,
            showSymbolLogo: true,
            colorTheme: 'dark',
            isTransparent: true,
            displayMode: 'compact',
            locale: 'en',
          }}
        />
      ) : null}

      {chartSymbol ? (
        <>
          <div className="tv-desk-copy">
            <p className="eyebrow">Price on TradingView</p>
            <h4>{marketLabel(selected)}</h4>
            <p>
              This is Deriv’s {marketLabel(selected)} candlestick on TradingView, with RSI on the same chart the
              desk reads. The RSI grid above is our live scan. This chart is the price tape. Rise/fall still
              fills on the public demo book, not from this widget.
            </p>
          </div>
          <TradingViewEmbed
            label={`${marketLabel(selected)} TradingView chart`}
            height={460}
            src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
            config={{
              autosize: true,
              symbol: chartSymbol,
              interval: tradingViewInterval(timeframe || 'M5'),
              timezone: 'Etc/UTC',
              theme: 'dark',
              style: '1',
              locale: 'en',
              backgroundColor: '#0e1726',
              gridColor: 'rgba(42, 58, 85, 0.6)',
              hide_top_toolbar: false,
              hide_legend: false,
              allow_symbol_change: false,
              calendar: false,
              studies: ['STD;RSI'],
              support_host: TRADINGVIEW_CHART_HOST,
            }}
          />
        </>
      ) : null}

      <p className="tv-desk-cta">
        <a
          href={chartSymbol ? tradingViewPartnerChartUrl(chartSymbol) : TRADINGVIEW_PARTNER_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open this chart on TradingView
        </a>
        {' · '}
        <a href={TRADINGVIEW_DERIV_CONNECT_URL} target="_blank" rel="noopener noreferrer">
          Connect a Deriv account on TradingView
        </a>
        {' · '}
        <a href={partnerCampaignUrl("tv-widget", "site")} target="_blank" rel="noopener noreferrer">
          Open a Deriv demo
        </a>
        {' · '}
        <a href={TRADINGVIEW_LAB_CHART_URL}>Stay on this desk</a>
        <span className="tv-desk-fine">
          {' '}Widget data is TradingView’s. I partner with Deriv and TradingView and may earn a commission.
          18+ only. Demo figures on this page. Not a signal.
        </span>
      </p>
    </section>
  );
}
