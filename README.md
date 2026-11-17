# Fit Cake London – fitcake.uk

Website of **Fit Cake London** (no-sugar, gluten-free bakery & café, Mitcham, London) – part of the Fit Cake network.
Built by [webdesignstudio.digital](https://webdesignstudio.digital).

- **Stack:** semantic HTML, modern CSS (custom properties, grid, `:has()`, native `<dialog>`), vanilla JavaScript ES modules.
  No framework, no build step, no runtime dependencies.
- **Languages:** English (`/en/`) and Polish (`/pl/`) with `hreflang` alternates.
- **Online ordering:** product dialog (size, quantity, live price) → cart → checkout (collection day/time, details, consents).
- **Quality gates:** unit tests (`node:test`), HTML validation (`html-validate`), CI on every push, Lighthouse 90+ / accessibility 100.

## Project structure

```
├── en/, pl/                 pages (index, products, locations, how-to-order, franchise, about, contact, terms, privacy …)
├── css/styles.css           one stylesheet, ordered: tokens → base → layout → components → responsive → utilities
├── js/
│   ├── app.js               entry point; loads feature modules only on pages that need them
│   ├── core/                config, i18n strings (EN/PL), helpers (escaping, money in pence, London time, safe storage)
│   ├── ui/                  menu, header, reveal on scroll, live open status, counters, videos, dialogs, toast
│   ├── shop/
│   │   ├── cart-store.js    cart logic – pure, DOM-free, unit tested
│   │   ├── catalog.js       products (JSON or Google Sheets CSV) + shop settings → one normalised model
│   │   ├── products-view.js product grid, diet filters, category, search
│   │   ├── product-dialog.js product dialog: size, quantity, “Add to order £…”
│   │   ├── cart-ui.js       header badge, mobile action bar, cart drawer
│   │   └── checkout.js      checkout: demo / order (Netlify Forms) / stripe (serverless function)
│   └── places/locations.js  cafés from data/locations.json, city search
├── data/                    products.json, locations.json, shop.json – content without touching code
├── netlify/functions/       checkout.mjs (Stripe Checkout Session) + order-pricing.mjs (server-side pricing)
├── tests/                   node:test unit tests
├── images/, fonts/          WebP photos, SVG icon sprite, self-hosted fonts (SIL OFL)
├── _headers, _redirects, netlify.toml
└── docs/INSTRUKCJA-PL.md    operations guide for the client (Polish)
```

## Architecture notes

- **Cart as a store.** `cart-store.js` keeps state, persists it (versioned, validated `localStorage` payload) and emits
  `change` events. Views only subscribe – no view mutates another view.
- **Money in integer pence.** No floating-point rounding; matches Stripe's API.
- **Server-side pricing.** The browser sends only product ids, sizes and quantities. `order-pricing.mjs` looks prices up
  in `data/products.json`, so the amount cannot be changed in the browser.
- **Progressive enhancement.** Navigation, content and the custom cake form work without JavaScript.
- **Accessibility.** Native `<dialog>` (focus, Esc), `aria-live` announcements, 44 px touch targets, visible focus,
  reduced-motion support, WCAG AA colour contrast.
- **Security.** All dynamic text is escaped before it is inserted into HTML; card data is handled only by Stripe.
- **Performance.** Responsive WebP images, preloaded LCP image and fonts, feature modules loaded on demand.

## Shop modes (`data/shop.json` → `mode`)

| mode     | what happens                                                                 |
|----------|------------------------------------------------------------------------------|
| `off`    | no ordering, “coming soon” message                                           |
| `demo`   | full flow with sample prices, nothing is sent (for presentations)            |
| `order`  | order is sent via Netlify Forms (`online-order`), payment at collection      |
| `stripe` | order + online payment via Stripe Checkout (needs Git/CLI deploy + env vars) |

Prices live in `data/products.json` as integer pence per size: `"prices": { "slice": 450, "whole-8": 3200 }`.

## Development

```bash
npm install        # dev tools only (html-validate)
npm test           # unit tests
npm run lint:html  # HTML validation
npm run check      # both
npm start          # local server on http://localhost:8080/en/
```

## Deployment

- **Netlify (Git):** connect the repository; `netlify.toml` publishes the root and deploys `netlify/functions`.
  Environment variables for online payments: `STRIPE_SECRET_KEY`, `SITE_URL`.
- **Netlify Drop:** drag the folder – the static site and Netlify Forms work; serverless payments do not.

## Legal (UK)

Terms of sale, privacy policy (UK GDPR) and pre-contract information at checkout (seller, prices incl. VAT, collection,
allergens, perishable goods and the Consumer Contracts Regulations 2013). Placeholders marked *[to be confirmed]* must be
completed and reviewed by the client before going live.
