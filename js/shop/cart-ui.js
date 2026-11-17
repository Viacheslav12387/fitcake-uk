// Licznik w nagłówku, przycisk w pasku na telefonie i panel koszyka z listą, ilościami i sumą.
import { $, $$, esc, money } from '../core/util.js';
import { LANG, t } from '../core/i18n.js';
import { cart } from './cart.js';
import { VERSION } from '../core/config.js';

const ICON = (id) => `<svg width="18" height="18" aria-hidden="true"><use href="../images/icons.svg?v=${VERSION}#icon-${id}"></use></svg>`;

function lineHTML(l) {
  return `<li class="cart-line">
    ${l.image ? `<img src="${esc(l.image)}" alt="" width="64" height="64" loading="lazy">` : '<span></span>'}
    <div>
      <h3>${esc(l.name)}</h3>
      <p class="cart-line-meta">${esc(l.variantName)} · ${money(l.unitPence, LANG)}</p>
      <div class="cart-line-row">
        <div class="qty">
          <button class="icon-btn qty-btn" type="button" data-line-dec="${esc(l.id)}" aria-label="${l.qty === 1 ? t.remove : t.decrease}: ${esc(l.name)}">${ICON(l.qty === 1 ? 'trash' : 'minus')}</button>
          <span class="qty-value">${l.qty}</span>
          <button class="icon-btn qty-btn" type="button" data-line-inc="${esc(l.id)}" aria-label="${t.increase}: ${esc(l.name)}"${l.qty >= cart.maxQty ? ' disabled' : ''}>${ICON('plus')}</button>
        </div>
        <span class="cart-line-total">${money(l.unitPence * l.qty, LANG)}</span>
      </div>
    </div>
  </li>`;
}

export function initCartUI() {
  const dlg = $('[data-cart-dialog]');
  const badges = $$('[data-cart-count]');
  const openers = $$('[data-cart-open]');
  const actionBtn = $('[data-action-order]');
  const actionText = actionBtn ? actionBtn.querySelector('span').textContent : '';

  function render(detail = {}) {
    const n = cart.count();
    const total = money(cart.totalPence(), LANG);
    badges.forEach((b) => {
      b.textContent = n;
      b.hidden = n === 0;
      if (detail.type === 'add') { b.classList.remove('is-bump'); void b.offsetWidth; b.classList.add('is-bump'); }
    });
    openers.forEach((o) => o.setAttribute('aria-label', t.cartLabel(n)));
    if (actionBtn) actionBtn.querySelector('span').textContent = n ? t.cartAction(n, total) : actionText;
    if (!dlg) return;
    const lines = cart.lines();
    $('[data-cart-lines]', dlg).innerHTML = lines.map(lineHTML).join('');
    $('[data-cart-empty]', dlg).hidden = lines.length > 0;
    $('[data-cart-total]', dlg).textContent = total;
    $('[data-cart-checkout]', dlg).disabled = lines.length === 0;
  }

  openers.forEach((o) => o.addEventListener('click', () => dlg?.showModal()));
  actionBtn?.addEventListener('click', (e) => {
    if (cart.count() === 0) return; // pusty koszyk: zwykły link do oferty
    e.preventDefault();
    dlg?.showModal();
  });
  dlg?.addEventListener('click', (e) => {
    const dec = e.target.closest('[data-line-dec]');
    const inc = e.target.closest('[data-line-inc]');
    if (dec) cart.setQty(dec.dataset.lineDec, cart.qtyOf(dec.dataset.lineDec) - 1);
    if (inc) cart.setQty(inc.dataset.lineInc, cart.qtyOf(inc.dataset.lineInc) + 1);
  });
  cart.onChange(render);
  render();
}
