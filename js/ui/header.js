// Nagłówek: kolor po przewinięciu; na telefonie chowa się przy przewijaniu w dół.
import { $ } from '../core/util.js';

export function initHeader() {
  const header = $('.header');
  if (!header) return;
  let lastY = window.scrollY;
  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 10);
    const menuOpen = document.querySelector('[data-menu].is-open') || document.querySelector('dialog[open]');
    header.classList.toggle('is-hidden', window.innerWidth < 960 && !menuOpen && y > 160 && y > lastY);
    lastY = y;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
  initSearchToggle(header);
  initActionBar();
}

// Lupa w nagłówku: rozwija pole wyszukiwania pod nagłówkiem; Esc lub ponowne kliknięcie zamyka.
// Na stronie oferty zamiast tego przenosi do wyszukiwarki nad listą produktów.
function initSearchToggle(header) {
  const toggle = header.querySelector('[data-search-toggle]');
  if (!toggle) return;
  const panel = document.getElementById(toggle.getAttribute('aria-controls'));
  const pageSearch = document.querySelector('[data-search]');
  const setOpen = (open) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) panel.querySelector('input')?.focus();
  };
  toggle.addEventListener('click', () => {
    if (pageSearch) { pageSearch.scrollIntoView({ block: 'center' }); pageSearch.focus({ preventScroll: true }); return; }
    setOpen(panel.hidden);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) { setOpen(false); toggle.focus(); }
  });
}

// Dolny pasek na telefonie: chowa się, dopóki na ekranie są te same przyciski z hero („Order online” / „Find us”).
function initActionBar() {
  const bar = document.querySelector('.action-bar');
  const twin = document.querySelector('.hero-actions');
  if (!bar || !twin || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(([entry]) => {
    bar.classList.toggle('is-hidden', entry.isIntersecting);
  }).observe(twin);
}
