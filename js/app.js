/* Hera The Goddess: page behaviour.
   You do not need to edit this file. Content lives in js/content.js and js/menu-data.js. */
(() => {
"use strict";

/* ---------------- helpers ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad = n => String(n).padStart(2, "0");
const fmt = v => "$" + (Number.isInteger(v) ? v : v.toFixed(2));
const reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
const parseISO = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const todayISO = () => { const d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
const safeUrl = u => (typeof u === "string" && /^https?:\/\//i.test(u.trim())) ? u.trim() : "";
const bookedOn = iso => Math.max(0, Number(BOOKED[iso]) || 0);
const placesLeft = iso => Math.max(0, CAPACITY - bookedOn(iso));
const placesText = n => n + (n === 1 ? " place" : " places");
/* Dates are written by hand (not Intl) so every browser prints exactly the same text */
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const dLong = d => WEEKDAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()];
const dFull = d => dLong(d) + " " + d.getFullYear();
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WKD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const shortDay = d => WKD[d.getDay()] + " " + d.getDate() + " " + MON[d.getMonth()];
const shortRange = (a, b) => (a.getTime() === b.getTime()) ? a.getDate() + " " + MON[a.getMonth()]
  : a.getDate() + (a.getMonth() === b.getMonth() ? "" : " " + MON[a.getMonth()]) + " – " + b.getDate() + " " + MON[b.getMonth()];
const reveal = i => ' style="--d:' + (Math.min(i, 6) * 0.08).toFixed(2) + 's"';

$("#year").textContent = "© " + new Date().getFullYear() + " Hera The Goddess";

/* ---------------- social links ---------------- */
(function social(){
  if (INSTAGRAM) {
    const url = /^https?:\/\//i.test(INSTAGRAM) ? INSTAGRAM : "https://www.instagram.com/" + INSTAGRAM.replace(/^@/, "") + "/";
    $$("[data-ig]").forEach(a => { a.href = url; });
    ["ig-lineup", "ig-visit", "ig-foot"].forEach(id => { const el = document.getElementById(id); if (el) el.hidden = false; });
  }
  const list = (SOCIALS || []).filter(s => s && s.label && safeUrl(s.url));
  const ul = $("#socials");
  if (list.length && ul) {
    ul.innerHTML = list.map(s => '<li><a href="' + esc(safeUrl(s.url)) + '" target="_blank" rel="noopener">' + esc(s.label) + '</a></li>').join("");
    ul.hidden = false;
  }
})();

/* ---------------- hero photo or video ---------------- */
(function heroMedia(){
  const box = $("#hero-media");
  if (!box || !(HERO.image || HERO.video)) return;
  const wantsVideo = HERO.video && !reduce;
  if (!wantsVideo && !HERO.image) return;
  $(".hero").classList.add("has-media");
  if (wantsVideo) {
    const v = document.createElement("video");
    v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true;
    v.setAttribute("playsinline", ""); v.setAttribute("muted", ""); v.preload = "metadata";
    if (HERO.image) v.poster = HERO.image;
    v.src = HERO.video;
    box.appendChild(v);
    const p = v.play(); if (p && p.catch) p.catch(() => {});
  } else {
    const img = new Image();
    img.alt = ""; img.decoding = "async"; img.fetchPriority = "high"; img.src = HERO.image;
    box.appendChild(img);
  }
})();

/* ---------------- events: upcoming weekends, recent nights, hero pill ---------------- */
const nightIsUpcoming = n => { const d = parseISO(n.date); return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 6) > new Date(); };
const djLine = n => (n.djs && n.djs.length) ? n.djs.map(esc).join('<span class="amp">&amp;</span>') : "";
const plainNames = n => (n.djs && n.djs.length) ? n.djs.join(" & ") : (n.title || "");
const posterAlt = nights => "Hera weekend lineup poster. " + nights.map(n => dLong(parseISO(n.date)) + ": " + ((n.djs && n.djs.length) ? n.djs.join(" and ") : (n.title || "see poster"))).join(". ") + ".";

