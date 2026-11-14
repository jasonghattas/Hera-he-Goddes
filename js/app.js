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

/* ---------------- nights: one engine the whole page reads ----------------
   Every night (listed in NIGHTS or filled in from SCHEDULE) is turned into one
   object with its type, DJs, hours, places reserved and left, and a status.
   The lineup, the hero, the reservation picker and the form all use nightFor(). */
const SCH = Object.assign({
  capacity: 50, openDays: [2, 3, 4, 5, 6, 0], partyDays: [5, 6],
  dinner: { title: "Food, cocktails & shisha", start: "17:00", end: "00:00" },
  party: { start: "17:00", djFrom: "21:30", end: "02:00" },
  lastCallMinutes: 60, showDays: 21, bookAheadDays: 90, dayEndsAt: "06:00"
}, typeof SCHEDULE === "object" && SCHEDULE ? SCHEDULE : {});
const CAPACITY = Math.max(1, Number(SCH.capacity) || 50);
const TYPES = {
  party: "DJ night", live: "Live performance", dinner: "Dinner night", private: "Private event", closed: "Closed"
};
const STATUS = {
  open: "Available", low: "Almost full", full: "Full", late: "Last call passed",
  private: "Private event", closed: "Closed", ended: "Ended"
};
const isoOf = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const addDays = (iso, n) => { const d = parseISO(iso); return isoOf(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)); };
const toMin = s => { const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || "").trim()); return m ? Number(m[1]) * 60 + Number(m[2]) : null; };
/* the bar's day runs past midnight: before dayEndsAt (6 AM) it is still last night */
function serviceNow(){
  const n = new Date();
  let mins = n.getHours() * 60 + n.getMinutes(), iso = isoOf(n);
  if (mins < (toMin(SCH.dayEndsAt) || 0)) { iso = isoOf(new Date(n.getFullYear(), n.getMonth(), n.getDate() - 1)); mins += 1440; }
  return { iso, mins };
}
/* 1290 -> "9:30 PM", 1560 -> "2:00 AM"; short: "9:30 PM", "2 AM" */
function clock(min, short){
  const m = ((min % 1440) + 1440) % 1440, h24 = Math.floor(m / 60), mm = m % 60;
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return h + (short && mm === 0 ? "" : ":" + pad(mm)) + (h24 >= 12 ? " PM" : " AM");
}
const NIGHT_BY_DATE = {};
(typeof NIGHTS !== "undefined" && Array.isArray(NIGHTS) ? NIGHTS : []).forEach(n => {
  if (n && typeof n.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(n.date)) NIGHT_BY_DATE[n.date] = n;
});
const DJ_LIST = typeof DJS === "object" && DJS ? DJS : {};
const djOf = k => {
  const d = DJ_LIST[k];
  return d ? { name: String(d.name || k), photo: d.photo || "", style: d.style || "" } : { name: String(k), photo: "", style: "" };
};

function nightFor(iso, sv){
  sv = sv || serviceNow();
  const d = parseISO(iso), wd = d.getDay(), e = NIGHT_BY_DATE[iso] || null;
  const openDay = (SCH.openDays || []).indexOf(wd) !== -1;
  let type = e && TYPES[e.type] ? e.type : (!openDay ? "closed" : ((SCH.partyDays || []).indexOf(wd) !== -1 ? "party" : "dinner"));
  const base = type === "dinner" ? SCH.dinner : SCH.party;
  const start = toMin(e && e.start) ?? toMin(base.start) ?? 1020;
  let end = toMin(e && e.end) ?? toMin(base.end) ?? 1440;
  if (end <= start) end += 1440;
  let djFrom = null;
  if (type === "party" || type === "live") {
    djFrom = toMin(e && e.djFrom) ?? toMin(SCH.party.djFrom);
    if (djFrom !== null && djFrom < start) djFrom += 1440;
    if (djFrom !== null && djFrom >= end) djFrom = null;
  }
  const capacity = Math.max(0, Math.round(Number(e && e.capacity) || CAPACITY));
  const reserved = Math.min(capacity, Math.max(0, Math.round(Number(e && e.reserved) || 0)));
  const left = capacity - reserved;
  const lastCall = end - Math.max(0, Number(SCH.lastCallMinutes) || 0);

  let status;
  if (type === "closed") status = "closed";
  else if (iso < sv.iso || (iso === sv.iso && sv.mins >= end)) status = "ended";
  else if (type === "private") status = "private";
  else if (left === 0) status = "full";
  else if (iso === sv.iso && sv.mins >= lastCall) status = "late";
  else status = left <= Math.max(5, Math.round(capacity * .2)) ? "low" : "open";

  return {
    iso, d, type, label: TYPES[type], listed: !!e,
    title: (e && e.title) || (type === "dinner" ? (SCH.dinner.title || TYPES.dinner) : ""),
    djs: (e && Array.isArray(e.djs) ? e.djs : []).map(djOf),
    start, end, djFrom, lastCall, capacity, reserved, left,
    minCharge: e && Number(e.minCharge) > 0 ? Number(e.minCharge) : 0,
    note: (e && e.note) || "", poster: (e && e.poster) || "",
    status, bookable: status === "open" || status === "low", tonight: iso === sv.iso
  };
}
const isMusic = n => n.type === "party" || n.type === "live";
const whoText = n => (n.type === "live" || n.type === "private") && n.title ? n.title :
  (n.djs.length ? n.djs.map(x => x.name).join(" & ") : (isMusic(n) && !n.title ? "Lineup coming soon" : (n.title || n.label)));
