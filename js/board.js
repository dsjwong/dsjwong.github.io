/* Departures board — the hero.
   Renders the next few HKIA departures with the model's P(delay > 15 min) as
   a split-flap board. The fallback rows live in the page itself (the visually
   hidden table #board-table), so this file has no data of its own except the
   airport-code -> city lookup. Live data comes from the same repo and CDN as
   js/hkia-live.js. Nothing here is a library. */
(function () {
  'use strict';

  var BASE = 'https://raw.githubusercontent.com/dsjwong/hkia-delay-predictor/main/web/public/data/';
  var REFRESH_MS = 5 * 60 * 1000;
  var STALE_HOURS = 6;
  var ROWS = 6;
  var SET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%:-/.'";
  var W = { flight: 6, to: 11, time: 5, late: 8 };

  var CITY = {
    ADD: 'Addis Ababa', AKL: 'Auckland', AMS: 'Amsterdam', AUH: 'Abu Dhabi', BKI: 'K Kinabalu',
    BKK: 'Bangkok', BLR: 'Bengaluru', BNE: 'Brisbane', BOM: 'Mumbai', BOS: 'Boston',
    BRU: 'Brussels', BWN: 'Brunei', CAN: 'Guangzhou', CDG: 'Paris', CEB: 'Cebu',
    CGK: 'Jakarta', CGO: 'Zhengzhou', CJU: 'Jeju', CKG: 'Chongqing', CMB: 'Colombo',
    CNX: 'Chiang Mai', CRK: 'Clark', CSX: 'Changsha', CTS: 'Sapporo', CTU: 'Chengdu',
    CZX: 'Changzhou', DAC: 'Dhaka', DAD: 'Da Nang', DEL: 'Delhi', DFW: 'Dallas',
    DMK: 'Bangkok', DOH: 'Doha', DPS: 'Bali', DVO: 'Davao', DXB: 'Dubai',
    FOC: 'Fuzhou', FRA: 'Frankfurt', FUK: 'Fukuoka', HAK: 'Haikou', HAN: 'Hanoi',
    HEL: 'Helsinki', HFE: 'Hefei', HGH: 'Hangzhou', HIJ: 'Hiroshima', HKT: 'Phuket',
    HLD: 'Hulunbuir', HND: 'Tokyo', HRB: 'Harbin', HSN: 'Zhoushan', HYD: 'Hyderabad',
    ICN: 'Seoul', IST: 'Istanbul', JFK: 'New York', JNB: 'Joburg', KHH: 'Kaohsiung',
    KIX: 'Osaka', KMG: 'Kunming', KMQ: 'Komatsu', KTI: 'Kratie', KTM: 'Kathmandu',
    KUL: 'K Lumpur', LAX: 'Los Angeles', LHR: 'London', LJG: 'Lijiang', MAA: 'Chennai',
    MAD: 'Madrid', MAN: 'Manchester', MEL: 'Melbourne', MNL: 'Manila', MUC: 'Munich',
    MXP: 'Milan', NAN: 'Nadi', NGB: 'Ningbo', NGO: 'Nagoya', NKG: 'Nanjing',
    NNG: 'Nanning', NRT: 'Tokyo', OKA: 'Okinawa', ORD: 'Chicago', PEK: 'Beijing',
    PEN: 'Penang', PER: 'Perth', PKX: 'Beijing', POM: 'P Moresby', PQC: 'Phu Quoc',
    PUS: 'Busan', PVG: 'Shanghai', RMQ: 'Taichung', ROR: 'Koror', SDJ: 'Sendai',
    SEA: 'Seattle', SFO: 'San Fran', SGN: 'HCMC', SHA: 'Shanghai', SIN: 'Singapore',
    SUB: 'Surabaya', SVO: 'Moscow', SYD: 'Sydney', SYX: 'Sanya', SZB: 'KL Subang',
    TAE: 'Daegu', TAK: 'Takamatsu', TAO: 'Qingdao', TFU: 'Chengdu', TNA: 'Jinan',
    TPE: 'Taipei', TSN: 'Tianjin', UBN: 'Ulaanbaatar', URC: 'Urumqi', USM: 'Koh Samui',
    WNZ: 'Wenzhou', WUH: 'Wuhan', WUX: 'Wuxi', XIY: 'Xi\'an', XMN: 'Xiamen',
    YCU: 'Yuncheng', YIH: 'Yichang', YIW: 'Yiwu', YVR: 'Vancouver', YYZ: 'Toronto',
    ZRH: 'Zurich'
  };

  var root = document.getElementById('board');
  var table = document.getElementById('board-table');
  if (!root || !table) return;

  var rowsEl = root.querySelector('.board-rows');
  var statusEl = document.getElementById('board-status');
  var clockEl = root.querySelector('.board-clock');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cells = [];
  var timer = null;
  var tick = 0;

  function pad(s, n) { s = String(s).toUpperCase(); return (s + new Array(n + 1).join(' ')).slice(0, n); }
  function hkt(d) {
    return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Hong_Kong' }).format(d);
  }
  function titleCase(s) { return s.toLowerCase().replace(/(^|[ \/])([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); }); }

  function build() {
    var frag = document.createDocumentFragment();
    for (var r = 0; r < ROWS; r++) {
      var row = document.createElement('div');
      row.className = 'board-row';
      ['flight', 'to', 'time', 'late'].forEach(function (g) {
        var grp = document.createElement('span');
        grp.className = 'grp';
        for (var i = 0; i < W[g]; i++) {
          var c = document.createElement('span');
          c.className = 'fl' + (g === 'late' && i >= 3 ? ' late-word' : '');
          c.textContent = ' ';
          grp.appendChild(c);
          cells.push({ el: c, ch: ' ', target: ' ', pos: -1, wait: 0 });
        }
        row.appendChild(grp);
      });
      frag.appendChild(row);
    }
    rowsEl.appendChild(frag);
  }

  function readTable() {
    return [].map.call(table.tBodies[0].rows, function (tr) {
      return { no: tr.cells[0].textContent, to: tr.cells[1].getAttribute('data-name'), time: tr.cells[2].textContent,
               p: parseFloat(tr.cells[3].getAttribute('data-p')) };
    });
  }

  function writeTable(list, label) {
    var body = table.tBodies[0];
    body.textContent = '';
    list.forEach(function (f) {
      var tr = body.insertRow();
      var th = document.createElement('th');
      th.scope = 'row';
      th.textContent = f.no;
      tr.appendChild(th);
      var td = tr.insertCell(); td.textContent = titleCase(f.to); td.setAttribute('data-name', f.to);
      tr.insertCell().textContent = f.time;
      td = tr.insertCell(); td.textContent = Math.round(f.p * 100) + '%'; td.setAttribute('data-p', f.p);
    });
    table.setAttribute('data-source', label);
  }

  function target(list) {
    var out = [];
    for (var r = 0; r < ROWS; r++) {
      var f = list[r];
      var pct = f ? Math.min(99, Math.round(f.p * 100)) : null;
      var text = f ? pad(f.no, W.flight) + pad(f.to, W.to) + pad(f.time, W.time) + pad((pct < 10 ? ' ' : '') + pct + '% LATE', W.late) : new Array(W.flight + W.to + W.time + W.late + 1).join(' ');
      for (var i = 0; i < text.length; i++) out.push({ ch: SET.indexOf(text[i]) < 0 ? ' ' : text[i], hot: f && f.p >= 0.3 });
    }
    return out;
  }

  function show(list) {
    var t = target(list);
    var any = false;
    cells.forEach(function (c, i) {
      var want = t[i];
      c.el.classList.toggle('hot', !!want.hot);
      if (want.ch === c.ch && c.pos < 0) return;
      c.target = want.ch;
      if (reduce) { c.ch = want.ch; c.el.textContent = want.ch; c.pos = -1; return; }
      var ti = SET.indexOf(want.ch);
      var steps = 4 + ((i * 7) % 9);
      c.pos = (ti - steps + SET.length * 2) % SET.length;
      c.wait = Math.floor(i / 8) + (i % 3);
      any = true;
    });
    if (any && !timer) timer = setInterval(step, 50);
  }

  function step() {
    var live = 0;
    cells.forEach(function (c) {
      if (c.pos < 0) return;
      if (c.wait > 0) { c.wait--; live++; return; }
      c.pos = (c.pos + 1) % SET.length;
      var ch = SET[c.pos];
      c.el.textContent = ch;
      if (ch === c.target) {
        c.pos = -1; c.ch = ch;
        c.el.classList.remove('flip'); void c.el.offsetWidth; c.el.classList.add('flip');
      } else live++;
    });
    if (!live) { clearInterval(timer); timer = null; }
  }

  function setClock() { if (clockEl) clockEl.textContent = 'HKT ' + hkt(new Date()); }

  function pick(files) {
    var now = Date.now(), out = [];
    files.forEach(function (d) {
      if (!d || !d.flights) return;
      var latest = 0;
      d.flights.forEach(function (f) { var s = Date.parse(f.scored_at); if (s > latest) latest = s; });
      if (!latest || (now - latest) / 36e5 > STALE_HOURS) return;
      d.flights.forEach(function (f) {
        var at = Date.parse(f.sched_ts);
        if (f.status !== 'scheduled' || typeof f.p !== 'number' || isNaN(at) || at < now) return;
        out.push({ at: at, no: f.flight_no, to: CITY[f.dest] || f.dest, time: hkt(new Date(at)), p: f.p });
      });
    });
    out.sort(function (a, b) { return a.at - b.at; });
    return out.slice(0, ROWS);
  }

  function get(name) {
    return fetch(BASE + name, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }

  function refresh() {
    get('departures_today.json').then(function (today) {
      var got = pick([today]);
      if (got.length >= ROWS) return got;
      return get('departures_tomorrow.json').then(function (tmr) { return pick([today, tmr]); }, function () { return got; });
    }).then(function (list) {
      if (list.length < 3) throw new Error('stale');
      writeTable(list, 'live');
      show(list);
      if (statusEl) statusEl.textContent = 'Updated ' + hkt(new Date()) + ' HKT';
    }).catch(function () {});
  }

  build();
  setClock();
  setInterval(setClock, 30000);
  show(readTable());

  if (window.fetch) {
    refresh();
    setInterval(function () { if (!document.hidden) refresh(); }, REFRESH_MS);
  }
})();