function nightCard(n, i){
  const d = parseISO(n.date);
  const isToday = n.date === todayISO();
  const left = placesLeft(n.date), used = CAPACITY - left;
  const cls = left === 0 ? " full" : (left <= 10 ? " low" : "");
  const txt = left === 0 ? "Full" : placesText(left) + " left of " + CAPACITY;
  const avail = '<div class="avail' + cls + '"><span>' + txt + '</span><span class="meter" aria-hidden="true"><i style="width:' + Math.round(used / CAPACITY * 100) + '%"></i></span></div>';
  const action = left === 0
    ? '<a class="btn btn-full" href="tel:' + PHONE_TEL + '">Full, call ' + PHONE_DISPLAY + '</a>'
    : '<a class="btn" href="#reserve" data-date="' + esc(n.date) + '">Reserve this night</a>';
  const hasDj = n.djs && n.djs.length;
  const title = hasDj && n.title ? '<p class="night-title">' + esc(n.title) + '</p>' : '';
  const label = hasDj ? "On the decks" : "Tonight at Hera";
  const main = hasDj ? djLine(n) : esc(n.title || "");
  const note = n.note ? '<p class="night-note">' + esc(n.note) + '</p>' : '';
  return '<article class="night reveal"' + reveal(i) + '>' +
    '<div class="night-date"><span class="day">' + d.getDate() + '</span>' +
    '<span class="dm"><b>' + WEEKDAYS[d.getDay()] + (isToday ? '<span class="tonight">TONIGHT</span>' : '') + '</b><span>' + MONTHS[d.getMonth()] + '</span></span></div>' +
    avail +
    '<div>' + title + '<p class="label">' + label + '</p><h3>' + main + '</h3>' + note + '</div>' +
    action + '</article>';
}

(function renderEvents(){
  const weekends = (WEEKENDS || []).filter(w => w && w.nights && w.nights.length);
  const upcoming = [], past = [];
  weekends.forEach(w => {
    const nights = w.nights.slice().sort((a, b) => a.date.localeCompare(b.date));
    const up = nights.filter(nightIsUpcoming);
    if (up.length) upcoming.push({ poster: w.poster, nights: up, all: nights });
    else past.push({ poster: w.poster, nights });
  });
  upcoming.sort((a, b) => a.nights[0].date.localeCompare(b.nights[0].date));
  past.sort((a, b) => b.nights[0].date.localeCompare(a.nights[0].date));

  const box = $("#upcoming");
  if (!upcoming.length) {
    box.innerHTML = '<p class="lineup-empty reveal">This week’s lineup is coming soon. Call or WhatsApp ' + PHONE_DISPLAY + ' to ask who is playing.</p>';
  } else {
    box.innerHTML = upcoming.map(w => {
      const poster = w.poster
        ? '<figure class="poster reveal"><img src="' + esc(w.poster) + '" alt="' + esc(posterAlt(w.all)) + '" loading="lazy" decoding="async"></figure>'
        : '';
      return '<div class="weekend' + (w.poster ? ' has-poster' : '') + '">' + poster +
        '<div class="nights">' + w.nights.map(nightCard).join("") + '</div></div>';
    }).join("");
  }

  /* recent nights (posters + names, newest first) */
  const recent = past.slice(0, 12);
  if (recent.length) {
    $("#past-grid").innerHTML = recent.map((w, i) => {
      const first = parseISO(w.nights[0].date), last = parseISO(w.nights[w.nights.length - 1].date);
      const head = shortRange(first, last);
      const lines = w.nights.map(n => '<li><span>' + esc(shortDay(parseISO(n.date))) + '</span> ' + esc(plainNames(n) || "See poster") + '</li>').join("");
      const img = w.poster ? '<img src="' + esc(w.poster) + '" alt="' + esc(posterAlt(w.nights)) + '" loading="lazy" decoding="async">' : '';
      return '<article class="past-card reveal"' + reveal(i % 4) + '>' +
        (img ? '<div class="past-img">' + img + '</div>' : '') +
        '<div class="past-cap"><b>' + esc(head) + '</b><ul>' + lines + '</ul></div></article>';
    }).join("");
    $("#past").hidden = false;
  }

  $("#djlist").innerHTML = RECENT_DJS.map(n => "<li>" + esc(n) + "</li>").join("");

  /* hero pill: the next night */
  const pill = $("#next-night");
  const next = upcoming.length ? upcoming[0].nights[0] : null;
  if (pill && next) {
    const d = parseISO(next.date);
    const who = plainNames(next);
    pill.innerHTML = '<i aria-hidden="true"></i><span>' + (next.date === todayISO() ? "Tonight" : "Next night") + '</span><b>' +
      esc(shortDay(d)) + '</b>' + (who ? '<em>' + esc(who) + '</em>' : '');
    pill.hidden = false;
  }
})();

