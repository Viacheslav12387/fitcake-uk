// Liczenie zamówienia po stronie serwera (bez zależności) – używane przez checkout.mjs i testy.
// Klient przysyła tylko identyfikatory i ilości; ceny bierzemy z data/products.json,
// więc nikt nie zmieni kwoty w przeglądarce.

export function priceOrder(items, products, shop) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 30) throw new Error('Invalid items');
  const maxQty = shop.max_qty || 10;
  const variantNames = Object.fromEntries((shop.variants || []).map((v) => [v.id, v.en]));
  return items.map(({ productId, variantId, qty }) => {
    const product = products.find((p) => String(p.id) === String(productId));
    const pence = product?.prices?.[variantId];
    if (!product || !Number.isInteger(pence) || pence <= 0) throw new Error(`Unknown or unpriced item: ${productId}/${variantId}`);
    if (!Number.isInteger(qty) || qty < 1 || qty > maxQty) throw new Error(`Invalid quantity for ${productId}`);
    return { name: `${product.name_en} – ${variantNames[variantId] || variantId}`, unitPence: pence, qty };
  });
}

/** Parametry Stripe Checkout Session (format application/x-www-form-urlencoded). */
export function sessionParams({ lines, reference, customer, collection, siteUrl, lang }) {
  const p = new URLSearchParams();
  p.set('mode', 'payment');
  p.set('success_url', `${siteUrl}/${lang === 'pl' ? 'pl' : 'en'}/order-success.html?ref=${encodeURIComponent(reference)}`);
  p.set('cancel_url', `${siteUrl}/${lang === 'pl' ? 'pl' : 'en'}/products.html#order-online`);
  p.set('client_reference_id', reference);
  if (customer?.email) p.set('customer_email', customer.email);
  p.set('locale', lang === 'pl' ? 'pl' : 'en-GB');
  p.set('metadata[reference]', reference);
  p.set('metadata[collection]', `${collection?.cafe || ''} ${collection?.date || ''} ${collection?.time || ''}`.trim());
  p.set('metadata[phone]', customer?.phone || '');
  lines.forEach((l, i) => {
    p.set(`line_items[${i}][quantity]`, String(l.qty));
    p.set(`line_items[${i}][price_data][currency]`, 'gbp');
    p.set(`line_items[${i}][price_data][unit_amount]`, String(l.unitPence));
    p.set(`line_items[${i}][price_data][product_data][name]`, l.name);
  });
  return p;
}
