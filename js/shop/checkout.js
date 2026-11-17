// =============================================================
// Podsumowanie zamówienia: lista z koszyka, odbiór (lokal, dzień, godzina), dane, zgody → wysłanie.
// Tryby (data/shop.json → mode):
//   demo   – nic nie jest wysyłane, okno pokazuje wynik,
//   order  – zamówienie trafia do lokalu przez Netlify Forms (formularz „online-order”), płatność przy odbiorze,
//   stripe – jak „order” + płatność online: funkcja serwerowa liczy cenę i zwraca link do płatności Stripe.
// Dane karty obsługuje wyłącznie Stripe – strona ich nie widzi.
// =============================================================
import { $, esc, money, londonDate, fetchJSON } from '../core/util.js';
import { LANG, t } from '../core/i18n.js';
import { DATA } from '../core/config.js';
import { loadShop } from './catalog.js';
import { cart } from './cart.js';

const reference = () => `FC-${Date.now().toString(36).toUpperCase()}`;

export function initCheckout(dlg) {
  const form = $('[data-checkout-form]', dlg);
  const el = (name) => $(`[data-co-${name}]`, dlg);
  const dateInput = el('date');
  const timeSelect = el('time');
  const cafeSelect = el('cafe');
  let locations = [];
  let shop = { mode: 'off' };

  const hoursFor = () => (locations.find((l) => l.id === cafeSelect.value) || locations[0])?.hours;

  function fillTimes() {
    const hours = hoursFor();
    const day = dateInput.value ? new Date(`${dateInput.value}T12:00:00Z`).getUTCDay() : null;
    const h = hours && day != null ? hours[day] : null;
    timeSelect.innerHTML = h
      ? Array.from({ length: h[1] - h[0] }, (_, i) => h[0] + i).map((x) => `<option value="${x}:00">${x}:00 – ${x + 1}:00</option>`).join('')
      : `<option value="">${t.closed}</option>`;
  }

  function renderSummary() {
    const lines = cart.lines();
    const total = money(cart.totalPence(), LANG);
    el('summary').innerHTML = lines.map((l) => `<li><span>${l.qty} × ${esc(l.name)} <small>(${esc(l.variantName)})</small></span><span>${money(l.unitPence * l.qty, LANG)}</span></li>`).join('')
      + `<li class="summary-total"><span>${t.total}</span><span>${total}</span></li>`;
    el('submit').textContent = shop.mode === 'stripe' ? t.payOrder(total) : t.sendOrder(total);
    // pola wysyłane w formularzu (czytelne dla obsługi lokalu w e-mailu)
    form.elements.items.value = lines.map((l) => `${l.qty} × ${l.name} (${l.variantName}) – ${money(l.unitPence * l.qty, 'en')}`).join('\n');
    form.elements.total.value = money(cart.totalPence(), 'en');
  }

  async function open() {
    if (!cart.count()) return;
    $('[data-cart-dialog]')?.close();
    form.hidden = false;
    el('body').hidden = false;
    el('foot').hidden = false;
    el('done').hidden = true;
    el('error').hidden = true;
    el('demo').hidden = shop.mode !== 'demo';
    el('payinfo').textContent = shop.mode === 'stripe' ? t.payInfoStripe : t.payInfoOrder;
    const min = londonDate(Number(shop.min_notice_days ?? 1));
    dateInput.min = min;
    dateInput.max = londonDate(60);
    if (!dateInput.value || dateInput.value < min) dateInput.value = min;
    fillTimes();
    renderSummary();
    dlg.showModal();
  }

  async function send() {
    const body = new URLSearchParams(new FormData(form)).toString();
    const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    if (!res.ok) throw new Error(`form ${res.status}`);
  }

  async function pay(ref) {
    const res = await fetch('/.netlify/functions/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference: ref, lang: LANG, items: cart.toOrderItems(),
        customer: { name: form.elements.name.value, email: form.elements.email.value, phone: form.elements.phone.value },
        collection: { cafe: cafeSelect.value, date: dateInput.value, time: timeSelect.value },
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) throw new Error(data.error || `checkout ${res.status}`);
    return data.url;
  }

  function done(ref, text) {
    el('ref').textContent = ref;
    el('done-text').textContent = text;
    el('body').hidden = true;
    el('foot').hidden = true;
    el('done').hidden = false;
    cart.clear();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.reportValidity() || !cart.count()) return;
    const ref = reference();
    form.elements.reference.value = ref;
    if (shop.mode === 'demo') { done(ref, t.doneDemo); return; }
    const btn = el('submit');
    btn.disabled = true;
    btn.textContent = t.sending;
    el('error').hidden = true;
    try {
      await send();
      if (shop.mode === 'stripe') { window.location.href = await pay(ref); return; }
      done(ref, t.doneOrder);
    } catch {
      el('error').textContent = t.error;
      el('error').hidden = false;
      btn.disabled = false;
      renderSummary();
    }
  });

  dateInput.addEventListener('change', fillTimes);
  cafeSelect.addEventListener('change', fillTimes);
  document.addEventListener('click', (e) => { if (e.target.closest('[data-checkout-open]')) open(); });

  Promise.all([loadShop(), fetchJSON(DATA.locations).catch(() => [])]).then(([s, list]) => {
    shop = s;
    locations = list;
    if (list.length) cafeSelect.innerHTML = list.map((l) => `<option value="${esc(l.id)}">${esc(l.name)} – ${esc(l.address)}</option>`).join('');
  });
}
