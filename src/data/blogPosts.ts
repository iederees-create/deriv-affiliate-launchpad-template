export type BlogPost = {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  readTime: string;
};

export const blogPosts: BlogPost[] = [
  {
    title: "5 Winning Strategies for Trading Deriv Synthetic Indices",
    slug: "winning-strategies-deriv-synthetic-indices",
    excerpt:
      "Master the 24/7 synthetic markets with these 5 proven strategies, designed for volatility and crash/boom indices.",
    date: "2026-08-15",
    readTime: "8 min read"
  },
  {
    title: "Deriv vs Traditional Forex Brokers: Which is Better?",
    slug: "deriv-vs-traditional-forex-brokers",
    excerpt:
      "An honest comparison of Deriv's platforms, leverage, and synthetics against traditional MT4/MT5 forex brokers.",
    date: "2026-08-10",
    readTime: "6 min read"
  },
  {
    title: "How to Manage Risk When Trading Crash and Boom",
    slug: "risk-management-crash-boom-indices",
    excerpt:
      "Crash and Boom indices are unique to Deriv. Learn how to protect your capital from sudden market spikes.",
    date: "2026-08-05",
    readTime: "5 min read"
  },
  {
    title: "A Beginner's Guide to Using Deriv MT5 (DMT5)",
    slug: "beginners-guide-deriv-mt5",
    excerpt:
      "Step-by-step instructions on setting up your Deriv MT5 account, adding indicators, and placing your first trade.",
    date: "2026-08-01",
    readTime: "10 min read"
  }
];
