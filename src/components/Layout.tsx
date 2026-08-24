import { Link, NavLink, Outlet } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { affiliateConfig } from "../config/affiliateConfig";

const navItems = [
  ["/tools", "Tools"],
  ["/kit", "Free kit"],
  ["/learn", "Learn"],
  ["/blog", "Blog"],
  ["/platforms", "Platforms"],
  ["/members", "VIP Area"],
  ["/risk-disclosure", "Risk"],
  ["/contact", "Contact"]
] as const;

export function Layout() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <Link to="/" className="brand" aria-label={`${affiliateConfig.brandName} home`}>
          <span className="brand-mark"><ShieldCheck size={18} aria-hidden="true" /></span>
          <span>{affiliateConfig.brandName}</span>
        </Link>
        <nav aria-label="Main navigation">
          {navItems.map(([href, label]) => (
            <NavLink key={href} to={href} className={({ isActive }) => (isActive ? "active" : "")}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div>
          <strong>{affiliateConfig.productName}</strong>
          <p>
            Demo template by NextGenWebs. This is not a trading bot, not financial advice, and not an official Deriv website.
          </p>
          <p>This template can be adapted for other broker affiliate programmes.</p>
        </div>
        <div className="footer-links">
          <Link to="/risk-disclosure">Risk disclosure</Link>
          <Link to="/contact">Contact</Link>
          <a href={affiliateConfig.partnerProgrammeLink} target="_blank" rel="noreferrer">Partner link</a>
        </div>
      </footer>
    </div>
  );
}
