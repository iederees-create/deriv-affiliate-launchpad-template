import { ArrowRight, MessageCircle } from "lucide-react";
import { affiliateConfig } from "../config/affiliateConfig";

type CTAProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  whatsapp?: boolean;
};

export function CTA({ href, children, variant = "primary", whatsapp = false }: CTAProps) {
  return (
    <a className={`cta cta-${variant}`} href={href} target="_blank" rel="noreferrer">
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
