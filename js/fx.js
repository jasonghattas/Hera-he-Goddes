/* Hera The Goddess: motion and 3D.
   Intro, the pinned 3D hero, ticker, headings, tilt cards, drifting recent nights,
   menu animations, cursor and embers. Styles are in css/fx.css.
   You do not need to edit this file. Everything stops for reduced-motion visitors. */
(() => {
"use strict";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const root = document.documentElement;
const mm = q => !!(window.matchMedia && matchMedia(q).matches);
const reduce = mm("(prefers-reduced-motion: reduce)");
const fine = mm("(hover: hover) and (pointer: fine)");
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ss = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const onScreen = (el, cb, margin = "0px") => {
  if (!("IntersectionObserver" in window)) { cb(true); return; }
  new IntersectionObserver(es => es.forEach(e => cb(e.isIntersecting)), { rootMargin: margin }).observe(el);
};

/* ================= intro: the emblem disc zooms open ================= */
(function intro(){
  const el = $("#intro");
  if (!el) { root.classList.add("ready"); return; }
  if (root.classList.contains("no-intro") || location.hash) { el.remove(); root.classList.add("ready"); return; }
  try { sessionStorage.setItem("hera-intro", "1"); } catch (_) {}
  document.body.classList.add("locked");
  setTimeout(() => el.classList.add("out"), 1500);
  setTimeout(() => { el.classList.add("gone"); root.classList.add("ready"); document.body.classList.remove("locked"); }, 2150);
  setTimeout(() => el.remove(), 2800);
})();

/* ================= the 3D hero ================= */
(function stage(){
  const hero = $("#top"), stick = $("#stick"), copy = $("#hero-copy"), rule = $("#hero-rule");
  const emb = $("#emblem"), scene = $("#scene"), img = $("#emb"), score = $("#score"), cue = $("#cue");
  const tags = $$(".tag");
  if (!hero || !stick || !emb || !scene) return;
  const hasMedia = typeof HERO !== "undefined" && !!(HERO.image || HERO.video);
  const mq = window.matchMedia ? matchMedia("(min-width: 901px) and (min-height: 640px)") : null;
  let staged = false, nat = { cx: 0, w: 0, scoreRight: 0, top: 0 };
  let cur = 0, tx = 0, ty = 0, mx = 0, my = 0, visible = true, raf = 0;

  function measure(){
    const grid = emb.offsetParent;
    nat.cx = (grid ? grid.offsetLeft : 0) + emb.offsetLeft + emb.offsetWidth / 2;
    nat.w = emb.offsetWidth;
    nat.scoreRight = staged ? score.offsetLeft + score.offsetWidth : 0;
    nat.top = parseFloat(getComputedStyle(stick).top) || 0;
  }
  function setStaged(){
    staged = !reduce && !hasMedia && !!(mq && mq.matches);
    root.classList.toggle("staged", staged);
    [copy, rule, emb, score, cue].forEach(e => { if (e) { e.style.transform = ""; e.style.opacity = ""; e.style.visibility = ""; } });
    tags.forEach(t => { t.style.opacity = "0"; });
    measure();
  }
  setStaged();
  if (mq) { const f = () => setStaged(); if (mq.addEventListener) mq.addEventListener("change", f); else if (mq.addListener) mq.addListener(f); }
  addEventListener("resize", measure);
  addEventListener("load", measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  if (reduce) return;
  addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse") return;
    mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1;
  }, { passive: true });

  function frame(now){
    raf = 0;
    const W = innerWidth, H = stick.clientHeight, t = now / 1000;
    tx += (mx - tx) * .07; ty += (my - ty) * .07;
    const floatY = Math.sin(t * 1.1) * 8;
    const sway = fine ? 0 : Math.sin(t * .6) * 11;
    if (staged) {
      const range = Math.max(1, hero.offsetHeight - stick.offsetHeight);
      const p = clamp((nat.top - hero.getBoundingClientRect().top) / range);
      cur += (p - cur) * .12; if (Math.abs(p - cur) < .0004) cur = p;
      const z = ss(.06, .5, cur);

      /* the words lift away */
      const fade = 1 - ss(.02, .24, cur);
      copy.style.opacity = fade.toFixed(3);
      copy.style.visibility = fade < .02 ? "hidden" : "";
      copy.style.transform = "translateY(" + (-cur * H * .3).toFixed(1) + "px)";
      rule.style.opacity = (fade * .7).toFixed(3);
      if (cue) cue.style.opacity = (1 - ss(0, .1, cur)).toFixed(3);

      /* the goddess moves in, grows and turns toward the story */
      const target = Math.max(nat.scoreRight + nat.w * .62 + 80, W * .56);
      const dx = mix(0, Math.min(0, target - nat.cx), z);
      emb.style.transform = "translate(" + dx.toFixed(1) + "px," + (floatY * .6).toFixed(1) + "px) scale(" + mix(1, 1.14, z).toFixed(4) + ")";
      scene.style.transform = "rotateX(" + (-ty * 9 + z * 4).toFixed(2) + "deg) rotateY(" + (tx * 13 - z * 16 + sway).toFixed(2) + "deg)";

      /* the story panel */
      const so = ss(.26, .46, cur);
      score.style.opacity = so.toFixed(3);
      score.style.visibility = so < .02 ? "hidden" : "visible";
      score.style.transform = "translateY(calc(-50% + " + ((1 - so) * 30).toFixed(1) + "px))";

      /* tags pinned to points on the drawing */
      const ir = img.getBoundingClientRect(), sr = stick.getBoundingClientRect();
      tags.forEach(tg => {
        const o = Number(tg.dataset.o);
        const op = ss(.36 + o * .07, .48 + o * .07, cur);
        tg.style.opacity = op.toFixed(3);
        if (op < .01) return;
        const px = ir.left - sr.left + ir.width * Number(tg.dataset.x);
        const py = ir.top - sr.top + ir.height * Number(tg.dataset.y);
        const w = tg.offsetWidth;
        let x = tg.classList.contains("l") ? px - w + 5 : px - 5;
        x = Math.min(W - w - 12, Math.max(12, x));
        tg.style.transform = "translate(" + x.toFixed(1) + "px," + (py - tg.offsetHeight / 2 + (1 - op) * 14).toFixed(1) + "px)";
      });
    } else {
      /* phones: the goddess floats, sways and tips back as the hero scrolls away */
      const r = hero.getBoundingClientRect();
      const q = clamp(-r.top / Math.max(1, r.height));
      emb.style.transform = "translateY(" + (floatY + q * r.height * .18).toFixed(1) + "px)";
      scene.style.transform = "rotateX(" + (-ty * 9 + q * 30).toFixed(2) + "deg) rotateY(" + (tx * 13 + sway).toFixed(2) + "deg)";
    }
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(frame); };
  onScreen(hero, v => { visible = v; start(); }, "100px");
  document.addEventListener("visibilitychange", start);
  start();
})();

/* ================= gold embers (pause when the hero is off-screen) ================= */
(function embers(){
  const c = $("#embers");
  if (!c || !c.getContext || reduce) return;
  const ctx = c.getContext("2d"), ps = [];
  let W = 0, H = 0, raf = 0, on = false, last = 0;
  function size(){
    const d = Math.min(2, window.devicePixelRatio || 1);
    W = c.clientWidth; H = c.clientHeight;
    c.width = Math.round(W * d); c.height = Math.round(H * d);
    ctx.setTransform(d, 0, 0, d, 0, 0);
    const n = innerWidth < 760 ? 26 : 56;
    ps.length = 0; for (let i = 0; i < n; i++) ps.push(spawn(true));
  }
  const spawn = init => ({ x: W * Math.random(), y: init ? Math.random() * H : H * (.8 + Math.random() * .3), r: .6 + Math.random() * 1.8,
    vy: 12 + Math.random() * 34, sw: Math.random() * 6.28, sp: .4 + Math.random() * 1.3, life: 0, max: 4 + Math.random() * 6, warm: Math.random() > .5 });
  function tick(now){
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = "lighter";
    for (const p of ps) {
      p.life += dt; p.y -= p.vy * dt; p.sw += p.sp * dt; p.x += Math.sin(p.sw) * 12 * dt;
      const k = p.life / p.max;
      if (k >= 1 || p.y < -10) { Object.assign(p, spawn(false)); continue; }
      const a = Math.sin(Math.PI * k) * .75, col = p.warm ? "243,215,154" : "226,190,120", R = p.r * 4;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R);
      g.addColorStop(0, "rgba(255,244,214," + a.toFixed(3) + ")");
      g.addColorStop(.25, "rgba(" + col + "," + (a * .7).toFixed(3) + ")");
      g.addColorStop(1, "rgba(" + col + ",0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, 6.283); ctx.fill();
    }
    if (on) raf = requestAnimationFrame(tick);
  }
  const startE = () => { if (on) return; on = true; last = performance.now(); raf = requestAnimationFrame(tick); };
  const stopE = () => { on = false; cancelAnimationFrame(raf); };
  size();
  let vis = true, t;
  onScreen(c.parentElement, v => { vis = v; if (v && !document.hidden) startE(); else stopE(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) stopE(); else if (vis) startE(); });
  let lastW = innerWidth;
  addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => { if (innerWidth !== lastW || !W) { lastW = innerWidth; size(); } }, 150); });
})();