const hoursText = n => n.type === "closed" ? "Closed" : n.type === "private" ? "Not open to the public" :
  (n.djFrom !== null ? "Doors " + clock(n.start) + " · Music " + clock(n.djFrom) + " – " + clock(n.end) : clock(n.start) + " – " + clock(n.end));
const shortHours = n => n.type === "closed" || n.type === "private" ? "" : (n.djFrom !== null ? clock(n.djFrom, true) : clock(n.start, true)) + " – " + clock(n.end, true);
const placesLine = n => n.reserved > 0 ? n.reserved + " reserved · " + n.left + " left of " + n.capacity : n.capacity + " places available";
const pct = n => n.capacity ? Math.round(n.reserved / n.capacity * 100) : 100;
const meter = n => '<span class="meter" aria-hidden="true"><i style="width:' + pct(n) + '%"></i></span>';
function avatar(dj){
  const initial = (dj.name.replace(/^dj\s+/i, "").trim().charAt(0) || "?").toUpperCase();
  return '<span class="av">' + (safeImg(dj.photo) ? '<img src="' + esc(dj.photo) + '" alt="" loading="lazy" decoding="async">' : '<b>' + esc(initial) + '</b>') + '</span>';
}
const safeImg = u => typeof u === "string" && /^(assets\/|https:\/\/)[^"'<>\s]+$/i.test(u.trim());
function djRow(n, compact){
  if (!n.djs.length) return "";
  if (compact) return '<div class="dj-stack" aria-hidden="true">' + n.djs.map(avatar).join("") + '</div>';
  return '<ul class="dj-row">' + n.djs.map(dj => '<li>' + avatar(dj) + '<span><b>' + esc(dj.name) + '</b>' + (dj.style ? '<small>' + esc(dj.style) + '</small>' : '') + '</span></li>').join("") + '</ul>';
}

/* ---------------- events: weekend lineup, recent nights, hero pill ---------------- */
const djLine = n => n.djs.length ? n.djs.map(x => esc(x.name)).join('<span class="amp">&amp;</span>') : "";
const posterAlt = nights => "Hera lineup poster. " + nights.map(n => dLong(n.d) + ": " + whoText(n)).join(". ") + ".";

function actionFor(n, cls){
  if (n.bookable) return '<a class="btn ' + (cls || "") + '" href="#reserve" data-date="' + esc(n.iso) + '">Reserve this night</a>';
  if (n.status === "full") return '<a class="btn btn-full" href="tel:' + PHONE_TEL + '">Full, call ' + PHONE_DISPLAY + '</a>';
  if (n.status === "late") return '<a class="btn" href="tel:' + PHONE_TEL + '">Call to join tonight</a>';
  if (n.status === "private") return '<a class="btn" href="tel:' + PHONE_TEL + '">Private event, call us</a>';
  return "";
}
function nightCard(n, i){
  const st = n.status;
  const avail = n.type === "private"
    ? '<div class="avail s-private"><span class="avail-top"><b>Private event</b><span>No online booking</span></span></div>'
    : '<div class="avail s-' + st + '"><span class="avail-top"><b>' + esc(STATUS[st]) + '</b><span>' + esc(placesLine(n)) + '</span></span>' + meter(n) + '</div>';
  const main = n.djs.length ? djLine(n) : esc(whoText(n));
  const title = n.djs.length && n.title ? '<p class="night-title">' + esc(n.title) + '</p>' : '';
  const extra = (n.minCharge ? '<p class="night-note">Minimum charge $' + n.minCharge + ' per person</p>' : '') + (n.note ? '<p class="night-note">' + esc(n.note) + '</p>' : '');
  return '<article class="night reveal"' + reveal(i) + '>' +
    '<div class="night-date"><span class="day">' + n.d.getDate() + '</span>' +
    '<span class="dm"><b>' + WEEKDAYS[n.d.getDay()] + (n.tonight ? '<span class="tonight">Tonight</span>' : '') + '</b><span>' + MONTHS[n.d.getMonth()] + '</span></span></div>' +
    '<p class="night-meta"><span class="chip-type t-' + n.type + '">' + esc(n.label) + '</span><span class="night-hours">' + esc(hoursText(n)) + '</span></p>' +
    avail +
    '<div>' + djRow(n, true) + title + '<p class="label">' + (n.djs.length ? "On the decks" : (n.type === "private" ? "Hera is booked" : "Tonight at Hera")) + '</p><h3>' + main + '</h3>' + extra + '</div>' +
    actionFor(n) + '</article>';
}

(function renderEvents(){
  const sv = serviceNow();
  const nights = Object.keys(NIGHT_BY_DATE).sort().map(iso => nightFor(iso, sv)).filter(n => n.type !== "dinner" && n.type !== "closed");
  const groups = [];
  nights.forEach(n => {
    const key = n.poster || ("week-" + addDays(n.iso, -((n.d.getDay() + 2) % 7)));
    let g = groups.find(x => x.key === key);
    if (!g) { g = { key, poster: n.poster, nights: [] }; groups.push(g); }
    g.nights.push(n);
  });
  const upcoming = groups.filter(g => g.nights.some(n => n.status !== "ended"))
    .map(g => ({ poster: g.poster, all: g.nights, nights: g.nights.filter(n => n.status !== "ended") }))
    .sort((a, b) => a.nights[0].iso.localeCompare(b.nights[0].iso));
  const past = groups.filter(g => g.nights.every(n => n.status === "ended"))
    .sort((a, b) => b.nights[0].iso.localeCompare(a.nights[0].iso));

  const box = $("#upcoming");
  if (!upcoming.length) {
    box.innerHTML = '<p class="lineup-empty reveal">This week’s lineup is coming soon. Call or WhatsApp ' + PHONE_DISPLAY + ' to ask who is playing.</p>';
  } else {
    box.innerHTML = upcoming.map(w => {
      const poster = w.poster ? '<figure class="poster reveal"><img src="' + esc(w.poster) + '" alt="' + esc(posterAlt(w.all)) + '" loading="lazy" decoding="async"></figure>' : '';
      return '<div class="weekend' + (w.poster ? ' has-poster' : '') + '">' + poster + '<div class="nights">' + w.nights.map(nightCard).join("") + '</div></div>';
    }).join("");
  }

  const recent = past.slice(0, 12);
  if (recent.length) {
    $("#past-grid").innerHTML = recent.map((w, i) => {
      const first = w.nights[0].d, last = w.nights[w.nights.length - 1].d;
      const lines = w.nights.map(n => '<li><span>' + esc(shortDay(n.d)) + '</span> ' + esc(whoText(n)) + '</li>').join("");
      const img = w.poster ? '<img src="' + esc(w.poster) + '" alt="' + esc(posterAlt(w.nights)) + '" loading="lazy" decoding="async">' : '';
      return '<article class="past-card reveal"' + reveal(i % 4) + '>' + (img ? '<div class="past-img">' + img + '</div>' : '') +
        '<div class="past-cap"><b>' + esc(shortRange(first, last)) + '</b><ul>' + lines + '</ul></div></article>';
    }).join("");
    $("#past").hidden = false;
  }

  $("#djlist").innerHTML = Object.keys(DJ_LIST).map(k => "<li>" + esc(djOf(k).name) + "</li>").join("");

  /* hero pill: tonight if Hera is open, otherwise the next DJ night */
  const pill = $("#next-night");
  let next = nightFor(sv.iso, sv);
  if (next.status === "closed" || next.status === "ended") next = null;
  if (!next) next = upcoming.length ? upcoming[0].nights[0] : null;
  if (!next) for (let i = 1; i <= 7 && !next; i++) { const n = nightFor(addDays(sv.iso, i), sv); if (n.status !== "closed") next = n; }
  if (pill && next) {
    pill.innerHTML = '<i aria-hidden="true"></i><span>' + (next.tonight ? "Tonight" : "Next night") + '</span><b>' + esc(shortDay(next.d)) + '</b>' +
      '<em>' + esc(whoText(next)) + '</em><small>' + esc(shortHours(next)) + '</small>';
    if (next.bookable) { pill.href = "#reserve"; pill.dataset.date = next.iso; }
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
  if (a.dataset.date) setDate(a.dataset.date, false);
  if (a.dataset.menuTab) selectTab($("#tab-" + a.dataset.menuTab));
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  if (history.replaceState && id) history.replaceState(null, "", "#" + id);
});

/* ---------------- booking form ----------------
   1. Choose your night (picker of the coming nights, or any date)
   2. The selected night shows its DJs, hours, places reserved and left
   3. Arrival times follow that night's hours
   4. The WhatsApp message carries every detail */
const form = $("#book"), sent = $("#sent");
const dateEl = $("#date"), timeEl = $("#time"), guestsEl = $("#guests"), pickEl = $("#nightpick");
const REQ_KEY = "hera-request";
let selected = null;

function svRange(){
  const sv = serviceNow();
  dateEl.min = sv.iso;
  dateEl.max = addDays(sv.iso, Math.max(1, Number(SCH.bookAheadDays) || 90));
  return sv;
}
function myRequest(){
  try { const r = JSON.parse(localStorage.getItem(REQ_KEY) || "null"); return r && r.date ? r : null; } catch (_) { return null; }
}

function pickCard(n, mine){
  const on = selected === n.iso;
  const left = n.bookable ? (n.reserved > 0 ? n.left + " left" : n.capacity + " places") : STATUS[n.status];
  const who = n.type === "closed" ? "Closed" : (n.type === "private" ? "Private event" : whoText(n));
  return '<button type="button" class="pick t-' + n.type + ' s-' + n.status + (on ? ' on' : '') + '" data-pick="' + n.iso + '" aria-pressed="' + on + '"' +
    (n.bookable ? '' : ' aria-disabled="true"') + ' aria-label="' + esc(dLong(n.d) + ", " + n.label + ", " + who + (shortHours(n) ? ", " + shortHours(n) : "") + ", " + (n.bookable ? placesLine(n) : STATUS[n.status])) + '">' +
    '<span class="pk-date"><small>' + (n.tonight ? "Tonight" : WKD[n.d.getDay()]) + '</small><b>' + n.d.getDate() + '</b><small>' + MON[n.d.getMonth()] + '</small></span>' +
    '<span class="pk-type">' + esc(n.label) + '</span>' +
    '<span class="pk-who">' + esc(who) + '</span>' +
    (shortHours(n) ? '<span class="pk-time">' + esc(shortHours(n)) + '</span>' : '') +
    '<span class="pk-left">' + esc(left) + '</span>' + (n.type !== "closed" ? meter(n) : '') +
    (mine ? '<span class="pk-mine">Your request</span>' : '') + '</button>';
}
function renderPicker(){
  const sv = svRange(), mine = myRequest();
  const days = Math.max(7, Number(SCH.showDays) || 21);
  let html = "";
  for (let i = 0; i < days; i++) {
    const n = nightFor(addDays(sv.iso, i), sv);
    if (n.status === "ended") continue;
    html += pickCard(n, mine && mine.date === n.iso);
  }
  pickEl.innerHTML = html;
}
pickEl.addEventListener("click", e => {
  const b = e.target.closest("[data-pick]");
  if (b) setDate(b.dataset.pick, false);
});
pickEl.addEventListener("keydown", e => {
  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
  const all = $$(".pick", pickEl), i = all.indexOf(document.activeElement);
  if (i === -1) return;
  e.preventDefault();
  const nx = all[Math.min(all.length - 1, Math.max(0, i + (e.key === "ArrowRight" ? 1 : -1)))];
  nx.focus(); nx.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduce ? "auto" : "smooth" });
});
$("#pick-prev").addEventListener("click", () => pickEl.scrollBy({ left: -pickEl.clientWidth * .8, behavior: reduce ? "auto" : "smooth" }));
$("#pick-next").addEventListener("click", () => pickEl.scrollBy({ left: pickEl.clientWidth * .8, behavior: reduce ? "auto" : "smooth" }));

