/**
 * ProLider - Dashboard del Asesor (Backoffice / CRM)
 * ---------------------------------------------------------------
 * - Métricas clave: Inmuebles activos, reservados, vendidos, ofertas pendientes y vistas
 * - Alertas inmediatas de propuestas económicas que requieren respuesta
 * - Acceso directo a publicación rápida de inmuebles
 * - Tabla de propiedades recientes con acceso a edición rápida
 */
window.PL = window.PL || {};
PL.pages = PL.pages || {};

PL.pages.advisorDashboard = (() => {
  const U = PL.utils;
  const C = PL.catalogs;
  const I = PL.icon;

  function render(ctx) {
    const advisor = PL.auth.currentAdvisor();
    const isAdmin = advisor.role === 'admin';
    const allProps = isAdmin ? PL.store.properties.all() : PL.store.properties.byAdvisor(advisor.id);
    const activeProps = allProps.filter((p) => p.status === 'disponible');
    const reservedProps = allProps.filter((p) => p.status === 'reservado');
    const soldProps = allProps.filter((p) => ['vendido', 'alquilado'].includes(p.status));
    const totalViews = allProps.reduce((sum, p) => sum + (p.views || 0), 0);

    const offers = PL.store.offers.byAdvisor(advisor.id);
    const pendingOffers = offers.filter((o) => o.status === 'pendiente');
    const recentProps = allProps.slice(0, 5);

    return `
      <div class="space-y-8">
        <!-- BIENVENIDA Y ACCIÓN RÁPIDA -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-beige-200">
          <div>
            <span class="text-xs font-bold uppercase tracking-[0.2em] text-oro-700">Panel de Control</span>
            <h1 class="font-display text-3xl sm:text-4xl font-bold text-militar-950">
              ${U.greeting()}, ${U.esc(advisor.name.split(' ')[0])}
            </h1>
            <p class="text-xs sm:text-sm text-militar-600 mt-0.5">
              ${isAdmin ? 'Vista global de gerencia (todos los inmuebles y asesores)' : 'Gestiona tus propiedades, ofertas recibidas y clientes'}
            </p>
          </div>

          <div class="flex items-center gap-3">
            <a href="#/asesor/inmuebles/nuevo" class="btn btn-primary shadow-gold rounded-xl py-2.5 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2">
              ${I('plus', 'w-4 h-4')} Publicar nuevo inmueble
            </a>
          </div>
        </div>

        <!-- TARJETAS DE MÉTRICAS (KPIs) -->
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div class="bg-white p-5 rounded-3xl border border-beige-200 shadow-sm">
            <div class="flex items-center justify-between text-oro-600 mb-2">
              <span class="text-[11px] font-bold uppercase tracking-wider text-militar-600">Disponibles</span>
              ${I('home', 'w-5 h-5')}
            </div>
            <strong class="font-display text-3xl font-bold text-militar-950">${activeProps.length}</strong>
            <span class="block text-[11px] text-militar-500 mt-1">En catálogo público</span>
          </div>

          <div class="bg-white p-5 rounded-3xl border border-beige-200 shadow-sm">
            <div class="flex items-center justify-between text-amber-600 mb-2">
              <span class="text-[11px] font-bold uppercase tracking-wider text-militar-600">Reservados</span>
              ${I('clock', 'w-5 h-5')}
            </div>
            <strong class="font-display text-3xl font-bold text-amber-600">${reservedProps.length}</strong>
            <span class="block text-[11px] text-militar-500 mt-1">En negociación final</span>
          </div>

          <div class="bg-white p-5 rounded-3xl border border-beige-200 shadow-sm">
            <div class="flex items-center justify-between text-emerald-600 mb-2">
              <span class="text-[11px] font-bold uppercase tracking-wider text-militar-600">Cerrados</span>
              ${I('award', 'w-5 h-5')}
            </div>
            <strong class="font-display text-3xl font-bold text-emerald-700">${soldProps.length}</strong>
            <span class="block text-[11px] text-militar-500 mt-1">Vendidos o alquilados</span>
          </div>

          <div class="bg-white p-5 rounded-3xl border border-beige-200 shadow-sm">
            <div class="flex items-center justify-between text-oro-700 mb-2">
              <span class="text-[11px] font-bold uppercase tracking-wider text-militar-600">Ofertas</span>
              ${I('handshake', 'w-5 h-5')}
            </div>
            <strong class="font-display text-3xl font-bold ${pendingOffers.length ? 'text-oro-600' : 'text-militar-950'}">${pendingOffers.length}</strong>
            <span class="block text-[11px] text-militar-500 mt-1">Pendientes de respuesta</span>
          </div>

          <div class="bg-white p-5 rounded-3xl border border-beige-200 shadow-sm col-span-2 lg:col-span-1">
            <div class="flex items-center justify-between text-militar-600 mb-2">
              <span class="text-[11px] font-bold uppercase tracking-wider text-militar-600">Vistas</span>
              ${I('eye', 'w-5 h-5')}
            </div>
            <strong class="font-display text-3xl font-bold text-militar-950">${U.fmtNum(totalViews)}</strong>
            <span class="block text-[11px] text-militar-500 mt-1">Visitas acumuladas</span>
          </div>
        </div>

        <!-- ALERTAS DE OFERTAS PENDIENTES -->
        ${pendingOffers.length ? `
          <div class="bg-oro-50 border-2 border-oro-400 rounded-3xl p-6 shadow-md space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="p-2.5 bg-oro-500 text-militar-950 rounded-2xl shadow-sm animate-pulse">${I('bell', 'w-5 h-5')}</span>
                <div>
                  <h3 class="font-display text-lg font-bold text-oro-950">Tienes ${pendingOffers.length} oferta(s) económica(s) pendiente(s)</h3>
                  <p class="text-xs text-oro-800">Clientes esperan tu respuesta formal (Aceptar, Contraofertar o Rechazar)</p>
                </div>
              </div>
              <a href="#/asesor/ofertas" class="btn btn-sm btn-primary shadow-gold text-xs">
                Gestionar ofertas ${I('arrowRight', 'w-3.5 h-3.5')}
              </a>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              ${pendingOffers.slice(0, 2).map((o) => {
                const p = PL.store.properties.get(o.propertyId);
                return `
                  <div class="bg-white p-4 rounded-2xl border border-oro-200 flex items-center justify-between gap-3">
                    <div class="min-w-0 flex-1">
                      <span class="text-[11px] font-bold text-oro-700 uppercase tracking-wider">${p ? p.code : 'Inmueble'}</span>
                      <h4 class="text-xs font-semibold text-militar-900 truncate">${p ? p.title : 'Propiedad'}</h4>
                      <p class="text-[11px] text-militar-500 mt-0.5">Cliente: <strong>${U.esc(o.clientName)}</strong></p>
                    </div>
                    <div class="text-right shrink-0">
                      <strong class="font-display text-lg text-militar-950 block">${U.fmtMoney(o.amount, o.currency)}</strong>
                      <a href="#/asesor/ofertas?id=${o.id}" class="text-[11px] text-oro-700 font-semibold hover:underline">Responder</a>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- PROPIEDADES RECIENTES DEL ASESOR -->
        <div class="bg-white rounded-3xl border border-beige-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-beige-200">
            <div>
              <h3 class="font-display text-xl font-bold text-militar-950">Tus Inmuebles Recientes</h3>
              <p class="text-xs text-militar-500">Últimas propiedades cargadas en el sistema</p>
            </div>
            <a href="#/asesor/inmuebles" class="text-xs text-oro-700 font-semibold hover:underline flex items-center gap-1">
              Ver todos (${allProps.length}) ${I('arrowRight', 'w-3.5 h-3.5')}
            </a>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs sm:text-sm">
              <thead class="text-[11px] font-bold uppercase tracking-wider text-militar-500 border-b border-beige-100">
                <tr>
                  <th class="py-3 px-2">Inmueble</th>
                  <th class="py-3 px-2">Tipo / Op.</th>
                  <th class="py-3 px-2">Precio</th>
                  <th class="py-3 px-2">Estatus</th>
                  <th class="py-3 px-2">Completitud</th>
                  <th class="py-3 px-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-beige-100">
                ${recentProps.map((p) => {
                  const comp = PL.store.completeness(p);
                  const status = C.status(p.status);
                  return `
                    <tr class="hover:bg-beige-50/70 transition">
                      <td class="py-3 px-2">
                        <div class="flex items-center gap-3">
                          <img src="${U.esc(PL.media.url(p.media?.photos?.[0]))}" class="w-12 h-10 rounded-lg object-cover shrink-0" ${PL.media.onErr}>
                          <div class="min-w-0">
                            <span class="text-[10px] font-bold text-oro-700 block">${p.code}</span>
                            <a href="#/propiedad/${p.id}" target="_blank" class="font-medium text-militar-900 hover:text-oro-700 truncate block max-w-xs">${U.esc(p.title)}</a>
                            <span class="text-[11px] text-militar-400">${U.esc(p.location.sector)}, ${U.esc(p.location.municipality)}</span>
                          </div>
                        </div>
                      </td>
                      <td class="py-3 px-2">
                        <span class="capitalize font-medium text-militar-800">${C.type(p.type).label}</span>
                        <span class="block text-[11px] text-militar-500 capitalize">${C.operation(p.operation).label}</span>
                      </td>
                      <td class="py-3 px-2 font-bold text-militar-950 font-display text-base">
                        ${U.fmtMoney(p.price, p.currency)}
                      </td>
                      <td class="py-3 px-2">
                        <span class="badge ${status.cls} text-[10px]">${status.label}</span>
                      </td>
                      <td class="py-3 px-2">
                        <div class="flex items-center gap-2">
                          <div class="w-16 h-2 bg-beige-200 rounded-full overflow-hidden">
                            <div class="h-full ${comp.score >= 80 ? 'bg-emerald-600' : comp.score >= 50 ? 'bg-oro-500' : 'bg-red-500'}" style="width: ${comp.score}%"></div>
                          </div>
                          <span class="text-[11px] font-semibold text-militar-700">${comp.score}%</span>
                        </div>
                      </td>
                      <td class="py-3 px-2 text-right whitespace-nowrap">
                        <a href="#/asesor/inmuebles/editar/${p.id}" class="icon-btn" title="Editar inmueble">
                          ${I('edit', 'w-4 h-4')}
                        </a>
                        <a href="#/propiedad/${p.id}" target="_blank" class="icon-btn" title="Ver en portal">
                          ${I('eye', 'w-4 h-4')}
                        </a>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function mount(root) {
    // Componente reactivo sin hooks complejos
  }

  return {
    title: 'Dashboard | ProLíder Backoffice',
    layout: 'admin',
    guard: 'advisor',
    render,
    mount,
  };
})();

