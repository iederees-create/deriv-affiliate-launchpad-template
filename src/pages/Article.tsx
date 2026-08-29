import { Link, Navigate, useParams } from "react-router-dom";
import { CTA, WhatsAppCTA } from "../components/CTA";
import { Seo } from "../components/Seo";
import { affiliateConfig } from "../config/affiliateConfig";
import { getArticle } from "../data/articles";
import { ArticleNarrator } from "../components/ArticleNarrator";

export function Article() {
  const { slug = "" } = useParams();
  const article = getArticle(slug);
  if (!article) return <Navigate to="/blog" replace />;

  return (
    <>
      <Seo
        title={article.title}
        description={article.description}
        path={`/blog/${article.slug}`}
        type="article"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: article.title,
          datePublished: article.date,
          author: { "@type": "Person", name: affiliateConfig.affiliateOwnerName },
          publisher: { "@type": "Organization", name: "NextGenWebs" }
        }}
      />
      <article className="article">
        <header className="article-header">
          <p className="eyebrow">{article.date}</p>
          <h1>{article.title}</h1>
          <p>{article.description}</p>
        </header>
        <ArticleNarrator title={article.title} description={article.description} sections={article.sections} />
        <div className="article-disclaimer">
          {affiliateConfig.disclosureText} {affiliateConfig.riskDisclaimer}
        </div>
        {article.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
        ))}
        <footer className="article-footer">
          <h2>Next step, if you want one</h2>
          <p>
            Use the tools, download the kit, or open a Deriv demo through my partner link. None of those actions is financial advice.
          </p>
          <div className="cta-row">
            <CTA href="/deriv-affiliate-launchpad-template/tools">Open the tools</CTA>
            <CTA href={affiliateConfig.demoAccountLink} variant="secondary">Open a Deriv demo</CTA>
            <WhatsAppCTA label="Ask a process question" />
          </div>
          <p><Link className="text-link" to="/blog">Back to all posts</Link></p>
        </footer>
      </article>
    </>
  );
}
