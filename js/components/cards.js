/**
 * ProLider - Tarjetas y piezas visuales reutilizables
 *  - propertyCard: tarjeta de inmueble del catálogo
 *  - advisorCard : tarjeta de asesor
 *  - badges, precio, características clave
 */
window.PL = window.PL || {};

PL.cards = (() => {
  const U = PL.utils;
  const C = PL.catalogs;
  const I = PL.icon;

  /** Etiqueta de precio según la operación */
  function price(p, { size = 'text-2xl', light = false } = {}) {
    if (!(+p.price > 0)) return `<span class="font-display ${size} ${light ? 'text-beige-50' : 'text-militar-900'}">Precio a consultar</span>`;
    const main = U.fmtMoney(p.price, p.currency);
    const suffix = p.operation === 'alquiler' ? '<span class="text-sm font-sans text-militar-500 ml-1">/mes</span>' : '';
    const alt = p.operation === 'venta_alquiler' && p.rentPrice ? `<span class="block text-xs font-sans text-militar-500 mt-0.5">o alquiler ${U.fmtMoney(p.rentPrice, p.currency)}/mes</span>` : '';
    return `<span class="font-display ${size} font-semibold ${light ? 'text-beige-50' : 'text-militar-900'} leading-none">${main}${suffix}</span>${alt}`;
  }

  const opBadge = (p) => {
    const cls = p.operation === 'alquiler' ? 'badge-rent' : p.operation === 'venta_alquiler' ? 'badge-both' : 'badge-sale';
    return `<span class="badge ${cls}">${C.operation(p.operation).label}</span>`;
  };
  const statusBadge = (key) => { const s = C.status(key); return `<span class="badge ${s.cls}">${s.label}</span>`; };
  const typeBadge = (p) => `<span class="badge badge-type">${I(C.type(p.type).icon, 'w-3.5 h-3.5')} ${C.type(p.type).label}</span>`;

  /** Fila de características clave (habitaciones, baños, puestos, m²) */
  function features(p, cls = '') {
    const t = C.type(p.type);
    const area = p.builtArea || p.landArea;
    const items = [];
    if (t.residential || p.bedrooms) items.push(['bed', p.bedrooms, p.bedrooms === 1 ? 'Hab.' : 'Habs.']);
    if (!t.land) items.push(['bath', p.bathrooms, p.bathrooms === 1 ? 'Baño' : 'Baños']);
    items.push(['car', p.parking, 'Puestos']);
    if (area) items.push(['ruler', U.fmtNum(area, true), 'm²']);
    return `<ul class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-militar-700 ${cls}">
      ${items.map(([ic, v, l]) => `<li class="flex items-center gap-1.5" title="${l}">${I(ic, 'w-4 h-4 text-oro-600')}<strong class="font-semibold">${v ?? 0}</strong><span class="text-militar-500">${l}</span></li>`).join('')}
    </ul>`;
  }

  const favBtn = (id, cls = '') => {
    const on = PL.store.favorites.has(id);
    return `<button class="fav-btn ${on ? 'on' : ''} ${cls}" data-fav="${id}" aria-label="${on ? 'Quitar de favoritos' : 'Guardar en favoritos'}" aria-pressed="${on}">${I('heart', 'w-5 h-5')}</button>`;
  };

  /** Tarjeta principal del catálogo */
  function propertyCard(p) {
    const advisor = PL.store.advisors.get(p.advisorId);
    const photos = p.media?.photos || [];
    const cover = PL.media.url(photos[0]);
    const loc = [p.location.sector, p.location.municipality].filter(Boolean).join(', ');
    const href = `#/propiedad/${p.id}`;
    const wa = advisor?.phone ? U.waLink(advisor.phone, `Hola ${advisor.name.split(' ')[0]}, me interesa el inmueble ${p.code}: ${p.title}`) : '';
    return `
      <article class="prop-card group">
        <div class="relative aspect-[4/3] overflow-hidden rounded-t-2xl bg-militar-800">
          <a href="${href}" aria-label="Ver ${U.esc(p.title)}">
            <img src="${U.esc(cover)}" alt="${U.esc(p.title)}" loading="lazy" decoding="async" class="w-full h-full object-cover transition duration-700 group-hover:scale-[1.06]" ${PL.media.onErr}>
            <span class="absolute inset-0 bg-gradient-to-t from-militar-950/70 via-transparent to-transparent"></span>
          </a>
          <div class="absolute top-3 left-3 flex flex-wrap gap-1.5 pr-14">
            ${opBadge(p)} ${p.status !== 'disponible' ? statusBadge(p.status) : ''} ${p.featured ? `<span class="badge badge-featured">${I('star', 'w-3 h-3')} Destacado</span>` : ''}
          </div>
          ${favBtn(p.id, 'absolute top-3 right-3')}
          <div class="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 pointer-events-none">
            ${typeBadge(p)}
            <span class="badge badge-glass">${I('image', 'w-3.5 h-3.5')} ${photos.length}</span>
          </div>
        </div>
        <div class="p-5 flex flex-col flex-1">
          <div class="flex items-start justify-between gap-3 mb-2">
            <div>${price(p)}</div>
            <span class="text-[11px] font-semibold tracking-wider text-oro-700 bg-oro-50 border border-oro-200 rounded-md px-2 py-1 shrink-0">${U.esc(p.code)}</span>
          </div>
          <h3 class="font-semibold text-militar-900 leading-snug line-clamp-2 min-h-[2.75rem]"><a href="${href}" class="hover:text-oro-700 transition">${U.esc(p.title)}</a></h3>
          <p class="mt-1.5 flex items-center gap-1.5 text-sm text-militar-500 truncate">${I('pin', 'w-4 h-4 shrink-0 text-oro-600')} ${U.esc(loc || p.location.state)}</p>
          <div class="my-4 h-px bg-gradient-to-r from-transparent via-beige-300 to-transparent"></div>
          ${features(p)}
          <div class="mt-auto pt-5 flex gap-2">
            <a href="${href}" class="btn btn-primary flex-1 justify-center">Ver detalles ${I('arrowRight', 'w-4 h-4')}</a>
            ${wa ? `<a href="${wa}" target="_blank" rel="noopener" class="btn btn-outline-wa px-3" aria-label="Escribir por WhatsApp">${I('whatsapp', 'w-5 h-5')}</a>` : ''}
          </div>
        </div>
      </article>`;
  }

  /** Esqueleto de carga */
  const skeleton = () => `
    <div class="prop-card animate-pulse"><div class="aspect-[4/3] bg-beige-200 rounded-t-2xl"></div>
    <div class="p-5 space-y-3"><div class="h-6 w-1/2 bg-beige-200 rounded"></div><div class="h-4 bg-beige-200 rounded"></div><div class="h-4 w-2/3 bg-beige-200 rounded"></div></div></div>`;

  /** Tarjeta de asesor */
  function advisorCard(a) {
    const s = PL.store.advisors.stats(a.id);
    return `
      <article class="advisor-card group">
        <a href="#/asesores/${a.id}" class="block relative">
          <div class="h-24 bg-gradient-to-br from-militar-800 to-militar-950 rounded-t-2xl relative overflow-hidden">
            <div class="absolute inset-0 bg-pattern opacity-10"></div>
          </div>
          <div class="-mt-12 flex justify-center">
            ${a.photo
              ? `<img src="${U.esc(PL.media.url(a.photo))}" alt="${U.esc(a.name)}" loading="lazy" class="w-24 h-24 rounded-full object-cover ring-4 ring-beige-50 shadow-lg group-hover:ring-oro-300 transition" ${PL.media.onErr}>`
              : `<span class="w-24 h-24 rounded-full ring-4 ring-beige-50 bg-oro-500 text-militar-950 text-2xl font-bold flex items-center justify-center shadow-lg">${U.initials(a.name)}</span>`}
          </div>
        </a>
        <div class="px-5 pb-5 pt-3 text-center flex flex-col flex-1">
          <h3 class="font-display text-2xl text-militar-900 leading-tight"><a href="#/asesores/${a.id}" class="hover:text-oro-700">${U.esc(a.name)}</a></h3>
          <p class="text-xs uppercase tracking-[0.2em] text-oro-700 mt-1">${U.esc(a.title || 'Asesor Inmobiliario')}</p>
          <p class="mt-3 text-sm text-militar-600"><strong class="text-militar-900">${s.active}</strong> inmueble${s.active === 1 ? '' : 's'} asignado${s.active === 1 ? '' : 's'}</p>
          <div class="mt-4 flex justify-center gap-2">
            ${a.phone ? `<a href="${U.waLink(a.phone, `Hola ${a.name.split(' ')[0]}, te contacto desde el portal ProLíder.`)}" target="_blank" rel="noopener" class="icon-btn icon-btn-soft" title="WhatsApp" aria-label="WhatsApp">${I('whatsapp')}</a>
            <a href="tel:${U.esc(a.phone)}" class="icon-btn icon-btn-soft" title="Llamar" aria-label="Llamar">${I('phone')}</a>` : ''}
            <a href="mailto:${U.esc(a.email)}" class="icon-btn icon-btn-soft" title="Correo" aria-label="Correo">${I('mail')}</a>
            ${a.instagram ? `<a href="https://instagram.com/${U.esc(a.instagram)}" target="_blank" rel="noopener" class="icon-btn icon-btn-soft" title="Instagram" aria-label="Instagram">${I('instagram')}</a>` : ''}
          </div>
          <a href="#/asesores/${a.id}" class="mt-5 btn btn-outline justify-center">Ver perfil e inmuebles</a>
        </div>
      </article>`;
  }

  return { propertyCard, advisorCard, skeleton, price, opBadge, statusBadge, typeBadge, features, favBtn };
})();

