/* =========================================================
   Exonol — animated page banners (no libraries)
     [data-pack-scene]   Company page: medicines packed into Exonol boxes and shipped
     [data-world-scene]  International page: world map with routes from India
   Both pause when off-screen and show a still frame for reduced-motion users.
   ========================================================= */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const GREEN = '#82BD41', BLUE = '#0272A7';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const easeIO = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  const easeOut = k => 1 - Math.pow(1 - k, 3);
  const easeIn = k => k * k * k;
  const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);

  /* run a frame function while the host is on screen */
  function runner(host, frame, stillAt) {
    let on = true, raf = 0, t0 = performance.now();
    const loop = now => { raf = requestAnimationFrame(loop); if (on && !document.hidden) frame((now - t0) / 1000); };
    if (reduce) { frame(stillAt); return; }
    new IntersectionObserver(([e]) => { on = e.isIntersecting; }).observe(host);
    raf = requestAnimationFrame(loop);
  }

  /* ======================= COMPANY: packing & shipping ======================= */
  function packScene(host) {
    const IMG = host.dataset.logo || 'assets/img/logo.svg';
    const IMGR = host.dataset.logoReverse || 'assets/img/logo-reverse.svg';
    const BELT = 440, FLOOR = 520, STATION = 845, TRUCK_X = 1190;
    const P = 12, SLOT = 3, BOXES = 3;

    /* one blister strip: 0 tablets (EXOZINE), 1 blue capsules (EXZOLE-SB), 2 green capsules (EDOX-LB) */
    function strip(kind) {
      let s = '<rect x="-31" y="-12" width="62" height="24" rx="5" fill="url(#xp-foil)" stroke="#9fb0bd" stroke-width=".8"/>';
      if (kind === 0) {
        for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++)
          s += '<circle cx="' + (-20 + c * 13.3) + '" cy="' + (r ? 5 : -5) + '" r="4.2" fill="url(#xp-tab)"/>';
      } else {
        const col = kind === 1 ? BLUE : GREEN;
        for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
          const x = -24 + c * 16.5, y = r ? 2.2 : -8.8;
          s += '<rect x="' + x + '" y="' + y + '" width="15" height="6.6" rx="3.3" fill="#f4f7f9"/><path d="M' + (x + 3.3) + ' ' + y + 'h4.2v6.6h-4.2a3.3 3.3 0 0 1 0-6.6z" fill="' + col + '"/>';
        }
      }
      return s;
    }

    function box(i) {
      return '<g class="xp-box" id="xp-box' + i + '" opacity="0">' +
        '<ellipse cx="72" cy="2" rx="80" ry="6" fill="#000" opacity=".28"/>' +
        '<polygon class="xp-in" points="0,-90 130,-90 150,-105 20,-105" fill="#8d9fae"/>' +
        '<polygon points="20,-105 150,-105 150,-100 20,-100" fill="#71879a"/>' +
        '<g class="xp-items">' + [0, 1, 2].map(k => '<g class="xp-it" opacity="0">' + strip(k) + '</g>').join('') + '</g>' +
        '<rect x="0" y="-90" width="130" height="90" fill="url(#xp-card)"/>' +
        '<polygon points="130,-90 150,-105 150,-15 130,0" fill="#c4d0da"/>' +
        '<image href="' + IMG + '" x="17" y="-76" width="96" height="34.4"/>' +
        '<text x="65" y="-27" text-anchor="middle" font-size="5.3" letter-spacing=".8" fill="#6b7e8c" font-family="Work Sans,system-ui,sans-serif" font-weight="600">MEDICINES · HANDLE WITH CARE</text>' +
        '<rect x="0" y="-15" width="130" height="5" fill="' + BLUE + '"/><rect x="0" y="-10" width="130" height="2" fill="' + GREEN + '"/>' +
        '<g transform="translate(134,-60) skewY(-36.9) scale(.06)"><use href="#xp-mark" width="330" height="330"/></g>' +
        '<polygon class="xp-fl" points="0,-90 20,-105 -25,-140 -45,-125" fill="#e4ebf0" stroke="#b8c6d2" stroke-width=".8"/>' +
        '<polygon class="xp-fr" points="130,-90 150,-105 182,-163 162,-148" fill="#dbe4eb" stroke="#b8c6d2" stroke-width=".8"/>' +
        '<g class="xp-tape" opacity="0"><polygon points="57,-90 73,-90 93,-105 77,-105" fill="' + GREEN + '"/><rect class="xp-tape-f" x="57" y="-90" width="16" height="0" fill="#6fa62c"/></g>' +
        '</g>';
    }

    let racks = '';
    [[540, 760], [770, 990]].forEach(([a, b]) => {
      racks += '<g opacity=".16" stroke="#9fc3dc" stroke-width="2" fill="none"><path d="M' + a + ' 150V' + BELT + 'M' + b + ' 150V' + BELT + '"/>';
      [210, 290, 370].forEach(y => { racks += '<path d="M' + a + ' ' + y + 'H' + b + '"/>'; });
      racks += '</g>';
      [210, 290, 370].forEach((y, r) => {
        for (let x = a + 14; x < b - 40; x += 46 + (r * 7) % 13) racks += '<rect x="' + x + '" y="' + (y - 34) + '" width="38" height="32" rx="2" fill="#173a52" opacity=".55"/><rect x="' + x + '" y="' + (y - 9) + '" width="38" height="3" fill="' + GREEN + '" opacity=".35"/>';
      });
    });

    let rollers = '';
    for (let x = 512; x < 1186; x += 42) rollers += '<g class="xp-roll" data-x="' + x + '"><circle cx="0" cy="0" r="6.5" fill="#0b2536" stroke="#4d7590" stroke-width="2"/><path d="M-6 0H6M0-6V6" stroke="#4d7590" stroke-width="1.6"/></g>';
    let legs = '';
    [530, 740, 960, 1165].forEach(x => { legs += '<rect x="' + (x - 5) + '" y="' + (BELT + 18) + '" width="10" height="' + (FLOOR - BELT - 18) + '" fill="#0f2e42"/><rect x="' + (x - 14) + '" y="' + (FLOOR - 4) + '" width="28" height="4" rx="2" fill="#123650"/>'; });

    let dustSvg = '';
    for (let i = 0; i < 26; i++) dustSvg += '<circle class="xp-dust" r="' + (1 + (i % 3) * .6).toFixed(1) + '" fill="#cfe7f7"/>';

    const svg =
      '<svg aria-hidden="true">' +
      '<defs>' +
        '<radialGradient id="xp-bg" cx=".68" cy=".32" r=".75"><stop offset="0" stop-color="#0d4361"/><stop offset=".55" stop-color="#072438"/><stop offset="1" stop-color="#03111b"/></radialGradient>' +
        '<linearGradient id="xp-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a2a3d"/><stop offset="1" stop-color="#020b12"/></linearGradient>' +
        '<linearGradient id="xp-beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe3ff" stop-opacity=".16"/><stop offset="1" stop-color="#bfe3ff" stop-opacity="0"/></linearGradient>' +
        '<linearGradient id="xp-card" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e3eaf0"/></linearGradient>' +
        '<linearGradient id="xp-foil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef2f5"/><stop offset=".5" stop-color="#c3ced7"/><stop offset="1" stop-color="#e8edf1"/></linearGradient>' +
        '<radialGradient id="xp-tab" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d4dde4"/></radialGradient>' +
        '<linearGradient id="xp-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a83bf"/><stop offset="1" stop-color="' + BLUE + '"/></linearGradient>' +
        '<linearGradient id="xp-cab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d7e1e8"/></linearGradient>' +
        '<linearGradient id="xp-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5fb4e0"/><stop offset="1" stop-color="#0d3550"/></linearGradient>' +
        '<linearGradient id="xp-fline" x1="0" x2="1"><stop offset="0" stop-color="' + GREEN + '" stop-opacity="0"/><stop offset=".25" stop-color="' + GREEN + '" stop-opacity=".4"/><stop offset="1" stop-color="' + GREEN + '" stop-opacity=".4"/></linearGradient>' +
        '<symbol id="xp-mark" viewBox="0 0 330.1 329.8"><use href="#exm"/></symbol>' +
      '</defs>' +
      '<rect width="100%" height="100%" fill="url(#xp-bg)"/><g id="xp-world">' +
      '<polygon points="870,-600 950,-600 1080,' + FLOOR + ' 740,' + FLOOR + '" fill="url(#xp-beam)"/>' +
      '<polygon points="1290,-600 1350,-600 1480,' + FLOOR + ' 1160,' + FLOOR + '" fill="url(#xp-beam)" opacity=".7"/>' +
      racks +
      '<rect x="-4000" y="' + FLOOR + '" width="10000" height="900" fill="url(#xp-floor)"/>' +
      '<rect x="420" y="' + FLOOR + '" width="1400" height="1.5" fill="url(#xp-fline)"/>' +
      '<g opacity=".07" stroke="#9fc3dc">' + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => '<path d="M' + (i * 200) + ' ' + FLOOR + 'L' + (1000 + (i * 200 - 1000) * 2.6) + ' 800"/>').join('') + '</g>' +
      dustSvg +
      /* packing machine */
      '<g id="xp-machine">' +
        '<rect x="866" y="-600" width="10" height="722" fill="#123650"/><rect x="944" y="-600" width="10" height="722" fill="#123650"/>' +
        '<rect x="836" y="118" width="148" height="140" rx="12" fill="#e8eef2"/>' +
        '<rect x="836" y="232" width="148" height="26" rx="0" fill="#cfd9e1"/><rect x="836" y="118" width="148" height="8" rx="4" fill="' + BLUE + '"/>' +
        '<rect x="848" y="140" width="80" height="40" rx="5" fill="#0b2536"/>' +
        '<g transform="translate(857,146) scale(.085)"><use href="#xp-mark" width="330" height="330"/></g>' +
        '<text x="889" y="168" font-size="9" fill="#cfe7f7" font-family="Work Sans,system-ui,sans-serif" font-weight="600" letter-spacing=".5">LINE 01</text>' +
        '<circle id="xp-led" cx="964" cy="152" r="6" fill="' + GREEN + '"/><circle cx="964" cy="172" r="6" fill="#f2b33d" opacity=".35"/>' +
        '<image href="' + IMG + '" x="852" y="192" width="92" height="33"/>' +
        '<g id="xp-piston"><rect x="896" y="258" width="28" height="18" fill="#9fb0bd"/><polygon points="886,276 934,276 924,296 896,296" fill="#c4d0da"/></g>' +
        '<rect id="xp-flash" x="900" y="294" width="20" height="4" rx="2" fill="' + GREEN + '" opacity="0"/>' +
      '</g>' +
      /* conveyor (back to front) */
      '<rect x="500" y="' + BELT + '" width="690" height="18" rx="9" fill="#123650"/>' +
      '<g id="xp-rollers" opacity=".6" transform="translate(0,' + (BELT + 9) + ')">' + rollers + '</g>' +
      legs +
      '<g id="xp-boxes">' + [0, 1, 2].map(box).join('') + '</g>' +
      '<line id="xp-belt" x1="500" y1="' + (BELT + 1) + '" x2="1188" y2="' + (BELT + 1) + '" stroke="#5f8eab" stroke-width="2.5" stroke-dasharray="16 12"/>' +
      /* delivery truck */
      '<g id="xp-truck">' +
        '<ellipse cx="1385" cy="' + (FLOOR + 2) + '" rx="230" ry="10" fill="#000" opacity=".35"/>' +
        '<g id="xp-tbody">' +
          '<polygon id="xp-door" points="1190,262 1150,282 1150,448 1190,456" fill="#0a6aa0" stroke="#0b5b88" stroke-width="2"/>' +
          '<rect x="1190" y="255" width="282" height="200" rx="8" fill="url(#xp-body)"/>' +
          '<rect x="1190" y="255" width="282" height="10" rx="5" fill="#2a9fd8"/>' +
          '<rect x="1190" y="418" width="282" height="12" fill="' + GREEN + '"/><rect x="1190" y="430" width="282" height="4" fill="#fff" opacity=".75"/>' +
          '<image href="' + IMGR + '" x="1226" y="293" width="210" height="75.3"/>' +
          '<text x="1331" y="398" text-anchor="middle" font-size="13.5" fill="#e6f4fb" font-family="Work Sans,system-ui,sans-serif" font-weight="500" letter-spacing="1.2">CODING A HEALTHIER TOMORROW</text>' +
          '<rect x="1190" y="455" width="390" height="16" rx="4" fill="#0b2536"/>' +
          /* cab */
          '<path d="M1478 312h52c10 0 18 5 23 13l26 42c4 6 6 13 6 20v68h-107z" fill="url(#xp-cab)"/>' +
          '<path d="M1492 326h36c6 0 11 3 14 8l20 33h-70z" fill="url(#xp-glass)"/>' +
          '<path d="M1490 378h40v62h-40z" fill="none" stroke="#b9c7d2" stroke-width="2"/><rect x="1498" y="390" width="12" height="3" rx="1.5" fill="#94a7b6"/>' +
          '<rect x="1574" y="420" width="12" height="9" rx="3" fill="#ffe7a3"/><rect x="1566" y="446" width="22" height="10" rx="3" fill="#b9c7d2"/>' +
          '<rect x="1478" y="452" width="107" height="4" fill="' + GREEN + '"/>' +
          '<path d="M1586 424l70 -18v40z" fill="#fff6cc" opacity=".14"/>' +
        '</g>' +
        [1250, 1322, 1536].map(x => '<g class="xp-wheel" data-x="' + x + '" transform="translate(' + x + ',490)"><circle r="29" fill="#0a1720"/><circle r="17" fill="#41596a"/><g class="xp-spk" stroke="#9fb0bd" stroke-width="3" stroke-linecap="round"><path d="M0-12V12M-12 0H12"/></g><circle r="5" fill="#cfd9e1"/></g>').join('') +
        '<g id="xp-speed" opacity="0" stroke="#cfe7f7" stroke-width="3" stroke-linecap="round"><path d="M1100 300h-90M1120 360h-130M1090 420h-70"/></g>' +
      '</g>' +
      '</g></svg>';

    host.innerHTML = svg;
    /* fit the scene into the clear area above the headline (right side on desktop) */
    const svgEl = host.firstChild, world = host.querySelector('#xp-world');
    function layout() {
      const r = host.getBoundingClientRect(), w = Math.max(1, r.width), h = Math.max(1, r.height);
      svgEl.setAttribute('viewBox', '0 0 ' + w.toFixed(1) + ' ' + h.toFixed(1));
      const CX0 = 470, CX1 = 1592, CY0 = 112, CY1 = FLOOR + 8;
      let s, tx, ty;
      if (w >= 760) {
        const top = 96, bot = h * .62, left = w * .34, right = w - 10;
        s = Math.min((right - left) / (CX1 - CX0), (bot - top) / (CY1 - CY0));
        tx = right - CX1 * s; ty = bot - CY1 * s;
      } else {
        const top = 64, bot = h * .5;
        s = (bot - top) / (CY1 - CY0);
        tx = w * .5 - 1060 * s; ty = bot - CY1 * s;
      }
      world.setAttribute('transform', 'translate(' + tx.toFixed(1) + ',' + ty.toFixed(1) + ') scale(' + s.toFixed(4) + ')');
    }
    layout();
    if (window.ResizeObserver) new ResizeObserver(layout).observe(host); else addEventListener('resize', layout);
    const q = s => host.querySelector(s), qa = s => [...host.querySelectorAll(s)];
    const boxes = qa('.xp-box').map(g => ({
      g, items: [...g.querySelectorAll('.xp-it')], fl: g.querySelector('.xp-fl'), fr: g.querySelector('.xp-fr'),
      inn: g.querySelector('.xp-in'), tape: g.querySelector('.xp-tape'), tapeF: g.querySelector('.xp-tape-f')
    }));
    const rolls = qa('.xp-roll'), wheels = qa('.xp-wheel').map(w => ({ w, x: +w.dataset.x, s: w.querySelector('.xp-spk') }));
    const belt = q('#xp-belt'), truck = q('#xp-truck'), tbody = q('#xp-tbody'), door = q('#xp-door'), speed = q('#xp-speed');
    const led = q('#xp-led'), piston = q('#xp-piston'), flash = q('#xp-flash');
    const dust = qa('.xp-dust').map((c, i) => ({ c, x: 520 + (i * 397) % 1060, y: 60 + (i * 173) % 440, sp: 6 + (i % 5) * 3, ph: i }));
    rolls.forEach(r => r.setAttribute('transform', 'translate(' + r.dataset.x + ',0)'));

    /* flap shapes: open (outward) → upright → closed (flat on the lid) */
    const FL = [[[-45, -125], [-25, -140]], [[0, -155], [20, -170]], [[65, -90], [85, -105]]];
    const FR = [[[162, -148], [182, -163]], [[130, -155], [150, -170]], [[65, -90], [85, -105]]];
    function flap(el, hinge, keys, k) {
      const a = k < .5 ? keys[0] : keys[1], b = k < .5 ? keys[1] : keys[2], kk = k < .5 ? k * 2 : (k - .5) * 2;
      const p = [lerp(a[0][0], b[0][0], kk), lerp(a[0][1], b[0][1], kk), lerp(a[1][0], b[1][0], kk), lerp(a[1][1], b[1][1], kk)];
      el.setAttribute('points', hinge + ' ' + p[2].toFixed(1) + ',' + p[3].toFixed(1) + ' ' + p[0].toFixed(1) + ',' + p[1].toFixed(1));
    }
    const DROP = [.95, 1.35, 1.75];

    function frame(t) {
      const tm = ((t % P) + P) % P;
      /* belt + rollers */
      belt.setAttribute('stroke-dashoffset', (-t * 70).toFixed(1));
      const rot = (t * 70 / 8) * 57.3;
      rolls.forEach(r => r.setAttribute('transform', 'translate(' + r.dataset.x + ',0) rotate(' + (rot % 360).toFixed(1) + ')'));

      /* boxes */
      let dropping = 0;
      boxes.forEach((b, i) => {
        const a = tm - i * SLOT;
        if (i >= BOXES || a < 0 || a > 4.6) { b.g.setAttribute('opacity', '0'); return; }
        let x;
        if (a < .8) x = lerp(470, STATION, easeOut(a / .8));
        else if (a < 2.9) x = STATION;
        else x = lerp(STATION, TRUCK_X + 32, seg(a, 2.9, 4.6));   /* moves at belt speed */
        b.g.setAttribute('opacity', seg(a, 0, .3).toFixed(2));
        b.g.setAttribute('transform', 'translate(' + x.toFixed(1) + ',' + BELT + ')');
        b.items.forEach((it, k) => {
          const d = seg(a, DROP[k], DROP[k] + .45);
          if (d <= 0 || a > 2.6) { it.setAttribute('opacity', '0'); return; }
          if (d < 1) dropping = Math.max(dropping, 1 - d);
          const y = lerp(-158, -46 + k * 4, easeIn(d)), r = lerp(-18 + k * 14, (k - 1) * 6, d);
          it.setAttribute('opacity', '1');
          it.setAttribute('transform', 'translate(' + (65 + (k - 1) * 9) + ',' + y.toFixed(1) + ') rotate(' + r.toFixed(1) + ')');
        });
        flap(b.fl, '0,-90 20,-105', FL, easeIO(seg(a, 2.05, 2.45)));
        flap(b.fr, '130,-90 150,-105', FR, easeIO(seg(a, 2.2, 2.6)));
        const tp = seg(a, 2.6, 2.9);
        b.tape.setAttribute('opacity', tp > 0 ? '1' : '0');
        b.tapeF.setAttribute('height', (22 * tp).toFixed(1));
      });

      /* machine reacts to each drop */
      piston.setAttribute('transform', 'translate(0,' + (dropping * 6).toFixed(1) + ')');
      flash.setAttribute('opacity', (dropping * .9).toFixed(2));
      led.setAttribute('opacity', (.55 + .45 * Math.abs(Math.sin(t * 2.4))).toFixed(2));

      /* truck: leaves after the third box, comes back empty */
      const u = (tm - 11.2 + P) % P;
      let dx = 0, v = 0;
      if (u < 1.4) { dx = easeIn(u / 1.4) * 1150; v = u / 1.4; }
      else if (u < 2.8) { const k = (u - 1.4) / 1.4; dx = (1 - easeOut(k)) * 1150; v = 1 - k; }
      let open;
      if (tm >= 2.35 && tm <= 10.75) open = 1;
      else if (tm > 10.75 && tm < 11.15) open = 1 - seg(tm, 10.75, 11.15);
      else if (tm >= 2.0 && tm < 2.35) open = seg(tm, 2.0, 2.35);
      else open = 0;
      const ow = 40 * easeIO(open);
      door.setAttribute('points', '1190,262 ' + (1190 - ow).toFixed(1) + ',' + (262 + ow * .5).toFixed(1) + ' ' + (1190 - ow).toFixed(1) + ',' + (456 - ow * .2).toFixed(1) + ' 1190,456');
      const bounce = v > .02 ? Math.sin(t * 38) * 1.2 * v : 0;
      truck.setAttribute('transform', 'translate(' + dx.toFixed(1) + ',0)');
      tbody.setAttribute('transform', 'translate(0,' + bounce.toFixed(2) + ')');
      wheels.forEach(w => w.s.setAttribute('transform', 'rotate(' + ((dx / 29) * 57.3 % 360).toFixed(1) + ')'));
      speed.setAttribute('opacity', (v * .5).toFixed(2));

      /* floating dust in the light */
      dust.forEach(p => {
        const y = (p.y - t * p.sp) % 480; const yy = y < 0 ? y + 480 : y;
        p.c.setAttribute('cx', (p.x + Math.sin(t * .6 + p.ph) * 14).toFixed(1));
        p.c.setAttribute('cy', (40 + yy).toFixed(1));
        p.c.setAttribute('opacity', (.12 + .18 * Math.abs(Math.sin(t * .8 + p.ph))).toFixed(2));
      });
    }
    runner(host, frame, 1.6);
    host.classList.add('ready');
  }

  /* ======================= INTERNATIONAL: world map ======================= */
  /* Dotted land map pre-computed from Natural Earth (world-atlas, 1:50m) in a Natural Earth projection.
     Highlighted countries match the home-page globe: India (HQ), Nigeria, Germany, USA, Brazil, Australia. */
  const MAP = {"W":1600,"H":780,"STEP":11,"land":"0ed1e0eo1e0fw1e0g71e0gt1e0h41e0hf1e0hq1e0i11e0ic1e0in1e0iy1e0j91e0jk1e0jv1e0k61e0kh1e0ks1e0r71e0ty1e0u91e0cp1p0eu1p0f51p0fg1p0gd1p0go1p0gz1p0ha1p0hl1p0hw1p0i71p0ii1p0it1p0j41p0jf1p0jq1p0k11p0kc1p0np1p0c8200dr200ed200eo200ez200hf200hq200i1200ic200in200iy200j9200jk200jv200k6200r7200ri200u9200uk200uv200v6200vh200vs200w3200yj200zg200av2b0b62b0bh2b0bs2b0c32b0db2b0dm2b0e82b0eu2b0f52b0ha2b0hl2b0hw2b0i72b0ii2b0it2b0j42b0jf2b0jq2b0k12b0r22b0sl2b0ti2b0tt2b0u42b0uf2b0uq2b0v12b0vc2b0vn2b0vy2b0w92b0wk2b0wv2b0x62b0xh2b0xs2b0z02b0zb2b0zm2b04w2m0572m0962m0a32m0ae2m0bm2m0bx2m0c82m0cj2m0d52m0dg2m0ed2m0fa2m0fl2m0fw2m0hq2m0i12m0ic2m0in2m0iy2m0j92m0jk2m0jv2m0og2m0or2m0p22m0s42m0sq2m0tc2m0tn2m0ty2m0u92m0uk2m0uv2m0v62m0vh2m0vs2m0w32m0we2m0wp2m0x02m0xb2m0xm2m0xx2m0y82m0yj2m0yu2m0z52m0zg2m0zr2m1022m10d2m10o2m10z2m11a2m11w2m1272m12i2m04r2x0522x05d2x05o2x0912x09c2x09n2x09y2x0a92x0ak2x0av2x0b62x0bh2x0bs2x0c32x0ce2x0cp2x0d02x0db2x0dm2x0dx2x0e82x0fg2x0fr2x0g22x0ha2x0hl2x0hw2x0i72x0ii2x0it2x0np2x0o02x0ob2x0om2x0ox2x0p82x0pj2x0pu2x0q52x0r22x0rd2x0ro2x0rz2x0sa2x0sl2x0sw2x0ti2x0tt2x0u42x0uf2x0uq2x0v12x0vc2x0vn2x0vy2x0w92x0wk2x0wv2x0x62x0xh2x0xs2x0y32x0ye2x0yp2x0z02x0zb2x0zm2x0zx2x1082x10j2x10u2x1152x11g2x11r2x1222x12d2x12o2x12z2x13a2x13l2x08k3808v380963809h3809s380a3380ae380ap380b0380bb380bm380bx380c8380cj380cu380d5380dg380e2380eo380ez380fa380fl380hf380hq380i1380k6380kh380ks380nj380nu380o5380or380p2380pd380pz380qa380ql380qw380r7380ri380rt380s4380sf380sq380t1380tc380tn380ty380u9380uk380uv380v6380vh380vs380w3380we380wp380x0380xb380xm380xx380y8380yj380yu380z5380zg380zr381023810d3810o3810z3811a3811l3811w381273812i3812t381343813f3808f3j08q3j0913j09c3j09n3j09y3j0a93j0ak3j0av3j0b63j0bh3j0bs3j0c33j0ce3j0cp3j0d03j0ej3j0fg3j0hl3j0hw3j0lk3j0n33j0ne3j0np3j0om3j0ox3j0p83j0pj3j0pu3j0q53j0qg3j0qr3j0r23j0rd3j0ro3j0rz3j0sa3j0sl3j0sw3j0t73j0ti3j0tt3j0u43j0uf3j0uq3j0v13j0vc3j0vn3j0vy3j0w93j0wk3j0wv3j0x63j0xh3j0xs3j0y33j0ye3j0yp3j0z03j0zb3j0zm3j0zx3j1083j10j3j10u3j1153j11g3j11r3j1223j12d3j12o3j12z3j13a3j13l3j0893u08k3u08v3u0963u09h3u09s3u0a33u0ae3u0ap3u0b03u0bb3u0bm3u0bx3u0c83u0cj3u0eo3u0ez3u0mx3u0n83u0nj3u0nu3u0o53u0pd3u0po3u0pz3u0qa3u0ql3u0qw3u0r73u0ri3u0rt3u0s43u0sf3u0sq3u0t13u0tc3u0tn3u0ty3u0u93u0uk3u0uv3u0v63u0vh3u0vs3u0w33u0we3u0wp3u0x03u0xb3u0xm3u0xx3u0y83u0yj3u0yu3u0z53u0zg3u0zr3u1023u10d3u10o3u10z3u11a3u11l3u08q450914509c4509n4509y450a9450ak450av450b6450bh450bs450c3450ce450cp450ej450eu450f5450fg450fr450lk450lv450np450ox450p8450pj450pu450q5450qg450qr450r2450rd450ro450rz450sa450sl450sw450t7450ti450tt450u4450uf450uq450v1450vc450vn450vy450w9450wk450wv450x6450xh450xs450y3450ye450yp450z0450zb450zm450zx451084510j4512o4512z4508v4g0964g09h4g09s4g0a34g0ae4g0ap4g0b04g0bb4g0bm4g0bx4g0c84g0cj4g0cu4g0d54g0dg4g0ed4g0eo4g0ez4g0fa4g0fl4g0fw4g0m04g0n84g0og4g0or4g0p24g0pd4g0po4g0pz4g0qa4g0ql4g0qw4g0r74g0ri4g0rt4g0s44g0sf4g0sq4g0t14g0tc4g0tn4g0ty4g0u94g0uk4g0uv4g0v64g0vh4g0vs4g0w34g0we4g0wp4g0x04g0xb4g0xm4g0xx4g0y84g0yj4g0yu4g0z54g0zg4g0zr4g1024g10d4g12i4g12t4g1344g08q4r0914r09c4r09n4r09y4r0a94r0ak4r0av4r0b64r0bh4r0bs4r0c34r0ce4r0cp4r0d04r0db4r0dm4r0dx4r0e84r0ej4r0eu4r0f54r0fg4r0fr4r0g24r0l94r0lk4r0lv4r0m64r0o04r0ob4r0om4r0ox4r0p84r0pj4r0pu4r0q54r0qg4r0qr4r0r24r0rd4r0ro4r0rz4r0sa4r0sl4r0sw4r0t74r0ti4r0tt4r0u44r0uf4r0uq4r0v14r0vc4r0vn4r0vy4r0w94r0wk4r0wv4r0x64r0xh4r0xs4r0y34r0ye4r0yp4r0z04r0zb4r0zm4r0zx4r1084r10j4r10u4r1154r11g4r12z4r08v520965209h5209s520a3520ae520ap520b0520bb520bm520bx520c8520cj520cu520d5520dg520dr520e2520ed520eo520ez520fa520fl520m0520mm520nu520o5520og520or520p2520pd520po520pz520qa520ql520qw520r7520ri520rt520s4520sf520sq520t1520tc520tn520ty520u9520uk520uv520v6520vh520vs520w3520we520wp520x0520xb520xm520xx520y8520yj520yu520z5520zg520zr521025210d5210o5210z5211a5211l5208q5d0ce5d0cp5d0d05d0db5d0dm5d0dx5d0e85d0ej5d0eu5d0f55d0g25d0gd5d0lv5d0m65d0mh5d0ms5d0n35d0o05d0ob5d0om5d0ox5d0p85d0pj5d0pu5d0q55d0qg5d0qr5d0r25d0rd5d0ro5d0rz5d0sa5d0sl5d0sw5d0t75d0ti5d0tt5d0u45d0uf5d0uq5d0v15d0vc5d0vn5d0vy5d0w95d0wk5d0wv5d0x65d0xh5d0xs5d0y35d0ye5d0yp5d0z05d0zb5d0zm5d0zx5d1085d10j5d10u5d1155d11g5d11r5d0d55o0dg5o0dr5o0e25o0ed5o0ez5o0fa5o0mb5o0mm5o0mx5o0n85o0nj5o0nu5o0o55o0og5o0or5o0p25o0pd5o0pz5o0ql5o0qw5o0r75o0ri5o0s45o0sf5o0sq5o0t15o0tc5o0tn5o0ty5o0u95o0uk5o0uv5o0v65o0vh5o0vs5o0w35o0we5o0wp5o0x05o0xb5o0xm5o0xx5o0y85o0yj5o0yu5o0z55o0zg5o0zr5o1025o10d5o10o5o10z5o11a5o11w5o0db5z0dm5z0m65z0mh5z0ms5z0n35z0ne5z0o05z0ob5z0om5z0ox5z0p85z0qr5z0r25z0rd5z0rz5z0sa5z0sl5z0sw5z0t75z0ti5z0tt5z0u45z0uf5z0uq5z0v15z0vc5z0vn5z0vy5z0w95z0wk5z0wv5z0x65z0xh5z0xs5z0y35z0ye5z0yp5z0z05z0zb5z0zm5z0zx5z1085z10j5z10u5z1155z1225z0le6a0lp6a0m06a0mb6a0n86a0nu6a0og6a0or6a0p26a0pd6a0r76a0ri6a0sf6a0sq6a0t16a0tc6a0tn6a0ty6a0u96a0uk6a0uv6a0v66a0vh6a0vs6a0w36a0we6a0wp6a0x06a0xb6a0xm6a0xx6a0y86a0yj6a0yu6a0z56a0zg6a0zr6a1026a10d6a10o6a0l96l0lk6l0lv6l0m66l0ob6l0om6l0p86l0pj6l0pu6l0q56l0qg6l0qr6l0r26l0rd6l0ro6l0sl6l0sw6l0t76l0ti6l0tt6l0u46l0uf6l0uq6l0v16l0vc6l0vn6l0vy6l0w96l0wk6l0wv6l0x66l0xh6l0xs6l0y36l0ye6l0yp6l0z06l0zb6l0zm6l1086l10j6l12d6l0le6w0lp6w0m06w0nu6w0or6w0pd6w0po6w0pz6w0qa6w0ql6w0qw6w0r76w0ri6w0rt6w0sf6w0sq6w0t16w0tc6w0tn6w0ty6w0u96w0uk6w0uv6w0v66w0vh6w0vs6w0w36w0we6w0wp6w0x06w0xb6w0xm6w0xx6w0y86w0yj6w0yu6w0z56w0zg6w0zr6w10z6w1276w0lk770m6770mh770ms770n3770ne770qg770qr770r2770rd770ro770rz770sa770sl770sw770t7770ti770tt770u4770uf770uq770v1770vc770vn770vy770w9770wk770wv770x6770xh770xs770y3770ye770yp770z0770zb770zm770zx77115771227712d770le7i0lp7i0m07i0mb7i0mm7i0mx7i0n87i0ql7i0qw7i0r77i0ri7i0rt7i0s47i0sf7i0sq7i0t17i0tc7i0tn7i0ty7i0u97i0uk7i0uv7i0vh7i0vs7i0w37i0we7i0wp7i0x07i0xb7i0xm7i0xx7i0y87i0yj7i0yu7i0z57i0zg7i0zr7i1027i11l7i11w7i08q7t0917t09n7t0l97t0lk7t0lv7t0m67t0mh7t0ms7t0n37t0ne7t0np7t0o07t0om7t0ox7t0p87t0pu7t0qg7t0qr7t0r27t0rd7t0ro7t0rz7t0sa7t0sl7t0sw7t0t77t0ti7t0tt7t0u47t0uf7t0uq7t0vn7t0vy7t0w97t0wk7t0wv7t0x67t0xh7t0xs7t0y37t0ye7t0yp7t0z07t0zb7t0zm7t0zx7t1087t10j7t0968409h8409s840a3840l3840le840lp840m0840mb840mm840mx840n8840nj840nu840o5840og840or840p2840pd840po840pz840qa840ql840qw840r7840ri840rt840sf840sq840t1840tc840tn840ty840u9840uk840uv840vs840w3840we840wp840x0840xb840xx840y8840yj840yu840z5840zg840zr841028410d8408q8f09c8f09n8f09y8f0a98f0kn8f0ky8f0l98f0lk8f0lv8f0m68f0mh8f0ms8f0n38f0ne8f0np8f0o08f0ob8f0om8f0ox8f0p88f0pj8f0pu8f0q58f0qr8f0r28f0rd8f0ro8f0rz8f0sl8f0sw8f0t78f0ti8f0tt8f0u48f0uf8f0wk8f0wv8f0x68f0xs8f0y38f0ye8f0yp8f0z08f0zb8f0zm8f0zx8f1088f10j8f08v8q09h8q09s8q0a38q0ae8q0kh8q0ks8q0l38q0le8q0lp8q0m08q0mb8q0mm8q0mx8q0n88q0nj8q0nu8q0o58q0og8q0or8q0p28q0pd8q0po8q0pz8q0qa8q0qw8q0r78q0ri8q0rt8q0s48q0u98q0uk8q0x08q0xm8q0xx8q0y88q0yj8q0yu8q0z58q0zg8q0zr8q1028q10d8q09n9109y910a9910ce910kc910kn910ky910l9910lk910lv910m6910mh910ms910n3910ne910np910o0910ob910om910ox910p8910pj910pu910q5910qg910r2910rd910ro910rz910sa910sl910sw910t7910x6910xh910xs910y3910ye910yp910z0910zb910zm910zx9109s9c0a39c0ae9c0bb9c0bm9c0cu9c0kh9c0ks9c0l39c0le9c0lp9c0m09c0mb9c0mm9c0mx9c0n89c0nj9c0nu9c0o59c0og9c0or9c0p29c0pd9c0po9c0pz9c0qa9c0ql9c0r79c0ri9c0rt9c0s49c0sf9c0sq9c0t19c0xm9c0xx9c0y89c0yj9c0yu9c09y9n0a99n0ak9n0b69n0bh9n0dm9n0dx9n0kc9n0kn9n0ky9n0l99n0lk9n0lv9n0m69n0mh9n0ms9n0n39n0ne9n0np9n0o09n0ob9n0om9n0ox9n0p89n0pj9n0pu9n0q59n0qg9n0qr9n0rd9n0ro9n0rz9n0sa9n0sl9n0sw9n0xs9n0y39n0ye9n0yp9n0z09n0zm9n0ae9y0ap9y0b09y0bb9y0kh9y0ks9y0l39y0le9y0lp9y0m09y0mb9y0mm9y0mx9y0n89y0nj9y0nu9y0o59y0og9y0or9y0p29y0pd9y0po9y0pz9y0qa9y0ql9y0qw9y0ri9y0rt9y0s49y0sf9y0xx9y0y89y0yj9y0yu9y0z59y10z9y0b6a90bha90bsa90kca90kna90kya90l9a90lka90lva90m6a90mha90msa90n3a90nea90npa90o0a90oba90oma90oxa90p8a90pja90pua90q5a90qga90qra90r2a90roa90rza90yea90ypa90z0a90zba90bmak0bxak0dgak0eoak0khak0ksak0l3ak0leak0lpak0m0ak0mbak0mmak0o5ak0ogak0orak0p2ak0pdak0poak0pzak0qaak0qlak0qwak0r7ak0riak0yuak0z5ak0zgak11lak0d0av0dbav0dmav0dxav0e8av0ejav0knav0kyav0l9av0lkav0lvav0m6av0mhav0o0av0obav0omav0oxav0p8av0pjav0puav0q5av0qgav0qrav0r2av0rdav0roav0rzav0saav0yeav0zbav10uav0c8b60cub60d5b60dgb60drb60e2b60edb60eob60ksb60l3b60leb60lpb60m0b60mbb60nub60o5b60ogb60orb60p2b60pdb60pob60pzb60qab60qlb60qwb60r7b60rib60rtb60s4b60w3b60yjb611ab611lb60d0bh0dbbh0dmbh0dxbh0e8bh0ejbh0eubh0f5bh0fgbh0l9bh0lkbh0lvbh0m6bh0nebh0npbh0o0bh0obbh0ombh0oxbh0p8bh0pjbh0pubh0q5bh0qgbh0qrbh0r2bh0rdbh0robh0rzbh0ypbh0cubs0d5bs0dgbs0drbs0e2bs0ezbs0fabs0flbs0njbs0nubs0o5bs0ogbs0orbs0p2bs0pdbs0pobs0pzbs0qabs0qlbs0qwbs0r7bs0ribs0rtbs0y8bs0yubs10dbs10obs0cpc30d0c30dbc30dmc30e8c30npc30o0c30obc30omc30oxc30p8c30pjc30puc30q5c30qgc30qrc30r2c30rdc30roc30ypc30z0c30zxc3108c310jc310uc30b0ce0cjce0cuce0d5ce0dgce0njce0nuce0o5ce0ogce0orce0p2ce0pdce0poce0pzce0qace0qlce0qwce0r7ce0yuce0zrce102ce10dce10oce0cpcp0d0cp0dbcp0dmcp0npcp0o0cp0obcp0omcp0oxcp0p8cp0pjcp0pucp0q5cp0qgcp0qrcp0r2cp0z0cp0zxcp108cp10jcp12ocp13acp13lcp0c8d00cjd00cud00d5d00nud00o5d00ogd00ord00p2d00pdd00pod00pzd00qad00qld00qwd00z5d010zd0134d013fd013qd0141d014yd00cpdb0d0db0o0db0obdb0omdb0oxdb0p8db0pjdb0pudb0q5db0qgdb0qrdb0r2db0zmdb0zxdb108db13ldb13wdb147db15fdb0cudm0d5dm0nudm0o5dm0ogdm0ordm0p2dm0pddm0podm0pzdm0qadm0qldm0qwdm11ldm13qdm14cdm0d0dx0dbdx0dmdx0dxdx0o0dx0obdx0omdx0oxdx0p8dx0pjdx0pudx0q5dx0qgdx0qrdx0r2dx0d5e80dge80dre80e2e80ede80nue80o5e80oge80ore80p2e80pde80poe80pze80qae80qle80qwe80dbej0dmej0dxej0e8ej0ejej0euej0o0ej0obej0omej0oxej0p8ej0pjej0puej0q5ej0qgej0qrej0r2ej0rzej0saej0dreu0e2eu0edeu0eoeu0ezeu0nueu0o5eu0ogeu0oreu0p2eu0pdeu0poeu0pzeu0qaeu0qleu0rteu0s4eu0dxf50e8f50ejf50euf50f5f50o0f50obf50omf50oxf50p8f50pjf50puf50q5f50qgf50rof50rzf50e2fg0edfg0eofg0ezfg0o5fg0ogfg0orfg0p2fg0pdfg0pofg0pzfg0qafg0rifg0rtfg0dxfr0e8fr0ejfr0eufr0f5fr0fgfr0o0fr0obfr0omfr0oxfr0p8fr0pjfr0pufr0q5fr0qgfr0rofr0e2g20edg20eog20ezg20fag20flg20o5g20ogg20org20p2g20pdg20pog20pzg20dxgd0e8gd0ejgd0eugd0f5gd0fggd0obgd0omgd0oxgd0p8gd0pjgd0pugd0e2go0edgo0eogo0ezgo0fago0oggo0orgo0p2go0pdgo0pogo0dxgz0e8gz0ejgz0eugz0f5gz0fggz0frgz0omgz0oxgz0p8gz0pjgz0e2ha0edha0eoha0ezha0faha0fwha0dxhl0e8hl0ejhl0euhl0f5hl0fghl018hw0e2hw0edhw0eohw0ezhw166hw16hhw01ei70dxi70e8i70eji70eui70e2ii0edii0eoii15kii013it0e8it0ejit14tit154it0e2j40edj40eoj40ezj40e8jf0ejjf0eujf0eojq0fwjq0euk10f5k1","hi":"0712m07c2m07n2m07y2m0892m08k2m08v2m14n2m14y2m1592m06w2x0772x07i2x07t2x0842x08f2x08q2x1542x15f2x0643806f3806q380713807c3807n3807y38089381593805z3j06a3j06l3j06w3j0773j07i3j07t3j0843j0643u06f3u06q3u0713u07y3u08f4505i4g08k4g0n34r0ne4r0np4r0mx520n8520nj520915d09c5d09n5d09y5d0a95d0ak5d0av5d0b65d0bh5d0bs5d0c35d0ne5d0np5d08k5o08v5o0965o09h5o09s5o0a35o0ae5o0ap5o0b05o0bb5o0bm5o0bx5o0c85o0cj5o0cu5o0eo5o08f5z08q5z0915z09c5z09n5z09y5z0a95z0ak5z0av5z0b65z0bh5z0bs5z0c35z0ce5z0cp5z0d05z0dx5z0e85z0ej5z0896a08k6a08v6a0966a09h6a09s6a0a36a0ae6a0ap6a0b06a0bb6a0bm6a0bx6a0c86a0cj6a0cu6a0d56a0dg6a0dr6a0e26a08f6l08q6l0916l09c6l09n6l09y6l0a96l0ak6l0av6l0b66l0bh6l0bs6l0c36l0ce6l0cp6l0d06l0db6l0dm6l0896w08k6w08v6w0966w09h6w09s6w0a36w0ae6w0ap6w0b06w0bb6w0bm6w0bx6w0c86w0cj6w0cu6w0d56w0dg6w08f7708q770917709c7709n7709y770a9770ak770av770b6770bh770bs770c3770ce770cp770d0770db7708k7i08v7i0967i09h7i09s7i0a37i0ae7i0ap7i0b07i0bb7i0bm7i0bx7i0c87i0cj7i0cu7i0v67i09c7t09y7t0a97t0ak7t0av7t0b67t0bh7t0bs7t0c37t0ce7t0v17t0vc7t0ae840ap840cj840v6840vh840xm840ak8f0uq8f0v18f0vc8f0vn8f0vy8f0w98f0xh8f0uv8q0v68q0vh8q0vs8q0w38q0we8q0wp8q0xb8q0uq910v1910vc910vn910vy910w9910wk910wv910v69c0vh9c0vs9c0w39c0we9c0wp9c0vc9n0vn9n0vy9n0w99n0v69y0vh9y0vs9y0w39y0vca90vna90vya90mxak0n8ak0njak0nuak0vhak0vsak0msav0n3av0neav0npav0vnav0vyav0mmb60mxb60n8b60njb60n3bh0edbs0eobs0fwbs0dxc30ejc30euc30f5c30fgc30frc30g2c30drce0e2ce0edce0eoce0ezce0face0flce0fwce0g7ce0dxcp0e8cp0ejcp0eucp0f5cp0fgcp0frcp0g2cp0gdcp0gocp0gzcp0dgd00drd00e2d00edd00eod00ezd00fad00fld00fwd00g7d00gid00gtd00h4d00hfd00dbdb0dmdb0dxdb0e8db0ejdb0eudb0f5db0fgdb0frdb0g2db0gddb0godb0gzdb0hadb0hldb0hwdb0dgdm0drdm0e2dm0eddm0eodm0ezdm0fadm0fldm0fwdm0g7dm0gidm0gtdm0h4dm0hfdm0hqdm0e8dx0ejdx0eudx0f5dx0fgdx0frdx0g2dx0gddx0godx0gzdx0hadx0hldx0eoe80eze80fae80fle80fwe80g7e80gie80gte80h4e80hfe8127e812ie812te813qe80f5ej0fgej0frej0g2ej0gdej0goej0gzej0haej11gej11rej122ej12dej12oej13lej13wej0faeu0fleu0fweu0g7eu0gieu0gteu0h4eu0hfeu11aeu11leu11weu127eu12ieu12teu134eu13feu13qeu0fgf50frf50g2f50gdf50gof50gzf50haf510uf5115f511gf511rf5122f512df512of512zf513af513lf513wf50fafg0flfg0fwfg0g7fg0gifg0gtfg0h4fg102fg10dfg10ofg10zfg11afg11lfg11wfg127fg12ifg12tfg134fg13ffg13qfg141fg0frfr0g2fr0gdfr0zxfr108fr10jfr10ufr115fr11gfr11rfr122fr12dfr12ofr12zfr13afr13lfr13wfr147fr0fwg20g7g2102g210dg210og210zg211ag211lg211wg2127g212ig212tg2134g213fg213qg2141g214cg20frgd0g2gd0gdgd0zxgd108gd10jgd10ugd115gd11ggd11rgd122gd12dgd12ogd12zgd13agd13lgd13wgd147gd0flgo0fwgo102go10dgo10ogo10zgo11ago11lgo11wgo127go12igo12tgo134go13fgo13qgo141go0g2gz0zxgz108gz10jgz10ugz122gz12dgz12ogz12zgz13agz13lgz13wgz0zrha12iha12tha134ha13fha13qha12dhl12ohl12zhl13ahl12oi712zi7","pts":{"hub":[1118,344],"ng":[839,396],"de":[840,179],"us":[396,237],"br":[572,515],"au":[1379,575]}};
  function decode(s) { const o = []; for (let i = 0; i < s.length; i += 5) o.push([parseInt(s.substr(i, 3), 36), parseInt(s.substr(i + 3, 2), 36)]); return o; }

  function worldScene(host) {
    const LAND = decode(MAP.land), HI = decode(MAP.hi), PT = MAP.pts;
    const ROUTES = [
      { k: 'de', name: 'Germany' }, { k: 'ng', name: 'Nigeria' }, { k: 'au', name: 'Australia' },
      { k: 'us', name: 'United States' }, { k: 'br', name: 'Brazil' }
    ].map((r, i) => {
      const a = PT.hub, b = PT[r.k], d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      return Object.assign(r, { a, b, c: [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - d * .3], per: 3.4 + i * .45, off: i * .7 });
    });
    const c = document.createElement('canvas'); host.appendChild(c);
    const ctx = c.getContext('2d');
    const base = document.createElement('canvas'), bctx = base.getContext('2d');
    let w = 0, h = 0, dpr = 1, s = 1, ox = 0, oy = 0;
    const X = x => ox + x * s, Y = y => oy + y * s;

    function size() {
      const r = host.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = base.width = Math.round(w * dpr); c.height = base.height = Math.round(h * dpr);
      c.style.width = w + 'px'; c.style.height = h + 'px';
      s = Math.max(w / MAP.W, h / MAP.H) * (w < 700 ? 1.3 : 1);
      ox = clamp(w * (w < 700 ? .5 : .64) - PT.hub[0] * s, w - MAP.W * s, 0);
      oy = clamp(h * (w < 700 ? .3 : .46) - PT.hub[1] * s, h - MAP.H * s, 0);
      /* static layer: background + dots */
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = bctx.createRadialGradient(X(PT.hub[0]), Y(PT.hub[1]), 0, X(PT.hub[0]), Y(PT.hub[1]), Math.max(w, h) * .9);
      g.addColorStop(0, '#0c3d5a'); g.addColorStop(.5, '#06243a'); g.addColorStop(1, '#020d16');
      bctx.fillStyle = g; bctx.fillRect(0, 0, w, h);
      const rr = Math.max(1, MAP.STEP * s * .2);
      bctx.fillStyle = 'rgba(160,205,235,.22)';
      LAND.forEach(p => { bctx.beginPath(); bctx.arc(X(p[0]), Y(p[1]), rr, 0, 6.283); bctx.fill(); });
      bctx.fillStyle = 'rgba(130,189,65,.62)';
      HI.forEach(p => { bctx.beginPath(); bctx.arc(X(p[0]), Y(p[1]), rr * 1.1, 0, 6.283); bctx.fill(); });
    }
    size();
    if (window.ResizeObserver) new ResizeObserver(size).observe(host); else addEventListener('resize', size);

    const qp = (r, k) => { const m = 1 - k; return [m * m * r.a[0] + 2 * m * k * r.c[0] + k * k * r.b[0], m * m * r.a[1] + 2 * m * k * r.c[1] + k * k * r.b[1]]; };
    function curve(r, k0, k1) { ctx.beginPath(); for (let i = 0; i <= 40; i++) { const p = qp(r, lerp(k0, k1, i / 40)); i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1])); } }
    function label(x, y, txt, sub, hub) {
      ctx.font = '600 ' + (hub ? 13 : 12) + 'px "Work Sans",system-ui,sans-serif';
      const tw = ctx.measureText(txt).width, sw = sub ? (ctx.font = '500 11px "Work Sans",system-ui,sans-serif', ctx.measureText(sub).width + 8) : 0;
      const bw = tw + sw + 20, bh = 24, bx = x + 12, by = y - bh - 8;
      ctx.fillStyle = hub ? 'rgba(130,189,65,.95)' : 'rgba(4,22,34,.78)';
      ctx.strokeStyle = hub ? 'transparent' : 'rgba(130,189,65,.5)';
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 12) : ctx.rect(bx, by, bw, bh); ctx.fill(); ctx.stroke();
      ctx.fillStyle = hub ? '#06243a' : '#fff'; ctx.font = '600 ' + (hub ? 13 : 12) + 'px "Work Sans",system-ui,sans-serif';
      ctx.textBaseline = 'middle'; ctx.fillText(txt, bx + 10, by + bh / 2 + .5);
      if (sub) { ctx.font = '500 11px "Work Sans",system-ui,sans-serif'; ctx.fillStyle = hub ? 'rgba(6,36,58,.75)' : 'rgba(255,255,255,.7)'; ctx.fillText(sub, bx + 10 + tw + 8, by + bh / 2 + .5); }
    }
    function plane(x, y, ang) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(-5, -7); ctx.lineTo(-2, 0); ctx.lineTo(-5, 7); ctx.closePath(); ctx.fill(); ctx.restore();
    }

    function frame(t) {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(base, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      /* light sweep across the land dots */
      const sx = ((t * 160) % (MAP.W + 600)) - 300, rr = Math.max(1, MAP.STEP * s * .22);
      for (const p of LAND) { const d = Math.abs(p[0] - sx); if (d < 90) { ctx.fillStyle = 'rgba(200,232,255,' + (.45 * (1 - d / 90)).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), rr, 0, 6.283); ctx.fill(); } }

      const hx = X(PT.hub[0]), hy = Y(PT.hub[1]);
      ROUTES.forEach((r, i) => {
        const grow = easeOut(seg(t, .4 + i * .3, 1.8 + i * .3));
        if (grow <= 0) return;
        /* route line */
        curve(r, 0, grow); ctx.strokeStyle = 'rgba(130,189,65,.32)'; ctx.lineWidth = 1.6; ctx.setLineDash([4, 5]); ctx.stroke(); ctx.setLineDash([]);
        const bx = X(r.b[0]), by = Y(r.b[1]);
        if (grow >= 1) {
          /* comet + plane */
          const k = (((t - 1.8 - i * .3 - r.off) / r.per) % 1 + 1) % 1, e = easeIO(k);
          const tail = Math.max(0, e - .22);
          const g = ctx.createLinearGradient(X(qp(r, tail)[0]), Y(qp(r, tail)[1]), X(qp(r, e)[0]), Y(qp(r, e)[1]));
          g.addColorStop(0, 'rgba(130,189,65,0)'); g.addColorStop(1, 'rgba(180,230,120,.95)');
          curve(r, tail, e); ctx.strokeStyle = g; ctx.lineWidth = 2.6; ctx.stroke();
          const p = qp(r, e), p2 = qp(r, Math.min(1, e + .01));
          if (k < .97) plane(X(p[0]), Y(p[1]), Math.atan2(p2[1] - p[1], p2[0] - p[0]));
          /* arrival ping */
          if (k < .32) { const q = k / .32; ctx.strokeStyle = 'rgba(130,189,65,' + (.8 * (1 - q)).toFixed(2) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bx, by, 5 + q * 26, 0, 6.283); ctx.stroke(); }
        }
        /* destination marker + label */
        const a = seg(t, 1.4 + i * .3, 2 + i * .3);
        if (a > 0) {
          ctx.globalAlpha = a;
          ctx.fillStyle = 'rgba(130,189,65,.25)'; ctx.beginPath(); ctx.arc(bx, by, 9, 0, 6.283); ctx.fill();
          ctx.fillStyle = '#82BD41'; ctx.beginPath(); ctx.arc(bx, by, 5, 0, 6.283); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bx, by, 2, 0, 6.283); ctx.fill();
          if (w >= 560) label(bx, by, r.name);
          ctx.globalAlpha = 1;
        }
      });
      /* hub: India */
      for (let j = 0; j < 3; j++) { const q = ((t * .55 + j / 3) % 1); ctx.strokeStyle = 'rgba(130,189,65,' + (.7 * (1 - q)).toFixed(2) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(hx, hy, 8 + q * 46, 0, 6.283); ctx.stroke(); }
      const gl = ctx.createRadialGradient(hx, hy, 0, hx, hy, 26); gl.addColorStop(0, 'rgba(130,189,65,.55)'); gl.addColorStop(1, 'rgba(130,189,65,0)');
      ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(hx, hy, 26, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#82BD41'; ctx.beginPath(); ctx.arc(hx, hy, 7, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(hx, hy, 3, 0, 6.283); ctx.fill();
      if (w >= 560) label(hx, hy, 'India', 'HQ · Mumbai', true);
    }
    runner(host, frame, 4.2);
    host.classList.add('ready');
  }

  document.querySelectorAll('[data-pack-scene]').forEach(packScene);
  document.querySelectorAll('[data-world-scene]').forEach(worldScene);
})();
