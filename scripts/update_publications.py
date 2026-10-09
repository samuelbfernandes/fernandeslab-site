#!/usr/bin/env python3
"""Update assets/publications.json from Google Scholar.

Google Scholar has no official API and actively blocks scrapers, so there are
two fetch backends:

  1. SerpAPI (recommended, reliable)  — set the SERPAPI_KEY env var. A free
     SerpAPI account allows ~100 searches/month, far more than a weekly run
     needs. Get a key at https://serpapi.com/.
  2. scholarly (no key, best effort) — used automatically when SERPAPI_KEY is
     not set. Google frequently rate-limits this, so it may fail; when it does,
     the existing publications.json is left untouched.

Run:  python scripts/update_publications.py
Env:  SERPAPI_KEY (optional), SCHOLAR_ID (default aR0shJYAAAAJ), MAX_PUBS (30)
"""
import datetime
import json
import os
import pathlib
import re
import sys
from urllib.parse import urlparse

SCHOLAR_ID = os.environ.get("SCHOLAR_ID") or "aR0shJYAAAAJ"
if not re.fullmatch(r"[A-Za-z0-9_-]{6,20}", SCHOLAR_ID):
    sys.exit("Invalid SCHOLAR_ID")
try:
    MAX_PUBS = max(1, min(int(os.environ.get("MAX_PUBS") or "30"), 200))
except ValueError:
    MAX_PUBS = 30
OUT = pathlib.Path(__file__).resolve().parent.parent / "assets" / "publications.json"


def _year(value):
    s = str(value or "").strip()[:4]
    return int(s) if s.isdigit() else None


def _text(value, limit=1000):
    """Plain, length-capped string (or None). The page escapes it again on render."""
    if value is None:
        return None
    s = " ".join(str(value).split())
    return s[:limit] or None


def _url(value):
    """Keep only absolute http(s) URLs; anything else (javascript:, data:, ...) is dropped."""
    s = str(value or "").strip()
    try:
        u = urlparse(s)
    except ValueError:
        return None
    return s if u.scheme in ("http", "https") and u.netloc else None


def _int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


# --- Conference-abstract filter ------------------------------------------------
# Google Scholar mixes meeting abstracts, posters, and symposium listings in with
# papers. Drop them so the site lists full publications only. A venue is treated
# as an abstract when it matches ABSTRACT_VENUE_RE, unless it also matches
# FULL_PAPER_VENUE_RE (archival proceedings / workshop papers and journals whose
# names happen to contain "proceedings", e.g. PNAS).
ABSTRACT_VENUE_RE = re.compile(
    r"abstract|conference|proceedings|annual meeting|international meeting|symposium"
    r"|asa,\s*cssa|cssa,\s*sssa|poster|workshop|plant and animal genome|\bpag\b",
    re.IGNORECASE,
)
FULL_PAPER_VENUE_RE = re.compile(
    r"neurips|neural information processing|approximate bayesian inference|\baabi\b"
    r"|archival track|proceedings of machine learning research|\bpmlr\b|\bicml\b|\biclr\b"
    r"|proceedings of the national academy|\bpnas\b|proceedings of the royal society",
    re.IGNORECASE,
)
# Titles Scholar sometimes imports from meeting programs rather than papers.
ABSTRACT_TITLE_RE = re.compile(r"^symposium\s*-|planning session", re.IGNORECASE)
# ASHS meeting abstracts appear in Scholar as "HortScience <vol> (<issue>), <year>"
# with no page or article number; full HortScience papers always carry one.
HORTSCIENCE_ABSTRACT_RE = re.compile(r"^hortscience\s+\d+\s*\(\d+\)\s*,\s*\d{4}$", re.IGNORECASE)


def is_conference_abstract(pub):
    venue = (pub.get("venue") or "").strip()
    title = (pub.get("title") or "").strip()
    if ABSTRACT_TITLE_RE.search(title):
        return True
    if HORTSCIENCE_ABSTRACT_RE.match(venue):
        return True
    if venue and ABSTRACT_VENUE_RE.search(venue) and not FULL_PAPER_VENUE_RE.search(venue):
        return True
    return False


