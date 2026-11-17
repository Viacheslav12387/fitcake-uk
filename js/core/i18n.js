// Teksty generowane przez JavaScript (EN/PL). Teksty w HTML tłumaczy osobno wersja /pl/.
export const LANG = document.documentElement.lang === 'pl' ? 'pl' : 'en';

const STRINGS = {
  en: {
    soon: 'Grand opening 31 October',
    open: (c) => `Open now · until ${c}:00`,
    today: (o) => `Closed · opens today at ${o}:00`,
    tomorrow: (o) => `Closed · opens tomorrow at ${o}:00`,
    all: 'All categories',
    none: 'No products match these filters.',
    count: (n) => `${n} ${n === 1 ? 'product' : 'products'}`,
    contains: 'Contains', noAllergens: 'None of the 14 major allergens', kcal: 'kcal / portion',
    protein: 'protein', carbs: 'carbs', fat: 'fat', ingredients: 'Ingredients',
    from: 'from', sample: 'sample', add: 'Add', details: 'Details', askInStore: 'Ask in store',
    addToOrder: 'Add to order', maxQty: (n) => `Maximum ${n} per order`,
    decrease: 'Decrease quantity', increase: 'Increase quantity', remove: 'Remove',
    added: (name) => `Added to your order: ${name}`,
    cartLabel: (n) => `Your order, ${n} ${n === 1 ? 'item' : 'items'}`,
    cartAction: (n, total) => `Order · ${total}`,
    sendOrder: (total) => `Send order · ${total}`,
    payOrder: (total) => `Order and pay · ${total}`,
    sending: 'Sending…',
    error: 'We could not send your order. Please try again or email us.',
    closed: 'Closed', total: 'Total',
    doneDemo: 'Demo: in the live version the café receives this order by email and the customer gets a confirmation.',
    doneOrder: 'Thank you! Your order has been sent. The café will confirm it by email. You pay when you collect.',
    payInfoOrder: 'You pay when you collect your order at the café.',
    payInfoStripe: 'Next step: secure payment by Stripe (card, Apple Pay, Google Pay).',
    demo: 'Demo version – sample prices, no real orders or payments.',
    cafesFound: (n) => `Cafés found: ${n}`,
    noCafe: (c) => `No Fit Cake in ${c} yet.`, openOne: 'Open one with us →',
    week: 'Mon–Sat', sun: 'Sunday', hours: 'Opening hours', directions: 'Get directions', orderCake: 'Order a cake',
    cafeDetails: 'Café details', map: 'Map', soonTitle: 'More cafés coming soon',
    soonText: 'Fit Cake is growing in the UK. Want to open a café in your city?', soonLink: 'Learn about the franchise',
    loadError: 'Could not load the list of cafés.', call: 'Call',
  },
  pl: {
    soon: 'Wielkie otwarcie 31 października',
    open: (c) => `Otwarte teraz · do ${c}:00`,
    today: (o) => `Zamknięte · otwieramy dziś o ${o}:00`,
    tomorrow: (o) => `Zamknięte · otwieramy jutro o ${o}:00`,
    all: 'Wszystkie kategorie',
    none: 'Brak produktów dla wybranych filtrów.',
    count: (n) => {
      const d = n % 10; const dd = n % 100;
      const w = n === 1 ? 'produkt' : (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) ? 'produkty' : 'produktów';
      return `${n} ${w}`;
    },
    contains: 'Zawiera', noAllergens: 'Bez 14 głównych alergenów', kcal: 'kcal / porcja',
    protein: 'białko', carbs: 'węglowodany', fat: 'tłuszcz', ingredients: 'Skład',
    from: 'od', sample: 'przykład', add: 'Dodaj', details: 'Szczegóły', askInStore: 'Zapytaj w lokalu',
    addToOrder: 'Dodaj do zamówienia', maxQty: (n) => `Maksymalnie ${n} sztuk w zamówieniu`,
    decrease: 'Zmniejsz ilość', increase: 'Zwiększ ilość', remove: 'Usuń',
    added: (name) => `Dodano do zamówienia: ${name}`,
    cartLabel: (n) => `Twoje zamówienie, sztuk: ${n}`,
    cartAction: (n, total) => `Koszyk · ${total}`,
    sendOrder: (total) => `Wyślij zamówienie · ${total}`,
    payOrder: (total) => `Zamów i zapłać · ${total}`,
    sending: 'Wysyłanie…',
    error: 'Nie udało się wysłać zamówienia. Spróbuj ponownie albo napisz do nas.',
    closed: 'Zamknięte', total: 'Razem',
    doneDemo: 'Demo: w wersji na żywo lokal dostaje to zamówienie e-mailem, a klient potwierdzenie.',
    doneOrder: 'Dziękujemy! Zamówienie zostało wysłane. Lokal potwierdzi je e-mailem. Płacisz przy odbiorze.',
    payInfoOrder: 'Płacisz przy odbiorze zamówienia w lokalu.',
    payInfoStripe: 'Następny krok: bezpieczna płatność Stripe (karta, Apple Pay, Google Pay).',
    demo: 'Wersja demo – ceny przykładowe, bez prawdziwych zamówień i płatności.',
    cafesFound: (n) => `Znaleziono lokale: ${n}`,
    noCafe: (c) => `Nie ma jeszcze Fit Cake w: ${c}.`, openOne: 'Otwórz własny lokal z nami →',
    week: 'Pon–Sob', sun: 'Niedziela', hours: 'Godziny otwarcia', directions: 'Wyznacz trasę', orderCake: 'Zamów tort',
    cafeDetails: 'Szczegóły lokalu', map: 'Mapa', soonTitle: 'Kolejne lokale wkrótce',
    soonText: 'Fit Cake rośnie w Wielkiej Brytanii. Chcesz otworzyć lokal w swoim mieście?', soonLink: 'Poznaj franczyzę',
    loadError: 'Nie udało się wczytać listy lokali.', call: 'Zadzwoń',
  },
};

export const t = STRINGS[LANG];

export const DIETS = {
  vegan: { en: 'Vegan', pl: 'Wegańskie' },
  keto: { en: 'Keto', pl: 'Keto' },
  'gluten-free': { en: 'Gluten-free', pl: 'Bez glutenu' },
  'lactose-free': { en: 'Lactose-free', pl: 'Bez laktozy' },
  'no-added-sugar': { en: 'No added sugar', pl: 'Bez dodatku cukru' },
};
export const CATEGORIES = {
  Cakes: { en: 'Cakes', pl: 'Ciasta' },
  Cheesecakes: { en: 'Cheesecakes', pl: 'Serniki' },
  'Tarts & Pies': { en: 'Tarts & Pies', pl: 'Tarty i placki' },
  Brownies: { en: 'Brownies', pl: 'Brownie' },
};
export const ALLERGENS_PL = {
  Gluten: 'Gluten', Crustaceans: 'Skorupiaki', Eggs: 'Jaja', Fish: 'Ryby', Peanuts: 'Orzeszki ziemne', Soya: 'Soja',
  Milk: 'Mleko', Nuts: 'Orzechy', Celery: 'Seler', Mustard: 'Gorczyca', Sesame: 'Sezam', Sulphites: 'Siarczyny',
  Lupin: 'Łubin', Molluscs: 'Mięczaki',
};
export const label = (map, key) => (map[key] ? map[key][LANG] : key);
export const allergenName = (a) => (LANG === 'pl' && ALLERGENS_PL[a] ? ALLERGENS_PL[a] : a);
