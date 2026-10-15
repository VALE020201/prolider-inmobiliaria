/**
 * ProLider - Página de Inicio (Home)
 * ---------------------------------------------------------------
 * - Hero elegante con buscador avanzado:
 *   * Selector de Operación (Venta / Alquiler)
 *   * Selector rápido de Tipo (Casa, Penthouse, Townhouse, Apartamento, etc.)
 *   * Filtros por ubicación, rango de precio, habitaciones y baños
 * - Cuadrícula de propiedades destacadas
 * - Sección "Nuestros Asesores" con contacto directo
 * - Módulo interactivo de Cotización Automática
 * - Captación de inmuebles ("Vende o Alquila con ProLíder")
 */
window.PL = window.PL || {};
PL.pages = PL.pages || {};

PL.pages.home = (() => {
  const U = PL.utils;
  const C = PL.catalogs;
  const I = PL.icon;

  function render(ctx) {
    const featured = PL.store.properties.public().filter((p) => p.featured).slice(0, 6);
    const recent = PL.store.properties.public().slice(0, 6);
    const advisors = PL.store.advisors.public().slice(0, 4);
    const munis = PL.store.properties.municipalities();

    return `
      <!-- HERO PRINCIPAL -->
      <section class="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 bg-militar-950 text-beige-100 overflow-hidden">
        <!-- Fondo cinematográfico con overlay de lujo -->
        <div class="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80"
               alt="Residencia de lujo" class="w-full h-full object-cover object-center filter brightness-[0.38] contrast-[1.08] scale-105 animate-subtle-zoom">
          <div class="absolute inset-0 bg-gradient-to-t from-militar-950 via-militar-950/60 to-militar-950/80"></div>
          <div class="absolute inset-0 bg-pattern opacity-[0.05]"></div>
        </div>

        <div class="container-x relative z-10 max-w-5xl text-center">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-militar-900/80 border border-oro-500/40 text-oro-300 text-xs uppercase tracking-[0.25em] font-medium mb-6 backdrop-blur-md shadow-lg">
            ${I('award', 'w-4 h-4 text-oro-400')} Asesoría Inmobiliaria de Alto Nivel
          </div>

          <h1 class="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] text-beige-50 max-w-4xl mx-auto drop-shadow-md">
            Encuentra el hogar que <span class="text-gradient-gold">define tu estilo</span> de vida
          </h1>

          <p class="mt-5 text-base sm:text-lg md:text-xl text-beige-200/90 max-w-2xl mx-auto font-light leading-relaxed">
            Propiedades exclusivas en Valencia y Carabobo. Respaldadas por asesores certificados y procesos transparentes.
          </p>

          <!-- BUSCADOR AVANZADO INTEGRADO -->
          <div class="mt-10 max-w-4xl mx-auto bg-white/95 backdrop-blur-xl p-4 sm:p-6 rounded-3xl shadow-2xl border border-beige-300 text-left transition-all duration-300 hover:border-oro-400/50">
            <!-- PESTAÑAS DE OPERACIÓN -->
            <div class="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-beige-200">
              <div class="flex p-1 bg-beige-100 rounded-2xl gap-1" id="hero-op-tabs">
                <button type="button" data-op="venta" class="btn btn-sm rounded-xl px-5 py-2 font-medium transition-all duration-200 bg-militar-900 text-beige-50 shadow">
                  Comprar
                </button>
                <button type="button" data-op="alquiler" class="btn btn-sm rounded-xl px-5 py-2 font-medium transition-all duration-200 text-militar-800 hover:text-militar-950">
                  Alquilar
                </button>
              </div>

              <div class="text-xs text-militar-500 flex items-center gap-1.5">
                ${I('sparkles', 'w-4 h-4 text-oro-600')} <span class="font-semibold text-militar-900">${PL.store.properties.public().length}</span> inmuebles disponibles hoy
              </div>
            </div>

            <!-- FILTRO RÁPIDO DE TIPO (Botones píldora) -->
            <div class="py-3 flex items-center gap-2 overflow-x-auto no-scrollbar" id="hero-type-pills">
              <button type="button" data-type="" class="chip-type active text-xs whitespace-nowrap">Todos</button>
              ${C.quickTypes.map((k) => {
                const t = C.type(k);
                return `<button type="button" data-type="${k}" class="chip-type text-xs whitespace-nowrap flex items-center gap-1.5">${I(t.icon, 'w-3.5 h-3.5')} ${t.label}</button>`;
              }).join('')}
            </div>

            <!-- CAMPOS DEL BUSCADOR -->
            <form id="hero-search-form" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
              <!-- Ubicación / Municipio -->
              <div class="relative">
                <label class="block text-[11px] font-semibold uppercase tracking-wider text-militar-600 mb-1">Ubicación</label>
                <div class="relative flex items-center">
                  <span class="absolute left-3 text-oro-600 pointer-events-none">${I('pin', 'w-4 h-4')}</span>
                  <select name="municipality" class="input input-sm pl-9 pr-8 bg-beige-50 text-militar-900 w-full appearance-none rounded-xl text-xs sm:text-sm font-medium">
                    <option value="">Todos los municipios</option>
                    ${munis.map((m) => `<option value="${U.esc(m)}">${U.esc(m)}</option>`).join('')}
                  </select>
                  <span class="absolute right-3 text-militar-400 pointer-events-none">${I('chevronDown', 'w-3.5 h-3.5')}</span>
                </div>
              </div>

              <!-- Rango de Precio -->
              <div class="relative">
                <label class="block text-[11px] font-semibold uppercase tracking-wider text-militar-600 mb-1">Presupuesto máx.</label>
                <div class="relative flex items-center">
                  <span class="absolute left-3 text-oro-600 pointer-events-none">${I('dollar', 'w-4 h-4')}</span>
                  <select name="maxPrice" class="input input-sm pl-9 pr-8 bg-beige-50 text-militar-900 w-full appearance-none rounded-xl text-xs sm:text-sm font-medium">
                    <option value="">Cualquier precio</option>
                    <option value="30000">Hasta $30.000</option>
                    <option value="50000">Hasta $50.000</option>
                    <option value="80000">Hasta $80.000</option>
                    <option value="120000">Hasta $120.000</option>
                    <option value="200000">Hasta $200.000</option>
                    <option value="350000">Hasta $350.000</option>
                    <option value="500000">Hasta $500.000</option>
                  </select>
                  <span class="absolute right-3 text-militar-400 pointer-events-none">${I('chevronDown', 'w-3.5 h-3.5')}</span>
                </div>
              </div>

              <!-- Habitaciones -->
              <div class="relative">
                <label class="block text-[11px] font-semibold uppercase tracking-wider text-militar-600 mb-1">Habitaciones</label>
                <div class="relative flex items-center">
                  <span class="absolute left-3 text-oro-600 pointer-events-none">${I('bed', 'w-4 h-4')}</span>
                  <select name="beds" class="input input-sm pl-9 pr-8 bg-beige-50 text-militar-900 w-full appearance-none rounded-xl text-xs sm:text-sm font-medium">
                    <option value="">Cualquier cantidad</option>
                    <option value="1">1+ hab.</option>
                    <option value="2">2+ habs.</option>
                    <option value="3">3+ habs.</option>
                    <option value="4">4+ habs.</option>
                  </select>
                  <span class="absolute right-3 text-militar-400 pointer-events-none">${I('chevronDown', 'w-3.5 h-3.5')}</span>
                </div>
              </div>

              <!-- Botón Buscar -->
              <div class="flex items-end">
                <button type="submit" class="btn btn-primary w-full justify-center py-2.5 rounded-xl shadow-gold hover:shadow-lg transition-all duration-200">
                  ${I('search', 'w-4 h-4')} Buscar inmuebles
                </button>
              </div>
            </form>
          </div>

          <!-- Menciones de confianza -->
          <div class="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs sm:text-sm text-beige-300/80">
            <div class="flex items-center gap-2">${I('shield', 'w-4 h-4 text-oro-400')} Documentación 100% verificada</div>
            <div class="flex items-center gap-2">${I('handshake', 'w-4 h-4 text-oro-400')} Negociación transparente y formal</div>
            <div class="flex items-center gap-2">${I('users', 'w-4 h-4 text-oro-400')} +20 asesores en Carabobo</div>
          </div>
        </div>
      </section>

      <!-- PROPIEDADES DESTACADAS -->
      <section class="py-20 bg-beige-50 border-b border-beige-200">
        <div class="container-x">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span class="text-xs font-bold uppercase tracking-[0.25em] text-oro-700">Selección Exclusiva</span>
              <h2 class="font-display text-3xl sm:text-4xl text-militar-950 mt-1">Propiedades Destacadas</h2>
              <p class="text-militar-600 mt-2 max-w-xl text-sm sm:text-base">Inmuebles que destacan por ubicación estratégica, acabados premium y precio competitivo.</p>
            </div>
            <a href="#/propiedades" class="btn btn-outline self-start md:self-auto flex items-center gap-2">
              Ver todo el catálogo ${I('arrowRight', 'w-4 h-4')}
            </a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${featured.map((p) => PL.cards.propertyCard(p)).join('')}
          </div>
        </div>
      </section>

      <!-- MÓDULO DE COTIZACIÓN AUTOMÁTICA (Teaser interactivo en Home) -->
      <section class="py-20 bg-militar-900 text-beige-100 relative overflow-hidden">
        <div class="absolute inset-0 bg-pattern opacity-[0.04]"></div>
        <div class="container-x relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div class="lg:col-span-5 space-y-5">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-oro-500/20 text-oro-300 text-xs font-semibold tracking-wider uppercase">
              ${I('calculator', 'w-4 h-4')} Herramienta Financiera
            </div>
            <h2 class="font-display text-3xl sm:text-4xl text-beige-50 leading-tight">
              Calcula tu inversión y plan de pagos al instante
            </h2>
            <p class="text-beige-300/80 text-sm sm:text-base leading-relaxed">
              Utiliza nuestro cotizador automatizado para estimar cuotas mensuales, iniciales y proyección de amortización en minutos.
            </p>
            <ul class="space-y-3 text-sm text-beige-200">
              <li class="flex items-center gap-2.5">${I('checkCircle', 'w-4 h-4 text-oro-400')} Cuota inicial ajustable (20% al 50%)</li>
              <li class="flex items-center gap-2.5">${I('checkCircle', 'w-4 h-4 text-oro-400')} Simulación de financiamiento a 12, 24, 36 o 60 meses</li>
              <li class="flex items-center gap-2.5">${I('checkCircle', 'w-4 h-4 text-oro-400')} Comparativa de compra de contado vs. cuotas</li>
            </ul>
            <div class="pt-2">
              <a href="#/cotizador" class="btn btn-gold shadow-gold">${I('calculator', 'w-4 h-4')} Abrir cotizador completo</a>
            </div>
          </div>

          <!-- MINI SIMULADOR INTERACTIVO -->
          <div class="lg:col-span-7 bg-militar-950/80 p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md">
            <h3 class="font-display text-2xl text-beige-100 mb-6 flex items-center justify-between">
              Simulador Rápido <span class="text-xs font-sans text-oro-400 bg-oro-950/80 border border-oro-800 px-3 py-1 rounded-full">Tiempo Real</span>
            </h3>

            <div class="space-y-5" id="home-calc-widget">
              <div>
                <div class="flex justify-between text-xs text-beige-300 mb-1">
                  <span>Valor del inmueble</span>
                  <span class="font-bold text-oro-300 text-sm" id="calc-val-display">$ 75.000</span>
                </div>
                <input type="range" id="calc-price" min="20000" max="400000" step="5000" value="75000" class="w-full accent-oro-500 cursor-pointer">
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="flex justify-between text-xs text-beige-300 mb-1">
                    <span>Inicial (30%)</span>
                    <span class="font-bold text-beige-100" id="calc-down-display">$ 22.500</span>
                  </div>
                  <input type="range" id="calc-down-pct" min="15" max="60" step="5" value="30" class="w-full accent-oro-500 cursor-pointer">
                </div>

                <div>
                  <div class="flex justify-between text-xs text-beige-300 mb-1">
                    <span>Plazo de pago</span>
                    <span class="font-bold text-beige-100" id="calc-term-display">24 meses</span>
                  </div>
                  <input type="range" id="calc-term" min="12" max="60" step="12" value="24" class="w-full accent-oro-500 cursor-pointer">
                </div>
              </div>

              <!-- RESULTADOS EN TIEMPO REAL -->
              <div class="pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-center">
                <div class="p-4 bg-militar-900 rounded-2xl border border-white/5">
                  <span class="block text-xs uppercase tracking-wider text-beige-400">Cuota mensual estimada</span>
                  <strong class="font-display text-2xl sm:text-3xl text-oro-400 mt-1 block" id="calc-monthly">$ 2.187</strong>
                </div>
                <div class="p-4 bg-militar-900 rounded-2xl border border-white/5">
                  <span class="block text-xs uppercase tracking-wider text-beige-400">Saldo a financiar</span>
                  <strong class="font-display text-2xl sm:text-3xl text-beige-100 mt-1 block" id="calc-balance">$ 52.500</strong>
                </div>
              </div>

              <div class="text-center pt-2">
                <button type="button" id="btn-quote-advisor" class="btn btn-outline-light w-full justify-center">
                  Consultar financiamiento con un asesor
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SECCIÓN NUESTROS ASESORES -->
      <section class="py-20 bg-beige-100/60 border-b border-beige-200">
        <div class="container-x">
          <div class="text-center max-w-2xl mx-auto mb-14">
            <span class="text-xs font-bold uppercase tracking-[0.25em] text-oro-700">Equipo Profesional</span>
            <h2 class="font-display text-3xl sm:text-4xl text-militar-950 mt-1">Nuestros Asesores</h2>
            <p class="text-militar-600 mt-3 text-sm sm:text-base">Profesionales inmobiliarios comprometidos en brindarte una experiencia segura, ágil y de máxima confianza.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            ${advisors.map((a) => PL.cards.advisorCard(a)).join('')}
          </div>

          <div class="text-center mt-12">
            <a href="#/asesores" class="btn btn-outline">
              Conocer a todo el equipo (${PL.store.advisors.public().length} asesores) ${I('arrowRight', 'w-4 h-4')}
            </a>
          </div>
        </div>
      </section>

      <!-- CAPTACIÓN DE INMUEBLES ("Vende tu Inmueble") -->
      <section id="publicar" class="py-20 bg-beige-50">
        <div class="container-x">
          <div class="bg-gradient-to-br from-militar-900 via-militar-950 to-militar-900 rounded-3xl p-8 sm:p-12 lg:p-16 text-beige-100 shadow-2xl relative overflow-hidden">
            <div class="absolute inset-0 bg-pattern opacity-[0.05]"></div>
            <div class="relative grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div class="lg:col-span-6 space-y-4">
                <span class="text-xs font-bold uppercase tracking-[0.25em] text-oro-400">¿Deseas vender o alquilar?</span>
                <h2 class="font-display text-3xl sm:text-4xl lg:text-5xl text-beige-50 leading-tight">
                  Publica tu propiedad con los líderes del mercado
                </h2>
                <p class="text-beige-300 text-sm sm:text-base leading-relaxed">
                  Conectamos tu inmueble con compradores calificados, difusión fotográfica profesional y asesoría legal completa de principio a fin.
                </p>
                <div class="grid grid-cols-2 gap-4 pt-3 text-sm text-beige-200">
                  <div class="flex items-center gap-2">${I('checkCircle', 'w-4 h-4 text-oro-400')} Avalúo y precio de mercado</div>
                  <div class="flex items-center gap-2">${I('checkCircle', 'w-4 h-4 text-oro-400')} Publicidad de alto alcance</div>
                  <div class="flex items-center gap-2">${I('checkCircle', 'w-4 h-4 text-oro-400')} Filtrado de prospectos</div>
                  <div class="flex items-center gap-2">${I('checkCircle', 'w-4 h-4 text-oro-400')} Trámites legales y registro</div>
                </div>
              </div>

              <!-- FORMULARIO RÁPIDO DE CONTACTO / CAPTACIÓN -->
              <div class="lg:col-span-6 bg-white rounded-2xl p-6 sm:p-8 text-militar-900 shadow-xl">
                <h3 class="font-display text-2xl text-militar-950 mb-1">Registra tu inmueble</h3>
                <p class="text-xs text-militar-600 mb-5">Uno de nuestros asesores especializados te contactará hoy mismo.</p>
                <form id="lead-form" class="space-y-3.5">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="field">
                      <label class="field-label">Nombre y Apellido</label>
                      <input type="text" name="name" required class="input input-sm" placeholder="Ej. Roberto Gómez">
                    </div>
                    <div class="field">
                      <label class="field-label">Teléfono (WhatsApp)</label>
                      <input type="tel" name="phone" required class="input input-sm" placeholder="Ej. 0414-1234567">
                    </div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="field">
                      <label class="field-label">Tipo de Operación</label>
                      <select name="operation" class="input input-sm">
                        <option value="venta">Deseo Vender</option>
                        <option value="alquiler">Deseo Alquilar</option>
                      </select>
                    </div>
                    <div class="field">
                      <label class="field-label">Tipo de Inmueble</label>
                      <select name="type" class="input input-sm">
                        ${C.types.map((t) => `<option value="${t.key}">${t.label}</option>`).join('')}
                      </select>
                    </div>
                  </div>
                  <div class="field">
                    <label class="field-label">Ubicación aproximada</label>
                    <input type="text" name="location" class="input input-sm" placeholder="Ej. Urbanización Valle de Oro, San Diego">
                  </div>
                  <button type="submit" class="btn btn-primary w-full justify-center py-3 shadow-gold text-sm font-semibold">
                    ${I('send', 'w-4 h-4')} Solicitar asesoría de captación
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function mount(root) {
    let currentOp = 'venta';
    let currentType = '';

    // Selector de Operación (Venta / Alquiler)
    const tabs = root.querySelectorAll('#hero-op-tabs button');
    tabs.forEach((b) => {
      b.addEventListener('click', () => {
        tabs.forEach((t) => {
          t.className = 'btn btn-sm rounded-xl px-5 py-2 font-medium transition-all duration-200 text-militar-800 hover:text-militar-950';
        });
        b.className = 'btn btn-sm rounded-xl px-5 py-2 font-medium transition-all duration-200 bg-militar-900 text-beige-50 shadow';
        currentOp = b.dataset.op;
      });
    });

    // Filtros rápidos de Tipo
    const pills = root.querySelectorAll('#hero-type-pills button');
    pills.forEach((p) => {
      p.addEventListener('click', () => {
        pills.forEach((x) => x.classList.remove('active'));
        p.classList.add('active');
        currentType = p.dataset.type;
      });
    });

    // Envío del buscador del Hero
    const form = root.querySelector('#hero-search-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const q = {
        op: currentOp,
        type: currentType,
        municipality: fd.get('municipality') || '',
        maxPrice: fd.get('maxPrice') || '',
        beds: fd.get('beds') || '',
      };
      PL.router.go(`/propiedades${U.toQuery(q)}`);
    });

    // Simulador rápido en tiempo real
    const priceEl = root.querySelector('#calc-price');
    const downEl = root.querySelector('#calc-down-pct');
    const termEl = root.querySelector('#calc-term');

    function updateCalc() {
      if (!priceEl) return;
      const price = +priceEl.value;
      const downPct = +downEl.value;
      const term = +termEl.value;

      const downVal = Math.round(price * (downPct / 100));
      const balance = price - downVal;
      // Interés referencial 0% a 5% anual en financiamientos directos
      const annualRate = 0.04;
      const monthlyRate = annualRate / 12;
      let monthly = 0;
      if (monthlyRate > 0) {
        monthly = Math.round((balance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term)));
      } else {
        monthly = Math.round(balance / term);
      }

      root.querySelector('#calc-val-display').textContent = U.fmtMoney(price);
      root.querySelector('#calc-down-display').textContent = `${U.fmtMoney(downVal)} (${downPct}%)`;
      root.querySelector('#calc-term-display').textContent = `${term} meses`;
      root.querySelector('#calc-monthly').textContent = U.fmtMoney(monthly);
      root.querySelector('#calc-balance').textContent = U.fmtMoney(balance);
    }

    [priceEl, downEl, termEl].forEach((i) => i?.addEventListener('input', updateCalc));
    updateCalc();

    root.querySelector('#btn-quote-advisor')?.addEventListener('click', () => {
      PL.router.go(`/cotizador?price=${priceEl.value}&down=${downEl.value}&term=${termEl.value}`);
    });

    // Envío de solicitud de captación (lead)
    const leadForm = root.querySelector('#lead-form');
    leadForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(leadForm);
      PL.store.leads.create({
        name: fd.get('name'),
        phone: fd.get('phone'),
        operation: fd.get('operation'),
        type: fd.get('type'),
        location: fd.get('location'),
      });
      PL.ui.toast('¡Solicitud enviada con éxito! Un asesor se comunicará contigo en breve.');
      leadForm.reset();
    });

    // Delegación de botón de favoritos en tarjetas
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-fav]');
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();
      const pid = b.dataset.fav;
      const added = PL.store.favorites.toggle(pid);
      b.classList.toggle('on', added);
      b.setAttribute('aria-pressed', String(added));
      PL.ui.toast(added ? 'Propiedad guardada en tus favoritos' : 'Eliminada de favoritos', 'info');
      const counter = document.querySelector('[data-fav-count]');
      const len = PL.store.favorites.list().length;
      if (counter) {
        counter.textContent = len;
        counter.style.display = len ? 'block' : 'none';
      }
    });
  }

  return {
    title: 'ProLíder Inmobiliaria | Compra, Venta y Alquiler de Inmuebles en Venezuela',
    layout: 'public',
    render,
    mount,
  };
})();

