# FernandesLAB website

Clean, static HTML site for the Fernandes Lab (University of Arkansas Division of
Agriculture). No build step, no frameworks — just HTML + one CSS file. Designed to
be edited by hand or with an AI assistant.

## Files

```
site/
├── index.html          Home (hero + intro + themes + news + stats)
├── about.html          Mission, vision & goals
├── our-team.html       Team: PI, postdocs, PhD, master students, interns, alumni
├── teaching.html       Courses taught + mentoring
├── projects.html       Funded grants + software/tools + study systems (crops)
├── publications.html   Citation metrics + recent publications
├── contact.html        Contact info + embedded Google Form
├── 404.html            Not-found page
├── CNAME               Custom domain (fernandeslab.org) — used by GitHub Pages
├── .nojekyll           Tells GitHub Pages to serve files as-is
└── assets/
    ├── css/style.css   ALL styling (dark theme). Colors live in the :root block at the top.
    ├── js/main.js      Mobile menu toggle, scroll reveal, sticky-header shadow
    ├── img/            logo.svg, ai-net.svg (hero motif), news/crop images, placeholders
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
the title `href` to the paper's DOI/URL and update the authors line.

**Add a grant** — in `projects.html`, copy a `<div class="grant">` block and update the
title, source, names, amount, and years.

**Add a news item** — in `index.html`, copy a `<article class="news-item">` block in the
"Latest news" section.

**Hero background image** — drop a file at `assets/img/hero-bg.jpg`, then in
`index.html` change `<section class="hero">` to
`<section class="hero" style="--hero:url('assets/img/hero-bg.jpg')">`.
(The interior page banners use the same `--hero` variable if you want to set it there too.)

**Contact form** — the embedded form in `contact.html` is the original Google Form.
Swap the `src` URL on the `<iframe>` to use a different form.

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
  cd site
  pip install scholarly requests
  SERPAPI_KEY=... python scripts/update_publications.py   # key optional
  ```

## Preview locally

```bash
cd site
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy to GitHub Pages (with fernandeslab.org)

1. **Create a repo** on GitHub (e.g. `fernandeslab-site`) and push the contents of
   this `site/` folder to it (the HTML files should be at the repo root).
   ```bash
   cd site
   git init -b main
   git add .
   git commit -m "Initial site"
   git remote add origin https://github.com/<you>/fernandeslab-site.git
   git push -u origin main
   ```
2. **Enable Pages**: repo → Settings → Pages → Source: *Deploy from a branch* →
   Branch: `main` / root → Save. Your site goes live at
   `https://<you>.github.io/fernandeslab-site/`.
3. **Custom domain**: still on Settings → Pages, set the custom domain to
   `fernandeslab.org` (the included `CNAME` file already does this on push).
4. **DNS** (at your domain registrar — move it off Google Sites):
   - Apex `fernandeslab.org` → four **A** records pointing to GitHub Pages:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `www` → **CNAME** record pointing to `<you>.github.io`
5. Back in Settings → Pages, tick **Enforce HTTPS** once the certificate is issued
   (can take a few minutes to a few hours).

DNS changes can take up to ~24h to propagate. Until then the `github.io` URL works.
