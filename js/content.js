/* =============================================================
   HERA THE GODDESS: CONTENT  (edit here, you never need to touch app.js)
   The menu has its own file: js/menu-data.js

   Sections that need photos or reviews (Gallery, Reviews, hero photo,
   map) stay hidden until you fill them in below. Nothing is invented.
   ============================================================= */

/* ---------- reservation line ---------- */
const PHONE_DISPLAY = "76 759 320";
const PHONE_TEL = "+96176759320";
const WA_NUMBER = "96176759320";

/* ---------- places per night ----------
   CAPACITY is the maximum number of guests in one night.
   BOOKED lists the guests already booked on each date (YYYY-MM-DD).
   A date that is not listed has 0 booked. Example:
     const BOOKED = { "2026-11-14": 18, "2026-11-15": 32 };
   ------------------------------------------------------------- */
const CAPACITY = 50;
const BOOKED = {
  // "2026-11-14": 18,
};

/* ---------- weekend lineups ----------
   One block per weekend. Add the newest weekend at the top.
     poster : photo of the weekend poster (put the file in assets/events/)
     nights : one entry per night
        date  : YYYY-MM-DD
        djs   : ["DJ Dado"]            (leave out when there is no DJ)
        title : optional, e.g. "Private party" or "Artist name, live"
        note  : optional one line, e.g. "Minimum charge $30 per person"
   A night moves from "Weekend Lineup" to "Recent nights" by itself
   the morning after it happens.
   ------------------------------------------------------------- */
const WEEKENDS = [
  { poster: "assets/events/2026-11-13.jpg", nights: [
    { date: "2026-11-13", djs: ["DJ Dado"] },
    { date: "2026-11-14", djs: ["DJ Bob", "DJ Sam"] }
  ]},
  { poster: "assets/events/2026-11-06.jpg", nights: [
    { date: "2026-11-06", djs: ["DJ Ely"] },
    { date: "2026-11-07", djs: ["DJ Dado"] }
  ]},
  { poster: "assets/events/2026-10-30.jpg", nights: [
    { date: "2026-10-30", djs: ["DJ Kimo"] },
    { date: "2026-10-31", djs: ["DJ Dado"] }
  ]},
  { poster: "assets/events/2026-10-23.jpg", nights: [
    { date: "2026-10-23", title: "Private party" },
    { date: "2026-10-24", djs: ["DJ Dado"] }
  ]},
  { poster: "assets/events/2026-10-16.jpg", nights: [
    { date: "2026-10-16", djs: ["DJ Bob", "DJ Sam"] },
    { date: "2026-10-17", djs: ["DJ Dado"] }
  ]},
  { poster: "assets/events/2026-10-09.jpg", nights: [
    { date: "2026-10-09", title: "Marc Tohme, live performance", djs: ["DJ Dado"], note: "Minimum charge $30 per person" },
    { date: "2026-10-10", djs: ["DJ Youssef"] }
  ]},
  { poster: "assets/events/2026-10-02.jpg", nights: [
    { date: "2026-10-02", djs: ["DJ Dado"] },
    { date: "2026-10-03", djs: ["DJ Youssef"] }
  ]},
  { poster: "assets/events/2026-09-25.jpg", nights: [
    { date: "2026-09-25", djs: ["DJ Nizar"] },
    { date: "2026-09-26", djs: ["DJ Dado"] }
  ]},
  { poster: "assets/events/2026-09-18.jpg", nights: [
    { date: "2026-09-18", djs: ["DJ Dado"] },
    { date: "2026-09-19", djs: ["DJ Kimo"] }
  ]}
];

/* DJs who played at Hera recently (shown as a list under the lineup) */
const RECENT_DJS = ["DJ Dado", "DJ Kimo", "DJ Youssef", "DJ Nizar", "DJ Bob", "DJ Sam", "DJ Cal", "DJ Ely", "DJ Yorgo", "DJ Hakim"];

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
