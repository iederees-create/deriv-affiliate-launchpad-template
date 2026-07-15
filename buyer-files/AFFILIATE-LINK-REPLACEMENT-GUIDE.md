# Affiliate Link Replacement Guide

All public CTA routes should be replaced in:

```text
src/config/affiliateConfig.ts
```

Replace:

- `primaryAffiliateLink`
- `demoAccountLink`
- `liveAccountLink`
- `partnerProgrammeLink`
- `whatsappNumber`
- `email`
- `socialLinks`

Use placeholder links during editing only. Before publishing, click every CTA and confirm it routes to the correct affiliate destination.

Do not add private affiliate links directly inside page components unless you intentionally want to manage them manually.
