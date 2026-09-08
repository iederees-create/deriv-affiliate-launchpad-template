import { Mail, MessageCircle } from "lucide-react";
import { CTA, WhatsAppCTA } from "../components/CTA";
import { SectionHeader } from "../components/Section";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";

export function Contact() {
  return (
    <>
      <Seo
        title={`Contact ${affiliateConfig.affiliateOwnerName}`}
        description="WhatsApp or email Iederees Francis about the Apex Trade Network Deriv partner desk."
        path="/contact"
      />
      <section className="page-hero">
        <p className="eyebrow">Iederees Francis</p>
        <h1>Ask a question. I cannot see your Deriv password.</h1>
        <p>Best for “I opened a demo” or “is this still practice money?” I will not tell you what to trade.</p>
      </section>
      <section className="section split contact-grid">
        <div className="panel">
          <MessageCircle aria-hidden="true" />
          <SectionHeader title="WhatsApp" text={affiliateConfig.whatsappNumber} />
          <WhatsAppCTA label="Message on WhatsApp" />
        </div>
        <div className="panel">
          <Mail aria-hidden="true" />
          <SectionHeader title="Email" text="For slower questions." />
          <CTA href={`mailto:${affiliateConfig.email}`} variant="secondary">{affiliateConfig.email}</CTA>
        </div>
      </section>
    </>
  );
}
