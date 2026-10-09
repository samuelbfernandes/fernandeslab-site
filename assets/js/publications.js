// ---------------------------------------------------------------------------
// Publications page: render the list from assets/publications.json, which a
// scheduled GitHub Action keeps in sync with Google Scholar. If the file is
// missing, malformed, or empty, the static list baked into publications.html
// stays in place.
//
// Everything from the JSON is treated as untrusted: text is HTML-escaped and
// links are only used when they are absolute http(s) URLs.
// ---------------------------------------------------------------------------
(function () {
  var listEl = document.getElementById('pub-list');
  if (!listEl || !window.fetch) return;

  var SCHOLAR = 'https://scholar.google.com/citations?user=aR0shJYAAAAJ&hl=en';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function safeUrl(u) {
    if (typeof u !== 'string') return null;
    try {
      var p = new URL(u.trim());
      return (p.protocol === 'https:' || p.protocol === 'http:') ? p.href : null;
    } catch (e) { return null; }
  }
  function toInt(v) {
    var n = parseInt(v, 10);
    return isFinite(n) && n >= 0 ? n : null;
  }
  function setNum(id, v) {
    var el = document.getElementById(id);
    var n = toInt(v);
    if (el && n != null) el.textContent = n.toLocaleString('en-US');
  }

  fetch('/assets/publications.json', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('no json'); return r.json(); })
    .then(function (data) {
      if (!data || typeof data !== 'object' || !Array.isArray(data.publications)) return;

      var fallback = safeUrl(data.scholar_url) || SCHOLAR;
      var pubs = data.publications.filter(function (p) {
        return p && typeof p === 'object' && typeof p.title === 'string' && p.title.trim();
      });
      if (!pubs.length) return;

      pubs.sort(function (a, b) { return (toInt(b.year) || 0) - (toInt(a.year) || 0); });

      listEl.innerHTML = pubs.map(function (p) {
        var url = safeUrl(p.url) || fallback;
        var year = toInt(p.year);
        var meta = [
          p.authors ? esc(p.authors) : '',
          p.venue ? '<em>' + esc(p.venue) + '</em>' : '',
          year != null ? String(year) : ''
        ].filter(Boolean).join(' · ');
        return '<div class="pub reveal in"><a href="' + esc(url) + '" rel="noopener noreferrer">' +
               esc(p.title) + '</a><p class="authors">' + meta + '</p></div>';
      }).join('');

      if (data.metrics && typeof data.metrics === 'object') {
        setNum('m-citations', data.metrics.citations);
        setNum('m-hindex', data.metrics.h_index);
        setNum('m-i10', data.metrics.i10_index);
      }

      var note = document.getElementById('pub-updated');
      if (note && typeof data.updated === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.updated)) {
        note.textContent = 'Synced from Google Scholar on ' + data.updated + '.';
        note.style.display = 'block';
      }
    })
    .catch(function () { /* keep the built-in static list */ });
})();
