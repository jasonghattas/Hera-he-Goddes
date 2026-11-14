/* =============================================================
   HERA THE GODDESS: CONTENT  (edit here, you never need to touch app.js)
   The menu has its own file: js/menu-data.js

   Sections that need photos or reviews (Gallery, Reviews, hero photo,
   map) stay hidden until you fill them in below. Nothing is invented.

   Later an admin page will fill SCHEDULE, DJS and NIGHTS from a server.
   The page only reads these three, so nothing else will need to change.
   ============================================================= */

/* ---------- reservation line ---------- */
const PHONE_DISPLAY = "76 759 320";
const PHONE_TEL = "+96176759320";
const WA_NUMBER = "96176759320";

/* ---------- opening hours and places ----------
   These rules fill every night that has no entry in NIGHTS below.
   Times are 24-hour "HH:MM". An end time earlier than the start means after midnight.
   !! The hours below are placeholders: confirm the real ones with Hera. !!
   ------------------------------------------------------------- */
const SCHEDULE = {
  capacity: 50,                 // places per night (a night in NIGHTS can set its own)
  openDays: [2, 3, 4, 5, 6, 0], // 0 Sunday, 1 Monday ... 6 Saturday. Monday is closed.
  partyDays: [5, 6],            // Friday and Saturday are DJ nights
  dinner: { title: "Food, cocktails & shisha", start: "17:00", end: "00:00" },
  party:  { start: "17:00", djFrom: "21:30", end: "02:00" },
  lastCallMinutes: 60,          // online requests stop this long before a night ends
  showDays: 21,                 // nights shown in the reservation picker
  bookAheadDays: 90,            // furthest date a guest can request
  dayEndsAt: "06:00"            // before 6 AM it still counts as last night
};

/* ---------- DJs ----------
   One entry per DJ. The key (dado, kimo...) is what NIGHTS uses.
     name  : as printed on the posters
     photo : optional, e.g. "assets/djs/dado.jpg" (square, 400 px). Without it the
             page shows the DJ's initial in a gold circle.
     style : optional one line, e.g. "House · Afro house"
   ------------------------------------------------------------- */
const DJS = {
  dado:    { name: "DJ Dado",    photo: "", style: "" },
  kimo:    { name: "DJ Kimo",    photo: "", style: "" },
  youssef: { name: "DJ Youssef", photo: "", style: "" },
  nizar:   { name: "DJ Nizar",   photo: "", style: "" },
  bob:     { name: "DJ Bob",     photo: "", style: "" },
  sam:     { name: "DJ Sam",     photo: "", style: "" },
  cal:     { name: "DJ Cal",     photo: "", style: "" },
  ely:     { name: "DJ Ely",     photo: "", style: "" },
  yorgo:   { name: "DJ Yorgo",   photo: "", style: "" },
  hakim:   { name: "DJ Hakim",   photo: "", style: "" }
};

/* ---------- nights ----------
   One entry per special night. Any open night that is not listed here is
   filled in from SCHEDULE (a dinner night, or a DJ night on Friday and Saturday
   with "lineup coming soon").
     date     : "YYYY-MM-DD"
     type     : "party" (DJ night), "live" (live performance), "dinner",
                "private" (no online booking) or "closed"
     djs      : keys from DJS, e.g. ["bob", "sam"]
     title    : optional, e.g. "Marc Tohme, live performance"
     start / djFrom / end : optional, to change the hours of that night only
     capacity : optional, places that night (default SCHEDULE.capacity)
     reserved : places already confirmed. Update it when you confirm a booking:
                the page then shows "32 reserved · 18 left".
     minCharge: optional minimum charge per person in dollars
     note     : optional one line
     poster   : the poster photo (put the file in assets/events/). Nights that
                share a poster are shown together as one weekend.
   A night moves to "Recent nights" by itself once it has ended.
   ------------------------------------------------------------- */
