// Drobne efekty: liczniki, filmy odtwarzane tylko gdy widoczne, rok w stopce, statystyki Umami.
import { $$, prefersReducedMotion } from '../core/util.js';
import { UMAMI_WEBSITE_ID } from '../core/config.js';

export function initCounters() {
  const nums = $$('[data-countup]');
  if (!nums.length || prefersReducedMotion() || !('IntersectionObserver' in window)) return;
  const run = (el) => {
    const target = Number(el.dataset.countup);
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / 1400, 1);
      el.textContent = Math.round(target * (1 - (1 - p) ** 3));
      if (p < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
  }), { threshold: 0.6 });
  nums.forEach((el) => io.observe(el));
}

export function initVideos() {
  $$('video[data-autoplay]').forEach((v) => {
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }).observe(v);
  });
}

export function initYear() {
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
}

export function initAnalytics() {
  if (!UMAMI_WEBSITE_ID || window.location.hostname === 'localhost') return;
  const s = document.createElement('script');
  s.src = 'https://cloud.umami.is/script.js';
  s.defer = true;
  s.dataset.websiteId = UMAMI_WEBSITE_ID;
  document.head.appendChild(s);
}
