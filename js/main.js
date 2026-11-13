/* ══════════ Casa Coro Coro — interacción ══════════ */
(function () {
  'use strict';
  var D = document, W = window, CORO = W.CORO || { fotos: [], anillo: [] };
  var $ = function (s, c) { return (c || D).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || D).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var REDUCED = W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = W.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ───────── idioma ───────── */
  var lang = 'es';
  try { lang = localStorage.getItem('lang') || ((navigator.language || 'es').slice(0, 2) === 'en' ? 'en' : 'es'); } catch (e) {}
  function setLang(l) {
    lang = l === 'en' ? 'en' : 'es';
    D.documentElement.lang = lang;
    $$('[data-es]').forEach(function (el) {
      var v = (!FINE && el.getAttribute('data-' + lang + '-touch')) || el.getAttribute('data-' + lang);
      if (v == null) return;
      if (el.hasAttribute('data-html')) el.innerHTML = v; else el.textContent = v;
    });
    $$('.lang button').forEach(function (b) { b.classList.toggle('active', b.dataset.lang === lang); });
    var href = 'https://wa.me/' + CORO.wa + '?text=' + encodeURIComponent(CORO.waMsg[lang]);
    $$('[data-wa]').forEach(function (a) { a.href = href; });
    try { localStorage.setItem('lang', lang); } catch (e) {}
    D.dispatchEvent(new CustomEvent('langchange'));
  }
  D.addEventListener('click', function (e) {
    var b = e.target.closest('.lang button');
    if (b) setLang(b.dataset.lang);
  });
  setLang(lang);

  /* ───────── loader ───────── */
  var loader = $('#loader'), t0 = Date.now();
  function ready() {
    var wait = loader ? Math.max(0, (REDUCED ? 0 : 1900) - (Date.now() - t0)) : 0;
    setTimeout(function () {
      if (loader) loader.classList.add('done');
      D.body.classList.add('loaded');
    }, wait);
  }
  if (D.readyState === 'complete') ready(); else { W.addEventListener('load', ready); setTimeout(ready, 3200); }

  /* ───────── nav ───────── */
  var nav = $('#nav'), burger = $('#burger'), mmenu = $('#mmenu');
  function menu(open) {
    if (!mmenu) return;
    mmenu.classList.toggle('open', open);
    mmenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    D.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger) {
    burger.addEventListener('click', function () { menu(!mmenu.classList.contains('open')); });
    mmenu.addEventListener('click', function (e) { if (e.target.closest('a')) menu(false); });
  }

  /* ───────── revelados ───────── */
  var rvEls = $$('.rv, .rv-img');
  if ('IntersectionObserver' in W && !REDUCED) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, sib = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('rv'); });
        var i = Math.max(0, sib.indexOf(el));
        el.style.setProperty('--rd', Math.min(i, 6) * 80 + 'ms');
        el.classList.add('in');
        io.unobserve(el);
        $$('[data-count]', el).forEach(count);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    rvEls.forEach(function (el) { io.observe(el); });
  } else rvEls.forEach(function (el) { el.classList.add('in'); });

  function count(el) {
    var to = +el.dataset.count, s = performance.now(), dur = 1300;
    (function tick(n) {
      var k = clamp((n - s) / dur, 0, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    })(s);
  }

  /* ───────── tilt 3D ───────── */
  if (FINE && !REDUCED) {
    $$('[data-tilt]').forEach(function (el) {
      var max = +el.dataset.tilt || 8, host = el.parentNode, glare = $('.glare', el);
      host.addEventListener('pointermove', function (e) {
        var r = host.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.classList.add('live');
        el.style.setProperty('--ry', (x * max * 2).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-y * max * 2).toFixed(2) + 'deg');
        if (glare) { glare.style.setProperty('--gx', ((x + 0.5) * 100).toFixed(1) + '%'); glare.style.setProperty('--gy', ((y + 0.5) * 100).toFixed(1) + '%'); }
      });
      host.addEventListener('pointerleave', function () {
        el.classList.remove('live');
        el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg');
      });
    });
    D.addEventListener('pointermove', function (e) {
      var c = e.target.closest && e.target.closest('[data-tilt-card], .gal-cell');
      if (!c) return;
      var r = c.getBoundingClientRect();
      c.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 12).toFixed(2) + 'deg');
      c.style.setProperty('--rx', ((0.5 - (e.clientY - r.top) / r.height) * 12).toFixed(2) + 'deg');
      if (!c._tl) { c._tl = true; c.addEventListener('pointerleave', function () { c.style.setProperty('--ry', '0deg'); c.style.setProperty('--rx', '0deg'); }); }
    });

    /* botones magnéticos */
    $$('.magnetic').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.28).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.4).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ───────── cardumen (canvas con profundidad) ───────── */
  function Shoal(canvas, opt) {
    var host = canvas.parentNode, ctx = canvas.getContext('2d');
    var w = 0, h = 0, dpr = 1, fish = [], rip = [], visible = false, running = false, t = 0;
    var ptr = { x: 0, y: 0, on: false, nx: 0, ny: 0 };
    var rgb = opt.rgb, gold = opt.gold;
    function size() {
      var r = host.getBoundingClientRect();
      w = r.width; h = r.height; dpr = Math.min(W.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      var n = Math.round(clamp(w * h / 26000, 16, opt.max || 52));
      while (fish.length < n) fish.push(make());
      fish.length = n;
      fish.sort(function (a, b) { return b.z - a.z; });
      if (!running) draw();
    }
    function make() {
      var z = Math.pow(Math.random(), 0.8);
      return { x: Math.random() * (w || 1200), y: (0.08 + Math.random() * 0.84) * (h || 700), z: z, a: Math.random() < 0.5 ? 0 : Math.PI, turn: 0,
        sp: (0.45 + Math.random() * 0.6) * (1.25 - z * 0.7), ph: Math.random() * 6.28, panic: 0 };
    }
    function wrap(a) { while (a > Math.PI) a -= 6.2832; while (a < -Math.PI) a += 6.2832; return a; }
    function scatter(x, y) {
      rip.push({ x: x, y: y, r: 6, life: 1 });
      fish.forEach(function (f) {
        var dx = f.x - x, dy = f.y - y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 340) { f.a = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.7; f.panic = 1 - d / 500; }
      });
    }
    function step() {
      for (var i = 0; i < fish.length; i++) {
        var f = fish[i];
        f.turn = (f.turn + (Math.random() - 0.5) * 0.022) * 0.95;
        f.a += f.turn - 0.007 * Math.sin(2 * f.a);
        if (ptr.on && f.panic < 0.1) {
          var dx = ptr.x - f.x, dy = ptr.y - f.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 380 && d > 64) f.a += wrap(Math.atan2(dy, dx) - f.a) * 0.045 * (1 - f.z * 0.6);
          else if (d <= 64) f.a += 0.07;
        }
        if (f.y < h * 0.07) f.a += wrap(1.2 - f.a) * 0.03;
        if (f.y > h * 0.93) f.a += wrap(-1.2 - f.a) * 0.03;
        f.a = wrap(f.a);
        var v = f.sp * (1 + f.panic * 5);
        f.panic *= 0.955;
        f.x += Math.cos(f.a) * v; f.y += Math.sin(f.a) * v;
        if (f.x < -90) f.x = w + 80; else if (f.x > w + 90) f.x = -80;
        if (f.y < -90) f.y = h + 80; else if (f.y > h + 90) f.y = -80;
      }
      for (var j = rip.length - 1; j >= 0; j--) { rip[j].r += 3.2; rip[j].life -= 0.018; if (rip[j].life <= 0) rip.splice(j, 1); }
    }
    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      var base = w < 700 ? 0.78 : 1;
      for (var i = 0; i < fish.length; i++) {
        var f = fish[i], near = 1 - f.z;
        var L = (11 + 25 * near) * base, al = (0.1 + 0.62 * near * near) * (opt.alpha || 1);
        var wag = Math.sin(t * (0.09 + f.sp * 0.07) * (1 + f.panic * 2) + f.ph) * 0.3;
        var px = f.x + ptr.nx * near * 26, py = f.y + ptr.ny * near * 16;
        ctx.save();
        ctx.translate(px, py); ctx.rotate(f.a);
        if (Math.cos(f.a) < 0) ctx.scale(1, -1);
        ctx.scale(L, L);
        ctx.beginPath();
        ctx.moveTo(1, 0.02);
        ctx.bezierCurveTo(0.8, -0.38, 0.05, -0.52, -0.52, -0.09 + wag * 0.2);
        ctx.lineTo(-1.04, -0.42 + wag);
        ctx.quadraticCurveTo(-0.84, wag * 0.85, -1.04, 0.42 + wag);
        ctx.lineTo(-0.52, 0.09 + wag * 0.2);
        ctx.bezierCurveTo(0.05, 0.44, 0.8, 0.32, 1, 0.02);
        ctx.fillStyle = 'rgba(' + rgb + ',' + al.toFixed(3) + ')';
        ctx.fill();
        if (near > 0.55) {
          ctx.fillStyle = 'rgba(' + gold + ',' + (al * 1.2).toFixed(3) + ')';
          for (var k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(0.34 - k * 0.2, -0.04 + wag * 0.03 * k, 0.045, 0, 6.2832); ctx.fill(); }
          for (k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(0.24 - k * 0.2, 0.13 + wag * 0.03 * k, 0.04, 0, 6.2832); ctx.fill(); }
          ctx.fillStyle = 'rgba(' + opt.eye + ',' + Math.min(1, al * 1.5).toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(0.66, -0.07, 0.07, 0, 6.2832); ctx.fill();
        }
        ctx.restore();
      }
      for (var j = 0; j < rip.length; j++) {
        var r = rip[j];
        ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 6.2832);
        ctx.strokeStyle = 'rgba(' + gold + ',' + (r.life * 0.55).toFixed(3) + ')'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(r.x, r.y, r.r * 0.6, 0, 6.2832);
        ctx.strokeStyle = 'rgba(' + rgb + ',' + (r.life * 0.25).toFixed(3) + ')'; ctx.stroke();
      }
    }
    function loop() {
      if (!visible || D.hidden) { running = false; return; }
      t++; step(); draw();
      requestAnimationFrame(loop);
    }
    function start() { if (!running && visible && !REDUCED) { running = true; requestAnimationFrame(loop); } }
    host.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top;
      ptr.nx = ptr.x / r.width - 0.5; ptr.ny = ptr.y / r.height - 0.5;
      ptr.on = e.pointerType !== 'touch';
    });
    host.addEventListener('pointerleave', function () { ptr.on = false; });
    host.addEventListener('pointerdown', function (e) {
      if (e.target.closest('a, button')) return;
      var r = canvas.getBoundingClientRect();
      scatter(e.clientX - r.left, e.clientY - r.top);
    });
    W.addEventListener('resize', size);
    D.addEventListener('visibilitychange', start);
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; start(); }, { threshold: 0 }).observe(host);
    size();
  }
  var sh = $('#shoal-hero'), sc = $('#shoal-contact');
  if (sh && sh.getContext) Shoal(sh, { rgb: '15,61,62', gold: '201,151,63', eye: '246,240,228', max: 54 });
  if (sc && sc.getContext) Shoal(sc, { rgb: '213,231,216', gold: '227,183,104', eye: '15,61,62', max: 40, alpha: 0.55 });

  /* ───────── el pez: zoom a través del ojo (dibujado en canvas) ─────────
     Todo el zoom se pinta en un canvas del tamaño de la pantalla, recortando la
     foto a lo visible: no hay capas gigantes, así que va igual de fluido en PC y teléfono. */
  var pin = $('#pez');
  if (pin && !REDUCED) (function () {
    var stage = $('.eye-stage', pin), cv = $('#eye-canvas'), ctx = cv.getContext('2d'), copy = $('.eye-copy', pin), dest = $('.eye-dest', pin);
    var small = Math.min(W.innerWidth, W.innerHeight) <= 820;
    var fish = new Image(), macroSrc = new Image(), macro = null;
    var cw = 0, ch = 0, dpr = 1, FW, FH, MD, fx, fy, s0, s1, sHide, dx, dy;
    var cur = 0, last = -1, vis = false, run = false, tk = 0, pinned = false, shown = false;
    var EX = 0.1775, EY = 0.4946, AR = 1.7917, EYE_IN_FISH = 0.06, EYE_IN_MACRO = 0.63, PUPIL = 0.15;
    function ss(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }
    fish.decoding = 'async'; macroSrc.decoding = 'async';
    fish.onload = function () { last = -1; };
    macroSrc.onload = function () {
      /* ojo macro con borde difuminado, para que se funda con la cabeza del pez */
      var n = macroSrc.naturalWidth, c = D.createElement('canvas'), x = c.getContext('2d');
      c.width = c.height = n;
      x.drawImage(macroSrc, 0, 0, n, n);
      var g = x.createRadialGradient(n / 2, n / 2, n * 0.28, n / 2, n / 2, n * 0.445);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.globalCompositeOperation = 'destination-in'; x.fillStyle = g; x.fillRect(0, 0, n, n);
      macro = c; last = -1;
    };
    fish.src = 'img/pez/coro-blanco-' + (small ? '1600' : '3200') + '.webp';
    macroSrc.src = 'img/pez/ojo-' + (small ? '900' : '1800') + '.jpg';

    function measure() {
      var w = stage.clientWidth, h = stage.clientHeight;
      if (w === cw && Math.abs(h - ch) < 120 && cw) return;   /* la barra del navegador móvil no re-dibuja todo */
      cw = w; ch = h; dpr = Math.min(W.devicePixelRatio || 1, 2);
      cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
      var narrow = cw <= 900;
      FW = narrow ? cw * 1.02 : Math.min(cw * 0.62, 900); FH = FW / AR;
      fx = cw / 2 - FW / 2; fy = ch * (narrow ? 0.47 : 0.52) - FH / 2;
      MD = Math.min(Math.min(cw, ch) * 0.78, 640);
      var half = Math.sqrt(cw * cw + ch * ch) / 2;
      s0 = (EYE_IN_FISH * FW) / (EYE_IN_MACRO * MD);
      s1 = 1.14 * half / (PUPIL * MD);
      sHide = half / (0.28 * MD);
      dx = cw / 2 - (fx + EX * FW); dy = ch / 2 - (fy + EY * FH);
      last = -1;
    }
    /* dibuja solo la parte visible de una imagen colocada en (x,y,w,h) */
    function blit(img, x, y, w, h, alpha) {
      var x0 = Math.max(0, x), y0 = Math.max(0, y), x1 = Math.min(cw, x + w), y1 = Math.min(ch, y + h);
      if (x1 <= x0 || y1 <= y0 || alpha <= 0.003) return;
      var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, (x0 - x) / w * iw, (y0 - y) / h * ih, (x1 - x0) / w * iw, (y1 - y0) / h * ih, x0, y0, x1 - x0, y1 - y0);
    }
    function draw(p) {
      var q = clamp((p - 0.1) / 0.68, 0, 1);
      var s = s0 * Math.pow(s1 / s0, q), Z = s / s0;
      var k = ss(q / 0.22), bob = (1 - k) * Math.sin(tk * 0.02) * 6;
      var ex = fx + EX * FW + k * dx, ey = fy + EY * FH + k * dy + bob;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, cw, ch);
      if (fish.complete && fish.naturalWidth) {
        var sh = 1 - clamp((Z - 1) / 0.8, 0, 1);
        if (sh > 0.01) {       /* sombra suave bajo el pez */
          var cx = fx + FW * 0.5, cy = fy + FH * 0.94 + bob * 0.3;
          ctx.save(); ctx.translate(cx, cy); ctx.scale(1, 0.13);
          var g = ctx.createRadialGradient(0, 0, 0, 0, 0, FW * 0.42);
          g.addColorStop(0, 'rgba(15,61,62,' + (0.2 * sh).toFixed(3) + ')'); g.addColorStop(1, 'rgba(15,61,62,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, FW * 0.42, 0, 6.2832); ctx.fill(); ctx.restore();
        }
        blit(fish, ex - EX * FW * Z, ey - EY * FH * Z, FW * Z, FH * Z, 1 - clamp((s - sHide * 0.6) / (sHide * 0.4), 0, 1));
      }
      if (macro) blit(macro, ex - MD * s / 2, ey - MD * s / 2, MD * s, MD * s, ss((s - 0.3) / 0.75));
      ctx.globalAlpha = 1;

      var co = 1 - clamp((p - 0.04) / 0.09, 0, 1);
      copy.style.opacity = co.toFixed(3);
      copy.style.transform = 'translate3d(0,' + (-(1 - co) * 36).toFixed(1) + 'px,0)';
      copy.style.visibility = co <= 0 ? 'hidden' : 'visible';

      var R = PUPIL * MD * s * clamp((s - 0.9) / 1.3, 0, 1);
      var open = q >= 0.999;
      dest.style.visibility = R > 1 ? 'visible' : 'hidden';
      dest.style.clipPath = dest.style.webkitClipPath = open ? 'none' : 'circle(' + R.toFixed(1) + 'px at 50% 50%)';
      var show = p > 0.7;
      if (show !== shown) { shown = show; dest.classList.toggle('shown', show); }
      cv.style.visibility = open ? 'hidden' : 'visible';
    }
    function loop() {
      if (!vis) { run = false; if (nav) nav.classList.remove('hide'); return; }
      tk++;
      var r = pin.getBoundingClientRect(), total = Math.max(1, r.height - ch);
      pinned = r.top <= 60 && r.bottom >= ch - 60;
      var p = clamp(-r.top / total, 0, 1);
      cur += (p - cur) * 0.14;
      if (Math.abs(p - cur) < 0.0005) cur = p;
      if (cur !== last || cur < 0.2) { draw(cur); last = cur; }
      if (nav) nav.classList.toggle('hide', pinned && cur < 0.72);
      requestAnimationFrame(loop);
    }
    /* la galería queda centrada en pantalla; el hueco que sobra debajo se recorta
       subiendo la sección siguiente, para que no haya espacio muerto al seguir bajando */
    var destIn = $('.dest-in', pin);
    function trim() {
      var gap = Math.max(0, stage.clientHeight - (destIn.offsetTop + destIn.offsetHeight));
      pin.style.marginBottom = -Math.round(gap) + 'px';
    }
    measure(); draw(0); trim();
    W.addEventListener('load', trim);
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(trim);
    W.addEventListener('resize', function () { measure(); draw(cur); trim(); });
    W.addEventListener('orientationchange', function () { cw = 0; setTimeout(function () { measure(); draw(cur); trim(); }, 250); });
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis && !run) { run = true; measure(); requestAnimationFrame(loop); } }, { threshold: 0 }).observe(pin);
  })();
  else if (pin) { var dd = $('.eye-dest', pin); if (dd) dd.classList.add('shown'); }

  /* ───────── nav: fondo al bajar ───────── */
  function onScroll() {
    var y = W.scrollY || W.pageYOffset;
    if (nav) nav.classList.toggle('scrolled', y > 30);
    $$('[data-par]').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > W.innerHeight + 200) return;
      var k = (r.top + r.height / 2 - W.innerHeight / 2) / W.innerHeight;
      el.style.translate = '0 ' + (k * +el.dataset.par).toFixed(1) + 'px';
    });
  }
  W.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (REDUCED) $$('[data-par]').forEach(function (el) { el.style.translate = 'none'; });

  /* ───────── visor de fotos ───────── */
  var lb = $('#lb'), lbImg = $('#lb-img'), lbCap = $('#lb-cap'), lbCount = $('#lb-count'), lbList = [], lbI = 0, lbFocus = null;
  function lbShow(i, instant) {
    lbI = (i + lbList.length) % lbList.length;
    var ph = CORO.fotos[lbList[lbI]];
    var set = function () {
      lbImg.src = 'img/casa/' + ph.f + '.jpg'; lbImg.alt = ph[lang];
      lbCap.textContent = ph[lang];
      lbCount.textContent = (lbI + 1) + ' / ' + lbList.length;
      lbImg.classList.remove('swap');
    };
    if (instant) return set();
    lbImg.classList.add('swap'); setTimeout(set, 180);
  }
  function lbOpen(list, i) {
    if (!lb) return;
    lbList = list; lbFocus = D.activeElement;
    lb.hidden = false; lbShow(i || 0, true);
    requestAnimationFrame(function () { lb.classList.add('open'); });
    D.body.style.overflow = 'hidden';
    $('#lb-x').focus();
  }
  function lbClose() {
    lb.classList.remove('open'); D.body.style.overflow = '';
    setTimeout(function () { lb.hidden = true; }, 350);
    if (lbFocus && lbFocus.focus) lbFocus.focus();
  }
  if (lb) {
    $('#lb-x').addEventListener('click', lbClose);
    $('#lb-prev').addEventListener('click', function () { lbShow(lbI - 1); });
    $('#lb-next').addEventListener('click', function () { lbShow(lbI + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-fig')) lbClose(); });
    D.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') lbClose();
      if (e.key === 'ArrowLeft') lbShow(lbI - 1);
      if (e.key === 'ArrowRight') lbShow(lbI + 1);
    });
    var sx = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (sx == null) return;
      var d = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(d) > 44) lbShow(lbI + (d < 0 ? 1 : -1));
    });
    D.addEventListener('langchange', function () { if (!lb.hidden) lbShow(lbI, true); });
  }
  var ALL = CORO.fotos.map(function (_, i) { return i; });
  $$('.dest-ph').forEach(function (b) {
    b.addEventListener('click', function () {
      var i = ALL.filter(function (j) { return CORO.fotos[j].f === b.dataset.foto; })[0];
      lbOpen(ALL, i || 0);
    });
  });

  /* ───────── espacios: paneles ───────── */
  var panels = $$('.panel');
  function activate(p) { panels.forEach(function (x) { x.classList.toggle('is-active', x === p); }); }
  panels.forEach(function (p) {
    if (FINE) p.addEventListener('pointerenter', function () { activate(p); });
    p.addEventListener('focus', function () { activate(p); });
    p.addEventListener('click', function (e) {
      var was = p.classList.contains('is-active');
      activate(p);
      if (e.target.closest('[data-open]') || (was && FINE)) {
        var list = ALL.filter(function (i) { return CORO.fotos[i].set === p.dataset.set; });
        var src = ($('img', p).getAttribute('src') || '').replace(/^.*\/|\.jpg$/g, '');
        var first = list.filter(function (i) { return CORO.fotos[i].f === src; })[0];
        if (first != null) list = [first].concat(list.filter(function (i) { return i !== first; }));
        lbOpen(list, 0);
      }
    });
    p.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target === p) p.click(); });
  });

  /* ───────── página de galería ───────── */
  var grid = $('#gal-grid');
  if (grid) {
    CORO.fotos.forEach(function (ph, i) {
      var b = D.createElement('button');
      b.className = 'gal-cell rv'; b.type = 'button'; b.setAttribute('aria-label', ph.es);
      b.innerHTML = '<span class="bg" style="background-image:url(img/casa/' + ph.f + '-900.jpg)"></span><img src="img/casa/' + ph.f + '-900.jpg" alt="' + ph.es + '" loading="' + (i < 8 ? 'eager' : 'lazy') + '" decoding="async" width="675" height="900">';
      b.addEventListener('click', function () { lbOpen(ALL, i); });
      grid.appendChild(b);
      if (typeof io !== 'undefined' && io) io.observe(b); else b.classList.add('in');
    });
  }
})();