/* ---------------- menu ---------------- */
function renderItem(it){
  const desc = it.d ? '<p class="item-desc">' + esc(it.d) + '</p>' : '';
  const img = it.img ? '<img class="item-img" src="' + esc(it.img) + '" alt="' + esc(it.alt || it.n) + '" loading="lazy" decoding="async">' : '';
  const cls = "item" + (it.img ? " has-img" : "");
  if (it.sizes) {
    return '<div class="' + cls + '">' + img + '<div class="item-body"><div class="item-head sized"><span class="item-name">' + esc(it.n) + '</span><span class="leader"></span><span class="sizes">' +
      it.sizes.map(s => '<span class="cell"><small>' + esc(s[0]) + '</small><b>' + fmt(s[1]) + '</b></span>').join("") +
      '</span></div>' + desc + '</div></div>';
  }
  return '<div class="' + cls + '">' + img + '<div class="item-body"><div class="item-head"><span class="item-name">' + esc(it.n) + '</span><span class="leader"></span><b class="price">' + fmt(it.p) + '</b></div>' + desc + '</div></div>';
}
function renderSection(key, s){
  let body;
  if (s.kind === "feature") {
    body = '<div class="features">' + s.items.map(it =>
      '<div class="feature' + (it.img ? ' has-img' : '') + '">' +
      (it.img ? '<img class="feature-img" src="' + esc(it.img) + '" alt="' + esc(it.alt || it.n) + '" loading="lazy" decoding="async">' : '') +
      '<div class="feature-body">' + (it.tag ? '<span class="tag">' + esc(it.tag) + '</span>' : '') +
      '<h4>' + esc(it.n) + '</h4><p>' + esc(it.d) + '</p><b class="price">' + fmt(it.p) + '</b></div></div>').join("") + '</div>';
  } else {
    body = '<div class="items">' + s.items.map(renderItem).join("") + '</div>';
  }
  const sub = s.sub && s.kind !== "feature" ? '<p class="sub">' + esc(s.sub) + '</p>' : '';
  return '<div class="msec" id="' + key + '-' + s.id + '" data-key="' + key + '"><h3>' + esc(s.title) + '</h3>' + sub + body + '</div>';
}
Object.keys(MENU).forEach(key => {
  const secs = MENU[key];
  const nav = secs.length > 1
    ? '<nav class="subnav" aria-label="' + esc(key) + ' categories">' + secs.map(s => '<a class="chip" href="#' + key + '-' + s.id + '">' + esc(s.title) + '</a>').join("") + '</nav>'
    : '';
  $("#panel-" + key).innerHTML = nav + secs.map(s => renderSection(key, s)).join("");
});

const tabs = $$(".tab");
function selectTab(tab, focus){
  tabs.forEach(t => {
    const on = t === tab;
    t.setAttribute("aria-selected", on ? "true" : "false");
    t.tabIndex = on ? 0 : -1;
    $("#" + t.getAttribute("aria-controls")).hidden = !on;
  });
  if (focus) tab.focus();
}
tabs.forEach((t, i) => {
  t.addEventListener("click", () => selectTab(t));
  t.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") { e.preventDefault(); selectTab(tabs[(i + 1) % tabs.length], true); }
    if (e.key === "ArrowLeft") { e.preventDefault(); selectTab(tabs[(i - 1 + tabs.length) % tabs.length], true); }
    if (e.key === "Home") { e.preventDefault(); selectTab(tabs[0], true); }
    if (e.key === "End") { e.preventDefault(); selectTab(tabs[tabs.length - 1], true); }
  });
});

