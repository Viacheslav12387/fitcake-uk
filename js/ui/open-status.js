// Status „otwarte / zamknięte” na żywo, liczony w czasie londyńskim. Godziny: data-hours='{"0":[10,18],…}'.
import { $$, londonNow } from '../core/util.js';
import { t } from '../core/i18n.js';

const DEFAULT_HOURS = { 0: [10, 18], 1: [9, 18], 2: [9, 18], 3: [9, 18], 4: [9, 18], 5: [9, 18], 6: [9, 18] };
const DEFAULT_OPENING = '2026-10-31';

export function statusFor(hours, openingDay, now = londonNow()) {
  const [o, c] = hours[now.dow];
  if (now.date < openingDay) return [t.soon, 'is-soon'];
  if (now.minutes >= o * 60 && now.minutes < c * 60) return [t.open(c), 'is-open'];
  return [now.minutes < o * 60 ? t.today(o) : t.tomorrow(hours[(now.dow + 1) % 7][0]), 'is-closed'];
}

export function updateOpenStatus() {
  $$('[data-open-status]').forEach((el) => {
    let hours = DEFAULT_HOURS;
    try { if (el.dataset.hours) hours = JSON.parse(el.dataset.hours); } catch { /* domyślne godziny */ }
    const [text, state] = statusFor(hours, el.dataset.openingDay || DEFAULT_OPENING);
    el.textContent = text;
    el.classList.remove('is-open', 'is-closed', 'is-soon');
    el.classList.add(state);
    el.hidden = false;
  });
}

export function initOpenStatus() {
  updateOpenStatus();
  window.setInterval(updateOpenStatus, 60000);
}
