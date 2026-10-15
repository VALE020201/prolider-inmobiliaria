/**
 * ProLider - Gestión de Inmuebles del Asesor (Listado & Acciones Rápidas)
 * ---------------------------------------------------------------
 * - Filtro por pestañas de estatus (Todos, Disponible, Reservado, Vendido, Borrador)
 * - Cambio instantáneo de estatus con un solo clic
 * - Duplicación ultrarrápida de propiedades (para crear variantes en un mismo conjunto)
 * - Búsqueda por código, título y sector
 * - Eliminación y acceso directo a edición
 */
window.PL = window.PL || {};
PL.pages = PL.pages || {};

PL.pages.advisorProperties = (() => {
  const U = PL.utils;
  const C = PL.catalogs;
  const I = PL.icon;

  function render(ctx) {
    const advisor = PL.auth.currentAdvisor();
    const isAdmin = advisor.role === 'admin';
    const all = isAdmin ? PL.store.properties.all() : PL.store.properties.byAdvisor(advisor.id);
    const qStatus = ctx.query.status || '';

    return `
      <div class="space-y-6">
        <!-- CABECERA -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-beige-200">
          <div>
            <span class="text-xs font-bold uppercase tracking-[0.2em] text-oro-700">Portafolio Inmobiliario</span>
            <h1 class="font-display text-3xl font-bold text-militar-950">
              ${isAdmin ? 'Gestión General de Inmuebles' : 'Mis Inmuebles Asignados'}
            </h1>
            <p class="text-xs text-militar-600 mt-0.5">
              Administra disponibilidad, actualiza precios y supervisa la calidad de cada publicación
            </p>
          </div>

          <a href="#/asesor/inmuebles/nuevo" class="btn btn-primary shadow-gold rounded-xl py-2.5 px-4 text-xs sm:text-sm font-semibold flex items-center gap-2">
            ${I('plus', 'w-4 h-4')} Publicar nuevo inmueble
          </a>
        </div>

        <!-- BARRA DE PESTAÑAS POR ESTATUS Y BUSCADOR -->
        <div class="bg-white p-4 rounded-3xl border border-beige-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar" id="status-tabs">
            <button type="button" data-status="" class="btn btn-sm rounded-full ${!qStatus ? 'btn-primary' : 'btn-ghost'} text-xs">
              Todos (${all.length})
            </button>
            <button type="button" data-status="disponible" class="btn btn-sm rounded-full ${qStatus === 'disponible' ? 'btn-primary' : 'btn-ghost'} text-xs">
              Disponibles (${all.filter((p) => p.status === 'disponible').length})
            </button>
            <button type="button" data-status="reservado" class="btn btn-sm rounded-full ${qStatus === 'reservado' ? 'btn-primary' : 'btn-ghost'} text-xs">
              Reservados (${all.filter((p) => p.status === 'reservado').length})
            </button>
            <button type="button" data-status="vendido" class="btn btn-sm rounded-full ${qStatus === 'vendido' ? 'btn-primary' : 'btn-ghost'} text-xs">
              Vendidos (${all.filter((p) => p.status === 'vendido').length})
            </button>
            <button type="button" data-status="alquilado" class="btn btn-sm rounded-full ${qStatus === 'alquilado' ? 'btn-primary' : 'btn-ghost'} text-xs">
              Alquilados (${all.filter((p) => p.status === 'alquilado').length})
            </button>
            <button type="button" data-status="borrador" class="btn btn-sm rounded-full ${qStatus === 'borrador' ? 'btn-primary' : 'btn-ghost'} text-xs">
              Borradores (${all.filter((p) => p.status === 'borrador').length})
            </button>
          </div>

          <!-- Búsqueda rápida -->
          <div class="relative w-full md:w-72">
            <span class="absolute left-3 top-2.5 text-militar-400">${I('search', 'w-4 h-4')}</span>
            <input type="text" id="prop-quick-search" placeholder="Buscar por código, título o sector..."
                   class="input input-sm pl-9 pr-3 text-xs w-full bg-beige-50 rounded-xl">
          </div>
        </div>

        <!-- LISTADO / TABLA DE INMUEBLES -->
        <div class="bg-white rounded-3xl border border-beige-200 shadow-sm overflow-hidden" id="props-table-card">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs sm:text-sm">
              <thead class="text-[11px] font-bold uppercase tracking-wider text-militar-600 bg-beige-50/70 border-b border-beige-200">
                <tr>
                  <th class="py-3.5 px-4">Inmueble</th>
                  <th class="py-3.5 px-3">Tipo / Op.</th>
                  <th class="py-3.5 px-3">Precio</th>
                  <th class="py-3.5 px-3">Estatus</th>
                  <th class="py-3.5 px-3">Vistas</th>
                  <th class="py-3.5 px-3">Completitud</th>
                  <th class="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-beige-100" id="props-tbody">
                <!-- Se llena dinámicamente con JS -->
              </tbody>
            </table>
          </div>
          <div id="props-empty-state" class="p-12 text-center hidden">
            <!-- Vacío -->
          </div>
        </div>
      </div>
    `;
  }

  function mount(root, ctx) {
    const advisor = PL.auth.currentAdvisor();
    const isAdmin = advisor.role === 'admin';
    let currentStatus = ctx.query.status || '';
    let searchQuery = '';

    const tbody = root.querySelector('#props-tbody');
    const emptyState = root.querySelector('#props-empty-state');
    const searchInput = root.querySelector('#prop-quick-search');

    function renderRows() {
      const all = isAdmin ? PL.store.properties.all() : PL.store.properties.byAdvisor(advisor.id);
      const q = U.norm(searchQuery);

      const filtered = all.filter((p) => {
        if (currentStatus && p.status !== currentStatus) return false;
        if (q) {
          const hay = U.norm(`${p.code} ${p.title} ${p.location.sector} ${p.location.municipality}`);
          if (!hay.includes(q)) return false;
        }
        return true;
      });

      if (!filtered.length) {
        tbody.innerHTML = '';
        emptyState.classList.remove('hidden');
        emptyState.innerHTML = PL.ui.empty(
          'building',
          'No se encontraron inmuebles',
          'No hay propiedades que coincidan con el estatus o término de búsqueda seleccionado.',
          '<a href="#/asesor/inmuebles/nuevo" class="btn btn-primary">Publicar inmueble ahora</a>'
        );
        return;
      }

      emptyState.classList.add('hidden');
      tbody.innerHTML = filtered.map((p) => {
        const comp = PL.store.completeness(p);
        const status = C.status(p.status);
        const offersCount = PL.store.offers.byProperty(p.id).length;

        return `
          <tr class="hover:bg-beige-50/60 transition group" data-prop-row="${p.id}">
            <td class="py-3 px-4">
              <div class="flex items-center gap-3">
                <div class="relative w-14 h-12 rounded-xl overflow-hidden bg-militar-800 shrink-0">
                  <img src="${U.esc(PL.media.url(p.media?.photos?.[0]))}" class="w-full h-full object-cover" ${PL.media.onErr}>
                  ${offersCount ? `<span class="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-oro-400"></span>` : ''}
                </div>
                <div class="min-w-0 max-w-xs sm:max-w-md">
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-bold text-oro-700 bg-oro-50 border border-oro-200 px-1.5 py-0.2 rounded">${p.code}</span>
                    ${offersCount ? `<a href="#/asesor/ofertas?pid=${p.id}" class="text-[10px] text-oro-800 font-semibold bg-oro-100 hover:bg-oro-200 px-1.5 py-0.2 rounded">${offersCount} oferta(s)</a>` : ''}
                  </div>
                  <a href="#/propiedad/${p.id}" target="_blank" class="font-semibold text-militar-900 hover:text-oro-700 truncate block text-xs sm:text-sm mt-0.5">${U.esc(p.title)}</a>
                  <span class="text-[11px] text-militar-400 truncate block">${U.esc(p.location.sector)}, ${U.esc(p.location.municipality)}</span>
                </div>
              </div>
            </td>

            <td class="py-3 px-3">
              <span class="capitalize font-semibold text-militar-800 block">${C.type(p.type).label}</span>
              <span class="text-[11px] text-militar-500 capitalize">${C.operation(p.operation).label}</span>
            </td>

            <td class="py-3 px-3">
              <strong class="font-display text-base text-militar-950 font-bold block">${U.fmtMoney(p.price, p.currency)}</strong>
              ${p.negotiable ? `<span class="text-[10px] text-emerald-700 font-medium">Negociable</span>` : ''}
            </td>

            <td class="py-3 px-3">
              <!-- SELECTOR RÁPIDO DE ESTATUS -->
              <select class="input input-sm py-1 pl-2 pr-6 text-xs rounded-lg font-semibold cursor-pointer status-quick-change" data-prop-id="${p.id}">
                ${C.statuses.map((s) => `
                  <option value="${s.key}" ${p.status === s.key ? 'selected' : ''}>${s.label}</option>
                `).join('')}
              </select>
            </td>

            <td class="py-3 px-3 text-militar-600 font-medium">
              ${U.fmtNum(p.views || 0)}
            </td>

            <td class="py-3 px-3">
              <div class="flex items-center gap-2">
                <div class="w-14 h-2 bg-beige-200 rounded-full overflow-hidden">
                  <div class="h-full ${comp.score >= 80 ? 'bg-emerald-600' : comp.score >= 50 ? 'bg-oro-500' : 'bg-red-500'}" style="width: ${comp.score}%"></div>
                </div>
                <span class="text-[11px] font-bold text-militar-700">${comp.score}%</span>
              </div>
            </td>

            <td class="py-3 px-4 text-right whitespace-nowrap">
              <div class="flex items-center justify-end gap-1">
                <a href="#/asesor/inmuebles/editar/${p.id}" class="icon-btn" title="Editar inmueble completo">
                  ${I('edit', 'w-4 h-4')}
                </a>
                <button type="button" class="icon-btn text-militar-600 hover:text-oro-700" data-duplicate-id="${p.id}" title="Duplicar como borrador">
                  ${I('copy', 'w-4 h-4')}
                </button>
                <a href="#/propiedad/${p.id}" target="_blank" class="icon-btn text-militar-600 hover:text-militar-950" title="Ver ficha pública">
                  ${I('eye', 'w-4 h-4')}
                </a>
                <button type="button" class="icon-btn text-militar-400 hover:text-red-600" data-delete-id="${p.id}" title="Eliminar inmueble">
                  ${I('trash', 'w-4 h-4')}
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Filtro por pestañas de estatus
    root.querySelectorAll('#status-tabs button').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentStatus = btn.dataset.status;
        root.querySelectorAll('#status-tabs button').forEach((b) => {
          b.className = `btn btn-sm rounded-full ${b === btn ? 'btn-primary' : 'btn-ghost'} text-xs`;
        });
        renderRows();
      });
    });

    // Búsqueda en vivo
    searchInput?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderRows();
    });

    // Delegación de eventos en tabla (cambio de estatus, duplicar, eliminar)
    tbody.addEventListener('change', (e) => {
      const sel = e.target.closest('.status-quick-change');
      if (!sel) return;
      const pid = sel.dataset.propId;
      const newStatus = sel.value;
      PL.store.properties.update(pid, { status: newStatus });
      PL.ui.toast(`Estatus actualizado a: ${C.status(newStatus).label}`);
      renderRows();
    });

    tbody.addEventListener('click', async (e) => {
      const dupBtn = e.target.closest('[data-duplicate-id]');
      if (dupBtn) {
        const pid = dupBtn.dataset.duplicateId;
        const copy = PL.store.properties.duplicate(pid);
        if (copy) {
          PL.ui.toast(`Inmueble duplicado como borrador: ${copy.code}`);
          renderRows();
        }
        return;
      }

      const delBtn = e.target.closest('[data-delete-id]');
      if (delBtn) {
        const pid = delBtn.dataset.deleteId;
        const p = PL.store.properties.get(pid);
        const ok = await PL.ui.confirm({
          title: `¿Eliminar ${p?.code || 'inmueble'}?`,
          message: 'Esta acción no se puede deshacer. Se eliminarán los datos y archivos asociados.',
          confirmText: 'Sí, eliminar',
          danger: true,
        });
        if (ok) {
          PL.store.properties.remove(pid);
          PL.ui.toast('Inmueble eliminado con éxito');
          renderRows();
        }
      }
    });

    renderRows();
  }

  return {
    title: 'Mis Inmuebles | ProLíder Backoffice',
    layout: 'admin',
    guard: 'advisor',
    render,
    mount,
  };
})();

