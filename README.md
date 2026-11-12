# Hera The Goddess

Website for Hera The Goddess, resto bar in Salhiyeh, Saida/Jezzine. Open Tuesday to Sunday from 5 PM, 18+ only.

One static page (`index.html`) with:

- weekend DJ lineup
- full menu: food, drinks and shisha
- booking form with places left per night (50 guests per night)
- feedback and notes form
- find-us section

Reservations, feedback and notes open WhatsApp with the message ready to send to the organizer, 76 759 320.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole site: styles, script and content |
| `logo-emblem.png` | Hera logo, gold line art on a transparent background |

## Run it

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

The page loads its fonts from Google Fonts, so it needs an internet connection to look as designed.

## Update it

Open `index.html` and look for the `EDIT HERE` comments near the top of the script.

- `LINEUP`: one line per night, `date` as `YYYY-MM-DD` and the DJs. A night disappears by itself the morning after.
- `CAPACITY` and `BOOKED`: guests per night and the guests already booked on each date, for example `"2026-11-15": 18`.
- `INSTAGRAM`: the Instagram handle or full link. The Instagram links stay hidden while it is empty.
- `MENU`: names, descriptions and prices in dollars.

## Limits

The page has no server. Bookings are not stored on the site: the guest sends the request on WhatsApp and the organizer confirms it there. The places-left numbers only change when `BOOKED` is edited. To count bookings automatically, the site needs a host with a small booking database.
