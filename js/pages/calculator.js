/**
 * ProLider - Módulo de Cotización Automática y Proyecciones Financieras
 * ---------------------------------------------------------------
 * - Calculadora hipotecaria e inversión interactiva
 * - Tabla de amortización mensual
 * - Estimación de gastos de cierre y registro inmobiliario
 * - Búsqueda de inmuebles afines al presupuesto calculado
 */
window.PL = window.PL || {};
PL.pages = PL.pages || {};

PL.pages.calculator = (() => {
  const U = PL.utils;
  const I = PL.icon;

  function render(ctx) {
    const q = ctx.query;
    const initialPrice = +q.price || 85000;
    const initialDown = +q.down || 30;
    const initialTerm = +q.term || 36;

    return `
      <div class="bg-beige-50 min-h-screen py-10 md:py-16">
        <div class="container-x max-w-5xl">
          <!-- CABECERA -->
          <div class="text-center max-w-2xl mx-auto mb-10">
            <span class="text-xs font-bold uppercase tracking-[0.25em] text-oro-700">Herramienta Financiera</span>
            <h1 class="font-display text-3xl sm:text-4xl lg:text-5xl text-militar-950 font-bold mt-1">
              Cotizador de Financiamiento
            </h1>
            <p class="text-militar-600 mt-3 text-sm sm:text-base">
              Proyecta cuotas mensuales, inicial requerida y estimación de costos de cierre de manera transparente.
            </p>
          </div>

          <!-- PANEL PRINCIPAL DEL COTIZADOR -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <!-- CONTROLES DEL FORMULARIO -->
            <div class="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm space-y-6">
              <h2 class="font-display text-xl text-militar-950 font-semibold border-b border-beige-200 pb-3">
                Parámetros de Simulación
              </h2>

              <!-- Valor del Inmueble -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-militar-700 mb-1">
                  Valor estimado del inmueble (USD)
                </label>
                <div class="relative">
                  <span class="absolute left-3.5 top-2.5 text-oro-600 font-bold">$</span>
                  <input type="number" id="calc-page-price" value="${initialPrice}" min="10000" step="1000"
                         class="input input-sm pl-8 pr-3 text-base font-bold text-militar-950 bg-beige-50 rounded-xl w-full">
                </div>
                <input type="range" id="calc-range-price" min="15000" max="500000" step="5000" value="${initialPrice}" class="w-full mt-2 accent-oro-500 cursor-pointer">
              </div>

              <!-- Porcentaje de Inicial -->
              <div>
                <div class="flex justify-between text-xs text-militar-700 font-bold uppercase tracking-wider mb-1">
                  <span>Cuota inicial</span>
                  <span class="text-oro-700 text-sm font-semibold" id="calc-page-down-label">${initialDown}%</span>
                </div>
                <input type="range" id="calc-page-down" min="10" max="70" step="5" value="${initialDown}" class="w-full accent-oro-500 cursor-pointer">
                <div class="flex justify-between text-xs text-militar-500 mt-1">
                  <span>Mín. 10%</span>
                  <span id="calc-page-down-usd" class="font-semibold text-militar-900">$ 0</span>
                  <span>Máx. 70%</span>
                </div>
              </div>

              <!-- Plazo de Financiamiento -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-militar-700 mb-1">
                  Plazo de pago
                </label>
                <select id="calc-page-term" class="input input-sm w-full bg-beige-50 rounded-xl text-xs sm:text-sm">
                  <option value="12" ${initialTerm === 12 ? 'selected' : ''}>12 meses (1 año)</option>
                  <option value="24" ${initialTerm === 24 ? 'selected' : ''}>24 meses (2 años)</option>
                  <option value="36" ${initialTerm === 36 ? 'selected' : ''}>36 meses (3 años)</option>
                  <option value="48" ${initialTerm === 48 ? 'selected' : ''}>48 meses (4 años)</option>
                  <option value="60" ${initialTerm === 60 ? 'selected' : ''}>60 meses (5 años)</option>
                </select>
              </div>

              <!-- Tasa de Interés Referencial -->
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-militar-700 mb-1">
                  Tasa de interés anual (estimada)
                </label>
                <select id="calc-page-rate" class="input input-sm w-full bg-beige-50 rounded-xl text-xs sm:text-sm">
                  <option value="0">0% (Financiamiento directo sin intereses)</option>
                  <option value="0.04" selected>4% anual</option>
                  <option value="0.07">7% anual</option>
                  <option value="0.10">10% anual</option>
                </select>
              </div>

              <div class="pt-2">
                <button type="button" id="btn-share-quote" class="btn btn-primary w-full justify-center py-3 rounded-xl shadow-gold text-xs sm:text-sm font-semibold">
                  ${I('whatsapp', 'w-4 h-4')} Compartir cotización por WhatsApp
                </button>
              </div>
            </div>

            <!-- RESULTADOS Y PROYECCIÓN -->
            <div class="lg:col-span-7 space-y-6">
              <!-- TARJETAS DE RESULTADOS PRINCIPALES -->
              <div class="bg-gradient-to-br from-militar-900 via-militar-950 to-militar-900 text-beige-100 p-6 sm:p-8 rounded-3xl border border-oro-500/30 shadow-xl">
                <span class="text-xs font-bold uppercase tracking-widest text-oro-400 block mb-1">Proyección de Pagos</span>
                <div class="flex items-baseline gap-2 mb-6">
                  <span class="font-display text-4xl sm:text-5xl font-bold text-oro-400" id="res-monthly-val">$ 0</span>
                  <span class="text-beige-300 text-sm">/ mes</span>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs sm:text-sm">
                  <div>
                    <span class="text-beige-400 block text-[11px] uppercase tracking-wider">Inicial</span>
                    <strong class="font-display text-xl text-beige-100 block mt-0.5" id="res-down-val">$ 0</strong>
                  </div>
                  <div>
                    <span class="text-beige-400 block text-[11px] uppercase tracking-wider">Monto a financiar</span>
                    <strong class="font-display text-xl text-beige-100 block mt-0.5" id="res-balance-val">$ 0</strong>
                  </div>
                  <div class="col-span-2 sm:col-span-1">
                    <span class="text-beige-400 block text-[11px] uppercase tracking-wider">Gastos de Cierre (~3%)</span>
                    <strong class="font-display text-xl text-oro-300 block mt-0.5" id="res-closing-val">$ 0</strong>
                  </div>
                </div>
              </div>

              <!-- DESGLOSE DE GASTOS LEGALES Y REGISTRO -->
              <div class="bg-white p-6 rounded-3xl border border-beige-200 shadow-sm space-y-3">
                <h3 class="font-display text-lg text-militar-950 font-bold flex items-center gap-2">
                  ${I('info', 'w-5 h-5 text-oro-600')} Desglose Estimado de Cierre
                </h3>
                <div class="space-y-2 text-xs sm:text-sm text-militar-700">
                  <div class="flex justify-between py-1 border-b border-beige-100">
                    <span>Aranceles de Registro Inmobiliario (estimados)</span>
                    <strong id="fee-registry">$ 0</strong>
                  </div>
                  <div class="flex justify-between py-1 border-b border-beige-100">
                    <span>Redacción y Visado de Documentos</span>
                    <span>$ 250 - $ 400</span>
                  </div>
                  <div class="flex justify-between py-1 border-b border-beige-100">
                    <span>Solvencias Municipales y Ficha Catastral</span>
                    <span>Incluidas en gestión ProLíder</span>
                  </div>
                </div>
              </div>

              <!-- INMUEBLES SUGERIDOS EN ESTE RANGO -->
              <div class="bg-white p-6 rounded-3xl border border-beige-200 shadow-sm space-y-4">
                <div class="flex items-center justify-between">
                  <h3 class="font-display text-lg text-militar-950 font-bold">Inmuebles dentro de este presupuesto</h3>
                  <a href="#/propiedades" class="text-xs text-oro-700 font-semibold hover:underline">Ver más</a>
                </div>
                <div id="matching-properties-list" class="space-y-3">
                  <!-- Se llena con JS -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function mount(root) {
    const priceInput = root.querySelector('#calc-page-price');
    const priceRange = root.querySelector('#calc-range-price');
    const downRange = root.querySelector('#calc-page-down');
    const downLabel = root.querySelector('#calc-page-down-label');
    const downUsd = root.querySelector('#calc-page-down-usd');
    const termSelect = root.querySelector('#calc-page-term');
    const rateSelect = root.querySelector('#calc-page-rate');

    const monthlyVal = root.querySelector('#res-monthly-val');
    const downVal = root.querySelector('#res-down-val');
    const balanceVal = root.querySelector('#res-balance-val');
    const closingVal = root.querySelector('#res-closing-val');
    const feeReg = root.querySelector('#fee-registry');
    const matchingList = root.querySelector('#matching-properties-list');

    function calculate() {
      const price = +priceInput.value || 0;
      const downPct = +downRange.value;
      const term = +termSelect.value;
      const annualRate = +rateSelect.value;

      const down = Math.round(price * (downPct / 100));
      const balance = price - down;
      const closing = Math.round(price * 0.03);

      const monthlyRate = annualRate / 12;
      let monthly = 0;
      if (monthlyRate > 0) {
        monthly = Math.round((balance * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -term)));
      } else {
        monthly = Math.round(balance / term);
      }

      downLabel.textContent = `${downPct}%`;
      downUsd.textContent = U.fmtMoney(down);
      monthlyVal.textContent = U.fmtMoney(monthly);
      downVal.textContent = U.fmtMoney(down);
      balanceVal.textContent = U.fmtMoney(balance);
      closingVal.textContent = U.fmtMoney(closing);
      feeReg.textContent = U.fmtMoney(Math.round(price * 0.02));

      // Buscar 3 inmuebles afines al precio
      const props = PL.store.properties.public()
        .filter((p) => Math.abs(p.price - price) <= price * 0.35)
        .slice(0, 3);

      if (props.length) {
        matchingList.innerHTML = props.map((p) => `
          <a href="#/propiedad/${p.id}" class="flex items-center gap-3 p-2 rounded-xl hover:bg-beige-50 transition border border-beige-100">
            <img src="${U.esc(PL.media.url(p.media?.photos?.[0]))}" class="w-16 h-12 rounded-lg object-cover" ${PL.media.onErr}>
            <div class="flex-1 min-w-0">
              <h4 class="text-xs font-semibold text-militar-900 truncate">${U.esc(p.title)}</h4>
              <p class="text-[11px] text-militar-500">${U.esc(p.location.sector)}, ${U.esc(p.location.municipality)}</p>
            </div>
            <strong class="text-xs font-bold text-oro-700">${U.fmtMoney(p.price, p.currency)}</strong>
          </a>
        `).join('');
      } else {
        matchingList.innerHTML = `<p class="text-xs text-militar-500 py-2">No hay inmuebles directamente en este rango exacto.</p>`;
      }
    }

    priceInput?.addEventListener('input', () => {
      priceRange.value = priceInput.value;
      calculate();
    });
    priceRange?.addEventListener('input', () => {
      priceInput.value = priceRange.value;
      calculate();
    });
    downRange?.addEventListener('input', calculate);
    termSelect?.addEventListener('change', calculate);
    rateSelect?.addEventListener('change', calculate);

    calculate();

    root.querySelector('#btn-share-quote')?.addEventListener('click', () => {
      const price = priceInput.value;
      const down = downVal.textContent;
      const term = termSelect.value;
      const monthly = monthlyVal.textContent;
      const text = `Hola ProLíder, realicé una cotización en su portal:\n- Valor: $${price}\n- Inicial: ${down}\n- Plazo: ${term} meses\n- Cuota est.: ${monthly}\n¿Podrían asesorarme para opciones de financiamiento disponibles?`;
      window.open(`https://wa.me/584148287450?text=${encodeURIComponent(text)}`, '_blank');
    });
  }

  return {
    title: 'Cotizador y Proyección Financiera | ProLíder Inmobiliaria',
    layout: 'public',
    render,
    mount,
  };
})();

