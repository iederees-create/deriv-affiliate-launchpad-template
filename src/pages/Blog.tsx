import { Link } from "react-router-dom";
import { Calendar, Clock } from "lucide-react";
import { blogPosts } from "../data/blogPosts";
import { Seo } from "../components/Seo";

export function Blog() {
  return (
    <>
      <Seo
        title="Trading Affiliate Blog Template"
        description="SEO-ready blog index for broker affiliates, introducing brokers, finance creators, and trading partner programme promoters."
        path="/blog"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Trading Affiliate Website Template Blog",
          url: "https://iederees-create.github.io/deriv-affiliate-launchpad-template/blog"
        }}
      />
      <section className="page-hero">
        <p className="eyebrow">SEO blog structure</p>
        <h1>Educational content that supports trust before conversion.</h1>
        <p>Use the blog to answer search questions, disclose the commercial relationship, and route informed visitors to configured affiliate links.</p>
      </section>
      <section className="section blog-grid">
        {blogPosts.map((post) => (
          <article className="post-card" key={post.slug}>
            <p className="post-meta"><Calendar size={15} aria-hidden="true" /> {post.date} <Clock size={15} aria-hidden="true" /> {post.readTime}</p>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
            {post.slug === "building-a-trading-affiliate-website" ? (
              <Link className="text-link" to={`/blog/${post.slug}`}>Read article</Link>
            ) : (
              <span className="muted">Demo post placeholder</span>
            )}
          </article>
        ))}
      </section>
    </>
  );
}
