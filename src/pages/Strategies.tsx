import { Link } from "react-router-dom";
import { DisclosureBand, SectionHeader } from "../components/Section";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";
import { statusLabels, strategies } from "../data/strategies";

export function Strategies() {
  return (
    <>
      <Seo
        title={`Strategies | ${affiliateConfig.brandName}`}
        description="Each strategy has its own page, its own rules and its own public record. Demo first. Not financial advice."
        path="/strategies"
      />
      <section className="section">
        <SectionHeader
          eyebrow="Strategies"
          title="One page per strategy, one record per page"
          text="A strategy is only called tested once it has a public record that includes the losses. Until then the page says so."
        />
        <p className="fine-print">{affiliateConfig.disclosureText}</p>
        <p>
          <Link className="text-link" to="/strategies/backtest-results">See how the paper strategies did in backtests on unseen data</Link>
        </p>
        <div className="card-grid">
          {strategies.map((item) => (
            <article className="card" key={item.slug}>
              <p className="eyebrow">
                <span className="strategy-badge" data-status={item.status}>{statusLabels[item.status]}</span>
              </p>
              <h3>{item.name}</h3>
              <p>{item.summary}</p>
              <p className="fine-print">{item.market} · {item.timeframe}</p>
              <Link className="text-link" to={`/strategies/${item.slug}`}>Read the rules and the record</Link>
            </article>
          ))}
        </div>
      </section>
      <DisclosureBand />
    </>
  );
}
