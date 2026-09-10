# Changelog — Fresh Phantom Marketing Site

All notable changes to this project are documented here.

## 2026-09-09 — Initial Build Session

### Added
- Astro project with @astrojs/cloudflare adapter, SSR mode
- Marketing landing page: Nav, Hero (centered), Services, Approach, Quote, Inquiry, Footer
- Design tokens ported from Fresh Phantom Design System (colors, typography, spacing, themes)
- CSS architecture: base.css → structure.css → presentation.css via @import chain
- Custom fonts: AyrBrickerBlack, CAMechano variants, Inter (Google Fonts)
- Contact form API endpoint (/api/contact) via Resend
- Resend config: msg.freshphantom.com domain, from no-reply@msg.freshphantom.com
- Two-email flow: internal notification to admin@freshphantom.com + submitter confirmation with 72-hour disclaimer
- Honeypot spam protection (client + server)
- Cloudflare Turnstile integration (widget, client validation, server siteverify)
- Per-field form validation with orange border error states and inline error messages
- Verify email, phone, and verify phone fields
- Middleware: naked domain → www.freshphantom.com (301 redirect)
- SEO meta tags: canonical URL, Open Graph, Twitter card
- Legal pages: Terms of Use, Privacy Policy, Legal (all noindexed)
- Prose page template for text-heavy pages
- Responsive breakpoints: 960px (tablet), 600px (mobile)
- Git repo initialized, pushed to github.com/chrisdigital/fresh-phantom-site (private)
- .gitignore excludes: Design System source, zip, .ai file, source images, reference markdown
- Project charter, changelog, session log, README

### Changed
- All font sizes converted from px to em/rem with 20% bump on small text
- Minimum font-size floor: 0.7em; label floor: 0.85em
- Straight quotes/apostrophes replaced with typographic entities throughout
- Hero layout changed from two-column grid to centered single-column
- Hero headline shortened: "Building at the seams of culture, love, and purpose."
- Brand name: "Fresh Phantom Labs" → "Fresh Phantom" throughout
- Service 02 title: "Branding" → "Creative Branding"
- Service titles use span blocks (not br tags) for responsive line breaking
- Inquiry heading: "Have something in mind?" → "Let this be the start of something awesome."
- Approach heading: "Our talents don’t fit neatly in one box, they are direct, client-focused, and tailored."
- Approach heading and quote section centered
- Form input borders use theme tokens for noir panel context
- Form field labels use letter-spacing: 0.1em (matching DS Input component)
- Nav CTA: adjusted line-height, padding; restricted to 50% width on mobile
- Pillar and explore link font sizes matched to eyebrow (0.85em)
- Service cards centered in mobile view
- Footer links updated from # to /terms, /privacy, /legal
- Nav logo links to / instead of #home
- Legal entity: DSGNR Unlimited, LLC dba Fresh Phantom (company section only)
- Copyright: ©2026 Fresh Phantom (no space after symbol)
- Confirmation email contact address: hello@freshphantom.com
- Named services removed from legal pages; replaced with "third-party providers"

### Attempted and Reverted
- Hero background image (headshot_2.png, coffee-cup2.png) — commented out, pending placement decision
