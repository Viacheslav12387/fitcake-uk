// Krótki komunikat na dole ekranu, ogłaszany też przez czytnik ekranu (role="status").
let timer;
export function toast(message) {
  const el = document.querySelector('[data-toast]');
  if (!el) return;
  el.textContent = message;
  el.classList.add('is-visible');
  window.clearTimeout(timer);
  timer = window.setTimeout(() => el.classList.remove('is-visible'), 2600);
}
