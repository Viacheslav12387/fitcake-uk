import { test } from 'node:test';
import assert from 'node:assert/strict';
import { priceOrder, sessionParams } from '../netlify/functions/order-pricing.mjs';

const products = [{ id: 'P001', name_en: 'Banana Cake', prices: { slice: 450, 'whole-8': 3200 } }, { id: 'P002', name_en: 'Carrot Cake', prices: {} }];
const shop = { max_qty: 10, variants: [{ id: 'slice', en: 'Slice' }, { id: 'whole-8', en: 'Whole cake · 8 portions' }] };

test('prices come from the server data, not from the browser', () => {
  const lines = priceOrder([{ productId: 'P001', variantId: 'whole-8', qty: 2, unitPence: 1 }], products, shop);
  assert.deepEqual(lines, [{ name: 'Banana Cake – Whole cake · 8 portions', unitPence: 3200, qty: 2 }]);
});

test('rejects unknown, unpriced or invalid items', () => {
  assert.throws(() => priceOrder([{ productId: 'NOPE', variantId: 'slice', qty: 1 }], products, shop));
  assert.throws(() => priceOrder([{ productId: 'P002', variantId: 'slice', qty: 1 }], products, shop));
  assert.throws(() => priceOrder([{ productId: 'P001', variantId: 'slice', qty: 11 }], products, shop));
  assert.throws(() => priceOrder([], products, shop));
});

test('builds Stripe Checkout parameters in pence and GBP', () => {
  const lines = priceOrder([{ productId: 'P001', variantId: 'slice', qty: 3 }], products, shop);
  const p = sessionParams({ lines, reference: 'FC-ABC', customer: { email: 'a@b.co' }, collection: { cafe: 'mitcham', date: '2026-11-10', time: '10:00' }, siteUrl: 'https://fitcake.uk', lang: 'en' });
  assert.equal(p.get('line_items[0][price_data][unit_amount]'), '450');
  assert.equal(p.get('line_items[0][price_data][currency]'), 'gbp');
  assert.equal(p.get('line_items[0][quantity]'), '3');
  assert.equal(p.get('client_reference_id'), 'FC-ABC');
  assert.match(p.get('success_url'), /^https:\/\/fitcake\.uk\/en\/order-success\.html/);
});
