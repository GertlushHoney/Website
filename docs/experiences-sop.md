# SOP: Running Bee Day dates (Experiences)

Written 2026-11-19. For whoever looks after the shop day to day. Plain steps, no code.

## How it is set up

- **One Shopify product** — "Experience - Bramble Farm", £45. It is **not** a physical product (no delivery, no Click & Drop parcel). One product serves every date; you never need a second one unless it is a different experience with its own price.
- **One Studio entry** — Studio → **Merch Product → Experiences → Bee Day Experience at Bramble Farm**. Its **Bookable dates** list holds every date, each with its own number of places.
- The site only shows a customer the dates that still have places. After an order is **paid**, that date's places drop automatically.
- The meeting point is **not** on the website; it is sent to the customer after they book (kept private to protect the apiary).

## Add a new date

1. Studio → Merch Product → Experiences → open **Bee Day Experience at Bramble Farm**.
2. Scroll to **Bookable dates** → **Add item**.
3. Enter the **Date** and **Total places** (6 so far). Leave **Places booked** at 0 — the site updates it.
4. Press **Publish**.
5. Within a minute, check the Experiences page (`/shop/experiences`) shows the new date and that the product page offers it.

**Never** make a second Studio entry for the same product to hold a new date. The booking system finds the entry by the date, and two active entries with the same date clash. Always add the date to this one entry.

## Change the number of places

Edit **Total places** on that date and publish. Never set it lower than **Places booked**.

## When someone books

Nothing for you to do except the day itself. The order appears in Shopify. Because the product is no longer a physical product, it should not appear in Click & Drop; if one ever does, delete it there. The customer's chosen date is on the order line.

## If a date is overbooked

Rarely, two people pay for the last place at the same moment. You get an email at admin@ with a subject starting "Action needed: overbooked experience, order #…".

1. Studio → **Experience Booking Conflict** → open the newest one. It gives the Shopify order number, the date and how many places were wanted.
2. In Shopify, open that order, refund it (or move the customer to another date by agreement), and contact them.
3. Back in Studio, tick **Resolved**.

## If someone cancels or you cancel a date (weather)

- **Refund in Shopify.** Refunds do **not** give the place back automatically.
- Then in Studio lower **Places booked** for that date by the number of places refunded, so the place can be sold again.
- To cancel a whole date: contact and refund each booking first, then remove the date from **Bookable dates** (or set **Total places** equal to **Places booked** so it sells out). Do not delete a date that still has bookings without refunding them.
- Weather: hives can only be opened above 15°C in dry weather; the product page already warns customers a date may be rescheduled.

## Test it

A £0 test booking is possible with the test discount codes while they exist (they were set up on 2026-11-15 and expire on 29 November). Each email address can use them once.
