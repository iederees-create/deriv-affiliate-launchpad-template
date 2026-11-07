import { useState } from "react";
import { BookOpen, Mail, MessageCircle, Users, Megaphone, LayoutTemplate } from "lucide-react";
import { CTA } from "../components/CTA";
import { Card, SectionHeader } from "../components/Section";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";

const disclosure = "Independent partner desk, not Deriv. Trading involves risk. Not financial advice. Deriv sets and pays commissions; no income guaranteed.";

const captions = [
  {
    platform: "LinkedIn",
    text: `Running a trading community or education page? I've joined the Apex Trade Network partner desk. You get your own Deriv Partner Hub, and the desk shares Chart Select demo sessions and ready-made education posts. Demo funds only. No income promises. Details and link in my profile.\n\n${disclosure}`
  },
  {
    platform: "TikTok",
    text: `Teach trading? Build your own partner desk with ready-made demo content 📊 Link in bio for the live desk, or comment PARTNER and I'll send the link.\n\n${disclosure}`
  },
  {
    platform: "Instagram",
    text: `Watch a live Deriv DEMO desk, every trade posted, losses included. Want to share it with your audience as a partner? Link in bio. DM "PARTNER" for the kit.\n\n${disclosure}`
  }
];

function CopyCaption({ platform, text }: { platform: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <article className="card">
      <h3>{platform}</h3>
      <p style={{ whiteSpace: "pre-wrap" }}>{text}</p>
      <button
        type="button"
        className="cta cta-secondary"
        onClick={() => {
          navigator.clipboard?.writeText(text).then(() => setCopied(true)).catch(() => setCopied(false));
        }}
      >
        <span>{copied ? "Copied" : "Copy caption"}</span>
      </button>
    </article>
  );
}

export function Partners() {
  return (
    <>
      <Seo
        title={`Become a partner | ${affiliateConfig.brandName}`}
        description="Join the Apex Trade Network partner desk as a Deriv sub-partner. Your own Partner Hub, ready-made demo and education content. No income guarantees."
        path="/partners"
      />
      <section className="page-hero">
        <p className="eyebrow">Become a partner · Independent desk, not Deriv</p>
        <h1>Bring your audience. Use our demo desk and content.</h1>
        <p>
          For trading educators, creators and community owners who want to refer people to Deriv with honest, demo-first content.
          Deriv sets and pays partner commissions directly, at rates Deriv sets and can change. No income is guaranteed.
        </p>
        <div className="cta-row">
          <CTA href={affiliateConfig.masterPartnerLink}>Sign up as a partner</CTA>
          <a className="text-link" href={`mailto:${affiliateConfig.email}?subject=Apex%20partner%20question`}>Email {affiliateConfig.email}</a>
        </div>
        <p className="fine-print">Master Partner link {affiliateConfig.masterPartnerLink} · Partner code {affiliateConfig.masterPartnerCode}</p>
      </section>
      <section className="section">
        <SectionHeader eyebrow="Who it is for" title="People who already teach or gather traders" />
        <div className="card-grid">
          <Card icon={BookOpen} title="Trading educators">You run classes, mentorships or YouTube lessons and want a demo desk to point students to.</Card>
          <Card icon={Megaphone} title="Creators">You post on TikTok, Instagram, X or LinkedIn and want ready-made, compliant content.</Card>
          <Card icon={Users} title="Community owners">You run a Telegram, WhatsApp or Discord group for traders.</Card>
        </div>
      </section>
      <section className="section">
        <SectionHeader eyebrow="How it works" title="Four steps" />
        <div className="card-grid">
          <Card title="1. Sign up">Use the Master Partner link on this page (code {affiliateConfig.masterPartnerCode}).</Card>
          <Card title="2. Get your Partner Hub">Deriv gives you your own partner dashboard and your own referral links.</Card>
          <Card title="3. Share honestly">Point your audience to demo accounts first. Use the kit below.</Card>
          <Card title="4. Deriv pays you">Commissions are paid by Deriv directly, at rates Deriv sets and can change. No figures promised here.</Card>
        </div>
      </section>
      <section className="section">
        <SectionHeader eyebrow="What Apex provides" title="Support, not slogans" />
        <div className="card-grid">
          <Card icon={LayoutTemplate} title="Chart Select demo desk">A public, demo-funds-only live desk with a 24/7 live demo challenge and Sunday recaps you can share.</Card>
          <Card icon={Megaphone} title="Post templates">Ready-made captions and image ideas with disclosures built in.</Card>
          <Card icon={BookOpen} title="Launchpad + education">This site, the free kit, tools and lessons for your audience.</Card>
          <Card icon={MessageCircle} title="Telegram community">Access to the demo-updates Telegram group via the VIP area.</Card>
          <Card icon={Mail} title="Direct support">Email {affiliateConfig.email} with any question.</Card>
        </div>
      </section>
      <section className="section">
        <SectionHeader eyebrow="Partner kit" title="Three captions, ready to copy" text="Swap in your own referral link from your Partner Hub. Keep the disclosure line." />
        <div className="card-grid">
          {captions.map((c) => <CopyCaption key={c.platform} {...c} />)}
        </div>
        <div className="cta-row" style={{ marginTop: 24 }}>
          <CTA href={affiliateConfig.masterPartnerLink}>Become a partner</CTA>
          <CTA href="/deriv-affiliate-launchpad-template/weekly-challenge" variant="secondary">See the live demo challenge</CTA>
        </div>
      </section>
      <section className="disclosure-band" aria-label="Important disclosures">
        <strong>Important:</strong> {affiliateConfig.brandName} is an independent partner desk run by {affiliateConfig.affiliateOwnerName}, not Deriv and not an official Deriv website. Trading involves risk. Not financial advice. Demo funds only on the public desk. This desk may earn commission on signups made through its links. Partner commissions are set and paid by Deriv; no income or results are guaranteed.
      </section>
    </>
  );
}