/* ================= ticker: speeds up and leans with your scroll ================= */
(function ticker(){
  const box = $("#ticker"), track = $("#track");
  if (!track) return;
  const sig = ((typeof MENU !== "undefined" && MENU.drinks || []).find(s => s.id === "signature") || { items: [] }).items.map(i => i.n);
  const words = [sig[0], "Fokhara steak", sig[1], "DJ nights every weekend", sig[2], "Shisha", sig[3], "Salhiyeh · Saida"].filter(Boolean);
  const unit = words.map((w, i) => "<span" + (i % 2 ? ' class="o"' : "") + ">" + esc(w) + "</span><b>✦</b>").join("");
  track.innerHTML = unit + unit;
  if (reduce) return;
  let x = 0, lastY = scrollY, vel = 0, last = 0, on = false, raf = 0;
  function tick(now){
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const dy = scrollY - lastY; lastY = scrollY;
    vel += (dy - vel) * .15;
    x -= (50 + Math.abs(vel) * 16) * dt * (vel < -.5 ? -1 : 1);
    const half = track.scrollWidth / 2;
    if (x < -half) x += half; if (x > 0) x -= half;
    track.style.transform = "translateX(" + x.toFixed(1) + "px) skewX(" + clamp(-vel * .5, -10, 10).toFixed(2) + "deg)";
    if (on) raf = requestAnimationFrame(tick);
  }
  onScreen(box, v => {
    if (v && !on) { on = true; last = performance.now(); lastY = scrollY; raf = requestAnimationFrame(tick); }
    else if (!v) { on = false; cancelAnimationFrame(raf); }
  });
})();

