// Ustawienia całej strony w jednym miejscu.
export const VERSION = '20261119b'; // podnieś po zmianie plików w /data, żeby przeglądarki pobrały nowe dane

// Statystyki bez cookies (Umami Cloud). Puste = skrypt się nie ładuje.
export const UMAMI_WEBSITE_ID = '';

// Produkty z Google Sheets (opublikowany CSV). Puste = data/products.json.
export const SHEET_CSV_URL = '';

export const DATA = {
  products: `../data/products.json?v=${VERSION}`,
  shop: `../data/shop.json?v=${VERSION}`,
  locations: `../data/locations.json?v=${VERSION}`,
};

export const TIME_ZONE = 'Europe/London';
