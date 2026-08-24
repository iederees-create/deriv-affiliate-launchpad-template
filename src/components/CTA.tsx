import { ArrowRight, MessageCircle } from "lucide-react";
import { affiliateConfig } from "../config/affiliateConfig";
import { isAffiliateHref, unlockKit } from "../lib/kit";

type CTAProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  whatsapp?: boolean;
};

export function CTA({ href, children, variant = "primary", whatsapp = false }: CTAProps) {
  const affiliate = isAffiliateHref(href);
  const internal = href.startsWith("/") && !href.startsWith("//");
  return (
    <a
      className={`cta cta-${variant}`}
      href={href}
      target={internal ? undefined : "_blank"}
      rel={internal ? undefined : "noreferrer"}
      onClick={() => {
        if (affiliate) unlockKit();
      }}
    >
      {whatsapp ? <MessageCircle size={18} aria-hidden="true" /> : null}
      <span>{children}</span>
      {!whatsapp ? <ArrowRight size={18} aria-hidden="true" /> : null}
    </a>
  );
}

export function WhatsAppCTA({ label = "Message on WhatsApp" }: { label?: string }) {
  const clean = affiliateConfig.whatsappNumber.replace(/[^\d]/g, "");
  return <CTA href={`https://wa.me/${clean}`} whatsapp>{label}</CTA>;
}
