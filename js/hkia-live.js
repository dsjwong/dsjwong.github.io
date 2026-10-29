(function () {
  'use strict';

  var URL = 'https://raw.githubusercontent.com/dsjwong/hkia-delay-predictor/main/web/public/data/model.json';
  var MAX_AGE_DAYS = 14;
  var root = document.getElementById('hkia-live');
  if (!root || !window.fetch) return;

  function el(name) { return root.querySelector('[data-hkia="' + name + '"]'); }
  function num(v) { return typeof v === 'number' && isFinite(v) ? v : null; }
  function day(iso) {
    var d = new Date(iso + 'T00:00:00Z');
    if (isNaN(d)) return null;
    return { d: d.getUTCDate(), m: d.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' }), y: d.getUTCFullYear() };
  }

  function render(ev) {
    if (!ev || ev.status !== 'ok') return;
    var at = new Date(ev.computed_at);
    if (isNaN(at) || (Date.now() - at.getTime()) / 864e5 > MAX_AGE_DAYS) return;

    var auc = ev.model && num(ev.model.auc);
    var base = ev.baseline_airline_hour && num(ev.baseline_airline_hour.auc);
    var n = num(ev.n_matured);
    if (auc === null || base === null || n === null) return;

    el('auc').textContent = auc.toFixed(3);
    el('base').textContent = base.toFixed(3);
    el('n').textContent = n.toLocaleString('en-GB');

    var a = day(ev.date_min), b = day(ev.date_max);
    if (a && b) {
      el('window').textContent = a.d + (a.m === b.m ? '' : ' ' + a.m) + '–' + b.d + ' ' + b.m + ' ' + b.y;
    }

    var up = at.getUTCDate() + ' ' + at.toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' }) + ' ' + at.getUTCFullYear();
    var days = num(ev.window_days);
    el('note').textContent = (days ? 'Rolling ' + days + '-day window; ' : '') + 'updated ' + up;
  }

  fetch(URL, { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (d) { render(d && d.live_eval); })
    .catch(function () {});
})();