def from_serpapi(key):
    import requests

    articles, metrics, start = [], {}, 0
    while True:
        resp = requests.get(
            "https://serpapi.com/search",
            params={
                "engine": "google_scholar_author",
                "author_id": SCHOLAR_ID,
                "api_key": key,
                "num": 100,
                "start": start,
                "sort": "pubdate",
            },
            timeout=60,
        )
        resp.raise_for_status()
        data = resp.json()
        if start == 0:
            table = (data.get("cited_by") or {}).get("table") or []

            def cell(i, k):
                try:
                    return table[i][k]["all"]
                except Exception:
                    return None

            metrics = {
                "citations": cell(0, "citations"),
                "h_index": cell(1, "h_index"),
                "i10_index": cell(2, "i10_index"),
            }
        batch = data.get("articles") or []
        articles += batch
        if len(batch) < 100 or len(articles) >= MAX_PUBS:
            break
        start += 100

    pubs = [
        {
            "title": a.get("title"),
            "authors": a.get("authors"),
            "venue": a.get("publication"),
            "year": _year(a.get("year")),
            "url": a.get("link"),
        }
        for a in articles
    ]
    return pubs, metrics


def from_scholarly():
    from scholarly import scholarly

    author = scholarly.search_author_id(SCHOLAR_ID)
    author = scholarly.fill(author, sections=["basics", "indices", "publications"])
    metrics = {
        "citations": author.get("citedby"),
        "h_index": author.get("hindex"),
        "i10_index": author.get("i10index"),
    }
    pubs = []
    for p in author.get("publications", []):
        bib = p.get("bib", {})
        pub_id = p.get("author_pub_id", "")
        url = (
            "https://scholar.google.com/citations?view_op=view_citation&hl=en"
            "&user=%s&citation_for_view=%s" % (SCHOLAR_ID, pub_id)
            if pub_id
            else None
        )
        pubs.append(
            {
                "title": bib.get("title"),
                "authors": bib.get("author"),
                "venue": bib.get("citation") or bib.get("venue"),
                "year": _year(bib.get("pub_year")),
                "url": url,
            }
        )
    return pubs, metrics


def main():
    key = os.environ.get("SERPAPI_KEY")
    try:
        if key:
            print("Fetching from Google Scholar via SerpAPI…")
            pubs, metrics = from_serpapi(key)
        else:
            print("No SERPAPI_KEY set; trying `scholarly` (may be rate-limited)…")
            pubs, metrics = from_scholarly()
    except Exception as exc:  # noqa: BLE001 - report and leave file untouched
        # requests' HTTPError messages include the full request URL, which
        # contains the api_key query parameter - never print it.
        msg = str(exc)
        if key:
            msg = msg.replace(key, "***")
        msg = re.sub(r"(api_key=)[^&\s]+", r"\1***", msg)
        print("ERROR fetching from Google Scholar (%s): %s" % (type(exc).__name__, msg), file=sys.stderr)
        return 1

    pubs = [
        {
            "title": _text(p.get("title"), 500),
            "authors": _text(p.get("authors"), 1000),
            "venue": _text(p.get("venue"), 300),
            "year": p.get("year") if isinstance(p.get("year"), int) else None,
            "url": _url(p.get("url")),
        }
        for p in pubs
    ]
    pubs = [p for p in pubs if p["title"]]
    dropped = [p for p in pubs if is_conference_abstract(p)]
    pubs = [p for p in pubs if not is_conference_abstract(p)]
    for p in dropped:
        print("Skipping conference abstract: %s (%s)" % (p["title"], p.get("venue")))
    pubs.sort(key=lambda p: (p.get("year") or 0), reverse=True)
    pubs = pubs[:MAX_PUBS]
    if not pubs:
        print("No publications returned; leaving publications.json unchanged.", file=sys.stderr)
        return 1

    data = {
        "author": "Samuel B. Fernandes",
        "scholar_id": SCHOLAR_ID,
        "scholar_url": "https://scholar.google.com/citations?user=%s&hl=en" % SCHOLAR_ID,
        "updated": datetime.date.today().isoformat(),
        "source": "serpapi" if key else "scholarly",
        "metrics": {k: _int(v) for k, v in metrics.items() if _int(v) is not None},
        "publications": pubs,
    }
    OUT.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print("Wrote %d publications to %s" % (len(pubs), OUT))
    return 0


if __name__ == "__main__":
    sys.exit(main())
