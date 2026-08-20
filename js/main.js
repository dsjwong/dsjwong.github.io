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
  // Icons are inline <svg> in index.html — no library, nothing to draw, and
  // they are painted with the first frame instead of appearing after JS runs.
  // To add one: copy the paths from https://lucide.dev/icons into an <svg>
  // matching the ones already in the markup.


  /* 2 ── Light / dark toggle ─────────────────────────────────────────────── */
  // The initial theme is applied by the inline script in index.html <head>
  // (before paint, so there is no flash). This only handles clicks.
  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var dark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', dark ? 'dark' : 'light');
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


  /* 7 ── Highlight the section you are currently reading ─────────────────── */
  // Watches a band across the middle of the screen. Whichever section is in
  // that band gets aria-current="true" on its nav link, which css/styles.css
  // styles. aria-current is used rather than a class so screen readers are
  // told the same thing sighted users are shown.
  var navLinks = document.querySelectorAll('[data-nav]');
  var watched  = document.querySelectorAll('section[id]');

  if (navLinks.length && watched.length && 'IntersectionObserver' in window) {
    var current = null;
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        if (current === e.target.id) return;
        current = e.target.id;
        navLinks.forEach(function (a) {
          a.setAttribute('aria-current', a.dataset.nav === current ? 'true' : 'false');
        });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });   // a thin band across the middle

    watched.forEach(function (s) { spy.observe(s); });
  }


  /* 8 ── Copy email to clipboard ─────────────────────────────────────────── */
  var copyBtn = document.getElementById('copy-email');
  if (copyBtn && navigator.clipboard) {
    var label = copyBtn.querySelector('span');
    var idle  = label.textContent;
    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(copyBtn.dataset.email).then(function () {
        label.textContent = 'Copied';
        copyBtn.classList.add('is-copied');
        setTimeout(function () {
          label.textContent = idle;
          copyBtn.classList.remove('is-copied');
        }, 1800);
      });
    });
  } else if (copyBtn) {
    copyBtn.remove();   // no clipboard API: hide the button rather than show a dead one
  }

})();
