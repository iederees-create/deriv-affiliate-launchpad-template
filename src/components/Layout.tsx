import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { affiliateConfig } from "../config/affiliateConfig";
import { ArticleNarrator } from "./ArticleNarrator";

const navItems = [
  ["/tools", "Tools"],
  ["/desk", "Desk"],
  ["/kit", "Free kit"],
  ["/learn", "Learn"],
  ["/blog", "Blog"],
  ["/platforms", "Platforms"],
  ["/members", "VIP Area"],
  ["/risk-disclosure", "Risk"],
  ["/contact", "Contact"]
] as const;

const pageNarrations: Record<string, { title: string; description: string; sections?: Array<{ heading: string; body: string[] }> }> = {
  "/": {
    title: "Welcome to Apex Trade Network.",
    description: "It is lovely to have you here. Take your time, explore the free tools, try the trader quiz, or begin with a demo account. There is no rush, and please remember that trading always involves risk."
  },
  "/how-it-works": {
    title: "Welcome. Let us make getting started feel simple.",
    description: "This page walks you gently through the journey from exploring a free demo to understanding the platforms. Start slowly, learn at your own pace, and only consider live trading when you feel informed and prepared."
  },
  "/partner-programme": {
    title: "Welcome to the partner programme guide.",
    description: "Here you can explore how affiliate partnerships may work, with clear expectations and no promises of guaranteed income. Please review the disclosures and current official programme terms before making a decision."
  },
  "/platforms": {
    title: "Welcome to the platform guide.",
    description: "Choosing a trading platform can feel overwhelming, so this page gives you a calm, straightforward overview. Browse the options and choose the experience that feels most comfortable for you."
  },
  "/learn": {
    title: "Welcome to the learning hub.",
    description: "You are in the right place to learn the basics without pressure. Explore each topic at your own pace, understand the risks, and build confidence before opening or funding any account."
  },
  "/tools": {
    title: "Welcome to your free trading tools.",
    description: "These simple calculators and planning aids are here to help you slow down, think clearly, and manage risk more carefully. Everything works in your browser, and no login is needed."
  },
  "/kit": {
    title: "Welcome to your free planning kit.",
    description: "Inside you will find practical checklists, a journal, and a demo plan designed to make your learning journey calmer and more organised. These are educational tools, not a promise of profit."
  },
  "/blog": {
    title: "Welcome to the blog.",
    description: "Make yourself comfortable and explore the guides that interest you. Every article includes a listen option, so you can relax and let the page read it aloud for you."
  },
  "/risk-disclosure": {
    title: "Welcome. Let us take a quiet moment to understand the risks.",
    description: "Trading can lead to financial loss, especially when leverage is involved. Please read this page carefully and never trade with money you cannot afford to lose."
  },
  "/contact": {
    title: "Hello, and welcome to the contact page.",
    description: "If something is unclear or you would simply like to ask a question, you are welcome to reach out by WhatsApp or email. Choose whichever option feels easiest for you."
  },
  "/auth": {
    title: "Welcome to your private account area.",
    description: "Sign in when you are ready, and keep your login details private. Your account gives you access to educational planning tools designed to support patience, consistency, and better trading habits.",
    sections: [
      { heading: "Protect your account", body: ["Use a unique password, never share verification codes, and always sign out on a shared device. No legitimate administrator should ask for your password."] },
      { heading: "Keep expectations realistic", body: ["Educational tools can improve your process, but they cannot guarantee profits or remove financial risk. Learn on demo first and never trade money needed for essential expenses."] }
    ]
  },
  "/members": {
    title: "Welcome to your V I P learning dashboard.",
    description: "This space is designed to help you become a more disciplined trader. Good trading is not about chasing every opportunity. It is about protecting your capital, following your process, and knowing when to stop.",
    sections: [
      { heading: "Plan before the chart", body: ["Write down the market, setup, maximum stake, session length, and daily loss limit before placing a trade. If you cannot explain the setup simply, pause and keep learning."] },
      { heading: "Protect capital first", body: ["Use a small, consistent risk limit. Stop when the daily limit or trade cap is reached. Never increase a stake simply to recover the previous loss."] },
      { heading: "Journal and review", body: ["Record the reason, result, emotion, and any broken rule after every trade. Review a meaningful sample instead of changing strategy after a few wins or losses. Process quality comes before profit screenshots."] }
    ]
  },
  "/admin/managed-strategy": {
    title: "Welcome to the managed strategy administration area.",
    description: "Use this dashboard carefully and responsibly. Administrative access is a duty of care, never a shortcut to promising returns or encouraging unsuitable risk.",
    sections: [
      { heading: "Put member suitability first", body: ["Confirm that every member understands possible losses, leverage, fees, withdrawal conditions, and the difference between education and financial advice. Never use urgency or guaranteed-return language."] },
      { heading: "Protect private information", body: ["Only access information needed for the task. Never read credentials aloud, copy sensitive data into informal messages, or expose one member to another. Follow least-access principles."] },
      { heading: "Keep decisions accountable", body: ["Document approvals, changes, confirmations, and exceptions clearly. Use the audit trail to explain what happened and why. When information is incomplete, pause the process instead of guessing."] }
    ]
  }
};

export function Layout() {
  const { pathname } = useLocation();
  const narration = pageNarrations[pathname];

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
        {narration ? (
          <div className="page-narrator-wrap">
            <ArticleNarrator key={pathname} title={narration.title} description={narration.description} sections={narration.sections ?? []} />
          </div>
        ) : null}
        <Outlet />
      </main>
      <footer className="site-footer">
        <div>
          <strong>{affiliateConfig.productName}</strong>
          <p>Independent educational and strategy-access platform. Not financial advice and not an official Deriv website.</p>
        </div>
        <div className="footer-links">
          <Link to="/desk">Beginner desk</Link>
          <Link to="/risk-disclosure">Risk disclosure</Link>
          <Link to="/contact">Contact</Link>
          <a href={affiliateConfig.partnerProgrammeLink} target="_blank" rel="noreferrer">Partner link</a>
        </div>
      </footer>
    </div>
  );
}