function fillTimes(n){
  const keep = timeEl.value;
  timeEl.innerHTML = "";
  const first = document.createElement("option");
  first.value = "";
  if (!n || !n.bookable) { first.textContent = n ? "Not open for requests" : "Choose a night first"; timeEl.appendChild(first); timeEl.disabled = true; return; }
  first.textContent = "Choose a time"; timeEl.appendChild(first); timeEl.disabled = false;
  const sv = serviceNow();
  let from = n.start;
  if (n.tonight) from = Math.max(from, Math.ceil(sv.mins / 30) * 30);
  for (let m = from; m <= n.lastCall; m += 30) {
    const o = document.createElement("option");
    const when = m === 1440 ? " (midnight)" : (m > 1440 ? " (after midnight)" : "");
    const label = clock(m) + when + (n.djFrom !== null && m === n.djFrom ? " · music starts" : "");
    o.value = clock(m) + when;
    o.textContent = label;
    timeEl.appendChild(o);
  }
  if (keep && Array.from(timeEl.options).some(o => o.value === keep)) timeEl.value = keep;
}

function setDate(iso, scroll){
  if (form.hidden) { sent.hidden = true; form.hidden = false; }
  selected = iso || null;
  dateEl.value = iso || "";
  renderPicker();
  const card = iso && pickEl.querySelector('[data-pick="' + iso + '"]');
  if (card) card.scrollIntoView({ block: "nearest", inline: "center", behavior: reduce || scroll === false ? "auto" : "smooth" });
  const n = iso ? nightFor(iso) : null;
  fillTimes(n);
  updateCap();
  $("#e-date").textContent = ""; $("#f-date").classList.remove("bad");
}
dateEl.addEventListener("change", () => {
  const v = dateEl.value;
  if (v && (v < dateEl.min || v > dateEl.max)) { setDate(null); $("#e-date").textContent = "Choose a date between today and " + dLong(parseISO(dateEl.max)) + "."; return; }
  setDate(v || null);
});

