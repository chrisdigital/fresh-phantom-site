# Fresh Phantom — Marketing Site

Astro site deployed to Cloudflare Pages. Contact form powered by Resend.

## Stack

- **Astro** — static-first site generator with server-side API routes
- **Cloudflare Pages** — hosting + serverless functions
- **Resend** — transactional email for inquiry form submissions

## Project Structure

```
src/
├── layouts/Base.astro          HTML shell, global CSS import
├── pages/
│   ├── index.astro             Marketing landing page
│   └── api/contact.ts          Resend email endpoint (server-side)
├── components/                 Astro components (structure only)
│   ├── Nav.astro
│   ├── Hero.astro
│   ├── Services.astro
│   ├── Approach.astro
│   ├── Quote.astro
│   ├── Inquiry.astro
│   ├── Footer.astro
│   └── GhostLogo.astro
├── scripts/
│   └── inquiry_form.ts         Client-side form submission logic
└── styles/
    ├── global.css              Import chain entry point
    ├── base.css                Resets, box model, tokens
    ├── structure.css           Layout, grid, positioning
    ├── presentation.css        Typography, color, surfaces
    └── tokens/
        ├── colors.css
        ├── typography.css
        ├── spacing.css
        └── themes.css
public/
├── fonts/                      Custom typefaces (woff/woff2)
└── assets/                     Brand marks, mockups
```

## Separation of Concerns

- **Structure** — `.astro` components contain only semantic HTML markup
- **Function** — TypeScript in `src/scripts/` and `src/pages/api/`
- **Styling** — CSS in `src/styles/`, layered via `@import`:
  `base.css` → `structure.css` → `presentation.css`

No inline styles. No `<style>` blocks in components.

## Development

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # Production build → dist/
npm run preview      # Preview production build locally
```

## Environment Variables

Set these in the Cloudflare Pages dashboard (Settings → Environment variables):

| Variable           | Purpose                              |
|--------------------|--------------------------------------|
| `RESEND_API_KEY`   | Resend API key                       |
| `CONTACT_TO_EMAIL` | Email address receiving inquiries    |

For local development, create a `.dev.vars` file (git-ignored):

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
CONTACT_TO_EMAIL=hello@example.com
```

## Deployment

Connected to GitHub via Cloudflare Pages. Push to `main` triggers build.

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Framework preset:** Astro
