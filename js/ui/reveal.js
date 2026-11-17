// Elementy poniżej ekranu pojawiają się przy przewijaniu (bez migania tego, co już widać).
import { prefersReducedMotion } from '../core/util.js';

const observer = !prefersReducedMotion() && 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-visible');
    observer.unobserve(e.target);
  }), { rootMargin: '0px 0px -8% 0px' })
  : null;

export function reveal(nodes) {
  if (!observer) return;
  const perParent = new Map();
  nodes.forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    const i = perParent.get(el.parentElement) || 0;
    perParent.set(el.parentElement, i + 1);
    el.style.transitionDelay = `${(i % 4) * 90}ms`;
    el.classList.add('reveal');
    observer.observe(el);
  });
}

export const REVEAL_SELECTOR = '.section-head, .text-block, .split-img, .stat, .feature, .order-step, .tags li, .cta, .form, .shop-box, .prose > *';