const maxGuests = () => { const n = selected && nightFor(selected); return n && n.bookable ? Math.max(1, n.left) : CAPACITY; };
$("#g-minus").addEventListener("click", () => { guestsEl.value = Math.max(1, (parseInt(guestsEl.value, 10) || 1) - 1); updateCap(); });
$("#g-plus").addEventListener("click", () => { guestsEl.value = Math.min(maxGuests(), (parseInt(guestsEl.value, 10) || 0) + 1); updateCap(); });
guestsEl.addEventListener("input", () => updateCap());

function setSubmit(n){
  const b = $("#submit-btn");
  const block = n && !n.bookable;
  b.disabled = !!block;
  b.textContent = !block ? "Send booking request" : ({ full: "This night is full", closed: "Closed that day", private: "Private event", late: "Online requests closed", ended: "This night has ended" }[n.status] || "Not available");
}
function updateCap(){
  const box = $("#cap");
  if (!selected) { box.hidden = true; box.innerHTML = ""; setSubmit(null); return; }
  const n = nightFor(selected);
  const guests = parseInt(guestsEl.value, 10) || 0;
  let sub = "", actions = "";
  const call = '<a class="btn btn-gold" href="tel:' + PHONE_TEL + '">Call ' + PHONE_DISPLAY + '</a>' +
    '<a class="btn btn-wa" href="https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent("Hello Hera, I would like to ask about " + dFull(n.d) + ".") + '" target="_blank" rel="noopener">WhatsApp</a>';
  if (n.status === "closed") { sub = "Hera is closed on " + WEEKDAYS[n.d.getDay()] + "s. Choose another night."; }
  else if (n.status === "private") { sub = "This night is booked for a private event. Call our organizer if you are a guest, or choose another night."; actions = call; }
  else if (n.status === "full") { sub = "All " + n.capacity + " places are taken. Call our organizer to ask about a free spot or choose another night."; actions = call; }
  else if (n.status === "late") { sub = "Online requests close " + SCH.lastCallMinutes + " minutes before the end of the night. Call us to see if we can still seat you."; actions = call; }
  else if (n.status === "ended") { sub = "This night has ended. Choose another night."; }
  else {
    if (guests > n.left) sub = "Your group of " + guests + " is more than the " + placesText(n.left) + " left. Lower the number of guests, or call " + PHONE_DISPLAY + ".";
    else if (n.status === "low") sub = "Only " + placesText(n.left) + " left. Send your request soon.";
    if (n.minCharge) sub += (sub ? " " : "") + "Minimum charge $" + n.minCharge + " per person.";
    if (isMusic(n) && !n.djs.length && !n.title) sub += (sub ? " " : "") + "The DJ for this night is announced on our posters.";
  }
  const warn = n.bookable && guests > n.left;
  const hours = n.type === "closed" || n.type === "private" ? '' : '<dl class="cap-hours">' + (
    '<div><dt>' + (n.djFrom !== null ? "Doors" : "Open") + '</dt><dd>' + clock(n.start) + (n.djFrom !== null ? "" : " – " + clock(n.end)) + '</dd></div>' +
    (n.djFrom !== null ? '<div><dt>' + (n.type === "live" ? "Live" : "DJ") + '</dt><dd>' + clock(n.djFrom) + ' – ' + clock(n.end) + '</dd></div>' : '') +
    (n.bookable ? '<div><dt>Last arrival</dt><dd>' + clock(n.lastCall) + '</dd></div>' : '')) + '</dl>';
  const count = n.type === "closed" || n.type === "private" ? '' :
    '<div class="cap-count"><span><b>' + n.reserved + '</b>reserved</span><span><b>' + n.left + '</b>left</span><span><b>' + n.capacity + '</b>places</span></div>' + meter(n);
  box.className = "cap t-" + n.type + " s-" + n.status + (warn ? " warn" : "");
  box.innerHTML = '<div class="cap-head"><span class="chip-type t-' + n.type + '">' + esc(n.label) + '</span><b class="cap-status">' + esc(STATUS[n.status]) + '</b></div>' +
    '<p class="cap-title">' + esc(dLong(n.d)) + (n.tonight ? ' <span class="tonight">Tonight</span>' : '') + '</p>' +
    (n.djs.length ? djRow(n) : '<p class="cap-who">' + esc(n.type === "closed" ? "Closed" : whoText(n)) + '</p>') +
    (n.djs.length && n.title ? '<p class="cap-who">' + esc(n.title) + '</p>' : '') +
    hours + count + (sub ? '<p class="cap-sub">' + esc(sub) + '</p>' : '') + (actions ? '<div class="cap-actions">' + actions + '</div>' : '');
  box.hidden = false;
  setSubmit(n);
}

