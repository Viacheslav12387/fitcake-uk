// Formularze Netlify (zamówienie tortu, franczyza) na hostingu statycznym bez obsługi formularzy
// (GitHub Pages, podgląd lokalny): zamiast błędu 405 przechodzimy na stronę podziękowania w trybie demo.
// Na Netlify i na docelowej domenie formularz wysyła się normalnie.
const STATIC_HOSTS = [/\.github\.io$/, /^localhost$/, /^127\.0\.0\.1$/];

export function initForms(forms) {
  if (!STATIC_HOSTS.some((re) => re.test(location.hostname))) return;
  forms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      if (!form.reportValidity()) return;
      e.preventDefault();
      const url = new URL(form.getAttribute('action') || './thank-you.html', location.href);
      url.searchParams.set('demo', '1');
      location.assign(url);
    });
  });
}

// Strona podziękowania: komunikat, że w wersji demo formularz nie został wysłany.
export function initDemoThanks(note) {
  if (new URLSearchParams(location.search).get('demo') === '1') note.hidden = false;
}
