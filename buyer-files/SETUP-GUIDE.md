# Setup Guide

## Requirements

- Node.js 20 or newer recommended.
- npm.
- A static hosting account such as GitHub Pages, Netlify, Vercel, or Cloudflare Pages.

## Local Setup

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

The production files will be created in `dist`.

## GitHub Pages

This demo is configured for:

```text
https://iederees-create.github.io/deriv-affiliate-launchpad-template/
```

If you use a different repository name, update `base` in `vite.config.ts`, the sitemap URLs, and canonical URLs.
