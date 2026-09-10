# Project Charter: Fresh Phantom Marketing Site

## 1. Project Summary

**freshphantom.com** is the public marketing site for Fresh Phantom, operated by DSGNR Unlimited, LLC. The site presents services, brand positioning, and a contact inquiry form.

Built with Astro, deployed to Cloudflare Pages, using Resend for transactional email and Cloudflare Turnstile for bot protection.

Repository: github.com/chrisdigital/fresh-phantom-site (private)

## 2. Core Problem

Fresh Phantom needs a public web presence that:

- Communicates services (product development, creative branding, technology consulting) clearly
- Reflects the brand design system (typography, color, voice) without compromise
- Provides a secure, functional contact form with spam protection
- Deploys with minimal infrastructure overhead
- Is maintainable by a solo developer/designer

## 3. Desired Outcome

A visitor should be able to:

- Understand what Fresh Phantom does and how it works
- Submit an inquiry through a validated, protected form
- Receive an immediate confirmation email with a copy of their submission
- View terms, privacy, and legal pages

The site owner should:

- Receive inquiry notifications at admin@freshphantom.com with reply-to set to the submitter
- Update content and deploy via git push
- Not need to manage servers, databases, or session state

## 4. Guiding Principles

- **Separation of concerns** — structure (HTML), function (JS/TS), styling (CSS) in separate files; no inline styles, no scoped style blocks
- **Design system fidelity** — all visual decisions trace to Fresh Phantom Design System tokens
- **Relative typography** — all font sizes in em/rem; no px; minimum floor 0.7em, label floor 0.85em
- **Fail-closed security** — form requires valid Turnstile token; honeypot present; server validates before sending
- **Progressive CSS** — base → structure → presentation via @import chain
- **Simplest solution** — static HTML where possible, server-side only for the API endpoint

## 5. Primary Users

### Visitor

A potential client, collaborator, or curious person evaluating Fresh Phantom for product development, branding, or technology consulting work.

### Site Owner

A solo developer/designer who maintains the site, reviews inquiry submissions, and updates content.

## 6. Scope

### Included

- Single-page marketing site (Nav, Hero, Services, Approach, Quote, Inquiry, Footer)
- Contact form with honeypot, Turnstile, per-field validation, email/phone verification
- Two-email flow: internal notification + submitter confirmation with 72-hour disclaimer
- Legal pages: Terms of Use, Privacy Policy, Legal (noindexed)
- Naked domain → www redirect (301 via middleware)
- SEO meta tags (Open Graph, Twitter card, canonical URL)
- Responsive breakpoints (960px tablet, 600px mobile)
- Design tokens ported from Fresh Phantom Design System

### Excluded

- CMS or admin dashboard
- User accounts or authentication
- Blog or dynamic content
- E-commerce or payment processing
- Analytics beyond Cloudflare defaults

## 7. Technical Architecture

### Stack

| Layer | Technology |
|---|---|
| Framework | Astro (SSR mode) |
| Hosting | Cloudflare Pages |
| Email | Resend (transactional) |
| Bot protection | Cloudflare Turnstile |
| DNS/CDN | Cloudflare |
| Repository | GitHub (private) |

### CSS Architecture

Layered via @import in load order:

1. base.css — resets, box model, imports design tokens
2. structure.css — layout, grid, positioning, responsive breakpoints
3. presentation.css — typography, color, surfaces, borders

### Server-Side

Single API endpoint: `POST /api/contact`

Request flow:

```
Form submit
  → Client-side validation (required fields, email match, phone match)
  → Honeypot check (client: fake success; server: silent 200)
  → Turnstile token check (client: error if missing; server: siteverify API)
  → Server field validation
  → Resend: internal notification email
  → Resend: submitter confirmation email
  → 200 response
```

### Environment Variables

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Resend API key |
| `CONTACT_TO_EMAIL` | Recipient for inquiry notifications |
| `TURNSTILE_SITE_KEY` | Turnstile widget key (public, build time) |
| `TURNSTILE_SECRET_KEY` | Turnstile secret key (server-side only) |

### Email Configuration

- Sending domain: msg.freshphantom.com
- From address: no-reply@msg.freshphantom.com
- Internal notifications to: admin@freshphantom.com
- Submitter confirmation contact reference: hello@freshphantom.com

## 8. Design System

Tokens ported from Fresh Phantom Design System export, in `src/styles/tokens/`:

- **Colors** — Phantom Black, Ghost White, Concrete, Volt, Signal Orange, Deep Teal, Warm White
- **Themes** — Phantom Noir (dark), Concrete Field (light), Deep Field (teal), Signal (orange)
- **Typography** — Inter (body/display), AyrBrickerBlack (editorial), CAMechano variants (mechanical labels)
- **Spacing** — 4px base unit system
- **Radii** — hard edges default, pill for controls

Inquiry form panel uses `data-theme="noir"` (dark). Rest of site uses `data-theme="field"` (light).

## 9. Risks and Mitigations

### Risk: Turnstile widget fails to load

Mitigation: client checks for token before submit; shows error. Server rejects without valid token (fail-closed).

### Risk: Resend delivery failure

Mitigation: internal email sends first; failure returns error. Confirmation email failure is logged but does not fail request.

### Risk: Spam bypasses honeypot

Mitigation: Turnstile is the primary gate. Honeypot is supplementary. Both check client and server.

### Risk: OG image missing

Status: meta tags wired; file does not exist yet. Social shares have no preview image until added.

## 10. Open Items

- OG image (1200×630) for social sharing
- Hero background image — commented out, pending placement decision
- 404 page
- Mobile hamburger nav (if pages expand)
- Favicon additional sizes beyond SVG

## 11. Related Documents

- [README](./README.md)
- [Changelog](./changelog.md)
- [Session Log](./session_log.md)
