// Małe, niezależne funkcje pomocnicze (bez stanu).

/** Bezpieczne wstawianie tekstu do HTML (ochrona przed XSS). */
export const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Kwota w pensach → „£4.50” (EN) lub „£4,50” (PL). Pensy = liczby całkowite, bez błędów zaokrągleń. */
export const money = (pence, lang = 'en') => {
  const s = (Math.round(pence) / 100).toFixed(2);
  return `£${lang === 'pl' ? s.replace('.', ',') : s}`;
};

/** Tekst do wyszukiwania: małe litery, bez polskich znaków. */
export const norm = (value) => String(value ?? '').toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l');

/** Dzisiejsza data/godzina w Londynie, niezależnie od strefy czasowej użytkownika. */
export const londonNow = (date = new Date(), timeZone = 'Europe/London') => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short',
  }).formatToParts(date).map((x) => [x.type, x.value]));
  return {
    date: `${p.year}-${p.month}-${p.day}`,
    dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday),
    minutes: Number(p.hour) * 60 + Number(p.minute),
  };
};

/** Data w Londynie za N dni (YYYY-MM-DD). */
export const londonDate = (addDays = 0) => londonNow(new Date(Date.now() + addDays * 86400000)).date;

/** localStorage, który nie wywraca strony w trybie prywatnym lub przy zablokowanych danych. */
export const safeStorage = {
  get(key) { try { return window.localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { window.localStorage.setItem(key, value); } catch { /* brak miejsca / zablokowane */ } },
  remove(key) { try { window.localStorage.removeItem(key); } catch { /* j.w. */ } },
};

/** Pobranie JSON z czytelnym błędem. */
export async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
