// Jeden wspólny koszyk dla całej strony (zapisany w przeglądarce).
import { createCart } from './cart-store.js';
import { safeStorage } from '../core/util.js';

export const cart = createCart({ storage: safeStorage, maxQty: 10 });
