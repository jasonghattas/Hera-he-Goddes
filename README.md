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

## Run it on your computer

```
python3 -m http.server 8000
```

Then open http://localhost:8000

## Where to change things

| What | File |
| --- | --- |
| Weekend lineups and posters, places booked per night, Instagram, map, hero photo, gallery, reviews | `js/content.js` (every setting is explained inside) |
| Menu items, descriptions, prices, dish photos | `js/menu-data.js` |
| About text, opening hours, wording in the page | `index.html` |
| Colours, fonts, spacing | `css/styles.css` (the colours are at the top) |
| Behaviour (forms, menu, gallery viewer) | `js/app.js` (you should not need to touch it) |

### Every week

1. Save the new weekend poster in `assets/events/` (for example `2026-11-20.jpg`).
2. Add one block at the top of `WEEKENDS` in `js/content.js` with the poster and the two nights.
3. Update `BOOKED` when people book, so "places left" stays right.

Nights move to "Recent nights" by themselves the morning after.

### Photos

- `assets/gallery/`: gallery photos, then list them in `GALLERY`. The Gallery section and its menu link appear by themselves.
- `assets/hero/`: one big photo (`hero.jpg`, at least 1920 px wide) or a short silent loop (`hero.mp4`, under 8 MB), then set `HERO`.
- `assets/menu/`: dish photos, then add `img: "assets/menu/name.jpg"` to the menu item.
- Keep photos under about 300 KB each (resize to 1600 px wide, JPEG quality 80).

### Reviews

Only copy real reviews, word for word, into `REVIEWS` (name, stars, text, source). The Reviews section appears when there is at least one.

## Places left per night

The page has no database, so the numbers come from `BOOKED` in `js/content.js`. Update it by hand when you accept a booking. If you want this to update by itself, the site needs a small backend; ask for it as a separate step.

## Deploy

The project is connected to Vercel. Push to `main` and Vercel publishes the new version. `vercel.json` adds security headers and caching for the images.

## Files

```
index.html            page structure and text
css/styles.css        design
js/content.js         content you edit
js/menu-data.js       the menu
js/app.js             behaviour
assets/img/           logo sizes, favicon, share image
assets/events/        weekend posters
assets/gallery/       gallery photos (add yours)
assets/hero/          hero photo or video (add yours)
robots.txt, sitemap.xml, site.webmanifest, favicon.ico, vercel.json
```
