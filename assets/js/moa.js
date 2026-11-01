/* Exonol — mechanism-of-action hero animations (illustrative). One canvas per page: <canvas data-moa="allergy|fungal|bacteria"> */
(function () {
  var cv = document.querySelector('canvas[data-moa]');
  if (!cv || !cv.getContext) return;
  var kind = cv.getAttribute('data-moa'), ctx = cv.getContext('2d');
  var steps = [].slice.call(document.querySelectorAll('.moa-steps li'));
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, S = null, L = 14, running = true, lastStep = -1, scene = null;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function ph(t, a, b) { return clamp((t - a) / (b - a), 0, 1); }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function eo(t) { return 1 - Math.pow(1 - t, 3); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function mixC(a, b, t) { return 'rgb(' + Math.round(lerp(a[0], b[0], t)) + ',' + Math.round(lerp(a[1], b[1], t)) + ',' + Math.round(lerp(a[2], b[2], t)) + ')'; }

  function glow(color, blur) { ctx.shadowColor = color; ctx.shadowBlur = blur; }
  function noGlow() { ctx.shadowBlur = 0; }
  function circle(x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fillStyle = fill; ctx.fill(); }
  function poly(x, y, r, n, rot) { ctx.beginPath(); for (var i = 0; i < n; i++) { var a = rot + i * 6.2832 / n; ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r, y + Math.sin(a) * r); } ctx.closePath(); }
  function capsule(x, y, len, r, ang) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); var h = Math.max(0, len / 2 - r);
    ctx.beginPath(); ctx.moveTo(-h, -r); ctx.lineTo(h, -r); ctx.arc(h, 0, r, -1.5708, 1.5708); ctx.lineTo(-h, r); ctx.arc(-h, 0, r, 1.5708, 4.7124); ctx.closePath(); ctx.restore();
  }

  /* ---------- molecules ---------- */
  function histamine(x, y, k, a, rot) {
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot);
    glow('rgba(255,96,80,.9)', 12 * k); ctx.strokeStyle = '#ff8a70'; ctx.lineWidth = 1.6 * k;
    poly(0, 0, 6 * k, 5, 0); ctx.fillStyle = 'rgba(255,90,70,.85)'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6 * k, 0); ctx.lineTo(13 * k, 0); ctx.stroke(); circle(15 * k, 0, 3 * k, '#ffb3a1');
    noGlow(); ctx.restore();
  }
  function levo(x, y, k, a, rot) { /* three linked rings, brand green */
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot);
    glow('rgba(135,193,63,.95)', 14 * k); ctx.strokeStyle = '#c6f08a'; ctx.lineWidth = 1.5 * k; ctx.fillStyle = 'rgba(135,193,63,.85)';
    poly(-9 * k, -4 * k, 5.5 * k, 6, .52); ctx.fill(); ctx.stroke();
    poly(3 * k, -4 * k, 5.5 * k, 6, .52); ctx.fill(); ctx.stroke();
    poly(-3 * k, 7 * k, 5 * k, 6, .52); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8 * k, -4 * k); ctx.lineTo(15 * k, -8 * k); ctx.stroke(); circle(16 * k, -8.5 * k, 2.6 * k, '#e9ffc9');
    noGlow(); ctx.restore();
  }
  function itra(x, y, k, a, rot) { /* triazole + chain, sky blue */
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot);
    glow('rgba(79,179,255,.95)', 14 * k); ctx.strokeStyle = '#bfe4ff'; ctx.lineWidth = 1.5 * k; ctx.fillStyle = 'rgba(64,160,255,.85)';
    poly(-10 * k, 0, 6 * k, 5, 0); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-4 * k, 0); ctx.lineTo(2 * k, -5 * k); ctx.lineTo(8 * k, 0); ctx.lineTo(14 * k, -5 * k); ctx.stroke();
    poly(19 * k, -3 * k, 5 * k, 6, 0); ctx.fill(); ctx.stroke();
    noGlow(); ctx.restore();
  }
  function doxy(x, y, k, a, rot) { /* four fused rings, gold */
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot);
    glow('rgba(244,192,78,.95)', 14 * k); ctx.strokeStyle = '#ffe3a3'; ctx.lineWidth = 1.4 * k; ctx.fillStyle = 'rgba(240,180,60,.85)';
    for (var i = 0; i < 4; i++) { poly((-13 + i * 8.6) * k, 0, 5 * k, 6, 0); ctx.fill(); ctx.stroke(); }
    noGlow(); ctx.restore();
  }

  /* ---------- background ---------- */
  var dust = [];
  function bg(t) {
    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#04161c'); g.addColorStop(.55, '#0A3533'); g.addColorStop(1, '#0b3f5e');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    var rg = ctx.createRadialGradient(S.cx, S.cy, 0, S.cx, S.cy, S.w * .75);
    rg.addColorStop(0, 'rgba(0,113,180,.28)'); rg.addColorStop(1, 'rgba(0,113,180,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    for (var i = 0; i < dust.length; i++) {
      var d = dust[i], y = (d.y - t * d.v * 10 + H * 2) % H, x = d.x + Math.sin(t * .4 + d.p) * 8;
      circle(x, y, d.r, 'rgba(160,220,255,' + d.a + ')');
    }
  }

  /* ---------- scene: allergy (Exozine) ---------- */
  function sceneAllergy() {
    var R = rng(7), rec = [], hist = [], drug = [], n = 5, k = S.k;
    var cx = S.cx + S.w * .05, cy = S.y + S.h * 1.62, rad = S.h * 1.05;
    for (var i = 0; i < n; i++) {
      var ang = -1.5708 + (i - 2) * .2;
      var px = cx + Math.cos(ang) * rad, py = cy + Math.sin(ang) * rad;
      rec.push({ x: px, y: py, nx: Math.cos(ang), ny: Math.sin(ang), ang: ang });
    }
    for (i = 0; i < 11; i++) hist.push({ x: S.x + R() * S.w, y: S.y + R() * S.h * .55, p: R() * 6, tgt: i < n ? i : -1, t0: .6 + i * .45, rot: R() * 6 });
    for (i = 0; i < 8; i++) drug.push({ sx: S.x - 60 * k - R() * 80 * k, sy: S.y + R() * S.h * .6, tgt: i < n ? i : -1, t0: 4.6 + i * .32, p: R() * 6, fx: S.x + S.w * (.2 + R() * .7), fy: S.y + R() * S.h * .4 });
    return function (t) {
      var infl = clamp(ph(t, .8, 3.8) - ph(t, 6.6, 9.6), 0, 1), calm = ph(t, 8, 10.5);
      /* cell */
      var cg = ctx.createRadialGradient(cx, cy - rad * .4, rad * .2, cx, cy, rad * 1.02);
      cg.addColorStop(0, mixC([20, 70, 110], [120, 40, 50], infl)); cg.addColorStop(1, 'rgba(10,53,51,0)');
      ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, 6.2832); ctx.fill();
      if (infl > .02) { glow('rgba(255,80,60,' + infl * .9 + ')', 40 * k * (1 + .3 * Math.sin(t * 6))); }
      if (calm > .02) { glow('rgba(135,193,63,' + calm * .7 + ')', 30 * k); }
      ctx.strokeStyle = mixC([120, 190, 230], [255, 120, 100], infl); ctx.lineWidth = 3 * k;
      ctx.beginPath(); ctx.arc(cx, cy, rad, -2.5, -.64); ctx.stroke(); noGlow();
      ctx.setLineDash([2 * k, 6 * k]); ctx.strokeStyle = 'rgba(180,220,255,.45)'; ctx.lineWidth = 2 * k;
      ctx.beginPath(); ctx.arc(cx, cy, rad - 9 * k, -2.5, -.64); ctx.stroke(); ctx.setLineDash([]);
      /* receptor state */
      for (var i = 0; i < n; i++) {
        var r = rec[i], hb = ph(t, hist[i].t0 + 1.4, hist[i].t0 + 2.2) * (1 - ph(t, drug[i].t0 + 1.0, drug[i].t0 + 1.6)), db = ph(t, drug[i].t0 + 1.3, drug[i].t0 + 1.8);
        var col = db > .5 ? '#87C13F' : hb > .5 ? '#ff6b5a' : '#8fb8d6';
        ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.ang + 1.5708);
        if (db > .5 || hb > .5) glow(col, 14 * k);
        ctx.strokeStyle = col; ctx.lineWidth = 3 * k; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -14 * k); ctx.moveTo(-8 * k, -26 * k); ctx.lineTo(-6 * k, -14 * k); ctx.lineTo(6 * k, -14 * k); ctx.lineTo(8 * k, -26 * k); ctx.stroke();
        noGlow(); ctx.restore();
      }
      /* histamine */
      for (i = 0; i < hist.length; i++) {
        var h = hist[i], fx = h.x + Math.sin(t * .7 + h.p) * 18 * k, fy = h.y + Math.cos(t * .6 + h.p) * 12 * k, x = fx, y = fy, a = ph(t, h.t0 - .5, h.t0);
        if (h.tgt >= 0) {
          var rr = rec[h.tgt], dx = rr.x + rr.nx * 30 * k, dy = rr.y + rr.ny * 30 * k, m = ease(ph(t, h.t0 + .2, h.t0 + 2.2));
          x = lerp(fx, dx, m); y = lerp(fy, dy, m);
          var kick = eo(ph(t, drug[h.tgt].t0 + 1.0, drug[h.tgt].t0 + 2.6));
          x += (rr.nx * 120 - 60) * k * kick; y += (rr.ny * 120 - 30) * k * kick; a *= 1 - ph(t, drug[h.tgt].t0 + 1.6, drug[h.tgt].t0 + 2.8);
        } else a *= 1 - ph(t, 7.5, 9.5);
        histamine(x, y, k, a, h.rot + t * .5);
      }
      /* drug */
      for (i = 0; i < drug.length; i++) {
        var d = drug[i], a2 = ph(t, d.t0, d.t0 + .4), m2 = ease(ph(t, d.t0, d.t0 + 1.8)), x2, y2;
        if (d.tgt >= 0) { var r2 = rec[d.tgt]; x2 = lerp(d.sx, r2.x + r2.nx * 30 * k, m2); y2 = lerp(d.sy, r2.y + r2.ny * 30 * k, m2); }
        else { x2 = lerp(d.sx, d.fx, m2) + Math.sin(t + d.p) * 10 * k; y2 = lerp(d.sy, d.fy, m2) + Math.cos(t * .8 + d.p) * 8 * k; }
        levo(x2, y2, k, a2, d.p + (1 - m2) * 3);
      }
    };
  }

  /* ---------- scene: fungal (Exzole-SB) ---------- */
  function sceneFungal() {
    var R = rng(11), k = S.k, cells = [], segs = [], drug = [];
    var pos = [[.24, .4], [.62, .24], [.56, .74], [.88, .58]];
    pos.forEach(function (p, ci) {
      var c = { x: S.x + S.w * p[0], y: S.y + S.h * p[1], r: (16 + R() * 4) * k, dots: [] };
      for (var j = 0; j < 14; j++) c.dots.push({ a: j / 14 * 6.2832, v: .6 + R() * .8 });
      cells.push(c);
      (function grow(x, y, ang, len, depth, order) {
        if (depth > 4) return;
        var x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
        segs.push({ x: x, y: y, x2: x2, y2: y2, d: depth + R() * .5, w: (4 - depth) * .9 + 1 });
        var sp = .35 + R() * .35;
        grow(x2, y2, ang - sp, len * (.74 + R() * .12), depth + 1);
        if (depth < 2 || R() < .7) grow(x2, y2, ang + sp, len * (.74 + R() * .12), depth + 1);
      })(c.x, c.y, R() * 6.28, 30 * k, 0);
      (function grow2(x, y, ang, len, depth) {
        if (depth > 3) return;
        var x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
        segs.push({ x: x, y: y, x2: x2, y2: y2, d: depth + .3 + R() * .5, w: (4 - depth) * .9 + 1 });
        grow2(x2, y2, ang + (R() - .5) * .7, len * .8, depth + 1); if (R() < .6) grow2(x2, y2, ang + (R() < .5 ? -1 : 1) * (.5 + R() * .4), len * .7, depth + 1);
      })(c.x, c.y, R() * 6.28 + 3, 26 * k, 0);
    });
    for (var i = 0; i < 14; i++) { var c = i % 4; drug.push({ sx: S.x - 50 * k - R() * 120 * k, sy: S.y + R() * S.h, c: c, a: R() * 6.28, t0: 4.6 + i * .18, p: R() * 6 }); }
    return function (t) {
      var g = ease(ph(t, .3, 4.2)) * (1 - ease(ph(t, 8.2, 11))), hit = ph(t, 6.2, 8.6), fade = 1 - ph(t, 9, 11.5) * .7;
      var col = mixC([214, 178, 72], [110, 120, 120], hit);
      ctx.lineCap = 'round';
      glow('rgba(214,178,72,' + (.6 * (1 - hit)) + ')', 10 * k);
      for (var i = 0; i < segs.length; i++) {
        var s = segs[i], f = clamp(g * 5.2 - s.d, 0, 1); if (f <= 0) continue;
        ctx.strokeStyle = col; ctx.globalAlpha = .85 * fade; ctx.lineWidth = s.w * k;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(lerp(s.x, s.x2, f), lerp(s.y, s.y2, f)); ctx.stroke();
        if (f > .98 && s.d > 3 && t > 2 && t < 7.5) circle(s.x2, s.y2, 2.6 * k * (1 + .3 * Math.sin(t * 5 + i)), 'rgba(240,210,120,.9)');
      }
      ctx.globalAlpha = 1; noGlow();
      cells.forEach(function (c, ci) {
        var sh = 1 - .35 * ph(t, 7.5, 10.5), a = fade;
        ctx.globalAlpha = a; glow('rgba(214,178,72,' + (.7 * (1 - hit)) + ')', 18 * k);
        ctx.beginPath(); ctx.ellipse(c.x, c.y, c.r * 1.25 * sh, c.r * sh, .3 + ci, 0, 6.2832); ctx.fillStyle = mixC([150, 120, 40], [70, 80, 85], hit); ctx.fill(); noGlow();
        circle(c.x - 3 * k, c.y - 2 * k, 5 * k * sh, mixC([90, 70, 20], [60, 65, 70], hit));
        c.dots.forEach(function (d) {
          var br = ph(t, 6.4, 9) * d.v, rr = c.r * 1.55 * sh + br * 40 * k, x = c.x + Math.cos(d.a + t * .2) * rr * 1.1, y = c.y + Math.sin(d.a + t * .2) * rr * .85;
          ctx.globalAlpha = a * (1 - br * .9); circle(x, y, 2.6 * k, '#f1d58a');
        });
        ctx.globalAlpha = 1;
      });
      drug.forEach(function (d) {
        var c = cells[d.c], m = ease(ph(t, d.t0, d.t0 + 2)), tx = c.x + Math.cos(d.a) * c.r * 1.9, ty = c.y + Math.sin(d.a) * c.r * 1.5;
        var a = ph(t, d.t0, d.t0 + .4) * (1 - ph(t, 11, 12.5) * .6);
        itra(lerp(d.sx, tx, m) + Math.sin(t + d.p) * 4 * k, lerp(d.sy, ty, m), k * .9, a, d.a + 3.14);
      });
    };
  }

  /* ---------- scene: bacteria (EDOX-LB) ---------- */
  function sceneBacteria() {
    var R = rng(23), k = S.k, bac = [], drug = [], lab = [];
    var pos = [[.2, .32], [.56, .16], [.4, .6], [.8, .46]];
    pos.forEach(function (p, i) {
      var x = S.x + S.w * p[0], y = S.y + S.h * p[1], a = R() * 3.14, t0 = .8 + i * .5;
      bac.push({ x: x, y: y, a: a, t0: t0, dir: 1, p: R() * 6 }); bac.push({ x: x, y: y, a: a, t0: t0, dir: -1, p: R() * 6 });
    });
    for (var i = 0; i < 16; i++) drug.push({ sx: S.x - 40 * k - R() * 120 * k, sy: S.y + R() * S.h * .8, b: i % 8, t0: 4.6 + i * .18, off: (R() - .5) * 14 * k, p: R() * 6 });
    var gy = S.y + S.h * .98;
    for (i = 0; i < 11; i++) lab.push({ x: S.x + S.w * (.05 + i * .09 + (R() - .5) * .04), dy: (R() * 26) * k, t0: 8.4 + R() * 1.6, a: (R() - .5) * 1.4, p: R() * 6 });
    return function (t) {
      /* gut lining */
      ctx.strokeStyle = 'rgba(143,184,214,.55)'; ctx.lineWidth = 2.5 * k; ctx.beginPath();
      for (var x = S.x - 20 * k; x <= S.x + S.w + 20 * k; x += 4) { var yy = gy - Math.abs(Math.sin((x - S.x) / (22 * k))) * 16 * k; x === S.x - 20 * k ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); }
      ctx.stroke();
      var hit = ph(t, 6.6, 9.2), die = ph(t, 7.6, 10.6);
      bac.forEach(function (b, i) {
        var sp = eo(ph(t, b.t0, b.t0 + 1.6)), len = lerp(30, 34, sp) * k, gap = sp * 24 * k;
        var x = b.x + Math.cos(b.a) * gap * b.dir + Math.sin(t * 1.2 + b.p) * 6 * k * (1 - hit), y = b.y + Math.sin(b.a) * gap * b.dir + Math.cos(t + b.p) * 5 * k * (1 - hit);
        var sh = 1 - .3 * die, a = 1 - die * .85;
        if (sp < .5 && b.dir < 0) return;
        var l = sp < .5 ? lerp(30, 56, sp * 2) * k : len;
        ctx.globalAlpha = a; glow('rgba(229,87,124,' + (.8 * (1 - hit)) + ')', 16 * k);
        capsule(x, y, l * sh, 10 * k * sh, b.a + t * .05 * b.dir); ctx.fillStyle = mixC([200, 70, 110], [90, 95, 100], hit); ctx.fill(); noGlow();
        ctx.strokeStyle = mixC([255, 150, 180], [140, 145, 150], hit); ctx.lineWidth = 1.5 * k; ctx.stroke();
        for (var r = 0; r < 4; r++) { var o = (r - 1.5) * 6 * k * sh; circle(x + Math.cos(b.a) * o, y + Math.sin(b.a) * o, 2.2 * k, hit > .3 ? '#f4c04e' : 'rgba(255,220,235,.85)'); }
        ctx.globalAlpha = 1;
        b._x = x; b._y = y;
      });
      drug.forEach(function (d) {
        var b = bac[d.b], m = ease(ph(t, d.t0, d.t0 + 2)), tx = (b._x || b.x) + d.off, ty = (b._y || b.y) - 18 * k + d.off * .4;
        var a = ph(t, d.t0, d.t0 + .4) * (1 - ph(t, 10.5, 12) * .7);
        doxy(lerp(d.sx, tx, m), lerp(d.sy, ty, m) + Math.sin(t * 1.3 + d.p) * 3 * k, k * .8, a, d.p * .2 + (1 - m) * 2);
      });
      lab.forEach(function (l) {
        var a = ph(t, l.t0, l.t0 + .6), y = gy - 28 * k - l.dy - Math.sin(t * 1.5 + l.p) * 3 * k;
        ctx.globalAlpha = a; glow('rgba(135,193,63,.9)', 14 * k);
        capsule(l.x, y, 20 * k, 5 * k, l.a); ctx.fillStyle = '#87C13F'; ctx.fill(); noGlow(); ctx.globalAlpha = 1;
      });
    };
  }

  function build() {
    var r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var wide = W > 760;
    S = wide ? { x: W * .3, y: H * .14, w: W * .44, h: H * .46 } : { x: W * .08, y: H * .1, w: W * .84, h: H * .42 };
    S.cx = S.x + S.w / 2; S.cy = S.y + S.h / 2; S.k = clamp(Math.min(S.w / 560, S.h / 340), .6, 1.5) * (wide ? 1.4 : 1.05);
    var R = rng(3); dust = [];
    for (var i = 0; i < 46; i++) dust.push({ x: R() * W, y: R() * H, r: R() * 1.6 + .4, a: R() * .35 + .08, v: R() * .6 + .2, p: R() * 6 });
    scene = kind === 'fungal' ? sceneFungal() : kind === 'bacteria' ? sceneBacteria() : sceneAllergy();
  }

  function frame(now) {
    var t = reduce ? 10.5 : (now / 1000) % L;
    ctx.globalAlpha = 1; bg(t);
    var fade = reduce ? 1 : Math.min(ph(t, 0, .7), 1 - ph(t, 13.2, 14));
    ctx.save(); ctx.globalAlpha = fade; scene(t); ctx.restore();
    var st = t < 4.5 ? 0 : t < 8.6 ? 1 : 2;
    if (st !== lastStep) { steps.forEach(function (li, i) { li.classList.toggle('on', i === st); }); lastStep = st; }
    if (running && !reduce) requestAnimationFrame(frame);
  }
  build();
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 150); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { var v = es[0].isIntersecting; if (v && !running) { running = true; requestAnimationFrame(frame); } running = v; }).observe(cv);
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden && !running) { running = true; requestAnimationFrame(frame); } else if (document.hidden) running = false; });
  requestAnimationFrame(frame);
})();
