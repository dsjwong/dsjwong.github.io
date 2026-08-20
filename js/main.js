/* ═══════════════════════════════════════════════════════════════════════════
   main.js — the small amount of behaviour this site needs

   You should not need to change anything in here. In order, it handles:
     1. icons          — swaps <i data-lucide="..."> for real SVGs
     2. theme toggle   — light/dark, remembered in localStorage
     3. mobile menu    — the hamburger dropdown
     4. nav background — frosted bar appears once you scroll
     5. scroll reveal  — fades in anything marked data-reveal
     6. footer year    — keeps the copyright date current by itself
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* 1 ── Icons ───────────────────────────────────────────────────────────── */
  // Lucide replaces every <i data-lucide="name"> with an inline SVG.
  // Icon names: https://lucide.dev/icons
  function drawIcons() {
    if (window.lucide) window.lucide.createIcons();
  }
  drawIcons();


  /* 2 ── Light / dark toggle ─────────────────────────────────────────────── */
  // The initial theme is applied by the inline script in index.html <head>
  // (before paint, so there is no flash). This only handles clicks.
  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var dark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', dark ? 'dark' : 'light');
      drawIcons();  // re-render so the sun/moon swap takes effect
    });
  }


  /* 3 ── Mobile menu ─────────────────────────────────────────────────────── */
  var menuBtn = document.getElementById('menu-toggle');
  var menu    = document.getElementById('mobile-menu');
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () {
      menu.classList.toggle('is-closed');
    });
    // Close it again after tapping a link.
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.add('is-closed'); });
    });
  }


  /* 4 ── Frosted nav bar on scroll ───────────────────────────────────────── */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* 5 ── Scroll reveal ───────────────────────────────────────────────────── */
  var targets = document.querySelectorAll('[data-reveal]');

  if (!('IntersectionObserver' in window)) {
    // Old browser: show everything rather than hiding it forever.
    targets.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        // Stagger siblings slightly so a grid of cards cascades in.
        setTimeout(function () {
          entry.target.classList.add('is-visible');
        }, i * 70);
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'   // fire slightly before it hits the edge
    });

    targets.forEach(function (el) { observer.observe(el); });
  }


  /* 6 ── Footer year ─────────────────────────────────────────────────────── */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

})();
