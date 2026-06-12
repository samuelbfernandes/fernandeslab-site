// ---------------------------------------------------------------------------
// FernandesLAB — small progressive enhancements (no dependencies)
// ---------------------------------------------------------------------------

// Mobile nav toggle
document.addEventListener('click', function (e) {
  var toggle = e.target.closest('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle) {
    nav.classList.toggle('open');
    toggle.classList.toggle('open');
  } else if (!e.target.closest('.nav')) {
    if (nav && nav.classList.contains('open')) {
      nav.classList.remove('open');
      var t = document.querySelector('.nav-toggle');
      if (t) t.classList.remove('open');
    }
  }
});

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
