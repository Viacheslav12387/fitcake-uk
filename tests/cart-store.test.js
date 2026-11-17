import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCart, CART_KEY } from '../js/shop/cart-store.js';

const memory = () => { const m = new Map(); return { get: (k) => m.get(k) ?? null, set: (k, v) => m.set(k, v) }; };
const cake = { productId: 'P001', variantId: 'slice', name: 'Banana Cake', variantName: 'Slice', unitPence: 450 };

test('adds items and sums in pence without rounding errors', () => {
  const cart = createCart();
  cart.add(cake, 2);
  cart.add({ ...cake, variantId: 'whole-8', unitPence: 3200 }, 1);
  assert.equal(cart.count(), 3);
  assert.equal(cart.totalPence(), 4100);
});

test('same product and size goes to one line', () => {
  const cart = createCart();
  cart.add(cake); cart.add(cake);
  assert.equal(cart.lines().length, 1);
  assert.equal(cart.lines()[0].qty, 2);
});

test('respects the maximum quantity', () => {
  const cart = createCart({ maxQty: 3 });
  assert.equal(cart.add(cake, 5), 3);
  assert.equal(cart.add(cake, 1), 0);
  assert.equal(cart.count(), 3);
});

test('quantity 0 removes the line', () => {
  const cart = createCart();
  cart.add(cake, 2);
  cart.setQty('P001:slice', 0);
  assert.equal(cart.count(), 0);
});

test('saves to storage and restores, ignoring broken data', () => {
  const storage = memory();
  createCart({ storage }).add(cake, 2);
  assert.equal(createCart({ storage }).count(), 2);
  storage.set(CART_KEY, '{not json');
  assert.equal(createCart({ storage }).count(), 0);
  storage.set(CART_KEY, JSON.stringify({ v: 1, lines: [{ productId: 'X', variantId: 'y', unitPence: -5, qty: 1 }] }));
  assert.equal(createCart({ storage }).count(), 0);
});

test('notifies listeners on change', () => {
  const cart = createCart();
  const events = [];
  cart.onChange((d) => events.push(d.type));
  cart.add(cake); cart.setQty('P001:slice', 3); cart.clear();
  assert.deepEqual(events, ['add', 'qty', 'clear']);
});

test('order items contain only ids and quantities (no prices)', () => {
  const cart = createCart();
  cart.add(cake, 2);
  assert.deepEqual(cart.toOrderItems(), [{ productId: 'P001', variantId: 'slice', qty: 2 }]);
});
