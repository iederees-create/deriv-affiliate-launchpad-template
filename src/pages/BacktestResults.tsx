import { Link } from "react-router-dom";
import { DisclosureBand, SectionHeader } from "../components/Section";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";
import { backtestResults } from "../data/backtestResults";

const REPO_RESEARCH_URL = "https://github.com/iederees-create/deriv-affiliate-launchpad-template/tree/main/engine/research";

const formatR = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(3)} R`;

export function BacktestResults() {
  const { rows, alsoTested, data, unseenWindow, costs, testedOn } = backtestResults;
  const ideaCount = rows.length + alsoTested.length;
  return (
    <>
      <Seo
        title={`Backtest results | ${affiliateConfig.brandName}`}
        description="Trading ideas tested on data they had never seen, with real costs. None showed an edge. Method and numbers published. Not financial advice."
        path="/strategies/backtest-results"
      />
      <section className="section">
        <SectionHeader
          eyebrow="Backtest results"
          title={`${ideaCount} ideas tested. None showed an edge.`}
          text="These are the results I would rather not have. They are published because a record that hides the losers is worthless."
        />
        <p className="fine-print">{affiliateConfig.disclosureText}</p>
        <p>
          Each idea had its rules fixed first. It was then run once on two years of prices it had never been
          tested on, with trading costs taken off. A result only counts as an edge if it is clearly above zero on
          that unseen data, was also positive on the earlier data, and survives small changes to its settings.
        </p>
        <div className="paper-table-wrap">
          <table className="paper-table">
            <thead>
              <tr>
                <th scope="col">Idea</th>
                <th scope="col">Trades on unseen data</th>
                <th scope="col">Average result per trade</th>
                <th scope="col">Likely range</th>
                <th scope="col">Profit factor</th>
                <th scope="col">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name}>
                  <th scope="row">
                    {row.slug ? <Link className="text-link" to={`/strategies/${row.slug}`}>{row.name}</Link> : row.name}
                    <span className="fine-print"> {row.kind}. {row.note}</span>
                  </th>
                  <td>{row.trades.toLocaleString("en-GB")}</td>
                  <td>{formatR(row.expectancyR)}</td>
                  <td>{row.interval}</td>
                  <td>{row.profitFactor.toFixed(2)}</td>
                  <td>{row.verdict}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="fine-print">
          R is the amount risked on one trade. +0.04 R means an average gain of 4% of the risk per trade; -0.11 R
          means an average loss of 11% of it. "Likely range" is the range the true average probably sits in. If it
          includes zero, the result cannot be told apart from luck. Profit factor is total wins divided by total
          losses; below 1 is a loss.
        </p>
        {alsoTested.map((item) => (
          <p key={item.name}>
            <strong>{item.name}.</strong> {item.summary}
          </p>
        ))}
      </section>

      <section className="section">
        <SectionHeader eyebrow="Method" title="How the test was run" />
        <ul className="strategy-list">
          <li><strong>Prices:</strong> {data}.</li>
          <li><strong>Unseen window:</strong> {unseenWindow}. It was looked at once per idea, after the rules were fixed.</li>
          <li><strong>Costs:</strong> {costs}. Slippage and wider spreads around news are not included and would lower every result.</li>
          <li><strong>Inconclusive</strong> means zero within noise, not nearly profitable. Confirming an edge as small as the best one here would take decades of trades.</li>
          <li><strong>Tested on:</strong> {testedOn}. Backtests are simulations. They are not a forecast.</li>
        </ul>
        <p>
          The four paper strategies keep running on live prices so the forward record builds in public, wins and
          losses included. This page is research and education, not financial advice. Trading involves risk and
          most retail traders lose money.
        </p>
        <p>
          <a className="text-link" href={REPO_RESEARCH_URL} target="_blank" rel="noreferrer">
            Read the full method, data notes and tables on GitHub
          </a>
        </p>
      </section>
      <DisclosureBand />
    </>
  );
}
