import type { LucideIcon } from "lucide-react";

export function SectionHeader({
  eyebrow,
  title,
  text
}: {
  eyebrow?: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="section-header">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}

export function Card({
  icon: Icon,
  title,
  children
}: {
  icon?: LucideIcon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="card">
      {Icon ? <Icon className="card-icon" size={22} aria-hidden="true" /> : null}
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  );
}

export function DisclosureBand() {
  return (
    <section className="disclosure-band" aria-label="Important disclosures">
      <strong>Important:</strong> This demo is a website template for affiliate marketing. It is not an official Deriv website, not a trading bot, and not financial advice. Trading involves risk, and affiliate owners may earn commissions from configured links.
    </section>
  );
}
