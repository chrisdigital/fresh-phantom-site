# Session Log — Fresh Phantom Marketing Site

## Session 1 — 2026-09-09

### Participants
- Chris Carvey (project owner)
- Cline (AI coding agent)

### Summary

Initial build of the Fresh Phantom marketing site from the Fresh Phantom Design System export. Full session from zero to deployed site.

### What was built
- Complete Astro project scaffolded from Design System template (MarketingSite.dc.html)
- CSS architecture established: separation of concerns (structure/function/styling), no inline styles
- All design tokens ported (colors, typography, spacing, themes, fonts)
- Contact form with three-layer protection (honeypot, Turnstile, per-field validation)
- Two-email flow via Resend (internal + submitter confirmation)
- Legal pages (Terms, Privacy, Legal) with prose template
- Middleware for naked domain redirect
- SEO meta tags
- Responsive breakpoints
- Git repo initialized and pushed to GitHub

### Decisions made
- Astro over static HTML — needed server-side API route for Resend + Turnstile verification
- No React — original DS template used client-side React/Babel; converted to native Astro components
- Centered hero — original two-column grid replaced with centered layout per owner direction
- em/rem typography — all px font sizes converted to relative units; 0.7em floor, 0.85em label floor
- Brand name — "Fresh Phantom Labs" dropped to "Fresh Phantom" throughout
- Legal entity — DSGNR Unlimited, LLC dba Fresh Phantom; details only on legal page
- No named services in legal — replaced with "third-party providers"
- Form contact references — point to inquiry form, not email addresses
- noindex on legal pages — Terms, Privacy, Legal excluded from search indexing
- Service title line breaks — span blocks (display: block/inline) instead of br tags

### Copy edits during session
- Hero: "Building at the seams of culture, love, and purpose."
- Services heading: "Three ways we move ideas forward with active imagination."
- Product Development: "Early concept to working product. We shape the idea, the experience, prototype, and remove ambiguity for results."
- Technology Consulting: "Clear thinking without the theater. We help choose the technical tools, architecture, and best workflows."
- Approach: "Our talents don’t fit neatly in one box, they are direct, client-focused, and tailored."
- Inquiry: "Let this be the start of something awesome."
- Quote: unchanged from DS template

### Open items carried forward
- OG image (public/assets/og-default.png, 1200×630) — not yet created
- Hero background image — attempted headshot and coffee cup; both commented out
- 404 page — not created
- Mobile hamburger nav — not needed yet
- Favicon sizes beyond SVG
- Site icon swap — owner indicated a change is coming

### Hard-won lessons
1. Don’t deviate from the source template without being asked — multiple corrections needed where form styling, content, and structure diverged from the DS export.
2. px font sizes are not acceptable — all typography must be relative to the 1em base.
3. Separation of concerns means separation — no inline styles, no style blocks in components.
4. br tags for layout are fragile — replaced with span blocks toggled via CSS display property.
5. Don’t reveal infrastructure in legal copy — hosting and email service names replaced with "third-party providers."

### Related documents
- [README](./README.md)
- [Project Charter](./fresh_phantom_project_charter.md)
- [Changelog](./changelog.md)
