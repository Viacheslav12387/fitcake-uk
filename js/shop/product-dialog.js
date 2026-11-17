// Okno produktu (jak w systemach zamówień): zdjęcie, skład, alergeny, wielkość, ilość, „Dodaj do zamówienia £…”.
import { $, esc, money } from '../core/util.js';
import { LANG, t, DIETS, CATEGORIES, label, allergenName } from '../core/i18n.js';
import { loadCatalog, photoAttrs } from './catalog.js';
import { cart } from './cart.js';
import { toast } from '../ui/toast.js';

export function initProductDialog(dlg) {
  const form = $('[data-pd-form]', dlg);
  const el = (name) => $(`[data-pd-${name}]`, dlg);
  let product = null;
  let qty = 1;

  const selected = () => {
    const input = form.querySelector('input[name="variant"]:checked');
    return product?.variants.find((v) => v.id === input?.value) || null;
  };

  function updateTotal() {
    const v = selected();
    const max = cart.maxQty - (v ? cart.qtyOf(`${product.id}:${v.id}`) : 0);
    qty = Math.max(1, Math.min(qty, Math.max(1, max)));
    el('qty').textContent = qty;
    el('minus').disabled = qty <= 1;
    el('plus').disabled = qty >= max;
    el('max').hidden = qty < max;
    el('max').textContent = t.maxQty(cart.maxQty);
    el('total').textContent = v ? money(v.pence * qty, LANG) : '';
    el('add').disabled = !v || max < 1;
  }

  async function open(id) {
    const products = await loadCatalog();
    product = products.find((p) => p.id === id);
    if (!product) return;
    qty = 1;
    const img = product.image ? photoAttrs(product, '(min-width: 640px) 560px, 100vw') : null;
    const photo = el('img');
    photo.hidden = !img;
    if (img) { photo.src = img.src; photo.srcset = img.srcset; photo.sizes = img.sizes; photo.alt = product.name; }
    el('cat').textContent = label(CATEGORIES, product.category);
    el('name').textContent = product.name;
    el('price').innerHTML = product.fromPence != null
      ? `${product.variants.length > 1 ? `${t.from} ` : ''}${money(product.fromPence, LANG)}${product.sample ? `<span class="sample-price">${t.sample}</span>` : ''}`
      : '';
    el('desc').textContent = product.desc;
    el('tags').innerHTML = product.diets.map((d) => `<li>${esc(label(DIETS, d))}</li>`).join('');
    const allergens = product.allergens.length ? product.allergens.map(allergenName).join(', ') : t.noAllergens;
    el('facts').innerHTML = `${product.kcal != null ? `<span><strong>${product.kcal}</strong> ${t.kcal}</span>` : ''}<span><strong>${t.contains}:</strong> ${esc(allergens)}</span>`;
    el('ing').textContent = product.ingredients ? `${t.ingredients}: ${product.ingredients}` : '';
    const m = product.macros;
    el('macros').innerHTML = m ? [['protein', m.protein], ['carbs', m.carbs], ['fat', m.fat]]
      .map(([k, v]) => `<li><strong>${LANG === 'pl' ? String(v).replace('.', ',') : v} g</strong>${t[k]}</li>`).join('') : '';
    el('more').hidden = !product.ingredients && !m;
    const options = el('options');
    options.innerHTML = product.variants.map((v, i) => `<label class="option">
        <input type="radio" name="variant" value="${esc(v.id)}"${i === 0 ? ' checked' : ''} required>
        <span class="option-name">${esc(v.name)}</span>
        <span class="option-price">${money(v.pence, LANG)}</span>
      </label>`).join('');
    el('group').hidden = !product.variants.length;
    el('foot').hidden = !product.variants.length;
    updateTotal();
    dlg.showModal();
    el('name').focus();
  }

  form.addEventListener('change', updateTotal);
  el('minus').addEventListener('click', () => { qty -= 1; updateTotal(); });
  el('plus').addEventListener('click', () => { qty += 1; updateTotal(); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = selected();
    if (!product || !v) return;
    const added = cart.add({
      productId: product.id, variantId: v.id, name: product.name, variantName: v.name, unitPence: v.pence,
      image: product.image ? photoAttrs(product, '').src : '',
    }, qty);
    if (added) toast(t.added(`${product.name} × ${added}`));
    dlg.close();
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-product-open]');
    if (btn) { e.preventDefault(); open(btn.dataset.productOpen); }
  });
}
