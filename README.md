# Fresh Phantom — Marketing Site

**Domain:** www.freshphantom.com
**Repo:** github.com/chrisdigital/fresh-phantom-site (private)
**Operator:** DSGNR Unlimited, LLC dba Fresh Phantom

Marketing site for Fresh Phantom. Astro SSR on Cloudflare Pages. Contact form with Resend email delivery, Cloudflare Turnstile verification, honeypot spam protection, and per-field validation.

## Related Documents

- [Project Charter](./fresh_phantom_project_charter.md)
- [Changelog](./changelog.md)
- [Session Log](./session_log.md)

## Stack

- **Astro** — static-first site generator with server-side API routes
- **Cloudflare Pages** — hosting, serverless functions, Turnstile bot protection
- **Resend** — transactional email (inquiry notification + submitter confirmation)

## Project Structure

```
src/
├── layouts/Base.astro            HTML shell, global CSS, SEO meta, Turnstile script
├── middleware.ts                  Naked domain → www redirect (301)
├── pages/
│   ├── index.astro               Marketing landing page
│   ├── terms.astro               Terms of Use (noindex)
│   ├── privacy.astro             Privacy Policy (noindex)
│   ├── legal.astro               Legal notice (noindex)
│   └── api/contact.ts            Resend + Turnstile endpoint (server-side)
├── components/                   Astro components (structure only — no inline styles)
│   ├── Nav.astro
│   ├── Hero.astro
│   ├── Services.astro
│   ├── Approach.astro
│   ├── Quote.astro
│   ├── Inquiry.astro
│   ├── Footer.astro
│   └── GhostLogo.astro
├── scripts/
│   └── inquiry_form.ts           Client-side form validation + submission
└── styles/
    ├── global.css                Import chain entry point
    ├── base.css                  Resets, box model, tokens
    ├── structure.css             Layout, grid, positioning, responsive breakpoints
    ├── presentation.css          Typography, color, surfaces
    └── tokens/
        ├── colors.css
        ├── typography.css
        ├── spacing.css
        └── themes.css
public/
├── fonts/                        Custom typefaces (woff/woff2)
└── assets/                       Brand marks, images
```

## Separation of Concerns

- **Structure** — `.astro` components contain only semantic HTML markup
- **Function** — TypeScript in `src/scripts/` and `src/pages/api/`
- **Styling** — CSS in `src/styles/`, layered via `@import`: `base.css` → `structure.css` → `presentation.css`

No inline styles. No `<style>` blocks in components.

## CSS Architecture

All font sizes use `em` (relative to body) or `rem` (headings in `clamp()`). No `px` font sizes.

- **Minimum text:** 0.7em
- **Label floor:** 0.85em
- **Responsive breakpoints:** 960px (tablet), 600px (mobile)

## Form Protection Layers

1. **Honeypot** — hidden `website` field; if filled, fakes success silently (client + server)
2. **Cloudflare Turnstile** — widget challenge before submit; token verified server-side via siteverify API
3. **Per-field validation** — required fields, email match, phone match; orange border + inline error messages
4. **Server-side validation** — required field checks, Turnstile token verification; fail-closed on all gates

## Email Flow

On successful submission, two emails send via Resend (`no-reply@msg.freshphantom.com`):

1. **Internal notification** → `admin@freshphantom.com` with full submission data, reply-to set to submitter
2. **Submitter confirmation** → submitter's email, addressed by name, with copy of input and 72-hour response disclaimer

## Development

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # Production build → dist/
npm run preview      # Preview production build locally
```

## Environment Variables

Set in Cloudflare Pages dashboard (Settings → Environment variables):

| Variable              | Purpose                              |
|-----------------------|--------------------------------------|
| `RESEND_API_KEY`      | Resend API key                       |
| `CONTACT_TO_EMAIL`    | Email address receiving inquiries    |
| `TURNSTILE_SITE_KEY`  | Cloudflare Turnstile widget site key |
| `TURNSTILE_SECRET_KEY`| Cloudflare Turnstile secret key      |

For local development, create a `.dev.vars` file (git-ignored).

## Deployment

Connected to GitHub via Cloudflare Pages. Push to `main` triggers build.

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Framework preset:** Astro
- **Naked domain redirect:** handled by middleware.ts (301 → www)

## Open Items

- **OG image** — `public/assets/og-default.png` (1200×630) needed; meta tags are wired but image file does not exist yet
- **Hero background image** — commented out in Hero.astro; CSS rules for `.hero__bg` remain in place
- **Favicon** — currently uses ghost mark SVG; may need additional sizes
- **404 page** — not yet created; currently serves Cloudflare/Astro default
- **Mobile nav** — links hidden at ≤600px; hamburger menu needed if pages expand beyond legal trio
