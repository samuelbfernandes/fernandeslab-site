// ---------------------------------------------------------------------------
// FernandesLAB — small progressive enhancements (no dependencies)
// ---------------------------------------------------------------------------

// Mobile nav toggle (keeps aria-expanded in sync for screen readers)
function setNav(open) {
  var nav = document.querySelector('.nav');
  var t = document.querySelector('.nav-toggle');
  if (nav) nav.classList.toggle('open', open);
  if (t) {
    t.classList.toggle('open', open);
    t.setAttribute('aria-expanded', String(open));
  }
}
function closeNav() { setNav(false); }
document.addEventListener('click', function (e) {
  var nav = document.querySelector('.nav');
  var toggle = e.target.closest('.nav-toggle');
  if (toggle) {
    setNav(!(nav && nav.classList.contains('open')));
  } else if (e.target.closest('.nav a')) {
    // tapping any nav or submenu link jumps to the topic and closes the mobile menu
    closeNav();
  } else if (!e.target.closest('.nav')) {
    if (nav && nav.classList.contains('open')) closeNav();
  }
});
document.addEventListener('keydown', function (e) {
  var nav = document.querySelector('.nav');
  if (e.key === 'Escape' && nav && nav.classList.contains('open')) {
    closeNav();
    var t = document.querySelector('.nav-toggle');
    if (t) t.focus();
  }
});

// Missing photos fall back to a placeholder. Images opt in with
// data-fallback="assets/img/placeholder-....svg" (replaces inline onerror
// handlers so the Content-Security-Policy can forbid inline script). Each image
// swaps at most once, so a missing placeholder can't cause an error loop.
(function () {
  function swap(img) {
    var fb = img.getAttribute('data-fallback');
    if (!fb) return;
    img.removeAttribute('data-fallback');
    img.src = fb;
  }
  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) swap(img);
    else img.addEventListener('error', function () { swap(img); }, { once: true });
  });
})();

// Header gains a shadow once the page is scrolled
var header = document.querySelector('.site-header');
function onScroll() {
  if (header) header.classList.toggle('scrolled', window.scrollY > 8);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Reveal elements as they enter the viewport
var reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && reveals.length) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(function (el) { io.observe(el); });
} else {
  reveals.forEach(function (el) { el.classList.add('in'); });
}

// Current year in the footer
var yr = document.getElementById('year');
if (yr) yr.textContent = new Date().getFullYear();

// Theme toggle (dark <-> light). The initial theme is set by the inline script
// in each page's <head> so there is no flash; here we just handle clicks and
// persist the choice. Default is dark; "light" is stored when chosen.
(function () {
  var btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  var root = document.documentElement;
  function label() {
    var light = root.getAttribute('data-theme') === 'light';
    btn.setAttribute('aria-pressed', String(light));
    var t = light ? 'Switch to dark mode' : 'Switch to light mode';
    btn.setAttribute('aria-label', t);
    btn.title = t;
  }
  label();
  btn.addEventListener('click', function () {
    var light = root.getAttribute('data-theme') === 'light';
    if (light) { root.removeAttribute('data-theme'); }
    else { root.setAttribute('data-theme', 'light'); }
    try { localStorage.setItem('theme', light ? 'dark' : 'light'); } catch (e) {}
    label();
  });
})();
