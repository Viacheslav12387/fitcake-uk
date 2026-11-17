// Lightbox galerii: pełne zdjęcie w natywnym <dialog>.
// Bez JS link otwiera samo zdjęcie (progressive enhancement).
// Obsługa: klik, strzałki ← →, Esc (natywnie), przesunięcie palcem, fokus wraca na miniaturę.
export function initLightbox(gallery, dialog) {
  if (!gallery || !dialog || typeof dialog.showModal !== 'function') return;
  const links = [...gallery.querySelectorAll('[data-lightbox]')];
  const img = dialog.querySelector('[data-lb-img]');
  const caption = dialog.querySelector('[data-lb-caption]');
  const count = dialog.querySelector('[data-lb-count]');
  let index = 0;
  let opener = null;

  const preload = (i) => { const a = links[(i + links.length) % links.length]; if (a) new Image().src = a.href; };

  function show(i) {
    index = (i + links.length) % links.length;
    const link = links[index];
    const thumb = link.querySelector('img');
    img.src = link.href;
    img.alt = thumb?.alt || '';
    caption.textContent = thumb?.alt || '';
    count.textContent = `${index + 1} / ${links.length}`;
    preload(index + 1);
    preload(index - 1);
  }

  gallery.addEventListener('click', (e) => {
    const link = e.target.closest('[data-lightbox]');
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey) return; // nowa karta – zostawiamy przeglądarce
    e.preventDefault();
    opener = link;
    show(links.indexOf(link));
    dialog.showModal();
  });

  dialog.querySelector('[data-lb-prev]')?.addEventListener('click', () => show(index - 1));
  dialog.querySelector('[data-lb-next]')?.addEventListener('click', () => show(index + 1));
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
  });

  // Przesunięcie palcem w lewo / w prawo na telefonie.
  let startX = null;
  dialog.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') startX = e.clientX; });
  dialog.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  });

  dialog.addEventListener('close', () => {
    img.src = 'data:,';
    opener?.focus();
  });
}
