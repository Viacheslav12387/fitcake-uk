// Wspólne zachowanie okien <dialog>: przycisk zamknięcia i klik w tło.
export function initDialogs() {
  document.addEventListener('click', (e) => {
    const close = e.target.closest('[data-dialog-close]');
    if (close) close.closest('dialog')?.close();
    if (e.target instanceof HTMLDialogElement) e.target.close(); // klik w przyciemnione tło
  });
}
