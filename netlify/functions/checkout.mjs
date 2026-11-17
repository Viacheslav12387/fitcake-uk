// Netlify Function: tworzy płatność Stripe Checkout za cały koszyk.
// Działa tylko przy wdrożeniu z GitHuba / Netlify CLI (nie przy przeciąganiu folderu).
// Zmienne środowiskowe (Netlify → Site configuration → Environment variables):
//   STRIPE_SECRET_KEY – klucz z panelu Stripe (sk_test_... do testów, sk_live_... na żywo)
//   SITE_URL          – np. https://fitcake.uk
import { readFile } from 'node:fs/promises';
import { priceOrder, sessionParams } from './order-pricing.mjs';

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const load = async (file) => JSON.parse(await readFile(new URL(`../../data/${file}`, import.meta.url), 'utf8'));

export default async (request) => {
  if (request.method !== 'POST') return json(405, { error: 'Method not allowed' });
  const key = process.env.STRIPE_SECRET_KEY;
  const siteUrl = process.env.SITE_URL || new URL(request.url).origin;
  if (!key) return json(503, { error: 'Payments are not configured' });

  let body;
  try { body = await request.json(); } catch { return json(400, { error: 'Invalid JSON' }); }
  const reference = String(body.reference || '').slice(0, 40);
  if (!/^FC-[A-Z0-9]+$/.test(reference)) return json(400, { error: 'Invalid reference' });

  try {
    const [products, shop] = await Promise.all([load('products.json'), load('shop.json')]);
    if (shop.mode !== 'stripe') return json(503, { error: 'Online payments are switched off' });
    const lines = priceOrder(body.items, products, shop);
    const params = sessionParams({ lines, reference, customer: body.customer, collection: body.collection, siteUrl, lang: body.lang });
    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    const session = await res.json();
    if (!res.ok) return json(502, { error: session.error?.message || 'Stripe error' });
    return json(200, { url: session.url });
  } catch (err) {
    return json(400, { error: err.message });
  }
};
