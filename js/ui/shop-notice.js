// Komunikaty o sklepie: „w przygotowaniu” (tryb off) albo pasek „demo”.
import { $$ } from '../core/util.js';
import { t } from '../core/i18n.js';
import { loadShop } from '../shop/catalog.js';

export async function initShopNotice() {
  const shop = await loadShop();
  $$('[data-shop-off]').forEach((el) => { el.hidden = shop.mode !== 'off'; });
  $$('[data-demo-note]').forEach((el) => { el.textContent = t.demo; el.hidden = shop.mode !== 'demo'; });
}
