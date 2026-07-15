import { Mail, MessageCircle } from "lucide-react";
import { CTA, WhatsAppCTA } from "../components/CTA";
import { SectionHeader } from "../components/Section";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";

export function Contact() {
  return (
    <>
      <Seo
        title="Contact the Affiliate Owner"
        description="Editable WhatsApp and email contact page for a trading affiliate website template."
        path="/contact"
      />
      <section className="page-hero">
        <p className="eyebrow">Lead capture</p>
        <h1>Route warm prospects into a simple follow-up workflow.</h1>
        <p>Update the WhatsApp number and email in the config file before publishing your rebranded website.</p>
      </section>
      <section className="section split contact-grid">
        <div className="panel">
          <MessageCircle aria-hidden="true" />
          <SectionHeader title="WhatsApp CTA" text="Best for creators and IBs who close questions through chat." />
          <WhatsAppCTA />
        </div>
        <div className="panel">
          <Mail aria-hidden="true" />
          <SectionHeader title="Email fallback" text="Use email for buyers, compliance questions, and partner enquiries." />
          <CTA href={`mailto:${affiliateConfig.email}`} variant="secondary">{affiliateConfig.email}</CTA>
        </div>
      </section>
    </>
  );
}
