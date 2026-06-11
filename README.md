# FernandesLAB website

Clean, static HTML site for the Fernandes Lab (University of Arkansas Division of
Agriculture). No build step, no frameworks — just HTML + one CSS file. Designed to
be edited by hand or with an AI assistant.

## Files

```
site/
├── index.html          Home (hero + intro)
├── our-team.html       Team: PI, postdocs, PhD, master students, interns, alumni
├── research.html       Latest news + projects & publications
├── gallery.html        Crops: soybean, rice, maize
├── contact.html        Contact info + embedded Google Form
├── 404.html            Not-found page
├── CNAME               Custom domain (fernandeslab.org) — used by GitHub Pages
├── .nojekyll           Tells GitHub Pages to serve files as-is
└── assets/
    ├── css/style.css   ALL styling. Colors live in the :root block at the top.
    ├── js/main.js      Mobile menu toggle only
    ├── img/            Hero background, news/gallery images, placeholders
    └── team/           Team member photos (filename = first name)
```

## Editing common things

**Colors / theme** — edit the `:root` variables at the top of `assets/css/style.css`.
Change them once and the whole site updates.

**Add or edit a team member** — open `our-team.html`, copy an existing
`<article class="person">` (or `<article class="card">` for the grid sections),
and update the text. Put their photo in `assets/team/` and point the `src` at it.
If a photo is missing, a placeholder silhouette shows automatically.

**Add a publication** — in `research.html`, copy a `<div class="pub">` block and set
the title `href` to the paper's DOI/URL and update the authors line.

**Add a news item** — in `research.html`, copy a `<article class="news-item">` block.

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
