# Jamel Salik — Developer Portfolio

A black + red, futuristic developer portfolio built with **Next.js 14 (App Router) + TypeScript**, **Tailwind CSS**, **Framer Motion**, **GSAP**, and **Three.js via React Three Fiber**. The entire site — profile, projects, skills, certificates, and social/resume links — is controlled from a protected **admin dashboard**, no code edits needed for day-to-day updates.

## ⚠️ Read this before you deploy: hosting

This is a **Node.js app**, not a static PHP site. **InfinityFree (and most free PHP hosts) cannot run it** — they only serve PHP/static files, with no Node.js runtime. Deploy to a Node-capable host instead:

- **[Vercel](https://vercel.com)** (made by the Next.js team, free tier, zero-config) — recommended.
- Render, Railway, or Fly.io also work if you want more control over the server.

## Getting started

```bash
npm install
cp .env.example .env.local
```

Generate your admin password hash and add it to `.env.local`:

```bash
node scripts/seed.mjs your-chosen-password
# paste the printed ADMIN_USERNAME and ADMIN_PASSWORD_HASH into .env.local
```

Also set `JWT_SECRET` in `.env.local` to any long random string.

```bash
npm run dev
```

Visit `http://localhost:3000` for the portfolio and `http://localhost:3000/admin` to log in to the dashboard.

### Heads up about `$` in `.env.local`

Next.js expands anything that looks like `$VARNAME` when it reads `.env` files — which would otherwise corrupt a bcrypt password hash, since those always start with `$2a$10$...`. `scripts/seed.mjs` already escapes this for you (it prints `\$2a\$10\$...`), so just paste its output as-is and don't "clean up" the backslashes.

## What's inside

```
src/
  app/
    page.tsx                    # assembles all homepage sections (force-dynamic: always reads fresh data)
    layout.tsx                   # fonts + global metadata
    globals.css                   # glassmorphism utilities, scrollbar, focus styles
    admin/page.tsx                 # login form
    admin/dashboard/                # protected CRUD dashboard (Profile, Projects, Skills, Certificates, Analytics)
    api/projects, api/certificates, api/skills, api/settings, api/auth, api/upload, api/contact
  components/
    Hero.tsx                      # animated name reveal + typing tagline + 3D background
    ParticleBackground.tsx          # Three.js / R3F particle field with pointer parallax
    ProfileCard.tsx                  # hanging ID card with lanyard, tilt, and flip — driven by admin settings
    ProjectsSection.tsx                # hand-of-cards "fan" layout + GSAP-animated detail modal
    SkillsSection.tsx                   # filterable skills grid with proficiency bars
    CertificatesSection.tsx               # filterable gallery + fullscreen lightbox
    ContactSection.tsx                     # form + admin-controlled social/resume links
    Button.tsx, Modal.tsx, Navbar.tsx, SmoothScroll.tsx   # reusable building blocks
  lib/
    db.ts       # storage layer — the only file you touch to swap databases
    auth.ts      # JWT helpers for the admin cookie
    mailer.ts     # Gmail SMTP sender for the contact form
  types/index.ts   # Project / Certificate / Skill / SiteSettings shapes shared everywhere
data/seed.json     # starter content (your real projects + skills, pre-filled)
```

## The "database"

Out of the box this runs on a **JSON file** (`data/db.json`, auto-created from `data/seed.json` on first run) so there's nothing to configure to try it locally. `src/lib/db.ts` is the single file that touches storage — every API route calls into it, so swapping to a real database means rewriting the functions in that one file, nothing else.

- **MongoDB**: `npm install mongoose`, connect once in a singleton, define schemas matching `src/types/index.ts`, swap each function for the matching Mongoose call.
- **MySQL** (closer to your usual PHP/MySQL stack): `npm install mysql2`, create a connection pool, mirror the types as tables, swap each function for the matching SQL query.

Comments inside `lib/db.ts` sketch out both paths.

## Admin dashboard — full site control

`/admin` to log in, `/admin/dashboard` once you're in. Five tabs:

- **Profile** — your name, role, "status" blurb on the ID card back, profile photo upload, GitHub/Facebook/email links, and resume (PDF) upload. Everything here flows straight into the Hero name, the ID card, and the Contact section links — no code edits.
- **Projects** — add/edit/delete, each with title, description, tech tags, GitHub link, **Visit site** link, a featured toggle, and an image upload. These render in the fan layout on the homepage.
- **Skills** — add/edit/delete, with a category (Language / Framework-Library / Database / Tool / Other) and a proficiency slider. These power both the Skills section and the "Stack" list on the back of your ID card.
- **Certificates** — same pattern as projects, with a category for the public filter.
- **Analytics** — simple counts: total projects, featured count, total skills, total certificates, certificates by category.

Auth is a signed JWT in an `httpOnly` cookie — every write route checks it server-side. The homepage and dashboard are both rendered fresh on every request (no static caching), so anything you change in the dashboard appears live immediately, including after deploying to Vercel — you never need to rebuild for a content change.

## The Projects "fan"

Project cards share one pivot point below the visible stack — rotating each card a few degrees around that shared point is literally how a hand fan works, so the arc comes for free. Clicking a card straightens it, lifts it forward with a red glow, and opens the GSAP-animated detail modal at the same time; the rest of the deck parts slightly to make room. Falls back to a tighter spread on small screens.

## Things to personalize before you ship this

- **Email & socials**: set these from `/admin/dashboard` → Profile tab (no code editing needed anymore).
- **Profile photo & resume**: upload both from the same Profile tab.
- **Seed content**: `data/seed.json` is pre-filled with your real projects (DropFile, TeamFreeNet, TechShop, StudyMate AI) and skills (PHP, MySQL, HTML, CSS, JavaScript, plus this site's own stack) using placeholder preview images — replace images via the dashboard once you have real screenshots, or add/edit everything fresh from there.

## Wiring up real email delivery (Gmail)

The contact form sends straight to your Gmail inbox via Gmail's own SMTP server, **and** still saves every message to `data/messages.json` as a backup in case email delivery ever fails.

1. Turn on 2-Step Verification on your Google account (required for App Passwords): `myaccount.google.com/security`
2. Go to `myaccount.google.com/apppasswords`, create a new App Password (name it anything, e.g. "Portfolio").
3. Google shows you a 16-character password — copy it.
4. Add to `.env.local`:
   ```
   GMAIL_USER=youraddress@gmail.com
   GMAIL_APP_PASSWORD=the16characterpassword
   ```
5. Restart `npm run dev`. Submissions now land in your inbox, reply-to set to whoever filled out the form.

If you skip this setup, the form still works — messages just go to `data/messages.json` instead of your inbox.

## Animation credits by section

- **Hero**: Framer Motion staggered letter reveal + custom typing-effect tagline, Three.js particle field with pointer parallax
- **Profile card**: Framer Motion spring-based pointer tilt, idle pendulum sway, and 3D flip
- **Projects fan**: spring-based fan-out/lift on click, GSAP timeline for the detail modal (scale + fade)
- **Skills bars**: Framer Motion width animation on scroll into view
- **Certificates lightbox**: Framer Motion `AnimatePresence` zoom
- **Scrolling**: Lenis smooth scroll (auto-disabled if the OS "reduce motion" setting is on)

## Notes on the sandbox build

Fonts (`Space Grotesk`, `Inter`, `JetBrains Mono`) load via `next/font/google`, which fetches font files **at build time** — this needs internet access during `npm run build`/`npm run dev`. That's normal on your machine or on Vercel. I verified the rest of the app (TypeScript, every route, login flow, full CRUD for projects/skills/certificates/settings, contact form, fan layout, the static-caching fix described below) compiles and runs correctly with the fonts swapped for system fonts in this restricted sandbox, then restored the real font imports for this deliverable.

**Static-caching fix:** Next.js will silently prerender any route or page that doesn't look "dynamic" to its build-time analysis — which would otherwise mean your homepage gets baked once at build time and admin dashboard edits never show up live, and the settings API would reject updates with a 405. Every API route and the homepage now explicitly export `dynamic = "force-dynamic"` so this can't happen.
