// Menu na telefonie: otwieranie, zamykanie (Esc, link), blokada przewijania tła.
import { $ } from '../core/util.js';

export function initMenu() {
  const menu = $('[data-menu]');
  const openBtn = $('[data-menu-open]');
  const closeBtn = $('[data-menu-close]');
  if (!menu || !openBtn || !closeBtn) return;
  const toggle = (open) => {
    menu.classList.toggle('is-open', open);
    openBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) closeBtn.focus(); else if (document.activeElement && menu.contains(document.activeElement)) openBtn.focus();
  };
  openBtn.addEventListener('click', () => toggle(true));
  closeBtn.addEventListener('click', () => toggle(false));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) toggle(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('is-open')) toggle(false); });
}