(function fillOccasions(){
  const list = ["Birthday", "Bachelor / Bachelorette", "Private party", "Group dinner", "Corporate event", "Drinks & music"];
  $("#occ").innerHTML = list.map((o, i) =>
    '<label class="opt"><input type="radio" name="occ" value="' + esc(o) + '" id="occ-' + i + '"><span>' + esc(o) + '</span></label>').join("");
})();

function read(){
  const occ = form.querySelector('input[name="occ"]:checked');
  return {
    name: $("#name").value.trim(), phone: $("#phone").value.trim(), date: selected || "",
    time: timeEl.value, guests: parseInt(guestsEl.value, 10), occ: occ ? occ.value : "",
    notes: $("#notes").value.trim(), age: $("#age").checked
  };
}
function validate(v){
  const e = {};
  if (v.name.length < 2) e.name = "Enter your name.";
  const digits = v.phone.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) e.phone = "Enter a phone number we can reach you on.";
  const n = v.date ? nightFor(v.date) : null;
  if (!n) e.date = "Choose the night you want to come.";
  else if (!n.bookable) e.date = ({
    closed: "Hera is closed that day. Choose another night.",
    private: "That night is a private event. Choose another night or call " + PHONE_DISPLAY + ".",
    full: "That night is full. Choose another night or call " + PHONE_DISPLAY + ".",
    late: "Online requests for tonight are closed. Call " + PHONE_DISPLAY + ".",
    ended: "That night has ended. Choose another night."
  })[n.status];
  if (!v.time) e.time = n && n.bookable ? "Choose your arrival time." : "Choose a night first.";
  if (!(v.guests >= 1)) e.guests = "Enter the number of guests.";
  else if (n && n.bookable && v.guests > n.left) e.guests = "Only " + placesText(n.left) + " left that night. Lower the number of guests or call " + PHONE_DISPLAY + ".";
  if (!v.occ) e.occ = "Choose an occasion.";
  if (!v.age) e.age = "Please confirm that everyone in your group is 18 or older.";
  return e;
}
const fieldIds = { name: "name", phone: "phone", date: "nightpick", time: "time", guests: "guests", occ: "occ-0", age: "age" };
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
  const n = nightFor(v.date);
  const lines = [
    "Hello Hera, I would like to make a reservation.",
    "",
    "Night: " + dFull(n.d) + " (" + n.label + (n.title && n.type !== "dinner" ? ": " + n.title : "") + (n.djs.length ? " with " + n.djs.map(x => x.name).join(" & ") : "") + ")",
    "Hours: " + hoursText(n),
    "Arrival: " + v.time,
    "Guests: " + v.guests,
    "Occasion: " + v.occ,
    "Name: " + v.name,
    "Phone: " + v.phone
  ];
  if (v.notes) lines.push("Notes: " + v.notes);
  if (n.minCharge) lines.push("Minimum charge: $" + n.minCharge + " per person (noted)");
  lines.push("", "Places left when I sent this: " + n.left + " of " + n.capacity, "Everyone in my group is 18+.");
  return lines.join("\n");
}
form.addEventListener("submit", e => {
  e.preventDefault();
  const v = read();
  const errs = validate(v);
  showErrors(errs);
  const first = Object.keys(errs)[0];
  if (first) {
    const el = first === "date" ? (pickEl.querySelector(".pick.on") || pickEl.querySelector(".pick")) : $("#" + fieldIds[first]);
    if (el) el.focus();
    return;
  }
  const msg = buildMessage(v);
  const url = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
  try { localStorage.setItem(REQ_KEY, JSON.stringify({ date: v.date, guests: v.guests, time: v.time, url })); } catch (_) {}
  $("#msg").value = msg;
  $("#wa-link").href = url;
  $("#copied").textContent = "";
  form.hidden = true;
  sent.hidden = false;
  renderPicker(); showMyRequest();
  sent.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  try { window.open(url, "_blank", "noopener"); } catch (_) {}
});
$("#edit").addEventListener("click", () => { sent.hidden = true; form.hidden = false; $("#name").focus(); });

