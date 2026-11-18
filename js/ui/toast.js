// Krótki komunikat na dole ekranu, ogłaszany też przez czytnik ekranu (role="status").
// Opcjonalny przycisk akcji (np. „Zobacz zamówienie”) – komunikat zostaje wtedy dłużej.
let timer;
export function toast(message, action) {
  const el = document.querySelector('[data-toast]');
  if (!el) return;
  el.replaceChildren(Object.assign(document.createElement('span'), { textContent: message }));
  if (action) {
    const btn = Object.assign(document.createElement('button'), { type: 'button', className: 'toast-action', textContent: action.label });
    btn.addEventListener('click', () => { el.classList.remove('is-visible'); action.onClick(); });
    el.append(btn);
  }
  el.classList.toggle('has-action', Boolean(action));
  el.classList.add('is-visible');
  window.clearTimeout(timer);
  timer = window.setTimeout(() => el.classList.remove('is-visible'), action ? 5000 : 2600);
}
