// Lokale z data/locations.json. Nowy lokal = nowy wpis w JSON (strona sama tworzy kartę).
import { $, esc, norm, fetchJSON } from '../core/util.js';
import { t } from '../core/i18n.js';
import { DATA } from '../core/config.js';
import { reveal } from '../ui/reveal.js';
import { updateOpenStatus } from '../ui/open-status.js';

const hh = (h) => `${h}:00`;

function hoursHTML(h) {
  const weekSame = [1, 2, 3, 4, 5, 6].every((d) => h[d][0] === h[1][0] && h[d][1] === h[1][1]);
  if (!weekSame) return '';
  return `<li><span>${t.week}</span><span>${hh(h[1][0])}–${hh(h[1][1])}</span></li><li><span>${t.sun}</span><span>${hh(h[0][0])}–${hh(h[0][1])}</span></li>`;
}

function cardHTML(l, compact, first) {
  const q = encodeURIComponent(l.maps_query);
  const sizes = l.image_sizes || [480, 960];
  const srcset = sizes.map((w) => `../images/photos/${l.image}-${w}.webp ${w}w`).join(', ');
  const search = norm([l.name, l.area, l.town, l.postcode, l.address, ...(l.town_aliases || [])].join(' '));
  return `<li class="location" id="${esc(l.id)}" data-search-text="${esc(search)}">
    <div class="location-img"><img src="../images/photos/${l.image}-${sizes[0]}.webp" srcset="${srcset}" sizes="(min-width: 960px) 40vw, 92vw" alt="${esc(l.name)}" width="${l.image_width || 960}" height="${l.image_height || 1200}" style="--focus: ${esc(l.image_focus || '50% 50%')}" ${first && !compact ? 'fetchpriority="high"' : 'loading="lazy"'}></div>
    <div class="location-body">
      <p class="location-area">${esc(l.area)}</p>
      <h3>${esc(l.name)}</h3>
      <p class="open-status" data-open-status data-hours='${JSON.stringify(l.hours)}' data-opening-day="${esc(l.opening_day || '')}" hidden></p>
      <address>${esc(l.address)}<br>${esc(l.town)} ${esc(l.postcode)}</address>
      <ul class="location-hours" aria-label="${t.hours}">${hoursHTML(l.hours)}</ul>
      <ul class="location-links">
        ${l.phone ? `<li><a href="tel:${esc(l.phone.replace(/\s/g, ''))}" data-umami-event="call-click">${t.call}: ${esc(l.phone)}</a></li>` : ''}
        ${l.email ? `<li><a href="mailto:${esc(l.email)}" data-umami-event="email-click">${esc(l.email)}</a></li>` : ''}
        ${l.instagram ? `<li><a href="${esc(l.instagram)}" target="_blank" rel="noopener" data-umami-event="instagram-click">Instagram</a></li>` : ''}
      </ul>
      <div class="location-actions">
        <a class="btn btn-primary" href="https://www.google.com/maps/dir/?api=1&amp;destination=${q}" target="_blank" rel="noopener" data-umami-event="directions-click">${t.directions}</a>
        ${compact ? `<a class="btn btn-ghost" href="./locations.html#${esc(l.id)}">${t.cafeDetails}</a>` : `<a class="btn btn-ghost" href="./products.html#order-online">${t.orderCake}</a>`}
      </div>
    </div>
    ${compact ? '' : `<iframe class="location-map" title="${t.map} – ${esc(l.name)}" loading="lazy" src="https://maps.google.com/maps?q=${q}&amp;t=m&amp;z=15&amp;output=embed"></iframe>`}
  </li>`;
}

const soonHTML = () => `<li class="location location-soon"><div class="location-body"><h3>${t.soonTitle}</h3><p>${t.soonText}</p><div class="location-actions"><a class="btn btn-accent" href="./franchise.html">${t.soonLink}</a></div></div></li>`;

function initCitySearch() {
  const form = $('[data-city-search]');
  const out = $('[data-city-result]');
  if (!form || !out) return;
  const input = form.querySelector('input');
  const run = () => {
    const q = norm(input.value.trim());
    let found = 0;
    document.querySelectorAll('.location[data-search-text]').forEach((card) => {
      const hit = !q || card.dataset.searchText.includes(q);
      card.hidden = !hit;
      if (hit) found += 1;
    });
    out.hidden = !q;
    out.innerHTML = found ? t.cafesFound(found) : `${esc(t.noCafe(input.value.trim()))} <a href="./franchise.html">${t.openOne}</a>`;
  };
  form.addEventListener('submit', (e) => { e.preventDefault(); run(); });
  input.addEventListener('input', run);
}

export async function initLocations(lists) {
  try {
    const data = await fetchJSON(DATA.locations);
    lists.forEach((ul) => {
      const compact = ul.hasAttribute('data-compact');
      ul.innerHTML = data.map((l, i) => cardHTML(l, compact, i === 0)).join('') + soonHTML();
      reveal(ul.querySelectorAll('.location'));
    });
    updateOpenStatus();
    if (window.location.hash) document.querySelector(window.location.hash)?.scrollIntoView();
    initCitySearch();
  } catch {
    lists.forEach((ul) => { ul.innerHTML = `<li class="location-error">${t.loadError}</li>`; });
  }
}