/* the guest's own request, remembered on this phone until the night has passed */
function showMyRequest(){
  const box = $("#myreq"), r = myRequest();
  if (!box) return;
  const n = r ? nightFor(r.date) : null;
  if (!r || !n || n.status === "ended") { if (r) try { localStorage.removeItem(REQ_KEY); } catch (_) {} box.hidden = true; return; }
  box.innerHTML = '<span class="dot" aria-hidden="true"></span><p><b>Your request: ' + esc(dLong(n.d)) + ', ' + esc(String(r.guests)) + (r.guests == 1 ? ' guest' : ' guests') + (r.time ? ', ' + esc(r.time) : '') + '.</b> ' +
    'Waiting for our team to confirm on WhatsApp.</p>' +
    (safeUrl(r.url) ? '<a class="link" href="' + esc(r.url) + '" target="_blank" rel="noopener">Send it again</a>' : '') +
    '<button type="button" class="link" id="myreq-clear">Hide</button>';
  box.hidden = false;
  $("#myreq-clear").addEventListener("click", () => { try { localStorage.removeItem(REQ_KEY); } catch (_) {} box.hidden = true; renderPicker(); });
}

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

renderPicker(); fillTimes(null); showMyRequest();
/* keep "tonight" and the places right if the page stays open past midnight */
setInterval(() => { renderPicker(); if (selected) { fillTimes(nightFor(selected)); updateCap(); } }, 5 * 60 * 1000);

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

/* hero embers live in js/fx.js (they pause when the hero is off-screen) */

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
