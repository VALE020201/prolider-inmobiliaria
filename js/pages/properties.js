/**
 * ProLider - Catálogo Completo de Propiedades
 * ---------------------------------------------------------------
 * - Filtros avanzados en tiempo real (Operación, Tipo, Ubicación, Precio, etc.)
 * - Vista en cuadrícula o lista
 * - Píldoras de filtros activos removibles
 * - Panel lateral deslizable (drawer) en móvil
 */
window.PL = window.PL || {};
PL.pages = PL.pages || {};

PL.pages.properties = (() => {
  const U = PL.utils;
  const C = PL.catalogs;
  const I = PL.icon;

  function render(ctx) {
    const q = ctx.query;
    const op = q.op || '';
    const munis = PL.store.properties.municipalities();

    return `
      <div class="bg-beige-100/50 min-h-screen py-8 md:py-12">
        <div class="container-x">
          <!-- CABECERA Y MIGAS -->
          <div class="mb-6">
            <nav class="text-xs text-militar-500 flex items-center gap-2 mb-2">
              <a href="#/" class="hover:text-oro-700">Inicio</a>
              <span>/</span>
              <span class="text-militar-900 font-medium">Propiedades</span>
              ${op ? `<span>/</span><span class="capitalize text-oro-700">${op}</span>` : ''}
            </nav>
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 class="font-display text-3xl sm:text-4xl text-militar-950 font-semibold">
                  Catálogo de Inmuebles
                </h1>
                <p class="text-militar-600 text-sm mt-1" id="results-count-text">
                  Cargando propiedades...
                </p>
              </div>

              <!-- CONTROLES DE VISTA Y ORDEN (ESCRITORIO) -->
              <div class="flex items-center gap-3">
                <button type="button" class="lg:hidden btn btn-sm btn-outline flex items-center gap-2" id="btn-toggle-filters">
                  ${I('filter', 'w-4 h-4')} Filtros <span class="badge badge-gold px-1.5 py-0.5 text-[10px]" id="filter-badge">0</span>
                </button>

                <div class="hidden sm:flex items-center gap-1.5 text-xs text-militar-600">
                  <span>Ordenar por:</span>
                  <select id="sort-select" class="input input-sm py-1 pl-2 pr-7 text-xs bg-white rounded-lg">
                    <option value="featured" ${q.sort === 'featured' ? 'selected' : ''}>Destacados</option>
                    <option value="recent" ${q.sort === 'recent' ? 'selected' : ''}>Más recientes</option>
                    <option value="price_asc" ${q.sort === 'price_asc' ? 'selected' : ''}>Menor precio</option>
                    <option value="price_desc" ${q.sort === 'price_desc' ? 'selected' : ''}>Mayor precio</option>
                    <option value="area_desc" ${q.sort === 'area_desc' ? 'selected' : ''}>Mayor metraje</option>
                  </select>
                </div>

                <div class="hidden sm:flex p-1 bg-beige-200/60 rounded-xl" id="view-mode-toggle">
                  <button type="button" data-view="grid" class="p-1.5 rounded-lg text-militar-900 bg-white shadow-sm" title="Vista en cuadrícula">
                    ${I('grid', 'w-4 h-4')}
                  </button>
                  <button type="button" data-view="list" class="p-1.5 rounded-lg text-militar-600 hover:text-militar-900" title="Vista en lista">
                    ${I('list', 'w-4 h-4')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- BARRA DE OPERACIONES RÁPIDAS -->
          <div class="flex items-center gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar border-b border-beige-200">
            <button type="button" data-op-filter="" class="btn btn-sm rounded-full ${!op ? 'btn-primary' : 'btn-outline'} text-xs">
              Todas las operaciones
            </button>
            <button type="button" data-op-filter="venta" class="btn btn-sm rounded-full ${op === 'venta' ? 'btn-primary' : 'btn-outline'} text-xs">
              En Venta
            </button>
            <button type="button" data-op-filter="alquiler" class="btn btn-sm rounded-full ${op === 'alquiler' ? 'btn-primary' : 'btn-outline'} text-xs">
              En Alquiler
            </button>
          </div>

          <!-- CHIPS DE FILTROS ACTIVOS -->
          <div id="active-filters-bar" class="flex flex-wrap items-center gap-2 mb-6 hidden">
            <span class="text-xs text-militar-500 font-medium mr-1">Filtros aplicados:</span>
            <div id="chips-container" class="flex flex-wrap gap-1.5"></div>
            <button type="button" id="btn-clear-all" class="text-xs text-oro-700 hover:text-oro-800 font-semibold ml-2 underline">
              Limpiar todo
            </button>
          </div>

          <!-- LAYOUT PRINCIPAL: SIDEBAR + GRID -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <!-- SIDEBAR DE FILTROS (ESCRITORIO & MÓVIL DRAWER) -->
            <aside id="filters-sidebar" class="filters-drawer lg:block lg:col-span-3 bg-white p-6 rounded-3xl border border-beige-200 shadow-sm space-y-6">
              <div class="flex items-center justify-between pb-3 border-b border-beige-200 lg:hidden">
                <h3 class="font-display text-xl text-militar-950 font-semibold">Filtros de búsqueda</h3>
                <button type="button" class="icon-btn" id="btn-close-filters">${I('x')}</button>
              </div>

              <!-- Búsqueda por palabra clave o código -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-militar-700 mb-2">Buscar</label>
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-militar-400">${I('search', 'w-4 h-4')}</span>
                  <input type="text" id="filter-q" value="${U.esc(q.q || '')}" placeholder="Código, sector, urbanización..."
                         class="input input-sm pl-9 pr-3 w-full bg-beige-50 rounded-xl text-xs sm:text-sm">
                </div>
              </div>

              <!-- Tipo de Inmueble -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-militar-700 mb-2">Tipo de Propiedad</label>
                <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1 no-scrollbar text-xs">
                  ${C.types.map((t) => `
                    <label class="flex items-center gap-2 cursor-pointer hover:text-oro-700 py-0.5">
                      <input type="checkbox" name="type" value="${t.key}" class="checkbox"
                             ${(q.type || '').split(',').includes(t.key) ? 'checked' : ''}>
                      <span>${t.label}</span>
                    </label>
                  `).join('')}
                </div>
              </div>

              <!-- Municipio -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-militar-700 mb-2">Municipio</label>
                <select id="filter-muni" class="input input-sm w-full bg-beige-50 rounded-xl text-xs sm:text-sm">
                  <option value="">Todos los municipios</option>
                  ${munis.map((m) => `<option value="${U.esc(m)}" ${q.municipality === m ? 'selected' : ''}>${U.esc(m)}</option>`).join('')}
                </select>
              </div>

              <!-- Rango de Precio -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-militar-700 mb-2">Precio (USD)</label>
                <div class="grid grid-cols-2 gap-2">
                  <input type="number" id="filter-min-price" value="${U.esc(q.minPrice || '')}" placeholder="Mín."
                         class="input input-sm bg-beige-50 rounded-xl text-xs">
                  <input type="number" id="filter-max-price" value="${U.esc(q.maxPrice || '')}" placeholder="Máx."
                         class="input input-sm bg-beige-50 rounded-xl text-xs">
                </div>
              </div>

              <!-- Habitaciones y Baños -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-militar-700 mb-2">Habitaciones</label>
                  <select id="filter-beds" class="input input-sm w-full bg-beige-50 rounded-xl text-xs">
                    <option value="">Cualquiera</option>
                    <option value="1" ${q.beds === '1' ? 'selected' : ''}>1+</option>
                    <option value="2" ${q.beds === '2' ? 'selected' : ''}>2+</option>
                    <option value="3" ${q.beds === '3' ? 'selected' : ''}>3+</option>
                    <option value="4" ${q.beds === '4' ? 'selected' : ''}>4+</option>
                    <option value="5" ${q.beds === '5' ? 'selected' : ''}>5+</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-militar-700 mb-2">Baños</label>
                  <select id="filter-baths" class="input input-sm w-full bg-beige-50 rounded-xl text-xs">
                    <option value="">Cualquiera</option>
                    <option value="1" ${q.baths === '1' ? 'selected' : ''}>1+</option>
                    <option value="2" ${q.baths === '2' ? 'selected' : ''}>2+</option>
                    <option value="3" ${q.baths === '3' ? 'selected' : ''}>3+</option>
                    <option value="4" ${q.baths === '4' ? 'selected' : ''}>4+</option>
                  </select>
                </div>
              </div>

              <!-- Puestos de Estacionamiento -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-militar-700 mb-2">Estacionamiento</label>
                <select id="filter-parking" class="input input-sm w-full bg-beige-50 rounded-xl text-xs">
                  <option value="">Cualquiera</option>
                  <option value="1" ${q.parking === '1' ? 'selected' : ''}>1+ puesto</option>
                  <option value="2" ${q.parking === '2' ? 'selected' : ''}>2+ puestos</option>
                  <option value="3" ${q.parking === '3' ? 'selected' : ''}>3+ puestos</option>
                </select>
              </div>

              <!-- Amenidades populares -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-militar-700 mb-2">Amenidades clave</label>
                <div class="space-y-1.5 text-xs">
                  ${C.popularAmenities.map((a) => `
                    <label class="flex items-center gap-2 cursor-pointer hover:text-oro-700 py-0.5">
                      <input type="checkbox" name="amenity" value="${a}" class="checkbox"
                             ${(q.amenities || '').split(',').includes(a) ? 'checked' : ''}>
                      <span>${a}</span>
                    </label>
                  `).join('')}
                </div>
              </div>

              <div class="pt-2">
                <button type="button" id="btn-apply-filters" class="btn btn-primary w-full justify-center text-xs py-2.5 rounded-xl shadow-gold">
                  Aplicar filtros
                </button>
              </div>
            </aside>

            <!-- CONTENEDOR DE RESULTADOS -->
            <main class="lg:col-span-9">
              <div id="properties-grid" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <!-- Se llena dinámicamente con JS -->
              </div>
              <div id="properties-empty" class="hidden">
                <!-- Estado vacío -->
              </div>
            </main>
          </div>
        </div>
      </div>
    `;
  }

  function mount(root, ctx) {
    let currentFilters = { ...ctx.query };
    let currentView = 'grid';

    const gridEl = root.querySelector('#properties-grid');
    const emptyEl = root.querySelector('#properties-empty');
    const countEl = root.querySelector('#results-count-text');
    const badgeEl = root.querySelector('#filter-badge');
    const chipsBar = root.querySelector('#active-filters-bar');
    const chipsContainer = root.querySelector('#chips-container');
    const sidebar = root.querySelector('#filters-sidebar');

    function renderActiveChips() {
      const chips = [];
      if (currentFilters.op) chips.push({ k: 'op', label: `Operación: ${C.operation(currentFilters.op).label}` });
      if (currentFilters.type) {
        currentFilters.type.split(',').forEach((t) => {
          chips.push({ k: 'type', v: t, label: C.type(t).label });
        });
      }
      if (currentFilters.municipality) chips.push({ k: 'municipality', label: currentFilters.municipality });
      if (currentFilters.maxPrice) chips.push({ k: 'maxPrice', label: `Hasta $${U.fmtNum(currentFilters.maxPrice)}` });
      if (currentFilters.minPrice) chips.push({ k: 'minPrice', label: `Desde $${U.fmtNum(currentFilters.minPrice)}` });
      if (currentFilters.beds) chips.push({ k: 'beds', label: `${currentFilters.beds}+ hab.` });
      if (currentFilters.baths) chips.push({ k: 'baths', label: `${currentFilters.baths}+ baños` });
      if (currentFilters.parking) chips.push({ k: 'parking', label: `${currentFilters.parking}+ puestos` });
      if (currentFilters.amenities) {
        currentFilters.amenities.split(',').forEach((a) => chips.push({ k: 'amenities', v: a, label: a }));
      }
      if (currentFilters.q) chips.push({ k: 'q', label: `"${currentFilters.q}"` });

      badgeEl.textContent = chips.length;

      if (!chips.length) {
        chipsBar.classList.add('hidden');
        return;
      }

      chipsBar.classList.remove('hidden');
      chipsContainer.innerHTML = chips.map((c) => `
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-beige-200 text-militar-900">
          ${U.esc(c.label)}
          <button type="button" data-remove-chip="${c.k}" data-val="${c.v || ''}" class="hover:text-red-600">${I('x', 'w-3 h-3')}</button>
        </span>
      `).join('');
    }

    function executeSearch() {
      renderActiveChips();
      PL.router.replaceQuery('/propiedades', U.toQuery(currentFilters));

      const results = PL.store.properties.search(currentFilters);
      countEl.textContent = `Mostrando ${results.length} propiedad${results.length === 1 ? '' : 'es'} disponible${results.length === 1 ? '' : 's'}`;

      if (!results.length) {
        gridEl.innerHTML = '';
        emptyEl.classList.remove('hidden');
        emptyEl.innerHTML = PL.ui.empty(
          'search',
          'No encontramos inmuebles con esos filtros',
          'Intenta ampliar tu rango de búsqueda, cambiar de municipio o quitar algunos filtros de amenidades.',
          '<button type="button" id="btn-empty-clear" class="btn btn-outline">Restablecer filtros</button>'
        );
        root.querySelector('#btn-empty-clear')?.addEventListener('click', resetFilters);
        return;
      }

      emptyEl.classList.add('hidden');
      if (currentView === 'grid') {
        gridEl.className = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6';
        gridEl.innerHTML = results.map((p) => PL.cards.propertyCard(p)).join('');
      } else {
        gridEl.className = 'flex flex-col gap-4';
        gridEl.innerHTML = results.map((p) => PL.cards.propertyCard(p)).join('');
      }
    }

    function resetFilters() {
      currentFilters = {};
      root.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
      root.querySelectorAll('select').forEach((s) => (s.value = ''));
      root.querySelector('#filter-q').value = '';
      executeSearch();
    }

    // Toggle Mobile Drawer
    root.querySelector('#btn-toggle-filters')?.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
    root.querySelector('#btn-close-filters')?.addEventListener('click', () => {
      sidebar.classList.remove('open');
    });

    // Pestañas rápidas de operación
    root.querySelectorAll('[data-op-filter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentFilters.op = btn.dataset.opFilter;
        root.querySelectorAll('[data-op-filter]').forEach((b) => {
          b.className = `btn btn-sm rounded-full ${b === btn ? 'btn-primary' : 'btn-outline'} text-xs`;
        });
        executeSearch();
      });
    });

    // Cambio de ordenamiento
    root.querySelector('#sort-select')?.addEventListener('change', (e) => {
      currentFilters.sort = e.target.value;
      executeSearch();
    });

    // Vista cuadrícula / lista
    root.querySelectorAll('#view-mode-toggle button').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentView = btn.dataset.view;
        root.querySelectorAll('#view-mode-toggle button').forEach((b) => {
          b.className = `p-1.5 rounded-lg ${b === btn ? 'text-militar-900 bg-white shadow-sm' : 'text-militar-600 hover:text-militar-900'}`;
        });
        executeSearch();
      });
    });

    // Aplicar filtros desde el formulario lateral
    function collectSidebarFilters() {
      currentFilters.q = root.querySelector('#filter-q').value.trim();
      currentFilters.municipality = root.querySelector('#filter-muni').value;
      currentFilters.minPrice = root.querySelector('#filter-min-price').value;
      currentFilters.maxPrice = root.querySelector('#filter-max-price').value;
      currentFilters.beds = root.querySelector('#filter-beds').value;
      currentFilters.baths = root.querySelector('#filter-baths').value;
      currentFilters.parking = root.querySelector('#filter-parking').value;

      const checkedTypes = Array.from(root.querySelectorAll('input[name="type"]:checked')).map((c) => c.value);
      currentFilters.type = checkedTypes.join(',');

      const checkedAmen = Array.from(root.querySelectorAll('input[name="amenity"]:checked')).map((c) => c.value);
      currentFilters.amenities = checkedAmen.join(',');

      sidebar.classList.remove('open');
      executeSearch();
    }

    root.querySelector('#btn-apply-filters')?.addEventListener('click', collectSidebarFilters);
    root.querySelector('#filter-q')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') collectSidebarFilters();
    });

    // Limpiar todos los filtros
    root.querySelector('#btn-clear-all')?.addEventListener('click', resetFilters);

    // Remover chip individual
    chipsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-remove-chip]');
      if (!btn) return;
      const k = btn.dataset.removeChip;
      const v = btn.dataset.val;

      if (k === 'type' && v) {
        const types = (currentFilters.type || '').split(',').filter((x) => x !== v);
        currentFilters.type = types.join(',');
        const cb = root.querySelector(`input[name="type"][value="${v}"]`);
        if (cb) cb.checked = false;
      } else if (k === 'amenities' && v) {
        const ams = (currentFilters.amenities || '').split(',').filter((x) => x !== v);
        currentFilters.amenities = ams.join(',');
        const cb = root.querySelector(`input[name="amenity"][value="${v}"]`);
        if (cb) cb.checked = false;
      } else {
        delete currentFilters[k];
        if (k === 'q') root.querySelector('#filter-q').value = '';
        if (k === 'municipality') root.querySelector('#filter-muni').value = '';
        if (k === 'minPrice') root.querySelector('#filter-min-price').value = '';
        if (k === 'maxPrice') root.querySelector('#filter-max-price').value = '';
        if (k === 'beds') root.querySelector('#filter-beds').value = '';
        if (k === 'baths') root.querySelector('#filter-baths').value = '';
        if (k === 'parking') root.querySelector('#filter-parking').value = '';
      }

      executeSearch();
    });

    // Delegación de botón de favoritos
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

    executeSearch();
  }

  return {
    title: 'Catálogo de Inmuebles | ProLíder Inmobiliaria',
    layout: 'public',
    render,
    mount,
  };
})();

