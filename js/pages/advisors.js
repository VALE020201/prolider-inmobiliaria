/**
 * ProLider - Directorio de Asesores y Perfil Individual
 * ---------------------------------------------------------------
 * - Directorio general con buscador por nombre
 * - Vista individual (#/asesores/:id) con bio, datos de contacto y
 *   catálogo exclusivo de las propiedades asignadas a ese asesor.
 */
window.PL = window.PL || {};
PL.pages = PL.pages || {};

PL.pages.advisors = (() => {
  const U = PL.utils;
  const I = PL.icon;

  function render(ctx) {
    // Si viene con parámetro de ID, renderizamos el perfil individual
    if (ctx.params.id) {
      return renderAdvisorDetail(ctx.params.id);
    }

    const advisors = PL.store.advisors.public();

    return `
      <div class="bg-beige-50 min-h-screen py-10 md:py-16">
        <div class="container-x">
          <div class="text-center max-w-2xl mx-auto mb-12">
            <span class="text-xs font-bold uppercase tracking-[0.25em] text-oro-700">Equipo Profesional</span>
            <h1 class="font-display text-3xl sm:text-4xl lg:text-5xl text-militar-950 font-bold mt-1">
              Nuestros Asesores
            </h1>
            <p class="text-militar-600 mt-3 text-sm sm:text-base">
              Conoce a nuestro equipo de especialistas inmobiliarios en Valencia y Carabobo. Cada asesor gestiona un portafolio exclusivo con atención personalizada.
            </p>

            <!-- BUSCADOR DE ASESORES -->
            <div class="mt-6 max-w-md mx-auto relative">
              <span class="absolute left-3.5 top-3 text-militar-400">${I('search', 'w-4 h-4')}</span>
              <input type="text" id="advisor-search-input" placeholder="Buscar asesor por nombre..."
                     class="input input-sm pl-10 pr-4 py-2.5 w-full bg-white rounded-2xl shadow-sm text-sm border-beige-300">
            </div>
          </div>

          <div id="advisors-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            ${advisors.map((a) => PL.cards.advisorCard(a)).join('')}
          </div>
          <div id="advisors-empty" class="hidden"></div>
        </div>
      </div>
    `;
  }

  function renderAdvisorDetail(id) {
    const a = PL.store.advisors.get(id);
    if (!a) {
      return `
        <div class="container-x py-20 text-center">
          ${PL.ui.empty('alert', 'Asesor no encontrado', 'El asesor solicitado no se encuentra en el equipo.', '<a href="#/asesores" class="btn btn-primary">Ver todos los asesores</a>')}
        </div>
      `;
    }

    const props = PL.store.properties.public().filter((p) => p.advisorId === a.id);
    const stats = PL.store.advisors.stats(a.id);
    const waLink = a.phone ? U.waLink(a.phone, `Hola ${a.name.split(' ')[0]}, te contacto desde el portal ProLíder.`) : '#';

    return `
      <div class="bg-beige-50 min-h-screen pb-20">
        <!-- HEADER DEL ASESOR -->
        <div class="bg-gradient-to-br from-militar-900 via-militar-950 to-militar-900 text-beige-100 pt-16 pb-24 relative overflow-hidden">
          <div class="absolute inset-0 bg-pattern opacity-[0.05]"></div>
          <div class="container-x relative max-w-4xl text-center">
            <a href="#/asesores" class="inline-flex items-center gap-1.5 text-xs text-oro-300 hover:text-oro-200 mb-6 font-medium">
              ${I('arrowLeft', 'w-3.5 h-3.5')} Volver al directorio de asesores
            </a>

            <div class="flex justify-center mb-4">
              ${a.photo ? `
                <img src="${U.esc(PL.media.url(a.photo))}" alt="${U.esc(a.name)}" class="w-32 h-32 rounded-full object-cover ring-4 ring-oro-400 shadow-2xl" ${PL.media.onErr}>
              ` : `
                <span class="w-32 h-32 rounded-full bg-oro-500 text-militar-950 text-4xl font-bold flex items-center justify-center shadow-2xl ring-4 ring-oro-400">
                  ${U.initials(a.name)}
                </span>
              `}
            </div>

            <h1 class="font-display text-3xl sm:text-4xl font-bold text-beige-50">${U.esc(a.name)}</h1>
            <p class="text-xs uppercase tracking-[0.25em] text-oro-400 mt-1">${U.esc(a.title || 'Asesor Inmobiliario Certificado')}</p>
            <p class="mt-4 text-sm text-beige-300/90 max-w-xl mx-auto leading-relaxed">
              ${U.esc(a.bio || 'Especialista en intermediación inmobiliaria en Carabobo, comprometido con la excelencia y la seguridad jurídica de cada operación.')}
            </p>

            <!-- ACCIONES DE CONTACTO DIRECTO -->
            <div class="mt-6 flex flex-wrap justify-center gap-3">
              ${a.phone ? `
                <a href="${waLink}" target="_blank" rel="noopener" class="btn btn-primary rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-gold">
                  ${I('whatsapp', 'w-4 h-4')} Escribir al WhatsApp
                </a>
                <a href="tel:${U.esc(a.phone)}" class="btn btn-ghost-light rounded-xl px-4 py-2.5 text-xs sm:text-sm">
                  ${I('phone', 'w-4 h-4')} ${U.fmtPhone(a.phone)}
                </a>
              ` : ''}
              <a href="mailto:${U.esc(a.email)}" class="btn btn-ghost-light rounded-xl px-4 py-2.5 text-xs sm:text-sm">
                ${I('mail', 'w-4 h-4')} Contactar por correo
              </a>
              ${a.instagram ? `
                <a href="https://instagram.com/${U.esc(a.instagram)}" target="_blank" rel="noopener" class="btn btn-ghost-light rounded-xl px-4 py-2.5 text-xs sm:text-sm">
                  ${I('instagram', 'w-4 h-4')} @${U.esc(a.instagram)}
                </a>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- PORTAFOLIO DE INMUEBLES ASIGNADOS -->
        <div class="container-x -mt-10 relative z-10">
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-md">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-beige-200">
              <div>
                <h2 class="font-display text-2xl text-militar-950 font-bold">Inmuebles Asignados</h2>
                <p class="text-xs text-militar-500 mt-0.5">Portafolio activo gestionado por ${U.esc(a.name)} (${props.length} propiedades)</p>
              </div>

              <div class="flex gap-2">
                <span class="badge badge-sale text-xs px-3 py-1">Venta: ${stats.venta}</span>
                <span class="badge badge-rent text-xs px-3 py-1">Alquiler: ${stats.alquiler}</span>
              </div>
            </div>

            <!-- CUADRÍCULA DE PROPIEDADES -->
            <div class="mt-6">
              ${props.length ? `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  ${props.map((p) => PL.cards.propertyCard(p)).join('')}
                </div>
              ` : `
                ${PL.ui.empty('home', 'Sin propiedades asignadas en este momento', 'Este asesor está captando nuevos inmuebles actualmente.')}
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function mount(root, ctx) {
    if (ctx.params.id) {
      // Delegar favoritos
      root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-fav]');
        if (!b) return;
        e.preventDefault();
        e.stopPropagation();
        const pid = b.dataset.fav;
        const added = PL.store.favorites.toggle(pid);
        b.classList.toggle('on', added);
        b.setAttribute('aria-pressed', String(added));
        PL.ui.toast(added ? 'Propiedad guardada en favoritos' : 'Eliminada de favoritos', 'info');
      });
      return;
    }

    // Buscador interactivo de asesores
    const searchInput = root.querySelector('#advisor-search-input');
    const grid = root.querySelector('#advisors-grid');
    const empty = root.querySelector('#advisors-empty');

    searchInput?.addEventListener('input', (e) => {
      const q = U.norm(e.target.value);
      const filtered = PL.store.advisors.public().filter((a) => {
        return U.norm(a.name).includes(q) || U.norm(a.title).includes(q) || U.norm(a.zone).includes(q);
      });

      if (!filtered.length) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
        empty.innerHTML = PL.ui.empty('search', 'No se encontraron asesores', 'Prueba con otro nombre o término de búsqueda.');
      } else {
        empty.classList.add('hidden');
        grid.innerHTML = filtered.map((a) => PL.cards.advisorCard(a)).join('');
      }
    });
  }

  return {
    title: 'Nuestros Asesores | ProLíder Inmobiliaria',
    layout: 'public',
    render,
    mount,
  };
})();

