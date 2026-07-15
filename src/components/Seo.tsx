import { useEffect } from "react";

const baseUrl = "https://iederees-create.github.io/deriv-affiliate-launchpad-template";

type SeoProps = {
  title: string;
  description: string;
  path?: string;
  type?: "website" | "article";
  jsonLd?: Record<string, unknown>;
};

function setMeta(name: string, content: string, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement("meta");
    if (property) tag.setAttribute("property", name);
    else tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

export function Seo({ title, description, path = "/", type = "website", jsonLd }: SeoProps) {
  useEffect(() => {
    const canonicalUrl = `${baseUrl}${path === "/" ? "/" : path}`;
    document.title = title;
    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", type, true);
    setMeta("og:url", canonicalUrl, true);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    const id = "route-json-ld";
    document.getElementById(id)?.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [description, jsonLd, path, title, type]);

  return null;
}