const NIGHTS = [
  { date: "2026-11-13", type: "party", djs: ["dado"],        reserved: 0, poster: "assets/events/2026-11-13.jpg" },
  { date: "2026-11-14", type: "party", djs: ["bob", "sam"],  reserved: 0, poster: "assets/events/2026-11-13.jpg" },
  { date: "2026-11-06", type: "party", djs: ["ely"],         poster: "assets/events/2026-11-06.jpg" },
  { date: "2026-11-07", type: "party", djs: ["dado"],        poster: "assets/events/2026-11-06.jpg" },
  { date: "2026-10-30", type: "party", djs: ["kimo"],        poster: "assets/events/2026-10-30.jpg" },
  { date: "2026-10-31", type: "party", djs: ["dado"],        poster: "assets/events/2026-10-30.jpg" },
  { date: "2026-10-23", type: "private", title: "Private party", poster: "assets/events/2026-10-23.jpg" },
  { date: "2026-10-24", type: "party", djs: ["dado"],        poster: "assets/events/2026-10-23.jpg" },
  { date: "2026-10-16", type: "party", djs: ["bob", "sam"],  poster: "assets/events/2026-10-16.jpg" },
  { date: "2026-10-17", type: "party", djs: ["dado"],        poster: "assets/events/2026-10-16.jpg" },
  { date: "2026-10-09", type: "live",  title: "Marc Tohme, live performance", djs: ["dado"], minCharge: 30, poster: "assets/events/2026-10-09.jpg" },
  { date: "2026-10-10", type: "party", djs: ["youssef"],     poster: "assets/events/2026-10-09.jpg" },
  { date: "2026-10-02", type: "party", djs: ["dado"],        poster: "assets/events/2026-10-02.jpg" },
  { date: "2026-10-03", type: "party", djs: ["youssef"],     poster: "assets/events/2026-10-02.jpg" },
  { date: "2026-09-25", type: "party", djs: ["nizar"],       poster: "assets/events/2026-09-25.jpg" },
  { date: "2026-09-26", type: "party", djs: ["dado"],        poster: "assets/events/2026-09-25.jpg" },
  { date: "2026-09-18", type: "party", djs: ["dado"],        poster: "assets/events/2026-09-18.jpg" },
  { date: "2026-09-19", type: "party", djs: ["kimo"],        poster: "assets/events/2026-09-18.jpg" }
];

/* ---------- social media ----------
   INSTAGRAM: the handle (for example "hera.thegoddess") or the full link.
   Until it is filled in, every Instagram button stays hidden.
   SOCIALS: other pages, for example
     [{ label: "Facebook", url: "https://www.facebook.com/..." }]
   ------------------------------------------------------------- */
const INSTAGRAM = "";
const SOCIALS = [];

/* ---------- map ----------
   directions : your exact Google Maps link (Google Maps > Share > Copy link).
                Until it is set, the button searches Google Maps for the name.
   embed      : the address inside src="..." of Google Maps > Share > Embed a map.
                Until it is set, the map box shows the Hera emblem instead.
   ------------------------------------------------------------- */
const MAP = { directions: "", embed: "" };

/* ---------- hero photo or video ----------
   image : large photo of Hera, at least 1920 px wide (assets/hero/hero.jpg)
   video : short silent loop (assets/hero/hero.mp4), under 8 MB
   Leave both empty to keep the black and gold hero.
   ------------------------------------------------------------- */
const HERO = { image: "", video: "" };

/* ---------- gallery ----------
   Put the photos in assets/gallery/ and list them here. The Gallery
   section and its menu link appear as soon as there is one photo.
     src   : "assets/gallery/interior-1.jpg"
     thumb : optional smaller version for the grid (faster on phones)
     alt   : what the photo shows, in one short sentence
     cat   : "Interior", "Food", "Drinks", "Shisha", "DJ nights" or "Atmosphere"
     w, h  : pixel size of src (keeps the page from jumping while it loads)
   ------------------------------------------------------------- */
const GALLERY = [
  // { src: "assets/gallery/interior-1.jpg", alt: "The main room at Hera", cat: "Interior", w: 1600, h: 1067 },
];

/* ---------- reviews ----------
   Only real reviews, copied word for word from where they were written.
     name   : the name shown publicly (or "Google user")
     rating : 1 to 5
     text   : the review
     source : "Google", "Instagram"...
     url    : optional link to the review
     date   : optional, for example "October 2026"
   REVIEW_SUMMARY (optional): { rating: 4.7, count: 120, source: "Google", url: "..." }
   REVIEW_LINKS (optional): { all: "link to all reviews", write: "link to leave a review" }
   ------------------------------------------------------------- */
const REVIEWS = [
  // { name: "Name", rating: 5, text: "...", source: "Google", date: "October 2026" },
];
const REVIEW_SUMMARY = null;
const REVIEW_LINKS = { all: "", write: "" };
