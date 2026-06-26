# TouchPilot Website

Marketing site for [TouchPilot](https://github.com/touchpilot/touchpilot), the
local-first Android AI agent runtime.

Built with [Astro](https://astro.build/) and [Tailwind CSS](https://tailwindcss.com/),
deployed to [Cloudflare Pages](https://pages.cloudflare.com/).

## Repository layout

```
.
├── astro.config.mjs        # Astro configuration
├── tailwind.config.mjs     # Tailwind theme (brand indigo, risk colors)
├── package.json
├── tsconfig.json
├── public/
│   └── favicon.svg
├── scripts/
│   └── import-skills.mjs   # Reads SKILL.md from sibling touchpilot repo,
│                           # writes src/data/skills.json
├── src/
│   ├── components/         # Hero, FeatureCard, SkillCard, RiskBadge, etc.
│   ├── layouts/
│   │   └── Base.astro      # HTML shell with theme + OG tags
│   ├── pages/              # /, /features, /skills, /install, /safety,
│   │                       #   /roadmap, /community
│   ├── data/
│   │   └── skills.json     # Generated at build time (gitignored)
│   └── styles/
│       └── global.css
└── .github/workflows/
    └── deploy.yml          # Cloudflare Pages deploy on push to main
```

## Local development

Requires Node.js 20+ and npm.

```bash
# 1. Install dependencies
npm install

# 2. Import skill data from the sibling touchpilot repo
TOUCHPILOT_REPO_DIR=../touchpilot npm run import-skills
# (defaults to ../touchpilot if env var not set)

# 3. Start the dev server with live reload
npm run dev
# -> open http://127.0.0.1:4321/
```

To do a one-shot build (matches CI):

```bash
TOUCHPILOT_REPO_DIR=../touchpilot npm run build
# -> output in ./dist
```

The skills import script reads from `TOUCHPILOT_REPO_DIR` (default `../touchpilot`).
If you don't have a sibling checkout, point it at any absolute path.

## Deployment

CI is configured in `.github/workflows/deploy.yml`:

- Triggered on push to `main` and on pull requests.
- Checks out `touchpilot/touchpilot` alongside this repo.
- Runs `npm ci`, the skill import, and `npm run build`.
- On push to `main`, publishes `./dist` to Cloudflare Pages.

### Required GitHub secrets

| Secret | Purpose |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Token with `Cloudflare Pages: Edit` permission. |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account id (found in the dashboard). |

Both are already set on `touchpilot/touchpilot-site`.

### Initial Cloudflare Pages setup (one-time)

1. Sign in at <https://dash.cloudflare.com/>.
2. Go to **Workers & Pages → Create application → Pages → Connect to Git**.
3. Select `touchpilot/touchpilot-site`.
4. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** *(leave empty)*
   - **Environment variables:** `NODE_VERSION=22`
5. Save and deploy.

After the first deploy, every push to `main` triggers the workflow which
publishes to the same Pages project.

### Custom domain (touchpilot.dev)

When you own `touchpilot.dev`:

1. In Cloudflare Pages → project → **Custom domains**, add `touchpilot.dev`.
2. In Cloudflare DNS, ensure `touchpilot.dev` has a CNAME (or ANAME) to the
   Pages project.
3. Repeat for any subdomains (e.g. `docs.touchpilot.dev`).

## License

Source code: MIT (same as TouchPilot). Branding and screenshots: see LICENSE
in the product repo if you add any.