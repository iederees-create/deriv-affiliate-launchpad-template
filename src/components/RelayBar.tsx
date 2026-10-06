import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import {
  PARTNER,
  REFERRAL,
  campaignLinks,
  decide,
  parseCampaignContext,
  recordEvent,
  type CampaignContext,
  type Consent,
  type RelayEvent
} from "../lib/relay";

const KEY = "apex-relay-v1";

type Stored = { consent: Consent; context: CampaignContext; events: RelayEvent[] };

function emptyStore(search: string): Stored {
  return { consent: "none", context: parseCampaignContext(search), events: [] };
}

function readStore(search: string): Stored {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyStore(search);
    const parsed = JSON.parse(raw) as Stored;
    const incoming = parseCampaignContext(search);
    return {
      consent: parsed.consent || "none",
      context: incoming.source === "direct" && !incoming.campaign ? parsed.context : incoming,
      events: Array.isArray(parsed.events) ? parsed.events : []
    };
  } catch {
    return emptyStore(search);
  }
}

export function RelayBar() {
  const { user } = useAuth();
  const [store, setStore] = useState<Stored>(() => readStore(window.location.search));
  const decision = decide(store.context, store.events, Boolean(user));

  useEffect(() => {
    if (store.consent === "none") return;
    if (store.events.some((event) => event.type === "page_view" && event.props?.path === window.location.pathname)) return;
    try {
      const events = recordEvent(store.events, store.consent, "page_view", { path: window.location.pathname });
      const next = { ...store, events };
      window.localStorage.setItem(KEY, JSON.stringify(next));
      setStore(next);
    } catch {
      // A second page view is enough; a blocked write should not break the page.
    }
  }, [store.consent]);

  function grant() {
    const next = { ...store, consent: "analytics" as Consent };
    window.localStorage.setItem(KEY, JSON.stringify(next));
    setStore(next);
  }

  const action = decision.external ? (
    <a className="cta cta-primary" href={decision.href} target="_blank" rel="noreferrer" onClick={() => remember("demo_clicked")}>
      {decision.cta}
    </a>
  ) : (
    <Link className="cta cta-primary" to={decision.href} onClick={() => {
      if (decision.href === "/kit") remember("kit_opened");
      if (decision.href === "/auth") remember("login_created");
    }}>
      {decision.cta}
    </Link>
  );

  function remember(type: "demo_clicked" | "kit_opened" | "login_created") {
    if (store.consent === "none") return;
    try {
      const events = recordEvent(store.events, store.consent, type, { content: store.context.content });
      const next = { ...store, events };
      window.localStorage.setItem(KEY, JSON.stringify(next));
      setStore(next);
    } catch {
      // The click still goes through.
    }
  }

  return (
    <aside className="relay-bar" aria-label="Next step for this visit">
      <style>{".relay-bar{margin:16px auto;max-width:1100px;padding:14px 16px;border:1px solid rgba(107,228,196,.35);border-radius:16px;background:#101a2b;display:grid;gap:8px}.relay-bar p{margin:0}.relay-links{color:#8ab4ff;font-size:13px}"}</style>
      <p>{decision.headline}</p>
      <div>{action}</div>
      <p className="fine-print">Demo funds only. Trading involves risk. Not financial advice. Referral code {REFERRAL}. Partner link {PARTNER}.</p>
      {store.consent === "none" ? (
        <button className="cta cta-ghost" type="button" onClick={grant}>Remember this visit so the next step matches</button>
      ) : (
        <p className="fine-print">Source {store.context.source} · {store.context.content || "no content id"} · {decision.creative}</p>
      )}
      <details className="relay-links">
        <summary>Campaign links for posts</summary>
        {campaignLinks.map(([label, href]) => (
          <div key={label}><a href={href}>{label}</a></div>
        ))}
      </details>
    </aside>
  );
}
