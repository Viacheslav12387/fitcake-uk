// Lista ciast: filtry diet, kategoria, wyszukiwarka, karty. Kliknięcie karty otwiera okno produktu.
import { $, esc, money, norm } from '../core/util.js';
import { LANG, t, DIETS, CATEGORIES, label } from '../core/i18n.js';
import { loadCatalog, loadShop, photoAttrs } from './catalog.js';
import { reveal } from '../ui/reveal.js';

const CARD_SIZES = '(min-width: 960px) 30vw, (min-width: 640px) 45vw, 92vw';

function cardHTML(p, i, shop) {
  const img = p.image ? photoAttrs(p, CARD_SIZES) : null;
  const priceHTML = p.fromPence != null
    ? `<p class="card-price"><small>${t.from}</small> ${money(p.fromPence, LANG)}${p.sample ? `<span class="sample-price">${t.sample}</span>` : ''}</p>`
    : `<p class="card-price"><small>${shop.mode === 'off' ? '' : t.askInStore}</small></p>`;
  const action = p.variants.length ? t.add : t.details;
  return `<li class="card">
    <div class="card-img">${img ? `<img src="${img.src}" srcset="${img.srcset}" sizes="${img.sizes}" alt="" width="600" height="450" ${i < 3 ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>` : ''}</div>
    <div class="card-body">
      <p class="card-cat">${esc(label(CATEGORIES, p.category))}</p>
      <h3 class="card-title"><button class="card-open" type="button" data-product-open="${esc(p.id)}">${esc(p.name)}</button></h3>
      <ul class="card-tags">${p.diets.map((d) => `<li>${esc(label(DIETS, d))}</li>`).join('')}</ul>
      <div class="card-foot">
        ${priceHTML}
        <button class="btn btn-primary card-add" type="button" data-product-open="${esc(p.id)}" aria-label="${esc(`${action}: ${p.name}`)}">${action}</button>
      </div>
    </div>
  </li>`;
}

export async function initProducts(list) {
  const limit = Number(list.dataset.limit) || 0;
  const chips = $('[data-diet-filters]');
  const category = $('[data-category]');
  const count = $('[data-count]');
  const search = $('[data-search]');
  const active = new Set();

  let products;
  let shop;
  try { [products, shop] = await Promise.all([loadCatalog(), loadShop()]); } catch {
    list.innerHTML = `<li class="empty">${t.none}</li>`;
    return;
  }

  if (search) {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) search.value = q;
    search.addEventListener('input', render);
  }
  if (chips) {
    chips.innerHTML = Object.entries(DIETS).map(([k, v]) => `<li><button type="button" class="chip" data-diet="${k}" aria-pressed="false">${v[LANG]}</button></li>`).join('');
    chips.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-diet]');
      if (!btn) return;
      const k = btn.dataset.diet;
      if (active.has(k)) active.delete(k); else active.add(k);
      btn.setAttribute('aria-pressed', String(active.has(k)));
      render();
    });
  }
  if (category) {
    const cats = [...new Set(products.map((p) => p.category).filter(Boolean))];
    category.innerHTML = `<option value="">${t.all}</option>${cats.map((c) => `<option value="${esc(c)}">${esc(label(CATEGORIES, c))}</option>`).join('')}`;
    category.addEventListener('change', render);
  }

  function render() {
    const cat = category ? category.value : '';
    const q = search ? norm(search.value.trim()) : '';
    let items = products.filter((p) => [...active].every((d) => p.diets.includes(d))
      && (!cat || p.category === cat)
      && (!q || norm(p.searchText).includes(q)));
    if (limit) items = items.slice(0, limit);
    list.innerHTML = items.length ? items.map((p, i) => cardHTML(p, i, shop)).join('') : `<li class="empty">${t.none}</li>`;
    if (count) count.textContent = t.count(items.length);
    reveal(list.querySelectorAll('.card'));
  }
  render();
}