/* highlight the menu category you are reading */
(function menuSpy(){
  if (!("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const panel = en.target.closest('[role="tabpanel"]');
      if (!panel || panel.hidden) return;
      const nav = $(".subnav", panel);
      if (!nav) return;
      $$(".chip", nav).forEach(c => {
        const on = c.getAttribute("href") === "#" + en.target.id;
        c.classList.toggle("active", on);
        if (on) { c.setAttribute("aria-current", "true"); nav.scrollTo({ left: c.offsetLeft - nav.clientWidth / 2 + c.offsetWidth / 2, behavior: reduce ? "auto" : "smooth" }); }
        else c.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-140px 0px -65% 0px" });
  $$(".msec").forEach(s => io.observe(s));
})();

/* ---------------- gallery + lightbox ---------------- */
(function gallery(){
  const items = (GALLERY || []).filter(g => g && g.src);
  if (!items.length) return;
  $("#gallery").hidden = false;
  $$('[data-optional="gallery"]').forEach(a => { a.hidden = false; });

  const cats = Array.from(new Set(items.map(g => g.cat).filter(Boolean)));
  const filters = $("#g-filters");
  if (cats.length > 1) {
    filters.innerHTML = ["All"].concat(cats).map((c, i) =>
      '<button class="chip" type="button" data-cat="' + (i ? esc(c) : "") + '" aria-pressed="' + (i === 0 ? "true" : "false") + '">' + esc(c) + '</button>').join("");
  } else filters.hidden = true;

  $("#g-grid").innerHTML = items.map((g, i) =>
    '<li class="g-cell reveal"' + reveal(i % 3) + ' data-cat="' + esc(g.cat || "") + '"><button class="g-item" type="button" data-i="' + i + '" aria-label="Open photo: ' + esc(g.alt || "Hera") + '">' +
    '<img src="' + esc(g.thumb || g.src) + '" alt="' + esc(g.alt || "") + '"' + (g.w && g.h ? ' width="' + Number(g.w) + '" height="' + Number(g.h) + '"' : '') + ' loading="lazy" decoding="async">' +
    '</button></li>').join("");

  filters.addEventListener("click", e => {
    const b = e.target.closest("button[data-cat]");
    if (!b) return;
    $$("button", filters).forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    $$(".g-cell").forEach(li => { li.hidden = !!b.dataset.cat && li.dataset.cat !== b.dataset.cat; });
  });

  const dlg = $("#lightbox"), img = $("#lb-img"), cap = $("#lb-cap");
  let list = [], idx = 0, opener = null;
  function show(i){
    idx = (i + list.length) % list.length;
    const g = list[idx];
    img.src = g.src; img.alt = g.alt || "";
    cap.textContent = (g.alt || "") + (list.length > 1 ? "  ·  " + (idx + 1) + " / " + list.length : "");
    $("#lb-prev").hidden = $("#lb-next").hidden = list.length < 2;
  }
  function open(i, trigger){
    list = $$(".g-cell").filter(li => !li.hidden).map(li => items[Number($(".g-item", li).dataset.i)]);
    const start = Math.max(0, list.indexOf(items[i]));
    opener = trigger;
    show(start);
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
  }
  $("#g-grid").addEventListener("click", e => {
    const b = e.target.closest(".g-item");
    if (b) open(Number(b.dataset.i), b);
  });
  $("#lb-close").addEventListener("click", () => dlg.close());
  $("#lb-prev").addEventListener("click", () => show(idx - 1));
  $("#lb-next").addEventListener("click", () => show(idx + 1));
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("close", () => { img.removeAttribute("src"); if (opener) opener.focus(); });
  dlg.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") { e.preventDefault(); show(idx - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); show(idx + 1); }
  });
  let sx = 0;
  dlg.addEventListener("touchstart", e => { sx = e.changedTouches[0].clientX; }, { passive: true });
  dlg.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50 && list.length > 1) show(idx + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();

/* ---------------- reviews (only genuine, supplied reviews) ---------------- */
(function reviews(){
  const list = (REVIEWS || []).filter(r => r && r.name && r.text && r.source && r.rating >= 1 && r.rating <= 5);
  if (!list.length) return;
  $("#reviews").hidden = false;
  $$('[data-optional="reviews"]').forEach(a => { a.hidden = false; });
  const stars = n => '<span class="rstars" role="img" aria-label="' + n + ' out of 5 stars">' + "★".repeat(Math.round(n)) + '<span class="off">' + "★".repeat(5 - Math.round(n)) + '</span></span>';

  const s = REVIEW_SUMMARY;
  if (s && s.rating && s.count) {
    const src = esc(s.source || "");
    const link = safeUrl(s.url);
    $("#r-summary").innerHTML = '<b class="r-score">' + Number(s.rating).toFixed(1) + '</b>' + stars(Number(s.rating)) +
      '<span class="r-count">' + Number(s.count) + ' reviews' + (src ? ' on ' + (link ? '<a href="' + esc(link) + '" target="_blank" rel="noopener">' + src + '</a>' : src) : '') + '</span>';
    $("#r-summary").hidden = false;
  }
  $("#r-grid").innerHTML = list.map((r, i) => {
    const url = safeUrl(r.url);
    const from = esc(r.source) + (r.date ? ' &middot; ' + esc(r.date) : '');
    return '<figure class="review reveal"' + reveal(i % 3) + '>' + stars(r.rating) +
      '<blockquote><p>' + esc(r.text) + '</p></blockquote>' +
      '<figcaption><b>' + esc(r.name) + '</b><span>' + (url ? '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + from + '</a>' : from) + '</span></figcaption></figure>';
  }).join("");
  const all = safeUrl(REVIEW_LINKS.all), write = safeUrl(REVIEW_LINKS.write);
  if (all || write) {
    $("#r-links").innerHTML = (all ? '<a class="btn" href="' + esc(all) + '" target="_blank" rel="noopener">Read all reviews</a>' : '') +
      (write ? '<a class="btn" href="' + esc(write) + '" target="_blank" rel="noopener">Write a review</a>' : '');
    $("#r-links").hidden = false;
  }
})();

/* ---------------- map ---------------- */
(function mapBox(){
  const dir = safeUrl(MAP.directions);
  if (dir) { $("#directions").href = dir; $("#map-open").href = dir; }
  const embed = (MAP.embed || "").trim();
  if (/^https:\/\/www\.google\.com\/maps\/embed/i.test(embed)) {
    const card = $("#map-card");
    card.classList.add("has-map");
    card.innerHTML = '<iframe src="' + esc(embed) + '" title="Map showing where Hera The Goddess is" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>';
  }
})();

/* ---------------- header and navigation ---------------- */
(function nav(){
  const header = $("#site-header"), btn = $("#menu-btn"), nav = $("#site-nav");
  const setNav = open => {
    nav.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("nav-open", open);
  };
  btn.addEventListener("click", () => setNav(!nav.classList.contains("open")));
  nav.addEventListener("click", e => { if (e.target.closest("a")) setNav(false); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && nav.classList.contains("open")) { setNav(false); btn.focus(); }
  });
  if (window.matchMedia) {
    const mq = matchMedia("(min-width: 981px)");
    const onChange = e => { if (e.matches) setNav(false); };
    if (mq.addEventListener) mq.addEventListener("change", onChange); else if (mq.addListener) mq.addListener(onChange);
  }
  const firstSection = $("#about");
  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 8);
    /* back in the hero: no section is "current" */
    if (firstSection && window.scrollY < firstSection.offsetTop - window.innerHeight * 0.4) {
      $$('#site-nav a[aria-current]').forEach(a => a.removeAttribute("aria-current"));
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if ("IntersectionObserver" in window) {
    const links = $$('#site-nav a[href^="#"]:not(.btn)');
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(a => {
          if (a.getAttribute("href") === "#" + en.target.id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    links.forEach(a => { const s = document.getElementById(a.getAttribute("href").slice(1)); if (s) io.observe(s); });
  }
})();

/* in-page links (smooth scroll, menu tab links, "Reserve this night") */
document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute("href").slice(1);
  const target = id ? document.getElementById(id) : document.body;
  if (!target || target.hidden) return;
  e.preventDefault();
  if (a.dataset.date) setDate(a.dataset.date);
  if (a.dataset.menuTab) selectTab($("#tab-" + a.dataset.menuTab));
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  if (history.replaceState && id) history.replaceState(null, "", "#" + id);
});

/* ---------------- booking form ---------------- */
const form = $("#book"), sent = $("#sent");
const dateEl = $("#date"), timeEl = $("#time"), guestsEl = $("#guests");
dateEl.min = todayISO();

(function fillTimes(){
  for (let m = 17 * 60; m <= 25 * 60; m += 30) {
    const h24 = Math.floor(m / 60) % 24, mm = m % 60;
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    const label = h12 + ":" + pad(mm) + (h24 >= 12 ? " PM" : " AM");
    const o = document.createElement("option");
    o.value = label; o.textContent = label;
    timeEl.appendChild(o);
  }
})();

(function fillOccasions(){
  const list = ["Birthday", "Bachelor / Bachelorette", "Private party", "Group dinner", "Corporate event", "Drinks & music"];
  $("#occ").innerHTML = list.map((o, i) =>
    '<label class="opt"><input type="radio" name="occ" value="' + esc(o) + '" id="occ-' + i + '"><span>' + esc(o) + '</span></label>').join("");
})();

const maxGuests = () => (dateEl.value && dateEl.value >= todayISO()) ? Math.max(1, Math.min(CAPACITY, placesLeft(dateEl.value))) : CAPACITY;
$("#g-minus").addEventListener("click", () => { guestsEl.value = Math.max(1, (parseInt(guestsEl.value, 10) || 1) - 1); updateCap(); });
$("#g-plus").addEventListener("click", () => { guestsEl.value = Math.min(maxGuests(), (parseInt(guestsEl.value, 10) || 0) + 1); updateCap(); });
guestsEl.addEventListener("input", () => updateCap());

function setDate(iso){
  if (form.hidden) { sent.hidden = true; form.hidden = false; }
  dateEl.value = iso;
  dateHint();
  updateCap();
}
function dateHint(){
  const hint = $("#date-hint");
  if (!dateEl.value) { hint.textContent = "We open Tuesday to Sunday from 5 PM. Up to " + CAPACITY + " guests per night."; return; }
  const d = parseISO(dateEl.value);
  hint.textContent = d.getDay() === 1
    ? "We usually open Tuesday to Sunday. Our team will tell you if we can host you on a Monday."
    : "We open Tuesday to Sunday from 5 PM.";
}
dateEl.addEventListener("change", () => { dateHint(); updateCap(); });

function setSubmit(full){
  const b = $("#submit-btn");
  b.disabled = full;
  b.textContent = full ? "This night is full" : "Send booking request";
}
function updateCap(){
  const box = $("#cap");
  const iso = dateEl.value;
  if (!iso || iso < todayISO()) { box.hidden = true; box.innerHTML = ""; setSubmit(false); return; }
  const left = placesLeft(iso), used = CAPACITY - left;
  const guests = parseInt(guestsEl.value, 10) || 0;
  const nice = dLong(parseISO(iso));
  let cls = "cap", title, sub, actions = "";
  if (left === 0) {
    cls += " full";
    title = nice + " is full";
    sub = "All " + CAPACITY + " places are taken. Call our organizer to ask about a free spot or another night.";
    actions = '<div class="cap-actions"><a class="btn btn-gold" href="tel:' + PHONE_TEL + '">Call ' + PHONE_DISPLAY + '</a>' +
      '<a class="btn btn-wa" href="https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent("Hello Hera, I would like to ask about " + nice + ".") + '" target="_blank" rel="noopener">WhatsApp</a></div>';
  } else {
    if (left <= 10) cls += " low";
    title = placesText(left) + " left on " + nice;
    sub = used + " of " + CAPACITY + " places are booked.";
    if (guests > left) {
      cls += " warn";
      sub = "Your group of " + guests + " is more than the " + placesText(left) + " left. Lower the number of guests, or call our organizer on " + PHONE_DISPLAY + ".";
    }
  }
  box.className = cls;
  box.innerHTML = '<p class="cap-title">' + esc(title) + '</p><span class="meter" aria-hidden="true"><i style="width:' + Math.round(used / CAPACITY * 100) + '%"></i></span><p class="cap-sub">' + esc(sub) + '</p>' + actions;
  box.hidden = false;
  setSubmit(left === 0);
}

function read(){
  const occ = form.querySelector('input[name="occ"]:checked');
  return {
    name: $("#name").value.trim(),
    phone: $("#phone").value.trim(),
    date: dateEl.value,
    time: timeEl.value,
    guests: parseInt(guestsEl.value, 10),
    occ: occ ? occ.value : "",
    notes: $("#notes").value.trim(),
    age: $("#age").checked
  };
}
function validate(v){
  const e = {};
  if (v.name.length < 2) e.name = "Enter your name.";
  const digits = v.phone.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) e.phone = "Enter a phone number we can reach you on.";
  if (!v.date) e.date = "Choose a date.";
  else if (v.date < todayISO()) e.date = "Choose today or a later date.";
  else if (placesLeft(v.date) === 0) e.date = "That night is full. Pick another date or call " + PHONE_DISPLAY + ".";
  if (!v.time) e.time = "Choose your arrival time.";
  if (!(v.guests >= 1 && v.guests <= CAPACITY)) e.guests = "Enter a number of guests from 1 to " + CAPACITY + ". For a bigger group, call " + PHONE_DISPLAY + ".";
  else if (v.date && v.date >= todayISO() && v.guests > placesLeft(v.date)) e.guests = "Only " + placesText(placesLeft(v.date)) + " left on that night. Lower the number of guests or call " + PHONE_DISPLAY + ".";
  if (!v.occ) e.occ = "Choose an occasion.";
  if (!v.age) e.age = "Please confirm that everyone in your group is 18 or older.";
  return e;
}
const fieldIds = { name: "name", phone: "phone", date: "date", time: "time", guests: "guests", occ: "occ-0", age: "age" };
function showErrors(errs){
  Object.keys(fieldIds).forEach(k => {
    const box = $("#e-" + k), wrap = $("#f-" + k);
    box.textContent = errs[k] || "";
    if (wrap) wrap.classList.toggle("bad", !!errs[k]);
  });
  const n = Object.keys(errs).length, sum = $("#err-summary");
  sum.textContent = n ? "Please check " + (n === 1 ? "the field" : n + " fields") + " marked above, then send your request again." : "";
  sum.hidden = !n;
}
function buildMessage(v){
  const lines = [
    "Hello Hera, I would like to make a reservation.",
    "",
    "Name: " + v.name,
    "Phone: " + v.phone,
    "Date: " + dFull(parseISO(v.date)),
    "Arrival: " + v.time,
    "Guests: " + v.guests,
    "Occasion: " + v.occ
  ];
  if (v.notes) lines.push("Notes: " + v.notes);
  lines.push("", "Everyone in my group is 18+.");
  return lines.join("\n");
}
form.addEventListener("submit", e => {
  e.preventDefault();
  const v = read();
  const errs = validate(v);
  showErrors(errs);
  const first = Object.keys(errs)[0];
  if (first) { const el = $("#" + fieldIds[first]); if (el) el.focus(); return; }
  const msg = buildMessage(v);
  const url = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
  $("#msg").value = msg;
  $("#wa-link").href = url;
  $("#copied").textContent = "";
  form.hidden = true;
  sent.hidden = false;
  sent.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  try { window.open(url, "_blank", "noopener"); } catch (_) {}
});
$("#edit").addEventListener("click", () => { sent.hidden = true; form.hidden = false; $("#name").focus(); });
async function copyFrom(taId, outId){
  const out = $("#" + outId), ta = $("#" + taId);
  try {
    await navigator.clipboard.writeText(ta.value);
    out.textContent = "Message copied. Paste it in WhatsApp.";
  } catch (_) {
    ta.focus(); ta.select();
    out.textContent = "Press and hold the text, then choose Copy.";
  }
}
$("#copy").addEventListener("click", () => copyFrom("msg", "copied"));

/* ---------------- feedback and notes ---------------- */
const fb = $("#fb"), fbSent = $("#fb-sent");
const FB = {
  feedback: {
    topics: ["Food", "Drinks", "Music & DJ", "Service", "Atmosphere", "Other"],
    msgLabel: "Your feedback", msgPh: "What did you enjoy? What could be better?",
    dateLabel: "Night you came (optional)", submit: "Send feedback"
  },
  note: {
    topics: ["Booking change", "Question", "Suggestion", "Lost item", "Other"],
    msgLabel: "Your note", msgPh: "Write your question, change or idea for the team",
    dateLabel: "Date it is about (optional)", submit: "Send note"
  }
};
const RATE_WORDS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];
let fbMode = "feedback";

$("#stars").innerHTML = [1, 2, 3, 4, 5].map(n =>
  '<label class="star"><input type="radio" name="rating" value="' + n + '"><span class="glyph" aria-hidden="true">★</span><span class="sr">' + n + (n === 1 ? " star" : " stars") + '</span></label>').join("");
function paintStars(n){
  $$("#stars .star").forEach((el, i) => el.classList.toggle("on", i < n));
  $("#rate-word").textContent = n ? RATE_WORDS[n] : "Tap a star";
}
$("#stars").addEventListener("change", e => paintStars(parseInt(e.target.value, 10) || 0));

function fbClearErrors(){
  ["rating", "msg", "phone"].forEach(k => { $("#e-fb-" + k).textContent = ""; $("#f-fb-" + k).classList.remove("bad"); });
}
function setFbMode(mode){
  fbMode = mode;
  const c = FB[mode];
  $$(".seg").forEach(b => {
    const on = b.dataset.mode === mode;
    b.setAttribute("aria-selected", on ? "true" : "false");
    b.tabIndex = on ? 0 : -1;
  });
  fb.setAttribute("aria-labelledby", "seg-" + mode);
  $("#f-fb-rating").hidden = mode !== "feedback";
  $("#fb-topics").innerHTML = c.topics.map((t, i) =>
    '<label class="opt"><input type="radio" name="topic" value="' + esc(t) + '" id="topic-' + i + '"><span>' + esc(t) + '</span></label>').join("");
  $("#fb-msg-label").textContent = c.msgLabel;
  $("#fb-msg").placeholder = c.msgPh;
  $("#fb-date-label").textContent = c.dateLabel;
  $("#fb-date").max = mode === "feedback" ? todayISO() : "";
  $("#fb-submit").textContent = c.submit;
  fbClearErrors();
}
const segs = $$(".seg");
segs.forEach((b, i) => {
  b.addEventListener("click", () => setFbMode(b.dataset.mode));
  b.addEventListener("keydown", e => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = segs[(i + (e.key === "ArrowRight" ? 1 : segs.length - 1)) % segs.length];
    setFbMode(next.dataset.mode); next.focus();
  });
});
setFbMode("feedback");

function fbRead(){
  const topic = fb.querySelector('input[name="topic"]:checked');
  const rating = fb.querySelector('input[name="rating"]:checked');
  return {
    rating: rating ? parseInt(rating.value, 10) : 0,
    topic: topic ? topic.value : "",
    msg: $("#fb-msg").value.trim(),
    name: $("#fb-name").value.trim(),
    phone: $("#fb-phone").value.trim(),
    date: $("#fb-date").value
  };
}
function fbValidate(v){
  const e = {};
  if (fbMode === "feedback" && !v.rating) e.rating = "Tap a star to rate your night.";
  if (v.msg.length < 5) e.msg = fbMode === "feedback" ? "Tell us a little about your night." : "Write your note for the team.";
  if (v.phone) {
    const d = v.phone.replace(/\D/g, "");
    if (d.length < 7 || d.length > 15) e.phone = "Check the phone number, or leave it empty.";
  }
  return e;
}
function fbBuild(v){
  const lines = [fbMode === "feedback" ? "Hello Hera, I would like to leave feedback." : "Hello Hera, I have a note for the team.", ""];
  if (fbMode === "feedback") lines.push("Rating: " + v.rating + " / 5 (" + RATE_WORDS[v.rating] + ")");
  if (v.topic) lines.push("About: " + v.topic);
  if (v.date) lines.push((fbMode === "feedback" ? "Night I came: " : "Date: ") + dFull(parseISO(v.date)));
  if (v.name) lines.push("Name: " + v.name);
  if (v.phone) lines.push("Phone: " + v.phone);
  lines.push("", (fbMode === "feedback" ? "Feedback:" : "Note:"), v.msg);
  return lines.join("\n");
}
fb.addEventListener("submit", e => {
  e.preventDefault();
  const v = fbRead();
  const errs = fbValidate(v);
  fbClearErrors();
  Object.keys(errs).forEach(k => { $("#e-fb-" + k).textContent = errs[k]; $("#f-fb-" + k).classList.add("bad"); });
  const first = Object.keys(errs)[0];
  if (first) {
    const target = first === "rating" ? fb.querySelector('input[name="rating"]') : $("#fb-" + first);
    if (target) target.focus();
    return;
  }
  const msg = fbBuild(v);
  const url = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
  $("#fb-out").value = msg;
  $("#fb-wa").href = url;
  $("#fb-copied").textContent = "";
  fb.hidden = true;
  fbSent.hidden = false;
  fbSent.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  try { window.open(url, "_blank", "noopener"); } catch (_) {}
});
$("#fb-edit").addEventListener("click", () => { fbSent.hidden = true; fb.hidden = false; $("#fb-msg").focus(); });
$("#fb-copy").addEventListener("click", () => copyFrom("fb-out", "fb-copied"));

/* ---------------- hero embers ---------------- */
(function embers(){
  const c = $("#embers");
  if (!c || !c.getContext || reduce) return;
  const ctx = c.getContext("2d");
  let w = 0, h = 0, parts = [], raf = 0;
  const hidden = () => c.offsetParent === null || getComputedStyle(c).display === "none";
  function size(){
    const r = c.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(70, Math.round(w * h / 16000));
    parts = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.5 + .5, vy: Math.random() * .28 + .07,
      a: Math.random() * 6.28, s: Math.random() * .02 + .006
    }));
  }
  function frame(){
    ctx.clearRect(0, 0, w, h);
    parts.forEach(p => {
      p.y -= p.vy; p.a += p.s; p.x += Math.sin(p.a) * .16;
      if (p.y < -6) { p.y = h + 6; p.x = Math.random() * w; }
      const al = .22 + .5 * Math.abs(Math.sin(p.a * 2));
      ctx.fillStyle = "rgba(226,190,120," + (al * .16).toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.283); ctx.fill();
      ctx.fillStyle = "rgba(244,214,150," + al.toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    });
    raf = requestAnimationFrame(frame);
  }
  function start(){ cancelAnimationFrame(raf); if (!hidden() && !document.hidden) { size(); frame(); } }
  start();
  let t;
  window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(start, 150); });
  document.addEventListener("visibilitychange", () => { if (document.hidden) cancelAnimationFrame(raf); else start(); });
})();

/* ---------------- reveal on scroll ---------------- */
(function revealOnScroll(){
  const els = $$(".reveal:not(.in)");
  if (!("IntersectionObserver" in window) || reduce) { els.forEach(el => el.classList.add("in")); return; }
  const io = new IntersectionObserver((entries, o) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); o.unobserve(en.target); } });
  }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
  els.forEach(el => io.observe(el));
})();

/* ---------------- deep links ----------------
   Sections are filled in by this script, so a link such as /#menu must be
   scrolled to again once the page above it has its final height. */
(function deepLink(){
  let h = decodeURIComponent(location.hash.slice(1));
  if (h === "lineup") h = "events";
  const t = h && document.getElementById(h);
  if (t && !t.hidden) requestAnimationFrame(() => t.scrollIntoView({ behavior: "auto", block: "start" }));
})();

})();
