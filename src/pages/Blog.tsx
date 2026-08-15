import { Link } from "react-router-dom";
import { Calendar, Clock } from "lucide-react";
import { blogPosts } from "../data/blogPosts";
import { Seo } from "../components/Seo";

export function Blog() {
  return (
    <>
      <Seo
        title="Trading Guides & Strategies"
        description="Learn how to trade Synthetic Indices, Forex, and Crypto on Deriv. Read our latest guides and strategies."
        path="/blog"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Apex Trade Network Blog",
          url: "https://iederees-create.github.io/deriv-affiliate-launchpad-template/blog"
        }}
      />
      <section className="page-hero">
        <p className="eyebrow">Trading Strategies & Guides</p>
        <h1>Master the Markets with our Expert Insights.</h1>
        <p>Read our latest guides on trading synthetic indices, managing risk, and mastering the Deriv platforms.</p>
      </section>
      <section className="section blog-grid">
        {blogPosts.map((post) => (
          <article className="post-card" key={post.slug}>
            <p className="post-meta"><Calendar size={15} aria-hidden="true" /> {post.date} <Clock size={15} aria-hidden="true" /> {post.readTime}</p>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
            {post.slug === "winning-strategies-deriv-synthetic-indices" ? (
              <Link className="text-link" to={`/blog/${post.slug}`}>Read article</Link>
            ) : (
              <span className="muted">Coming soon</span>
            )}
          </article>
        ))}
      </section>
    </>
  );
}
