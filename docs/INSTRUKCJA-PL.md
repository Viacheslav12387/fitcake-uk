# Fit Cake London – instrukcja obsługi strony (PL)

## Wgrywanie strony
**Teraz (Netlify Drop):** app.netlify.com → projekt → **Deploys** → przeciągnij cały folder → poczekaj na **Published** → odśwież stronę (Cmd + Shift + R).
**Docelowo (GitHub):** każda zmiana wysłana na GitHub wgrywa się sama. Wtedy działają też płatności online.

## Zamówienia online (`data/shop.json`)
- `"mode": "demo"` – pokaz dla klienta (ceny przykładowe, nic nie jest wysyłane).
- `"mode": "order"` – zamówienie przychodzi do lokalu e-mailem, klient płaci przy odbiorze.
- `"mode": "stripe"` – zamówienie + płatność online (wymaga wdrożenia z GitHuba i konta Stripe).
- `"mode": "off"` – zamówienia wyłączone.
- `"min_notice_days": 1` – najwcześniejszy dzień odbioru (1 = jutro). `"max_qty": 10` – limit sztuk.
- `"variants"` – wielkości (kawałek, tort 8 porcji, tort 12 porcji). `"demo_prices"` – ceny tylko do pokazu.

### Ceny (`data/products.json`)
Przy każdym cieście: `"prices": { "slice": 450, "whole-8": 3200 }` – **w pensach** (450 = £4.50).
Wielkość bez ceny nie pojawi się w oknie produktu.

### Powiadomienia o zamówieniach (tryb „order”)
Netlify → **Forms** → włącz wykrywanie formularzy → wgraj stronę jeszcze raz → formularz `online-order`
→ **Form notifications → Email** → e-mail lokalu. W mailu: numer zamówienia (FC-…), lista, suma, dzień i godzina odbioru, dane klienta.

### Płatności online (tryb „stripe”) – kroki
1. Firma (Fit Cake London Ltd) zakłada konto na stripe.com i podaje dane firmy i konto bankowe.
2. Strona na GitHubie i połączona z Netlify (jednorazowo).
3. Netlify → Site configuration → **Environment variables**: `STRIPE_SECRET_KEY` (klucz z panelu Stripe), `SITE_URL` = `https://fitcake.uk`.
4. Test: klucz `sk_test_…`, karta 4242 4242 4242 4242. Potem klucz `sk_live_…`.
5. W Stripe: Settings → Emails → potwierdzenia płatności dla klienta.

## Nowy lokal
`data/locations.json` → skopiuj blok Mitcham, zmień `id`, nazwę, adres, godziny, e-mail, zdjęcie. Strona sama doda kartę, status „otwarte” i lokal w podsumowaniu zamówienia.

## Nowe zdjęcie produktu
WebP w dwóch szerokościach: `images/photos/nazwa-480.webp` i `nazwa-960.webp` → w `products.json`: `"image": "nazwa"`, `"image_sizes": [480, 960]`.

## Produkty z Google Sheets
Arkusz → Plik → Udostępnij → Opublikuj w internecie → CSV → link wklej w `js/core/config.js` → `SHEET_CSV_URL`. Obsługa zmienia menu sama.

## Statystyki (Umami, bez cookies)
umami.is → Add website → skopiuj Website ID → `js/core/config.js` → `UMAMI_WEBSITE_ID`.

## Przed startem (checklista)
- [ ] Regulamin: numer spółki, siedziba, minimalny czas zamówienia, termin anulowania (miejsca „[to be confirmed]”) – sprawdza prawnik/księgowy klienta.
- [ ] Ceny w `products.json`, `mode` ustawione na `order` albo `stripe`.
- [ ] Logo od centrali, dane centrali UK w stopce.
- [ ] Usunąć `<meta name="robots" content="noindex, nofollow">` ze wszystkich stron i poprawić `robots.txt`.
- [ ] Domena fitcake.uk w Netlify (rekord A `75.2.60.5`, CNAME `www`).
- [ ] Testowe zamówienie z telefonu → e-mail doszedł.
- [ ] Lighthouse 90+, Google Search Console + sitemap.
