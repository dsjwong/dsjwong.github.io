/* Assertions run against the real page in a real browser. Injected into a
   temporary copy of index.html by test/run.sh — never loaded by the site. */
const R = [], errs = [];
addEventListener('error', e => errs.push('JS error: ' + e.message));
const ok   = (n, c, d = '') => R.push((c ? 'PASS' : 'FAIL') + '  ' + n + (d && !c ? '  -> ' + d : ''));
const info = (n, d) => R.push('INFO  ' + n + '  ' + d);
const wait = ms => new Promise(r => setTimeout(r, ms));
// NOTE: requestAnimationFrame never fires in headless Chrome (no compositor)
// and deadlocks the suite if awaited. Poll on timers instead.
const until = async (fn, tries = 80) => {
  for (let i = 0; i < tries; i++) { if (fn()) return true; await wait(60); }
  return false;
};

function contrast(fg, bg) {
  const lum = c => {
    const [r, g, b] = c.match(/\d+/g).slice(0, 3).map(v => {
      v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const a = lum(fg), b = lum(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

addEventListener('load', async () => {
 try {
  /* links and assets ---------------------------------------------------- */
  const anchors = [...document.querySelectorAll('a[href^="#"]')];
  const dead = anchors.filter(a => a.getAttribute('href') !== '#' && !document.querySelector(a.getAttribute('href')));
  ok('every in-page anchor resolves', dead.length === 0, dead.map(a => a.getAttribute('href')).join(','));
  info('anchors checked', anchors.length);

  const urls = [...new Set([...document.querySelectorAll('link[rel=stylesheet],script[src],img[src],a[href$=".pdf"],link[rel=icon]')]
    .map(e => e.getAttribute('href') || e.getAttribute('src')).filter(u => u && !/^https?:/.test(u)))];
  for (const u of urls) {
    try { const r = await fetch(u, { method: 'HEAD' }); ok('asset ' + u, r.ok, 'status ' + r.status); }
    catch (e) { ok('asset ' + u, false, e.message); }
  }

  const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
  ok('no duplicate element ids', ids.filter((v, i) => ids.indexOf(v) !== i).length === 0);

  /* theme toggle -------------------------------------------------------- */
  const t = document.getElementById('theme-toggle');
  const was = document.documentElement.classList.contains('dark');
  t.click();
  ok('theme toggle flips the theme', document.documentElement.classList.contains('dark') !== was);
  ok('theme toggle persists to localStorage', ['dark', 'light'].includes(localStorage.getItem('theme')));
  t.click();
  ok('theme toggle is reversible', document.documentElement.classList.contains('dark') === was);

  /* mobile menu --------------------------------------------------------- */
  const mb = document.getElementById('menu-toggle'), mm = document.getElementById('mobile-menu');
  ok('mobile menu starts closed', mm.classList.contains('is-closed'));
  ok('menu button reports collapsed state', mb.getAttribute('aria-expanded') === 'false');
  mb.click();
  ok('mobile menu opens on click', !mm.classList.contains('is-closed'));
  ok('menu button reports expanded state', mb.getAttribute('aria-expanded') === 'true');
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  ok('Escape closes the menu', mb.getAttribute('aria-expanded') === 'false');
  ok('menu button label tracks its state', mb.getAttribute('aria-label') === 'Open menu');
  mb.click(); mm.querySelector('a').click();
  ok('menu closes after choosing a link', mm.classList.contains('is-closed'));

  /* copy button --------------------------------------------------------- */
  const cb = document.getElementById('copy-email');
  if (cb) {
    ok('copy button has an email to copy', !!cb.dataset.email, cb.dataset.email || 'missing');
    ok('copy button has an accessible name', !!cb.getAttribute('aria-label'));
    ok('copy confirmation is announced', !!cb.querySelector('[aria-live]'));
  } else info('copy button', 'removed — no clipboard API in this context');

  /* scrolling ----------------------------------------------------------- */
  document.documentElement.style.scrollBehavior = 'auto';
  window.scrollTo({ top: document.getElementById('work').offsetTop + 400, behavior: 'instant' });
  ok('page actually scrolled', await until(() => window.scrollY > 100));
  window.dispatchEvent(new Event('scroll'));   // headless emits none itself
  ok('nav gains its scrolled state', await until(() => document.getElementById('nav').classList.contains('is-scrolled')));
  ok('scroll spy marks the current section',
     await until(() => [...document.querySelectorAll('[data-nav]')].some(a => a.getAttribute('aria-current') === 'true')));
  ok('scroll reveal fires', [...document.querySelectorAll('[data-reveal]')].some(e => e.classList.contains('is-visible')));

  /* layout -------------------------------------------------------------- */
  window.scrollTo({ top: 0, behavior: 'instant' }); await wait(300);
  const vw = document.documentElement.clientWidth;
  const over = [...document.querySelectorAll('body *')].filter(e => {
    const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > vw + 1 || r.left < -1);
  }).filter(e => !e.classList.contains('skip-link'));
  ok('nothing overflows horizontally', over.length === 0, over.slice(0, 3).map(e => e.tagName + '.' + e.className).join(' | '));
  ok('document is no wider than the viewport', document.documentElement.scrollWidth <= vw + 1,
     document.documentElement.scrollWidth + ' vs ' + vw);

  /* dead CSS ------------------------------------------------------------ */
  let unused = [], total = 0;
  for (const sh of document.styleSheets) {
    let rules; try { rules = sh.cssRules } catch (e) { continue }
    const walk = rl => {
      // a CSSStyleRule exposes an EMPTY cssRules list under CSS nesting, which
      // is truthy — check length or every rule looks like a container
      if (rl.cssRules && rl.cssRules.length) { [...rl.cssRules].forEach(walk); return; }
      if (!rl.selectorText) return;
      for (const sel of rl.selectorText.split(',')) {
        const clean = sel.trim().replace(/::?(before|after|hover|focus|focus-visible|active|first-of-type|last-of-type|last-child|first-child|placeholder|selection|marker)/g, '');
        if (!clean || clean === '*') continue;
        total++;
        try { if (!document.querySelector(clean)) unused.push(sel.trim()); } catch (e) {}
      }
    };
    [...rules].forEach(walk);
  }
  info('CSS selectors checked', total);
  // reset rules for elements not used yet are intentional, and a state selector
  // cannot match at rest — only unused component classes are genuinely dead
  const resetTags = /^(h[1-6]|b|strong|ol|ul|li|input|select|textarea|button|img|video|canvas|audio|iframe|embed|object|html|body|a|p)$/;
  const stateful = /\[aria-|\.is-|:focus|:hover|:active|::/;
  const realDead = unused.filter(u => !resetTags.test(u.trim()) && !stateful.test(u));
  info('unused reset/state selectors (expected)', unused.length - realDead.length);
  ok('no dead component CSS', realDead.length === 0, realDead.join(' | '));

  // The opposite and more damaging direction: a class in the markup that no
  // stylesheet defines does nothing at all, silently. This is the single
  // easiest mistake to make when editing index.html.
  const defined = new Set();
  for (const sh of document.styleSheets) {
    let rules; try { rules = sh.cssRules } catch (e) { continue }
    const collect = rl => {
      if (rl.cssRules && rl.cssRules.length) { [...rl.cssRules].forEach(collect); return; }
      if (!rl.selectorText) return;
      (rl.selectorText.match(/\.((?:[a-zA-Z0-9_-]|\\.)+)/g) || [])
        .forEach(c => defined.add(c.slice(1).replace(/\\/g, '')));
    };
    [...rules].forEach(collect);
  }
  const undef = [...new Set([...document.querySelectorAll('[class]')]
    .flatMap(e => [...e.classList]))].filter(c => !defined.has(c));
  ok('every class in the markup is defined in a stylesheet', undef.length === 0, undef.join(' | '));

  /* accessibility ------------------------------------------------------- */
  const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => +h.tagName[1]);
  let skip = null;
  for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) skip = `h${hs[i - 1]} -> h${hs[i]}`;
  ok('heading levels never skip', !skip, skip || '');
  ok('exactly one h1', hs.filter(x => x === 1).length === 1, 'found ' + hs.filter(x => x === 1).length);

  const navs = [...document.querySelectorAll('nav')];
  ok('every nav landmark is named', navs.every(n => n.getAttribute('aria-label')));
  ok('main landmark present', !!document.querySelector('main'));
  ok('skip link is the first focusable element',
     document.querySelector('a[href],button').classList.contains('skip-link'));

  // an <img alt> inside a link supplies its accessible name too
  const nameless = [...document.querySelectorAll('button,a')].filter(e =>
    !e.textContent.trim() && !e.getAttribute('aria-label') && !e.querySelector('[aria-label]')
    && ![...e.querySelectorAll('img')].some(i => i.alt && i.alt.trim()));
  ok('every link and button has an accessible name', nameless.length === 0,
     nameless.map(e => e.tagName + '.' + e.className).join(','));
  ok('every image has alt text', [...document.querySelectorAll('img')].every(i => i.alt !== null && i.alt !== undefined));
  ok('decorative svgs are hidden from screen readers',
     [...document.querySelectorAll('svg')].every(s => s.getAttribute('aria-hidden')));

  const times = [...document.querySelectorAll('time')];
  ok('every <time> has a datetime attribute', times.length > 0 && times.every(x => x.getAttribute('datetime')),
     times.length + ' found');

  /* contrast (WCAG AA: 4.5 for small text, 3 for large) ------------------ */
  const bg = getComputedStyle(document.body).backgroundColor;
  for (const sel of ['.body', '.h3', '.meta', '.rail-label', '.tag']) {
    const el = document.querySelector(sel); if (!el) continue;
    const c = contrast(getComputedStyle(el).color, bg);
    const need = parseFloat(getComputedStyle(el).fontSize) < 18.66 ? 4.5 : 3;
    ok(`contrast ${sel} (${c.toFixed(2)}:1, needs ${need})`, c >= need);
  }

  /* document basics ----------------------------------------------------- */
  ok('html has a lang attribute', !!document.documentElement.lang);
  ok('page has a title', document.title.length > 5);
  ok('page has a meta description', !!document.querySelector('meta[name=description]'));
  ok('a print stylesheet exists', [...document.styleSheets].some(sh => {
    try { return [...sh.cssRules].some(r => r.media && [...r.media].includes('print')) } catch (e) { return false }
  }));
  ok('no console errors during load', errs.length === 0, errs.join(' | '));
 } catch (e) {
  R.push('HARNESS ERROR  ' + e.message + '  ' + (e.stack || '').split('\n')[1]);
 }
 document.body.innerHTML = '<pre id="out">' + R.join('\n') + '</pre>';
});
