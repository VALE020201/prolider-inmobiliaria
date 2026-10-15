/**
 * ProLider - Vista Detallada del Inmueble (Property Detail)
 * ---------------------------------------------------------------
 * - Galería de imágenes de alta resolución con visor Lightbox
 * - Ficha técnica exhaustiva (metrajes, habitaciones, baños, puestos, condición)
 * - Módulo de Cotización Automática integrado (cuota inicial, plazos, desglose)
 * - Mapa de ubicación aproximada
 * - Video / Tour Virtual (si aplica)
 * - Tarjeta del Asesor encargado con contacto directo por WhatsApp y llamada
 * - Sistema de Ofertas Formales y Negociación integrado
 */
window.PL = window.PL || {};
PL.pages = PL.pages || {};

PL.pages.propertyDetail = (() => {
  const U = PL.utils;
  const C = PL.catalogs;
  const I = PL.icon;

  function render(ctx) {
    const p = PL.store.properties.get(ctx.params.id);
    if (!p) {
      return `
        <div class="container-x py-20 text-center">
          ${PL.ui.empty('alert', 'Inmueble no encontrado', 'El inmueble que buscas no existe o ha sido despublicado.', '<a href="#/propiedades" class="btn btn-primary">Ver todas las propiedades</a>')}
        </div>
      `;
    }

    // Incrementar contador de vistas
    PL.store.properties.addView(p.id);

    const advisor = PL.store.advisors.get(p.advisorId);
    const photos = p.media?.photos || [];
    const client = PL.auth.currentClient();
    const existingOffer = client ? PL.store.offers.activeFor(p.id, client.id) : null;
    const isFav = PL.store.favorites.has(p.id);
    const waText = `Hola ${advisor?.name || 'Asesor'}, estoy interesado(a) en el inmueble ${p.code}: ${p.title}. ¿Podrías brindarme más información?`;
    const waLink = advisor?.phone ? U.waLink(advisor.phone, waText) : '#';

    return `
      <div class="bg-beige-50 min-h-screen pb-20">
        <!-- BARRA SUPERIOR DE ACCIONES Y MIGAS -->
        <div class="bg-white border-b border-beige-200 sticky top-16 md:top-20 z-20 backdrop-blur-md bg-white/95">
          <div class="container-x py-3 flex items-center justify-between gap-4">
            <a href="#/propiedades" class="text-xs sm:text-sm font-medium text-militar-700 hover:text-oro-700 flex items-center gap-1.5 transition">
              ${I('arrowLeft', 'w-4 h-4')} Volver al catálogo
            </a>
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold uppercase tracking-wider text-oro-700 bg-oro-50 border border-oro-200 px-2.5 py-1 rounded-lg">
                ${U.esc(p.code)}
              </span>
              <button type="button" class="icon-btn" id="btn-share-prop" title="Compartir propiedad">
                ${I('share', 'w-4 h-4')}
              </button>
              <button type="button" class="fav-btn ${isFav ? 'on' : ''}" data-fav="${p.id}" title="Guardar en favoritos" aria-pressed="${isFav}">
                ${I('heart', 'w-4 h-4')}
              </button>
            </div>
          </div>
        </div>

        <div class="container-x mt-6">
          <!-- GALERÍA MULTIMEDIA -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-8">
            <!-- FOTO PRINCIPAL DESTACADA -->
            <div class="lg:col-span-8 relative aspect-[16/10] bg-militar-900 rounded-3xl overflow-hidden shadow-lg group cursor-pointer" id="main-gallery-view">
              <img src="${U.esc(PL.media.url(photos[0]))}" id="active-photo-img" alt="${U.esc(p.title)}" class="w-full h-full object-cover transition duration-500 group-hover:scale-105" ${PL.media.onErr}>
              <div class="absolute inset-0 bg-gradient-to-t from-militar-950/60 via-transparent to-transparent pointer-events-none"></div>

              <div class="absolute top-4 left-4 flex gap-2">
                ${PL.cards.opBadge(p)}
                ${p.status !== 'disponible' ? PL.cards.statusBadge(p.status) : ''}
              </div>

              <button type="button" class="absolute bottom-4 right-4 btn btn-sm btn-glass text-xs flex items-center gap-1.5 shadow-lg" id="btn-open-lightbox">
                ${I('expand', 'w-4 h-4')} Ver todas (${photos.length} fotos)
              </button>
            </div>

            <!-- MINIATURAS LATERALES -->
            <div class="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-3 max-h-[500px] overflow-y-auto no-scrollbar pr-0.5">
              ${photos.slice(1, 5).map((src, i) => `
                <div class="relative aspect-[16/10] bg-militar-800 rounded-2xl overflow-hidden cursor-pointer group shadow" data-gallery-thumb="${i + 1}">
                  <img src="${U.esc(PL.media.url(src))}" alt="" class="w-full h-full object-cover transition duration-300 group-hover:opacity-90 group-hover:scale-105" ${PL.media.onErr}>
                  ${i === 3 && photos.length > 5 ? `
                    <div class="absolute inset-0 bg-militar-950/75 flex items-center justify-center text-beige-100 font-display text-xl font-bold">
                      +${photos.length - 5}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- CONTENIDO PRINCIPAL: DETALLES + ASESOR LATERAL -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div class="lg:col-span-8 space-y-8">
              <!-- ENCABEZADO Y PRECIO -->
              <div class="bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-beige-200">
                  <div>
                    <span class="text-xs font-bold uppercase tracking-[0.2em] text-oro-700 block mb-1">
                      ${C.type(p.type).label} en ${C.operation(p.operation).label}
                    </span>
                    <h1 class="font-display text-2xl sm:text-3xl text-militar-950 font-bold leading-tight">
                      ${U.esc(p.title)}
                    </h1>
                    <p class="mt-2 text-sm text-militar-600 flex items-center gap-1.5">
                      ${I('pin', 'w-4 h-4 text-oro-600')} ${U.esc(p.location.sector)}, ${U.esc(p.location.municipality)}, Estado ${U.esc(p.location.state)}
                    </p>
                  </div>

                  <div class="text-left sm:text-right">
                    <span class="block text-xs uppercase tracking-wider text-militar-500 font-semibold mb-1">Precio publicado</span>
                    <div class="text-3xl sm:text-4xl font-display font-bold text-militar-950">
                      ${U.fmtMoney(p.price, p.currency)}
                    </div>
                    ${p.negotiable ? `<span class="inline-block mt-1 text-xs text-oro-700 bg-oro-50 border border-oro-200 px-2 py-0.5 rounded-full font-medium">Precio Negociable</span>` : ''}
                  </div>
                </div>

                <!-- CARACTERÍSTICAS PRINCIPALES -->
                <div class="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div class="p-3 bg-beige-50 rounded-2xl border border-beige-100">
                    <span class="text-oro-600 flex justify-center mb-1">${I('bed', 'w-6 h-6')}</span>
                    <strong class="font-display text-xl text-militar-950 block">${p.bedrooms || 0}</strong>
                    <span class="text-xs text-militar-500">Habitaciones</span>
                  </div>
                  <div class="p-3 bg-beige-50 rounded-2xl border border-beige-100">
                    <span class="text-oro-600 flex justify-center mb-1">${I('bath', 'w-6 h-6')}</span>
                    <strong class="font-display text-xl text-militar-950 block">${p.bathrooms || 0}</strong>
                    <span class="text-xs text-militar-500">Baños</span>
                  </div>
                  <div class="p-3 bg-beige-50 rounded-2xl border border-beige-100">
                    <span class="text-oro-600 flex justify-center mb-1">${I('car', 'w-6 h-6')}</span>
                    <strong class="font-display text-xl text-militar-950 block">${p.parking || 0}</strong>
                    <span class="text-xs text-militar-500">Puestos Estac.</span>
                  </div>
                  <div class="p-3 bg-beige-50 rounded-2xl border border-beige-100">
                    <span class="text-oro-600 flex justify-center mb-1">${I('ruler', 'w-6 h-6')}</span>
                    <strong class="font-display text-xl text-militar-950 block">${p.builtArea || p.landArea || '—'}</strong>
                    <span class="text-xs text-militar-500">Metros Cuadrados</span>
                  </div>
                </div>
              </div>

              <!-- DESCRIPCIÓN DETALLADA -->
              <div class="bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm space-y-4">
                <h2 class="font-display text-2xl text-militar-950 font-semibold">Descripción del Inmueble</h2>
                <div class="prose text-militar-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  ${U.nl2br(p.description)}
                </div>
              </div>

              <!-- ESPECIFICACIONES ARQUITECTÓNICAS -->
              <div class="bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm space-y-4">
                <h2 class="font-display text-2xl text-militar-950 font-semibold">Ficha Técnica</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div class="flex justify-between py-2 border-b border-beige-100">
                    <span class="text-militar-500">Área de Construcción</span>
                    <strong class="text-militar-900">${p.builtArea ? `${U.fmtNum(p.builtArea, true)} m²` : 'No especificada'}</strong>
                  </div>
                  <div class="flex justify-between py-2 border-b border-beige-100">
                    <span class="text-militar-500">Área de Terreno</span>
                    <strong class="text-militar-900">${p.landArea ? `${U.fmtNum(p.landArea, true)} m²` : 'No especificada'}</strong>
                  </div>
                  <div class="flex justify-between py-2 border-b border-beige-100">
                    <span class="text-militar-500">Condición del Inmueble</span>
                    <strong class="text-militar-900">${U.esc(p.condition || 'Satisfactorio')}</strong>
                  </div>
                  <div class="flex justify-between py-2 border-b border-beige-100">
                    <span class="text-militar-500">Mobiliario</span>
                    <strong class="text-militar-900">${C.furnishedLabel(p.furnished)}</strong>
                  </div>
                  <div class="flex justify-between py-2 border-b border-beige-100">
                    <span class="text-militar-500">Año de Construcción</span>
                    <strong class="text-militar-900">${p.yearBuilt > 1900 ? p.yearBuilt : 'Referencial'}</strong>
                  </div>
                  <div class="flex justify-between py-2 border-b border-beige-100">
                    <span class="text-militar-500">Niveles / Plantas</span>
                    <strong class="text-militar-900">${p.levels || 1}</strong>
                  </div>
                </div>
              </div>

              <!-- AMENIDADES Y BONDADES -->
              ${p.amenities?.length ? `
                <div class="bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm space-y-4">
                  <h2 class="font-display text-2xl text-militar-950 font-semibold">Amenidades y Comodidades</h2>
                  <div class="flex flex-wrap gap-2">
                    ${p.amenities.map((a) => `
                      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-beige-100 text-militar-900 text-xs sm:text-sm font-medium border border-beige-200">
                        ${I('check', 'w-4 h-4 text-oro-600')} ${U.esc(a)}
                      </span>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- MÓDULO DE COTIZACIÓN AUTOMÁTICA INTEGRADA -->
              <div class="bg-gradient-to-br from-militar-900 via-militar-950 to-militar-900 text-beige-100 p-6 sm:p-8 rounded-3xl border border-oro-500/30 shadow-xl space-y-6">
                <div class="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span class="text-xs font-bold uppercase tracking-widest text-oro-400">Simulación Financiera</span>
                    <h3 class="font-display text-2xl text-beige-50">Cotizador para esta Propiedad</h3>
                  </div>
                  ${I('calculator', 'w-7 h-7 text-oro-400')}
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-xs uppercase tracking-wider text-beige-300 font-semibold mb-2">
                      Porcentaje de Inicial (<span id="prop-down-pct-val">30</span>%)
                    </label>
                    <input type="range" id="prop-calc-down" min="15" max="60" step="5" value="30" class="w-full accent-oro-500 cursor-pointer">
                    <div class="flex justify-between text-xs text-beige-400 mt-1">
                      <span>15%</span>
                      <span>Monto: <strong class="text-oro-300" id="prop-down-amount">$ 0</strong></span>
                      <span>60%</span>
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs uppercase tracking-wider text-beige-300 font-semibold mb-2">
                      Plazo de financiamiento
                    </label>
                    <select id="prop-calc-term" class="input input-sm bg-militar-800 text-beige-100 w-full border-white/20 rounded-xl">
                      <option value="12">12 meses (1 año)</option>
                      <option value="24" selected>24 meses (2 años)</option>
                      <option value="36">36 meses (3 años)</option>
                      <option value="48">48 meses (4 años)</option>
                      <option value="60">60 meses (5 años)</option>
                    </select>
                  </div>
                </div>

                <!-- DESGLOSE DE CUOTA Y SALDO -->
                <div class="p-5 bg-white/5 rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div>
                    <span class="text-[11px] uppercase tracking-wider text-beige-400 block">Inicial estimada</span>
                    <strong class="font-display text-2xl text-beige-50 block mt-1" id="prop-res-down">$ 0</strong>
                  </div>
                  <div>
                    <span class="text-[11px] uppercase tracking-wider text-beige-400 block">Saldo a financiar</span>
                    <strong class="font-display text-2xl text-beige-50 block mt-1" id="prop-res-balance">$ 0</strong>
                  </div>
                  <div class="border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0">
                    <span class="text-[11px] uppercase tracking-wider text-oro-300 font-bold block">Cuota mensual est.</span>
                    <strong class="font-display text-3xl text-oro-400 block mt-1" id="prop-res-monthly">$ 0</strong>
                  </div>
                </div>
                <p class="text-[11px] text-beige-400/80 text-center italic">
                  * Valores referenciales sujetos a políticas del propietario y condiciones de negociación.
                </p>
              </div>

              <!-- MAPA DE UBICACIÓN APROXIMADA -->
              <div class="bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm space-y-4">
                <div class="flex items-center justify-between">
                  <h2 class="font-display text-2xl text-militar-950 font-semibold">Ubicación Aproximada</h2>
                  <span class="text-xs text-militar-500">${U.esc(p.location.sector)}, ${U.esc(p.location.municipality)}</span>
                </div>
                <div class="aspect-[16/8] bg-beige-200 rounded-2xl relative overflow-hidden flex items-center justify-center border border-beige-300" id="property-map-container">
                  <!-- Mapa visual estilizado con marcador corporativo -->
                  <div class="absolute inset-0 bg-militar-950/10 flex items-center justify-center">
                    <div class="relative flex flex-col items-center animate-bounce">
                      <div class="p-3 rounded-full bg-militar-900 text-oro-400 shadow-2xl border-2 border-oro-400">
                        ${I('home', 'w-6 h-6')}
                      </div>
                      <div class="w-3 h-3 bg-militar-900 rotate-45 -mt-1.5 border-r-2 border-b-2 border-oro-400"></div>
                      <span class="mt-2 text-xs font-bold text-militar-950 bg-white/90 px-3 py-1 rounded-full shadow-md backdrop-blur-sm">
                        ${U.esc(p.location.sector)}
                      </span>
                    </div>
                  </div>
                </div>
                <p class="text-xs text-militar-500">
                  Por seguridad y confidencialidad, la dirección exacta se coordina previamente con el asesor responsable.
                </p>
              </div>
            </div>

            <!-- COLUMNA LATERAL: ASESOR + SISTEMA DE OFERTAS FORMALES -->
            <aside class="lg:col-span-4 space-y-6 lg:sticky lg:top-36">
              <!-- TARJETA DEL ASESOR ENCARGADO -->
              <div class="bg-white p-6 rounded-3xl border border-beige-200 shadow-sm text-center">
                <span class="text-[11px] font-bold uppercase tracking-widest text-oro-700 block mb-3">Asesor Responsable</span>
                <div class="flex justify-center mb-3">
                  ${advisor?.photo ? `
                    <img src="${U.esc(PL.media.url(advisor.photo))}" alt="${U.esc(advisor.name)}" class="w-20 h-20 rounded-full object-cover ring-4 ring-oro-400/40 shadow-md" ${PL.media.onErr}>
                  ` : `
                    <span class="w-20 h-20 rounded-full bg-oro-500 text-militar-950 text-2xl font-bold flex items-center justify-center shadow-md ring-4 ring-oro-400/40">
                      ${U.initials(advisor?.name)}
                    </span>
                  `}
                </div>
                <h3 class="font-display text-xl text-militar-950 font-bold">${U.esc(advisor?.name || 'Asesor ProLíder')}</h3>
                <p class="text-xs text-militar-500 mt-0.5">${U.esc(advisor?.title || 'Asesor Inmobiliario Certificado')}</p>

                <div class="mt-5 space-y-2.5">
                  <a href="${waLink}" target="_blank" rel="noopener" class="btn btn-outline-wa w-full justify-center py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm">
                    ${I('whatsapp', 'w-4 h-4')} Contactar por WhatsApp
                  </a>
                  ${advisor?.phone ? `
                    <a href="tel:${U.esc(advisor.phone)}" class="btn btn-outline w-full justify-center py-2 rounded-xl text-xs sm:text-sm font-semibold">
                      ${I('phone', 'w-4 h-4')} Llamar directamente
                    </a>
                  ` : ''}
                </div>
              </div>

              <!-- SISTEMA DE OFERTAS Y NEGOCIACIÓN FORMAL -->
              <div class="bg-white p-6 rounded-3xl border border-oro-400/50 shadow-md">
                <div class="flex items-center gap-2 mb-3">
                  <span class="p-2 bg-oro-100 text-oro-800 rounded-xl">${I('handshake', 'w-5 h-5')}</span>
                  <div>
                    <h3 class="font-display text-lg text-militar-950 font-bold leading-tight">Enviar Propuesta Formal</h3>
                    <p class="text-xs text-militar-600">Presenta una oferta directa al asesor</p>
                  </div>
                </div>

                ${existingOffer ? `
                  <div class="p-4 bg-oro-50 border border-oro-200 rounded-2xl space-y-2">
                    <span class="badge ${C.offerStatus(existingOffer.status).cls}">
                      Estatus: ${C.offerStatus(existingOffer.status).label}
                    </span>
                    <p class="text-xs text-militar-800 leading-snug">
                      Ya tienes una oferta activa de <strong>${U.fmtMoney(existingOffer.amount, existingOffer.currency)}</strong>.
                    </p>
                    <a href="#/mi-cuenta?tab=ofertas&id=${existingOffer.id}" class="btn btn-sm btn-outline w-full justify-center text-xs mt-2">
                      Ver estado de negociación
                    </a>
                  </div>
                ` : `
                  <form id="offer-form" class="space-y-3 pt-2">
                    <div class="field">
                      <label class="field-label text-xs">Monto de tu oferta (USD)</label>
                      <input type="number" name="amount" required min="1000" step="500"
                             value="${p.price ? Math.round(p.price * 0.95) : ''}"
                             class="input input-sm text-sm font-bold text-militar-950">
                    </div>

                    <div class="field">
                      <label class="field-label text-xs">Modalidad de pago</label>
                      <select name="financing" class="input input-sm text-xs">
                        <option value="Contado">Pago de Contado</option>
                        <option value="Financiamiento corto">Financiamiento (3 a 6 meses)</option>
                        <option value="Crédito bancario">Crédito bancario / Hipotecario</option>
                      </select>
                    </div>

                    <div class="field">
                      <label class="field-label text-xs">Mensaje o condiciones</label>
                      <textarea name="message" rows="3" class="input input-sm text-xs leading-relaxed"
                                placeholder="Indica plazo estimado de firma, disponibilidad de fondos u observaciones..."></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary w-full justify-center py-2.5 rounded-xl shadow-gold text-xs font-semibold">
                      ${I('send', 'w-4 h-4')} Radicar oferta económica
                    </button>
                    <p class="text-[11px] text-militar-500 text-center leading-tight">
                      Tu oferta será notificada de inmediato al asesor y al propietario.
                    </p>
                  </form>
                `}
              </div>
            </aside>
          </div>
        </div>
      </div>
    `;
  }

  function mount(root, ctx) {
    const p = PL.store.properties.get(ctx.params.id);
    if (!p) return;

    const photos = p.media?.photos || [];

    // Galería: Clic en miniatura cambia la foto principal
    const activeImg = root.querySelector('#active-photo-img');
    root.querySelectorAll('[data-gallery-thumb]').forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const idx = +thumb.dataset.galleryThumb;
        if (photos[idx]) {
          activeImg.src = PL.media.url(photos[idx]);
        }
      });
    });

    // Abrir Lightbox completo
    const openLightbox = () => {
      if (photos.length) {
        PL.ui.lightbox(photos.map(PL.media.url), 0, p.title);
      }
    };
    root.querySelector('#main-gallery-view')?.addEventListener('click', openLightbox);
    root.querySelector('#btn-open-lightbox')?.addEventListener('click', (e) => {
      e.stopPropagation();
      openLightbox();
    });

    // Compartir propiedad
    root.querySelector('#btn-share-prop')?.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({ title: p.title, url: window.location.href });
      } else {
        navigator.clipboard.writeText(window.location.href);
        PL.ui.toast('Enlace copiado al portapapeles');
      }
    });

    // Favoritos
    root.querySelector('[data-fav]')?.addEventListener('click', (e) => {
      const b = e.currentTarget;
      const added = PL.store.favorites.toggle(p.id);
      b.classList.toggle('on', added);
      b.setAttribute('aria-pressed', String(added));
      PL.ui.toast(added ? 'Propiedad guardada en favoritos' : 'Eliminada de favoritos', 'info');
    });

    // Cotizador automático reactivo
    const downRange = root.querySelector('#prop-calc-down');
    const termSelect = root.querySelector('#prop-calc-term');

    function updatePropCalc() {
      if (!downRange || !p.price) return;
      const pct = +downRange.value;
      const term = +termSelect.value;
      const price = p.price;

      const downVal = Math.round(price * (pct / 100));
      const balance = price - downVal;
      const monthly = Math.round(balance / term);

      root.querySelector('#prop-down-pct-val').textContent = pct;
      root.querySelector('#prop-down-amount').textContent = U.fmtMoney(downVal, p.currency);
      root.querySelector('#prop-res-down').textContent = U.fmtMoney(downVal, p.currency);
      root.querySelector('#prop-res-balance').textContent = U.fmtMoney(balance, p.currency);
      root.querySelector('#prop-res-monthly').textContent = U.fmtMoney(monthly, p.currency);
    }

    downRange?.addEventListener('input', updatePropCalc);
    termSelect?.addEventListener('change', updatePropCalc);
    updatePropCalc();

    // Envío del Formulario de Oferta Formal
    const offerForm = root.querySelector('#offer-form');
    offerForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(offerForm);
      const amount = +fd.get('amount');
      const financing = fd.get('financing');
      const message = fd.get('message');

      PL.auth.requireClient((client) => {
        PL.store.offers.create({
          property: p,
          client,
          amount,
          financing,
          downPayment: 0,
          message,
          phone: client.phone,
        });
        PL.ui.toast('¡Tu oferta ha sido enviada exitosamente al asesor!');
        PL.router.resolve();
      }, 'Para formalizar una propuesta económica debes iniciar sesión con tu cuenta.');
    });
  }

  return {
    title: 'Detalle de Inmueble | ProLíder Inmobiliaria',
    layout: 'public',
    render,
    mount,
  };
})();

