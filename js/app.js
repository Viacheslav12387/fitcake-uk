// =============================================================
// Fit Cake London – punkt startowy JavaScript (moduły ES).
// Każda funkcja uruchamia się tylko tam, gdzie na stronie jest jej element.
// =============================================================
import { $, $$ } from './core/util.js';
import { initMenu } from './ui/menu.js';
import { initHeader } from './ui/header.js';
import { reveal, REVEAL_SELECTOR } from './ui/reveal.js';
import { initOpenStatus } from './ui/open-status.js';
import { initCounters, initVideos, initYear, initAnalytics } from './ui/effects.js';
import { initDialogs } from './ui/dialogs.js';
import { initShopNotice } from './ui/shop-notice.js';
import { initCartUI } from './shop/cart-ui.js';

initYear();
initMenu();
initHeader();
initDialogs();
initOpenStatus();
initCounters();
initVideos();
initAnalytics();
initCartUI();
initShopNotice();
reveal($$(REVEAL_SELECTOR));

// Moduły ładowane tylko na stronach, które ich potrzebują (mniej kodu na start).
const products = $('[data-products]');
if (products) import('./shop/products-view.js').then((m) => m.initProducts(products));

const productDialog = $('[data-product-dialog]');
if (productDialog) import('./shop/product-dialog.js').then((m) => m.initProductDialog(productDialog));

const checkout = $('[data-checkout-dialog]');
if (checkout) import('./shop/checkout.js').then((m) => m.initCheckout(checkout));

const locations = $$('[data-locations]');
if (locations.length) import('./places/locations.js').then((m) => m.initLocations(locations));

const staticForms = $$('form[data-netlify]:not([data-checkout-form])');
if (staticForms.length) import('./ui/forms.js').then((m) => m.initForms(staticForms));
const demoThanks = $('[data-demo-thanks]');
if (demoThanks) import('./ui/forms.js').then((m) => m.initDemoThanks(demoThanks));

const gallery = $('[data-gallery]');
if (gallery) import('./ui/lightbox.js').then((m) => m.initLightbox(gallery, $('[data-lightbox-dialog]')));
