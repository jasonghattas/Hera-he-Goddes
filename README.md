# Hera The Goddess website

Resto bar in Salhiyeh, Saida/Jezzine. Open Tuesday to Sunday from 5 PM, 18+ only.
Reservations: **76 759 320** (call or WhatsApp).

A plain static website: no framework, no build step, nothing to install. Vercel serves the files as they are.

## What is in the site

- Hero with the Hera logo, "Reserve a table" and "Explore our menu", the next night and the opening hours
- About Hera
- Events: weekend lineup with posters, places left per night, "Reserve this night" buttons, recent nights
- Menu: Food, Drinks and Shisha with sticky category links
- Gallery, Reviews, hero photo/video, Google Map: built in, **shown only when you add real content** (see below)
- Reservation form that opens WhatsApp with the whole booking written out. A reservation is confirmed only after the team replies.
- Feedback and notes form that opens WhatsApp
- Location, contact, footer, mobile call/reserve bar

## Motion and 3D

- **Intro:** the emblem disc zooms open (once per visit; skipped on direct links like `/#menu`).
- **Hero (computers):** the hero stays pinned while you scroll. The goddess is a 3D scene with orbit rings that turns with the mouse, moves in and grows; the words lift away, the story panel appears and four tags pin out from the drawing. On phones she floats, sways and tips back as you scroll.
- **Ticker** of signature cocktails that speeds up and leans with your scroll.
- **Headings** flip up letter by letter; blocks tip up into place.
- **3D tilt cards** with a gold sheen on lineup nights, posters, pillars and featured dishes (mouse only).
- **Recent nights** drift sideways as you scroll; menu dishes rise one after another; a gold progress line tracks the menu.
- **Gold cursor** and magnetic buttons on computers; embers that pause when off-screen.
- Visitors who turn on "reduce motion" get a calm, still version of the page.

## Run it on your computer

```
python3 -m http.server 8000
```

Then open http://localhost:8000

## Where to change things

| What | File |
| --- | --- |
| Hours, DJs, nights, posters, places reserved per night, Instagram, map, hero photo, gallery, reviews | `js/content.js` (every setting is explained inside) |
| Menu items, descriptions, prices, dish photos | `js/menu-data.js` |
| About text, opening hours, wording in the page | `index.html` |
| Colours, fonts, spacing | `css/styles.css` (the colours are at the top) |
| Behaviour (forms, menu, gallery viewer) | `js/app.js` (you should not need to touch it) |
| 3D and animation (intro, pinned hero, tilt cards, ticker, cursor, embers) | `js/fx.js` and `css/fx.css` |

### Every week

1. Save the new weekend poster in `assets/events/` (for example `2026-11-20.jpg`).
2. Add the two nights at the top of `NIGHTS` in `js/content.js` with their DJs and the poster.
3. Update `reserved` on a night when you confirm a booking, so "places left" stays right.

Nights move to "Recent nights" by themselves the morning after.

### Photos

- `assets/gallery/`: gallery photos, then list them in `GALLERY`. The Gallery section and its menu link appear by themselves.
- `assets/hero/`: one big photo (`hero.jpg`, at least 1920 px wide) or a short silent loop (`hero.mp4`, under 8 MB), then set `HERO`.
- `assets/menu/`: dish photos, then add `img: "assets/menu/name.jpg"` to the menu item.
- Keep photos under about 300 KB each (resize to 1600 px wide, JPEG quality 80).

### Reviews

Only copy real reviews, word for word, into `REVIEWS` (name, stars, text, source). The Reviews section appears when there is at least one.

## Nights and reservations

Everything about the nights lives in `js/content.js`:

- `SCHEDULE`: places per night (50), open days (Tuesday to Sunday), DJ nights (Friday and Saturday), the hours of a dinner night and a DJ night, when online requests stop (1 hour before closing), and how many nights the picker shows. **The hours there are placeholders: confirm them with Hera.**
- `DJS`: every DJ with name, optional photo (`assets/djs/name.jpg`, square) and style. Without a photo the page shows the DJ's initial in a gold circle.
- `NIGHTS`: the special nights (DJ, live, private, closed) with their DJs, poster and `reserved`. Nights that are not listed are filled in from `SCHEDULE`.

What the guest sees:

- **Weekend lineup:** each night shows its type (DJ night, live, private), the hours (doors, music until close), its status (Available, Almost full, Full, Private event) and "32 reserved · 18 left of 50" with a bar, plus the DJs with their photo.
- **Choose your night:** the reservation form starts with a strip of the next 21 nights, every one with the DJ or "Food, cocktails & shisha", the hours and the places left. Mondays show Closed, full and private nights cannot be requested.
- **The selected night:** DJs, doors, music and last arrival times, reserved / left / places, warnings (only a few places left, group too big, minimum charge) and call buttons when a night is full.
- **Arrival times** follow that night's hours and stop at the last arrival time; tonight only shows times still ahead.
- **After midnight** the page still treats it as last night until 6 AM, so "Tonight" and the bookings stay right.
- The guest's own request is remembered on their phone ("Your request: Saturday 14 November, 6 guests") until the night has passed.

### Places reserved and left

The page has no database yet: when you confirm a booking, add the guests to `reserved` on that night in `NIGHTS` (add the night if it is not listed). The next step is an admin page that saves nights, DJs, photos and reservations on a server; the page only reads `SCHEDULE`, `DJS` and `NIGHTS`, so it will keep working the same way.

## Deploy

The project is connected to Vercel. Push to `main` and Vercel publishes the new version. `vercel.json` adds security headers and caching for the images.

## Files

```
index.html            page structure and text
css/styles.css        design
js/content.js         content you edit
js/menu-data.js       the menu
js/app.js             behaviour
js/fx.js              3D and animation
css/fx.css            3D and animation styles
assets/img/           logo sizes, favicon, share image
assets/events/        weekend posters
assets/gallery/       gallery photos (add yours)
assets/hero/          hero photo or video (add yours)
robots.txt, sitemap.xml, site.webmanifest, favicon.ico, vercel.json
```
