import { useEffect, useState } from "react";
import { Download, LockOpen } from "lucide-react";
import { CTA } from "../components/CTA";
import { DisclosureBand, SectionHeader } from "../components/Section";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";
import { isKitUnlocked, kitFiles, unlockKit } from "../lib/kit";

const publicKit = `${import.meta.env.BASE_URL}kit`;

export function Kit() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const sync = () => setUnlocked(isKitUnlocked());
    sync();
    window.addEventListener("ngw-kit-unlock", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ngw-kit-unlock", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <>
      <Seo
        title="Free Trading Kit | Journal, Demo Plan, Checklists"
        description="Download a 14-day demo plan, trade journal, pre-session checklist, and position-size worksheet. Educational files, not financial advice."
        path="/kit"
      />
      <section className="page-hero">
        <p className="eyebrow">Downloadable kit</p>
        <h1>Five files that are more useful than another “winning strategy” screenshot.</h1>
        <p>
          Open a Deriv demo through my partner link to unlock the downloads. That click is how I get paid if you later become a client. The files are planning aids, not a promise of profit.
        </p>
      </section>
      <DisclosureBand />
      <section className="section">
        <SectionHeader
          title={unlocked ? "Downloads are unlocked on this browser" : "Unlock the kit with a demo signup click"}
          text={unlocked
            ? "You already used the partner link on this browser. Download what you need, then come back to the calculators."
            : "The button below opens Deriv with my tracking link, then enables the PDF buttons here. I cannot see whether you finished signup. I am asking you to use the route if you want the pack."}
        />
        {!unlocked ? (
          <div className="cta-row">
            <CTA href={affiliateConfig.demoAccountLink}>Open Deriv demo and unlock</CTA>
            <button type="button" className="cta cta-ghost" onClick={() => { unlockKit(); setUnlocked(true); }}>
              <LockOpen size={18} aria-hidden="true" />
              <span>I already signed up through this page</span>
            </button>
          </div>
        ) : null}
      </section>
      <section className="section kit-grid">
        {kitFiles.map((item) => (
          <article className="kit-card" key={item.file}>
            <p className="eyebrow">{item.pages}</p>
            <h2>{item.title}</h2>
            <p>{item.text}</p>
            {unlocked ? (
              <a className="cta cta-secondary" href={`${publicKit}/${item.file}`} download>
                <Download size={18} aria-hidden="true" />
                <span>Download PDF</span>
              </a>
            ) : (
              <p className="muted">Unlock above to download.</p>
            )}
          </article>
        ))}
      </section>
    </>
  );
}
