# Maintaining the FernandesLAB website

Notes for maintainers and AI assistants editing this site. Clean, static HTML for the
Fernandes Lab (University of Arkansas Division of Agriculture) — no build step, no
frameworks, just HTML + one CSS file. Designed to be edited by hand or with an AI assistant.

## Files

```
├── index.html          Home (hero + intro + themes + news + stats)
├── about.html          Mission, vision & goals
├── our-team.html       Team: open positions, PI, postdocs, PhD, master students, interns, alumni
├── teaching.html       Courses taught + mentoring
├── projects.html       Funded grants + software/tools + study systems (crops)
├── publications.html   Citation metrics + recent publications
├── contact.html        Contact details only (no form)
├── 404.html            Not-found page
├── CNAME               Custom domain (fernandeslab.org) — used by GitHub Pages
├── .nojekyll           Tells GitHub Pages to serve files as-is
├── .github/workflows/  Scheduled Google Scholar → publications.json updater
├── scripts/            update_publications.py (Scholar fetcher)
└── assets/
    ├── css/style.css   ALL styling (dark theme). Colors live in the :root block at the top.
    ├── js/main.js      Mobile menu toggle, theme toggle, scroll reveal, sticky-header shadow
    ├── img/            logo.svg, ai-net.svg (hero motif), news/crop images, placeholders
    ├── publications.json  Publications data rendered by publications.html (auto-updated)
    └── team/           Team member photos (filename = first name)
```

The site uses a **dark theme** by default with a **light/dark toggle** in the header
(the sun/moon button). The choice is saved per-visitor in `localStorage`, and an inline
script in each page's `<head>` applies it before paint so there's no flash. Re-skin
either theme by editing the `:root` palette (dark) and the `:root[data-theme="light"]`
block (light) in `assets/css/style.css`. The brand mark is `assets/img/logo.svg`, and the
faint neural-network motif behind the hero/banners is `assets/img/ai-net.svg`.

## Editing common things

**Colors / theme** — edit the `:root` variables at the top of `assets/css/style.css`.
Change them once and the whole site updates.

**Add or edit a team member** — open `our-team.html`, copy an existing
`<article class="person">` (or `<article class="card">` for the grid sections),
and update the text. Put their photo in `assets/team/` and point the `src` at it.
If a photo is missing, a placeholder silhouette shows automatically.

**Add a publication** — in `publications.html`, copy a `<div class="pub">` block and set
the title `href` to the paper's DOI/URL and update the authors line. (Usually unnecessary —
the list auto-updates from Google Scholar; see below.)

**Add a grant** — in `projects.html`, copy a `<div class="grant">` block and update the
title, source, names, amount, and years.

**Add a news item** — in `index.html`, copy a `<article class="news-item">` block in the
"Latest news" section.

**Hero background image** — drop a file at `assets/img/hero-bg.jpg`, then in
`index.html` change `<section class="hero">` to
`<section class="hero" style="--hero:url('assets/img/hero-bg.jpg')">`.
(The interior page banners use the same `--hero` variable if you want to set it there too.)

**Contact page** — shows contact details only (no form). The email is written as
`samuelbf [at] uark [dot] edu` (no `mailto:` link) to deter scrapers; edit the text in
`contact.html` and the footer of each page if it changes.

**Open positions** — listed in the "Open positions" section of `our-team.html`
(`#openings`). Copy the `<div class="grant feature-grant">` block to add a posting and set
the "View & apply" link; delete the block when a position closes.

**Clean URLs** — internal links omit the `.html` extension (e.g. `/teaching`); GitHub
Pages serves the file automatically. Keep new links extension-less and root-absolute
(`/page`).

### Images still needed (placeholders show until added)
- `assets/img/hero-bg.jpg` — homepage / banner background (optional)
- `assets/img/news-carlos-sisg.jpg`, `assets/img/news-igor-contest.jpg`
- `assets/img/gallery-soybean.jpg`, `assets/img/gallery-rice.jpg`, `assets/img/gallery-maize.jpg`

## Auto-updating publications from Google Scholar

The **Publications** page renders its list from `assets/publications.json`, and a
scheduled GitHub Action keeps that file in sync with Google Scholar — so new papers
appear without editing HTML. If the JSON is ever missing, the page falls back to the
hand-written list baked into `publications.html`.

- **Workflow:** `.github/workflows/update-publications.yml` runs every Monday (and on
  demand via *Actions → Update publications from Google Scholar → Run workflow*). It runs
  `scripts/update_publications.py`, then commits `assets/publications.json` if it changed.
- **Reliability — set a free key (recommended):** Google Scholar blocks scrapers, so add a
  repo secret named `SERPAPI_KEY` (*Settings → Secrets and variables → Actions*). Get a free
  key at https://serpapi.com/ (~100 searches/month, far more than a weekly run needs). With
  it, updates are dependable. **Without** the key the script falls back to the `scholarly`
  package, which Google often rate-limits; if a run fails, nothing is committed and the page
  keeps the last good list.
- **Change author / count:** edit `SCHOLAR_ID` (currently `aR0shJYAAAAJ`) or `MAX_PUBS`
  in the workflow's env, or run locally:
  ```bash
  pip install scholarly requests
  SERPAPI_KEY=... python scripts/update_publications.py   # key optional
  ```

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```
Note: extension-less URLs (`/teaching`) are a GitHub Pages feature and won't resolve under
`http.server`; open `teaching.html` directly when testing locally.

## Deploy to GitHub Pages (with fernandeslab.org)

Hosted on GitHub Pages from the `main` branch (repo root). Pushing to `main` redeploys.

1. **Pages source:** repo → Settings → Pages → *Deploy from a branch* → `main` / root.
2. **Custom domain:** `fernandeslab.org` (the `CNAME` file sets this).
3. **DNS** (at the registrar):
   - Apex `fernandeslab.org` → four **A** records: `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - `www` → **CNAME** to `samuelbfernandes.github.io`
4. **HTTPS:** Settings → Pages → tick **Enforce HTTPS** once GitHub issues the certificate
   (minutes–hours after DNS resolves). If the cert is stuck, remove and re-add the custom
   domain to re-trigger it.
