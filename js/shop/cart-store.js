// =============================================================
// Koszyk – sama logika (bez HTML), dzięki temu da się ją testować (tests/cart-store.test.js).
// Ceny trzymamy w pensach (liczby całkowite), żeby 0,1 + 0,2 zawsze dawało 0,3.
// Zmiany ogłaszamy zdarzeniem „change” – widoki (licznik, panel, podsumowanie) tylko nasłuchują.
// =============================================================

export const CART_KEY = 'fitcake-cart';
export const CART_VERSION = 1;

const isLine = (l) => l
  && typeof l.productId === 'string' && typeof l.variantId === 'string'
  && Number.isInteger(l.unitPence) && l.unitPence >= 0
  && Number.isInteger(l.qty) && l.qty > 0;

export const lineId = (productId, variantId) => `${productId}:${variantId}`;

/**
 * @param {object} [options]
 * @param {{get(k:string):string|null, set(k:string,v:string):void}} [options.storage] – zapis między wizytami
 * @param {number} [options.maxQty] – maksymalna liczba sztuk jednego produktu
 */
export function createCart({ storage = null, maxQty = 10 } = {}) {
  const events = new EventTarget();
  /** @type {Map<string, {id:string, productId:string, variantId:string, name:string, variantName:string, unitPence:number, qty:number, image:string}>} */
  let lines = new Map();

  const clamp = (qty) => Math.max(0, Math.min(maxQty, Math.floor(Number(qty) || 0)));

  function save() {
    if (!storage) return;
    storage.set(CART_KEY, JSON.stringify({ v: CART_VERSION, lines: [...lines.values()] }));
  }

  function load() {
    if (!storage) return;
    try {
      const data = JSON.parse(storage.get(CART_KEY) || 'null');
      if (!data || data.v !== CART_VERSION || !Array.isArray(data.lines)) return;
      lines = new Map(data.lines.filter(isLine).map((l) => [l.id || lineId(l.productId, l.variantId), { ...l, qty: clamp(l.qty) }]));
    } catch { lines = new Map(); } // uszkodzony zapis = pusty koszyk, strona działa dalej
  }

  function emit(detail = {}) {
    save();
    events.dispatchEvent(new CustomEvent('change', { detail }));
  }

  const api = {
    maxQty,
    /** Dodaje produkt; zwraca liczbę faktycznie dodanych sztuk (limit maxQty). */
    add(item, qty = 1) {
      const id = lineId(item.productId, item.variantId);
      const current = lines.get(id);
      const before = current ? current.qty : 0;
      const after = clamp(before + qty);
      if (after === before) return 0;
      lines.set(id, {
        id,
        productId: String(item.productId),
        variantId: String(item.variantId),
        name: String(item.name || ''),
        variantName: String(item.variantName || ''),
        unitPence: Math.round(item.unitPence),
        image: String(item.image || ''),
        qty: after,
      });
      emit({ type: 'add', id, added: after - before });
      return after - before;
    },
    setQty(id, qty) {
      const line = lines.get(id);
      if (!line) return;
      const q = clamp(qty);
      if (q === 0) lines.delete(id); else line.qty = q;
      emit({ type: 'qty', id });
    },
    remove(id) {
      if (lines.delete(id)) emit({ type: 'remove', id });
    },
    clear() {
      lines.clear();
      emit({ type: 'clear' });
    },
    lines: () => [...lines.values()],
    qtyOf: (id) => (lines.get(id) ? lines.get(id).qty : 0),
    count: () => [...lines.values()].reduce((n, l) => n + l.qty, 0),
    totalPence: () => [...lines.values()].reduce((sum, l) => sum + l.unitPence * l.qty, 0),
    onChange(fn) {
      const handler = (e) => fn(e.detail);
      events.addEventListener('change', handler);
      return () => events.removeEventListener('change', handler);
    },
    /** Dane wysyłane do zamówienia: tylko identyfikatory i ilości (cenę liczy serwer). */
    toOrderItems: () => [...lines.values()].map((l) => ({ productId: l.productId, variantId: l.variantId, qty: l.qty })),
  };

  load();
  return api;
}