/* ================= headings: letters flip up in 3D ================= */
(function split(){
  if (reduce) return;
  const hs = $$(".h2").filter(h => h.children.length === 0);
  hs.forEach(h => {
    const text = h.textContent.trim();
    h.setAttribute("aria-label", text);
    let i = 0;
    const frag = document.createDocumentFragment();
    text.split(/(\s+)/).forEach(word => {
      if (!word) return;
      if (/^\s+$/.test(word)) { frag.appendChild(document.createTextNode(" ")); return; }
      const wd = document.createElement("span"); wd.className = "wd"; wd.setAttribute("aria-hidden", "true");
      Array.from(word).forEach(ch => {
        const c = document.createElement("span"); c.className = "c"; c.style.setProperty("--i", i++); c.textContent = ch; wd.appendChild(c);
      });
      frag.appendChild(wd);
    });
    h.textContent = ""; h.appendChild(frag); h.classList.add("split");
  });
  if (!("IntersectionObserver" in window)) { hs.forEach(h => h.classList.add("in")); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  hs.forEach(h => io.observe(h));
})();

/* ================= recent nights: a strip that drifts sideways as you scroll ================= */
(function strip(){
  const sec = $("#past"), grid = $("#past-grid");
  if (!sec || sec.hidden || !grid || !grid.children.length) return;
  const view = document.createElement("div");
  view.className = "past-view";
  grid.parentNode.insertBefore(view, grid); view.appendChild(grid);
  grid.classList.add("strip");
  const tilts = [-2.4, 1.8, -1.3, 2.5, -1.9, 1.2];
  Array.from(grid.children).forEach((c, i) => c.style.setProperty("--r", tilts[i % tilts.length] + "deg"));
  if (reduce) { view.style.overflowX = "auto"; return; }
  function upd(){
    const r = sec.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const cs = getComputedStyle(view);
    const inner = view.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const max = Math.max(0, grid.scrollWidth - inner);
    const p = clamp((innerHeight - r.top) / (innerHeight + r.height));
    grid.style.transform = "translateX(" + (-p * max).toFixed(1) + "px)";
  }
  addEventListener("scroll", upd, { passive: true }); addEventListener("resize", upd); upd();
})();

/* ================= menu: panels flip in, dishes rise one after another ================= */
(function menuFx(){
  $$(".msec").forEach(sec => $$(".item, .feature", sec).forEach((it, i) => it.style.setProperty("--i", i)));
  if (reduce || !("IntersectionObserver" in window)) { $$(".msec").forEach(s => s.classList.add("in")); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  $$(".msec").forEach(s => io.observe(s));
  $$(".tab").forEach(t => t.addEventListener("click", () => {
    const panel = document.getElementById(t.getAttribute("aria-controls"));
    if (!panel) return;
    panel.classList.remove("swap"); void panel.offsetWidth; panel.classList.add("swap");
  }));

  /* reading progress through the menu */
  const bar = $("#mprog"), menu = $("#menu");
  if (!bar || !menu) return;
  const upd = () => {
    const r = menu.getBoundingClientRect();
    bar.style.transform = "scaleX(" + clamp((innerHeight * .5 - r.top) / r.height).toFixed(4) + ")";
    bar.classList.toggle("on", r.top < innerHeight * .5 && r.bottom > 0);
  };
  addEventListener("scroll", upd, { passive: true }); addEventListener("resize", upd); upd();
})();

/* ================= numbers count up ================= */
(function countUp(){
  const els = $$(".about-facts b").filter(b => /^\d+/.test(b.textContent));
  if (reduce || !els.length || !("IntersectionObserver" in window)) return;
  els.forEach(b => {
    const m = b.textContent.match(/^(\d+)(.*)$/), n = Number(m[1]), tail = m[2];
    b.setAttribute("aria-label", b.textContent);
    b.textContent = "0" + tail;
    const io = new IntersectionObserver(es => {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      (function step(now){
        const k = clamp((now - t0) / 1500), e = 1 - Math.pow(1 - k, 3);
        b.textContent = Math.round(n * e) + tail;
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    });
    io.observe(b);
  });
})();

/* ================= 3D tilt cards (mouse only) ================= */
(function tilt(){
  if (!fine || reduce) return;
  $$(".night, .pillar, .feature, .poster, .past-card, .map-card, .aside .card").forEach(el => el.classList.add("tilt"));
  let active = null;
  function release(el){
    el.classList.remove("tilting");
    el.style.transition = "transform .8s var(--ease), border-color .3s, box-shadow .4s";
    el.style.transform = "";
    setTimeout(() => { if (!el.classList.contains("tilting")) el.style.transition = ""; }, 800);
    if (active === el) active = null;
  }
  document.addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse") return;
    const el = e.target.closest(".tilt");
    if (active && active !== el) release(active);
    if (!el || el.classList.contains("has-map")) return;
    if (parseFloat(getComputedStyle(el).opacity) < .99) return;
    active = el;
    const r = el.getBoundingClientRect();
    const px = clamp((e.clientX - r.left) / r.width), py = clamp((e.clientY - r.top) / r.height);
    const max = el.matches(".poster, .past-card, .map-card") ? 12 : 8;
    el.style.transition = "transform .14s ease-out, border-color .3s, box-shadow .4s";
    el.style.transform = "perspective(900px) rotateX(" + ((.5 - py) * max).toFixed(2) + "deg) rotateY(" + ((px - .5) * max * 1.2).toFixed(2) + "deg) translateY(-4px)";
    el.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
    el.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
    el.classList.add("tilting");
  }, { passive: true });
  document.documentElement.addEventListener("mouseleave", () => { if (active) release(active); });
})();

/* ================= gold cursor and magnetic buttons (mouse only) ================= */
(function cursor(){
  if (!fine || reduce) return;
  const el = document.createElement("div");
  el.className = "cur hide"; el.style.transform = "translate(-100px,-100px)"; el.setAttribute("aria-hidden", "true"); el.innerHTML = "<span></span>";
  document.body.appendChild(el);
  const label = el.firstChild;
  $$('.pillar[href="#menu"]').forEach(a => { a.dataset.cur = "Menu"; });
  $$('.pillar[href="#events"]').forEach(a => { a.dataset.cur = "Lineup"; });
  let x = -100, y = -100, cx = x, cy = y, mag = null, raf = 0;
  function loop(){
    cx += (x - cx) * .22; cy += (y - cy) * .22;
    el.style.transform = "translate(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px)";
    raf = (Math.abs(x - cx) > .3 || Math.abs(y - cy) > .3) ? requestAnimationFrame(loop) : 0;
  }
  addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse") return;
    if (x < -50) { cx = e.clientX; cy = e.clientY; }
    x = e.clientX; y = e.clientY;
    const t = e.target;
    const tagged = t.closest("[data-cur], [data-date]");
    const text = tagged ? (tagged.dataset.cur || "Book") : "";
    el.classList.toggle("label", !!text);
    if (text) label.textContent = text;
    el.classList.toggle("hot", !text && !!t.closest("a, button, label, select, .tilt"));
    el.classList.toggle("hide", !!t.closest("input, textarea, select, iframe"));
    const m = t.closest(".btn");
    if (mag && mag !== m) { mag.style.translate = ""; mag = null; }
    if (m && !m.disabled) {
      mag = m;
      const r = m.getBoundingClientRect();
      m.style.translate = ((x - r.left - r.width / 2) * .22).toFixed(1) + "px " + ((y - r.top - r.height / 2) * .3).toFixed(1) + "px";
    }
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
  addEventListener("pointerdown", () => el.classList.add("down"));
  addEventListener("pointerup", () => el.classList.remove("down"));
  document.documentElement.addEventListener("mouseleave", () => { el.classList.add("hide"); if (mag) { mag.style.translate = ""; mag = null; } });
  document.documentElement.addEventListener("mouseenter", () => el.classList.remove("hide"));
})();

})();
