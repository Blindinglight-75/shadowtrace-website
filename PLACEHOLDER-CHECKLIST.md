# ShadowTrace Website Placeholder Checklist

This document lists all placeholder content that needs to be replaced with real information before the website goes live.

---

## Critical (Must Replace Before Launch)

### Company Information

| Location | Placeholder | Replacement Needed |
|----------|-------------|-------------------|
| `about.html` | `[Name]` (CEO) | Actual CEO name and bio |
| `about.html` | `[Name]` (CTO) | Actual CTO name and bio |
| `about.html` | `[Name]` (Head of Product) | Actual name and bio |
| All pages | `hello@shadowtrace.com` | Verified working email address |
| All pages | `publicsector@shadowtrace.com` | Verified working email or remove |
| All pages | `security@shadowtrace.com` | Verified working email |
| All pages | `careers@shadowtrace.com` | Verified working email or remove |

### Legal & Compliance

| Location | Placeholder | Replacement Needed |
|----------|-------------|-------------------|
| All footers | Privacy Policy link (`#`) | Actual privacy policy URL |
| All footers | Terms of Service link (`#`) | Actual terms URL |
| All footers | Security link (`#`) | Actual security page URL |
| `contact.html` | Privacy Policy link (`#`) in form | Actual privacy policy URL |
| All footers | "SOC 2 Type II Certified" | Verify certification is obtained |
| All footers | "ISO 27001" | Verify certification is obtained |

### Pricing

| Location | Placeholder | Replacement Needed |
|----------|-------------|-------------------|
| `pricing.html` | Starter tier pricing ("Contact for pricing") | Actual pricing or "From X/month" |
| `pricing.html` | Professional tier pricing ("Contact for pricing") | Actual pricing |
| `pricing.html` | All feature inclusions/limits | Verify accuracy with product team |

---

## High Priority (Replace Before Major Marketing)

### Testimonials

| Location | Placeholder | Replacement Needed |
|----------|-------------|-------------------|
| `index.html` | "Head of Financial Crime, UK Law Enforcement Agency" | Real quote with attribution (or verified anonymised role) |
| `index.html` | "Director of Compliance, Global Bank" | Real quote with attribution |
| `index.html` | "Chief Risk Officer, Digital Asset Exchange" | Real quote with attribution |

### Statistics & Metrics

| Location | Placeholder | Replacement Needed |
|----------|-------------|-------------------|
| `index.html` | "18B+" transactions indexed | Verify current accurate number |
| `index.html` | "<2s" alert latency | Verify current SLA |
| `index.html` | "99.9%" uptime | Verify SLA commitment |
| `index.html` | "50+" organisations | Verify customer count |

### Supported Chains

| Location | Placeholder | Replacement Needed |
|----------|-------------|-------------------|
| `index.html` | Bitcoin, Ethereum, Polygon, BNB Chain, Tron | Verify complete and accurate chain list |
| `platform.html` | "15 blockchains" reference | Verify count matches actual supported chains |

---

## Medium Priority (Replace When Available)

### Resources/Downloads

| Location | Placeholder | Replacement Needed |
|----------|-------------|-------------------|
| `resources.html` | "The Investigator's Guide to Blockchain Tracing" | Actual PDF or remove |
| `resources.html` | "Crypto AML Compliance Checklist" | Actual PDF or remove |
| `resources.html` | "Ransomware Payment Trends 2025" | Actual report or remove |
| `resources.html` | "SAR Documentation Template" | Actual template or remove |
| `resources.html` | Download links (`#`) | Actual file URLs |

### Blog Posts

| Location | Placeholder | Replacement Needed |
|----------|-------------|-------------------|
| `resources.html` | "Understanding Chain-Hopping..." | Actual blog post URL or remove |
| `resources.html` | "Travel Rule Implementation..." | Actual blog post URL or remove |
| `resources.html` | "Pig Butchering Scams..." | Actual blog post URL or remove |
| `resources.html` | "View All Posts" link | Actual blog index URL |

### Webinars

| Location | Placeholder | Replacement Needed |
|----------|-------------|-------------------|
| `resources.html` | Feb 15 webinar | Real event details or remove |
| `resources.html` | Feb 28 webinar | Real event details or remove |
| `resources.html` | Registration links (`#`) | Actual registration URLs |

---

## Lower Priority (Enhancement Items)

### Images & Media

| Location | Placeholder | Replacement Needed |
|----------|-------------|-------------------|
| `resources.html` | Blog post images (gradient placeholders) | Actual featured images |
| `about.html` | Leadership photos (icon placeholders) | Actual headshots |

### API Documentation

| Location | Placeholder | Replacement Needed |
|----------|-------------|-------------------|
| All footers | "API Documentation" link (`#`) | Actual docs URL |
| `platform.html` | API example code | Verify accuracy with engineering |

### External Links

| Location | Placeholder | Replacement Needed |
|----------|-------------|-------------------|
| Navigation | Login/Sign In | Actual app URL (currently `login.html`) |
| All CTAs | "Request Demo" | Verify contact form is functional |

---

## Form Functionality

The following forms need backend implementation:

| Location | Form | Backend Needed |
|----------|------|----------------|
| `contact.html` | Demo request form | Form submission handler |
| `resources.html` | Newsletter signup | Email service integration |
| `login.html` | Login form | Authentication backend |

---

## Technical Verification

Before launch, verify:

- [ ] All email addresses work and route correctly
- [ ] Forms submit successfully (or show appropriate messaging)
- [ ] All internal links work (no broken links)
- [ ] Logo file (`assets/ShadowTraceLogo.svg`) exists and displays correctly
- [ ] Site works on mobile devices
- [ ] Meta descriptions are indexed correctly
- [ ] Canonical URLs point to production domain

---

## Notes

- Statistics (transactions indexed, organisations, etc.) should be updated quarterly
- Testimonials require written consent from the quoted individuals/organisations
- Certifications (SOC 2, ISO 27001) should only be claimed if current and valid
- Pricing should be reviewed by commercial team before publishing

---

*Last updated: January 2026*
