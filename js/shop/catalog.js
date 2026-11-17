// =============================================================
// Katalog: wczytanie produktów (products.json albo Google Sheets) i ustawień sklepu (shop.json),
// zamiana na jeden, przewidywalny format używany przez widoki.
// =============================================================
import { DATA, SHEET_CSV_URL } from '../core/config.js';
import { fetchJSON } from '../core/util.js';
import { LANG } from '../core/i18n.js';

/** Tryby sklepu: off – bez zamówień; demo – pokaz; order – wysyłka zamówienia, płatność przy odbiorze; stripe – płatność online. */
export const MODES = ['off', 'demo', 'order', 'stripe'];

let shopPromise;
export function loadShop() {
  shopPromise ??= fetchJSON(DATA.shop)
    .then((s) => ({ mode: MODES.includes(s.mode) ? s.mode : 'off', max_qty: 10, min_notice_days: 1, variants: [], demo_prices: {}, ...s }))
    .catch(() => ({ mode: 'off', variants: [], demo_prices: {}, max_qty: 10, min_notice_days: 1 }));
  return shopPromise;
}

// ---------- Google Sheets (CSV) ----------
export function parseCSV(text) {
  const rows = [];
  let row = []; let cell = ''; let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1; } else if (ch === '"') quoted = false; else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

function rowsToProducts(rows) {
  const head = rows[0].map((h) => h.trim().toLowerCase());
  const col = (name) => head.findIndex((h) => h.startsWith(name.toLowerCase()));
  const yes = (v) => /^(tak|yes|y|1|true)$/i.test((v || '').trim());
  const num = (v) => { const n = parseFloat(String(v || '').replace(',', '.').replace(/[^\d.]/g, '')); return Number.isFinite(n) ? n : null; };
  const dietCols = { vegan: 'dieta: vegan', keto: 'dieta: keto', 'gluten-free': 'dieta: bez glutenu', 'lactose-free': 'dieta: bez laktozy', 'no-added-sugar': 'dieta: bez cukru' };
  const allergenCols = { Gluten: 'gluten', Crustaceans: 'skorupiaki', Eggs: 'jaja', Fish: 'ryby', Peanuts: 'orzeszki ziemne', Soya: 'soja', Milk: 'mleko', Nuts: 'orzechy', Celery: 'seler', Mustard: 'gorczyca', Sesame: 'sezam', Sulphites: 'siarczyny', Lupin: 'łubin', Molluscs: 'mięczaki' };
  return rows.slice(1).map((r) => ({
    id: r[col('id')], order: num(r[col('kolejno')]) ?? 999, category: r[col('kategoria')],
    name_en: r[col('nazwa (en)')], desc_en: r[col('opis (en)')], name_pl: r[col('nazwa (pl)')], desc_pl: r[col('opis (pl)')],
    kcal: num(r[col('kcal')]),
    diets: Object.keys(dietCols).filter((k) => yes(r[col(dietCols[k])])),
    allergens: Object.keys(allergenCols).filter((k) => yes(r[col(`alergen: ${allergenCols[k]}`)])),
    image: r[col('zdjęcie')] || '', note: r[col('uwagi')] || '', prices: {},
  })).filter((p) => p.name_en && !/przykład/i.test(p.note));
}

async function loadRaw() {
  if (SHEET_CSV_URL) {
    try {
      const res = await fetch(SHEET_CSV_URL, { cache: 'no-store' });
      if (res.ok) return rowsToProducts(parseCSV(await res.text()));
    } catch { /* awaryjnie products.json */ }
  }
  return fetchJSON(DATA.products);
}

/**
 * Warianty z ceną dla produktu.
 * Na żywo: tylko warianty z ceną w products.json → "prices": { "slice": 450 } (pensy).
 * Demo: brakujące ceny uzupełnia shop.json → demo_prices (oznaczone jako przykład).
 */
export function variantsFor(product, shop) {
  const prices = product.prices || {};
  return (shop.variants || []).map((v) => {
    const real = Number.isInteger(prices[v.id]) ? prices[v.id] : null;
    const demo = shop.mode === 'demo' && Number.isInteger(shop.demo_prices?.[v.id]) ? shop.demo_prices[v.id] : null;
    const pence = real ?? demo;
    return pence == null ? null : { id: v.id, name: v[LANG] || v.en, pence, sample: real == null };
  }).filter(Boolean);
}

let catalogPromise;
/** Produkty gotowe do wyświetlenia, posortowane, z wariantami i ceną „od”. */
export function loadCatalog() {
  catalogPromise ??= Promise.all([loadRaw(), loadShop()]).then(([raw, shop]) => raw
    .map((p) => {
      const variants = shop.mode === 'off' ? [] : variantsFor(p, shop);
      return {
        id: String(p.id),
        order: p.order ?? 999,
        category: p.category,
        name: (LANG === 'pl' && p.name_pl) || p.name_en,
        desc: (LANG === 'pl' && p.desc_pl) || p.desc_en || '',
        ingredients: (LANG === 'pl' && p.ingredients_pl) || p.ingredients_en || '',
        diets: p.diets || [],
        allergens: p.allergens || [],
        kcal: p.kcal ?? null,
        macros: p.protein != null ? { protein: p.protein, carbs: p.carbs, fat: p.fat } : null,
        image: p.image || '',
        imageSizes: p.image_sizes?.length ? p.image_sizes : [480],
        variants,
        fromPence: variants.length ? Math.min(...variants.map((v) => v.pence)) : null,
        sample: variants.some((v) => v.sample),
        searchText: [p.name_en, p.name_pl, p.desc_en, p.desc_pl, p.ingredients_en, p.ingredients_pl].join(' '),
      };
    })
    .sort((a, b) => a.order - b.order));
  return catalogPromise;
}

/** Adres zdjęcia produktu (WebP w kilku szerokościach albo pełny URL z arkusza). */
export function photoAttrs(product, sizes) {
  if (/^https?:\/\//.test(product.image)) return { src: product.image, srcset: '', sizes: '' };
  const url = (w) => `../images/photos/${encodeURIComponent(product.image)}-${w}.webp`;
  return {
    src: url(product.imageSizes[0]),
    srcset: product.imageSizes.map((w) => `${url(w)} ${w}w`).join(', '),
    sizes,
  };
}
