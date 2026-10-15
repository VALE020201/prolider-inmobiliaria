/**
 * ProLider - Módulo de Cotización de Operación Inmobiliaria y Gastos de Cierre
 * --------------------------------------------------------------------------
 * Adaptado 100% a la realidad del mercado inmobiliario venezolano:
 * - Compraventa: Esquema fraccionado en 3 etapas (Reserva 10%, Opción 40%, Saldo a Registro SAREN 50%)
 *   y estimación precisa de aranceles de registro, visado de abogado y solvencias.
 * - Alquiler: Presupuesto total de entrada (depósito en garantía, cánones adelantados, honorarios y contrato).
 * - Sugerencias en tiempo real de propiedades afines del catálogo.
 * - Compartir por WhatsApp y exportar/imprimir cotización oficial.
 */
window.PL = window.PL || {};
PL.pages = PL.pages || {};

PL.pages.calculator = (() => {
  const U = PL.utils;
  const I = PL.icon;

  function render(ctx) {
    const q = ctx.query;
    const initialOp = q.op === 'alquiler' ? 'alquiler' : 'venta';
    const initialPrice = +q.price || (initialOp === 'alquiler' ? 450 : 85000);

    return `
      <div class="bg-beige-50 min-h-screen py-8 sm:py-14 print:bg-white print:py-0">
        <div class="container-x max-w-6xl">
          <!-- CABECERA -->
          <div class="text-center max-w-3xl mx-auto mb-8 sm:mb-12 print:mb-6">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-oro-100/80 text-oro-800 text-xs font-bold uppercase tracking-[0.2em] mb-2 border border-oro-200">
              ${I('calculator', 'w-3.5 h-3.5 text-oro-700')} Cotizador Inmobiliario
            </span>
            <h1 class="font-display text-3xl sm:text-4xl lg:text-5xl text-militar-950 font-bold mt-1">
              Estructura de Pago y Gastos de Cierre
            </h1>
            <p class="text-militar-600 mt-3 text-sm sm:text-base leading-relaxed">
              Calcula con total transparencia las etapas reales de desembolso para compraventa (Reserva, Opción y Registro SAREN) o el presupuesto integral requerido para ingresar a un alquiler en Venezuela.
            </p>
          </div>

          <!-- SELECTOR DE OPERACIÓN (TABS) -->
          <div class="flex justify-center mb-8 print:hidden">
            <div class="inline-flex p-1.5 bg-beige-200/80 rounded-2xl border border-beige-300/70 shadow-inner">
              <button type="button" id="tab-btn-venta"
                      class="tab-btn flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${initialOp === 'venta' ? 'bg-militar-900 text-beige-50 shadow-md' : 'text-militar-700 hover:text-militar-950'}">
                ${I('home', 'w-4 h-4')} Compraventa Inmobiliaria
              </button>
              <button type="button" id="tab-btn-alquiler"
                      class="tab-btn flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${initialOp === 'alquiler' ? 'bg-militar-900 text-beige-50 shadow-md' : 'text-militar-700 hover:text-militar-950'}">
                ${I('key', 'w-4 h-4')} Presupuesto de Alquiler
              </button>
            </div>
          </div>

          <!-- ========================================================= -->
          <!-- SECCIÓN 1: COTIZADOR DE COMPRAVENTA                       -->
          <!-- ========================================================= -->
          <div id="section-venta" class="${initialOp === 'venta' ? 'block' : 'hidden'} space-y-8">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <!-- PANEL DE PARÁMETROS DE COMPRA -->
              <div class="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
                <div class="border-b border-beige-200 pb-3">
                  <h2 class="font-display text-xl text-militar-950 font-bold">
                    Parámetros de Adquisición
                  </h2>
                  <p class="text-xs text-militar-500 mt-0.5">Ajusta el valor de la propiedad y las etapas de pago acordadas.</p>
                </div>

                <!-- Valor de la Propiedad -->
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-militar-700 mb-1">
                    Valor de compraventa pactado (USD)
                  </label>
                  <div class="relative">
                    <span class="absolute left-3.5 top-2.5 text-oro-600 font-bold">$</span>
                    <input type="number" id="buy-price-input" value="${initialOp === 'venta' ? initialPrice : 85000}" min="5000" step="1000"
                           class="input input-sm pl-8 pr-3 text-lg font-bold text-militar-950 bg-beige-50 rounded-xl w-full">
                  </div>
                  <input type="range" id="buy-price-range" min="15000" max="600000" step="5000" value="${initialOp === 'venta' ? initialPrice : 85000}"
                         class="w-full mt-2 accent-oro-500 cursor-pointer">
                  
                  <!-- Atajos de precio rápido -->
                  <div class="flex flex-wrap gap-1.5 mt-2 print:hidden">
                    <button type="button" class="btn-price-shortcut px-2.5 py-1 text-[11px] rounded-lg bg-beige-100 hover:bg-oro-100 text-militar-800 font-semibold transition" data-price="35000">$35.000</button>
                    <button type="button" class="btn-price-shortcut px-2.5 py-1 text-[11px] rounded-lg bg-beige-100 hover:bg-oro-100 text-militar-800 font-semibold transition" data-price="60000">$60.000</button>
                    <button type="button" class="btn-price-shortcut px-2.5 py-1 text-[11px] rounded-lg bg-beige-100 hover:bg-oro-100 text-militar-800 font-semibold transition" data-price="95000">$95.000</button>
                    <button type="button" class="btn-price-shortcut px-2.5 py-1 text-[11px] rounded-lg bg-beige-100 hover:bg-oro-100 text-militar-800 font-semibold transition" data-price="160000">$160.000</button>
                    <button type="button" class="btn-price-shortcut px-2.5 py-1 text-[11px] rounded-lg bg-beige-100 hover:bg-oro-100 text-militar-800 font-semibold transition" data-price="250000">$250.000</button>
                  </div>
                </div>

                <!-- Etapa 1: Reserva -->
                <div class="bg-beige-50/70 p-4 rounded-2xl border border-beige-200">
                  <div class="flex justify-between items-center text-xs font-bold text-militar-800 mb-1">
                    <span class="flex items-center gap-1.5">
                      <span class="w-5 h-5 rounded-full bg-militar-900 text-oro-400 inline-flex items-center justify-center text-[10px]">1</span>
                      Reserva de Intención
                    </span>
                    <span class="text-oro-700 font-bold" id="buy-reserva-pct-label">10%</span>
                  </div>
                  <input type="range" id="buy-reserva-range" min="5" max="25" step="1" value="10" class="w-full accent-oro-500 cursor-pointer">
                  <div class="flex justify-between text-[11px] text-militar-500 mt-1">
                    <span>Monto estimado:</span>
                    <strong class="text-militar-900 font-bold" id="buy-reserva-usd">$ 0</strong>
                  </div>
                  <p class="text-[10px] text-militar-500 mt-1">Congela la oferta y retira el inmueble del mercado para revisión jurídica.</p>
                </div>

                <!-- Etapa 2: Opción a Compra -->
                <div class="bg-beige-50/70 p-4 rounded-2xl border border-beige-200">
                  <div class="flex justify-between items-center text-xs font-bold text-militar-800 mb-1">
                    <span class="flex items-center gap-1.5">
                      <span class="w-5 h-5 rounded-full bg-militar-900 text-oro-400 inline-flex items-center justify-center text-[10px]">2</span>
                      Opción de Compra (Arras)
                    </span>
                    <span class="text-oro-700 font-bold" id="buy-opcion-pct-label">40%</span>
                  </div>
                  <input type="range" id="buy-opcion-range" min="20" max="60" step="5" value="40" class="w-full accent-oro-500 cursor-pointer">
                  <div class="flex justify-between text-[11px] text-militar-500 mt-1">
                    <span>Monto estimado:</span>
                    <strong class="text-militar-900 font-bold" id="buy-opcion-usd">$ 0</strong>
                  </div>
                  <p class="text-[10px] text-militar-500 mt-1">Firma bilateral autenticada o privada que concede plazo de 30-45 días para el registro.</p>
                </div>

                <!-- Etapa 3: Saldo contra Registro SAREN -->
                <div class="bg-oro-50/60 p-4 rounded-2xl border border-oro-200">
                  <div class="flex justify-between items-center text-xs font-bold text-militar-900 mb-1">
                    <span class="flex items-center gap-1.5">
                      <span class="w-5 h-5 rounded-full bg-oro-600 text-white inline-flex items-center justify-center text-[10px]">3</span>
                      Saldo a Firma en Registro (SAREN)
                    </span>
                    <span class="text-oro-800 font-bold" id="buy-registro-pct-label">50%</span>
                  </div>
                  <div class="flex justify-between text-xs text-militar-700 mt-1">
                    <span>Monto al otorgamiento:</span>
                    <strong class="text-militar-950 font-bold text-sm" id="buy-registro-usd">$ 0</strong>
                  </div>
                  <p class="text-[10px] text-militar-600 mt-1">Remanente cancelado en cheque de gerencia o transferencia contra firma definitiva.</p>
                </div>

                <!-- Estimación de Aranceles SAREN y Trámites -->
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-militar-700 mb-1">
                    Tasa arancelaria SAREN referencial
                  </label>
                  <select id="buy-saren-rate" class="input input-sm w-full bg-beige-50 rounded-xl text-xs sm:text-sm">
                    <option value="0.02">2.0% (Tasa base municipal / residencial estándar)</option>
                    <option value="0.025" selected>2.5% (Tasa habitual en Carabobo con timbres y solvencias)</option>
                    <option value="0.03">3.0% (Estimación con solvencias especiales o alta valoración)</option>
                  </select>
                </div>

                <!-- Acciones -->
                <div class="pt-2 space-y-2 print:hidden">
                  <button type="button" id="btn-share-buy" class="btn btn-primary w-full justify-center py-3 rounded-xl shadow-gold text-xs sm:text-sm font-semibold">
                    ${I('whatsapp', 'w-4 h-4')} Compartir estructura por WhatsApp
                  </button>
                  <button type="button" id="btn-print-buy" class="btn btn-ghost-light w-full justify-center py-2.5 rounded-xl text-xs sm:text-sm border border-beige-300 text-militar-800 hover:bg-beige-100">
                    ${I('document', 'w-4 h-4')} Imprimir / Descargar cotización oficial
                  </button>
                </div>
              </div>

              <!-- RESULTADOS DE COMPRAVENTA -->
              <div class="lg:col-span-7 space-y-6">
                
                <!-- HERO CARD PRINCIPAL DE COMPRA -->
                <div class="bg-gradient-to-br from-militar-900 via-militar-950 to-militar-900 text-beige-100 p-6 sm:p-8 rounded-3xl border border-oro-500/30 shadow-xl space-y-6">
                  <div>
                    <span class="text-xs font-bold uppercase tracking-widest text-oro-400 block mb-1">Desembolso Total Proyectado</span>
                    <div class="flex items-baseline gap-2">
                      <span class="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-oro-400" id="res-buy-total">$ 0</span>
                      <span class="text-beige-300 text-xs sm:text-sm">(Inmueble + Gastos Legales SAREN)</span>
                    </div>
                  </div>

                  <!-- 3 ETAPAS DE DESEMBOLSO -->
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs">
                    <div class="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                      <div class="flex items-center justify-between text-beige-400 mb-1">
                        <span class="text-[10px] uppercase font-bold tracking-wider">1. Reserva</span>
                        <span class="text-[10px] text-oro-400" id="card-reserva-pct">10%</span>
                      </div>
                      <strong class="font-display text-lg sm:text-xl text-beige-50 block" id="card-reserva-val">$ 0</strong>
                      <span class="text-[10px] text-beige-400 mt-1 block">Al momento del acuerdo (Día 0)</span>
                    </div>
                    <div class="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                      <div class="flex items-center justify-between text-beige-400 mb-1">
                        <span class="text-[10px] uppercase font-bold tracking-wider">2. Opción Venta</span>
                        <span class="text-[10px] text-oro-400" id="card-opcion-pct">40%</span>
                      </div>
                      <strong class="font-display text-lg sm:text-xl text-beige-50 block" id="card-opcion-val">$ 0</strong>
                      <span class="text-[10px] text-beige-400 mt-1 block">A la firma de documento (Día 5-15)</span>
                    </div>
                    <div class="p-3.5 bg-white/5 rounded-2xl border border-oro-500/30 bg-oro-950/20">
                      <div class="flex items-center justify-between text-oro-300 mb-1">
                        <span class="text-[10px] uppercase font-bold tracking-wider">3. Firma SAREN</span>
                        <span class="text-[10px] text-oro-400" id="card-registro-pct">50%</span>
                      </div>
                      <strong class="font-display text-lg sm:text-xl text-oro-400 block" id="card-registro-val">$ 0</strong>
                      <span class="text-[10px] text-oro-300/80 mt-1 block">Contra documento público (Día 30-45)</span>
                    </div>
                  </div>

                  <!-- DETALLE DE GASTOS LEGALES Y REGISTRO -->
                  <div class="pt-4 border-t border-white/10">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs uppercase tracking-wider text-oro-300 font-bold">Gastos Legales y de Formalización</span>
                      <strong class="font-display text-lg text-oro-400" id="res-buy-fees-total">$ 0</strong>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-beige-300">
                      <div class="flex justify-between p-2 rounded-xl bg-white/5">
                        <span>Aranceles SAREN (~2.5%):</span>
                        <strong class="text-beige-100" id="card-saren-val">$ 0</strong>
                      </div>
                      <div class="flex justify-between p-2 rounded-xl bg-white/5">
                        <span>Redacción, visado y solvencias:</span>
                        <strong class="text-beige-100">$ 350</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- CRONOGRAMA DE ADQUISICIÓN EN VENEZUELA -->
                <div class="bg-white p-6 rounded-3xl border border-beige-200 shadow-sm space-y-4">
                  <h3 class="font-display text-lg text-militar-950 font-bold flex items-center gap-2">
                    ${I('checkCircle', 'w-5 h-5 text-oro-600')} Proceso Legal de Compraventa en Venezuela
                  </h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-militar-700">
                    <div class="p-3.5 bg-beige-50 rounded-2xl border border-beige-200">
                      <strong class="text-militar-900 block font-bold mb-1">Paso 1: Reserva y Revisión Legal</strong>
                      <p class="text-[11px] leading-relaxed text-militar-600">
                        Se entrega la reserva formal y los abogados de ProLíder verifican la tradición legal (20 años), solvencias municipales y estatus registral sin gravámenes.
                      </p>
                    </div>
                    <div class="p-3.5 bg-beige-50 rounded-2xl border border-beige-200">
                      <strong class="text-militar-900 block font-bold mb-1">Paso 2: Documento de Opción a Compra</strong>
                      <p class="text-[11px] leading-relaxed text-militar-600">
                        Firma bilateral donde se estipulan las arras, condiciones de entrega de llaves y plazo de vigencia para tramitar la Ficha Catastral ante la Alcaldía.
                      </p>
                    </div>
                    <div class="p-3.5 bg-beige-50 rounded-2xl border border-beige-200">
                      <strong class="text-militar-900 block font-bold mb-1">Paso 3: Emisión de PUB (SAREN)</strong>
                      <p class="text-[11px] leading-relaxed text-militar-600">
                        El sistema del SAREN emite la Planilla Única Bancaria calculada en base a las unidades tributarias y tablas oficiales de aranceles.
                      </p>
                    </div>
                    <div class="p-3.5 bg-beige-50 rounded-2xl border border-beige-200">
                      <strong class="text-militar-900 block font-bold mb-1">Paso 4: Otorgamiento y Firma Registral</strong>
                      <p class="text-[11px] leading-relaxed text-militar-600">
                        Comprador y vendedor firman el documento definitivo en la sede del Registro Inmobiliario, liquidando simultáneamente el 50% de saldo restante.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- INMUEBLES EN VENTA SUGERIDOS -->
                <div class="bg-white p-6 rounded-3xl border border-beige-200 shadow-sm space-y-4 print:hidden">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-display text-lg text-militar-950 font-bold">Inmuebles en venta afines</h3>
                      <p class="text-xs text-militar-500">Propiedades dentro de este rango de presupuesto</p>
                    </div>
                    <a href="#/propiedades?op=venta" class="text-xs text-oro-700 font-bold hover:underline">Ver catálogo completo →</a>
                  </div>
                  <div id="buy-matching-properties" class="space-y-3">
                    <!-- Se llena con JS -->
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- ========================================================= -->
          <!-- SECCIÓN 2: COTIZADOR DE ALQUILER                          -->
          <!-- ========================================================= -->
          <div id="section-alquiler" class="${initialOp === 'alquiler' ? 'block' : 'hidden'} space-y-8">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <!-- PANEL DE PARÁMETROS DE ALQUILER -->
              <div class="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
                <div class="border-b border-beige-200 pb-3">
                  <h2 class="font-display text-xl text-militar-950 font-bold">
                    Parámetros del Arrendamiento
                  </h2>
                  <p class="text-xs text-militar-500 mt-0.5">Calcula la inversión inicial de ingreso según las normas de mercado.</p>
                </div>

                <!-- Canon Mensual -->
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-militar-700 mb-1">
                    Canon mensual de arrendamiento (USD)
                  </label>
                  <div class="relative">
                    <span class="absolute left-3.5 top-2.5 text-oro-600 font-bold">$</span>
                    <input type="number" id="rent-canon-input" value="${initialOp === 'alquiler' ? initialPrice : 450}" min="100" step="25"
                           class="input input-sm pl-8 pr-3 text-lg font-bold text-militar-950 bg-beige-50 rounded-xl w-full">
                  </div>
                  <input type="range" id="rent-canon-range" min="150" max="3500" step="25" value="${initialOp === 'alquiler' ? initialPrice : 450}"
                         class="w-full mt-2 accent-oro-500 cursor-pointer">
                  
                  <!-- Atajos de canon rápido -->
                  <div class="flex flex-wrap gap-1.5 mt-2 print:hidden">
                    <button type="button" class="btn-canon-shortcut px-2.5 py-1 text-[11px] rounded-lg bg-beige-100 hover:bg-oro-100 text-militar-800 font-semibold transition" data-canon="250">$250</button>
                    <button type="button" class="btn-canon-shortcut px-2.5 py-1 text-[11px] rounded-lg bg-beige-100 hover:bg-oro-100 text-militar-800 font-semibold transition" data-canon="400">$400</button>
                    <button type="button" class="btn-canon-shortcut px-2.5 py-1 text-[11px] rounded-lg bg-beige-100 hover:bg-oro-100 text-militar-800 font-semibold transition" data-canon="650">$650</button>
                    <button type="button" class="btn-canon-shortcut px-2.5 py-1 text-[11px] rounded-lg bg-beige-100 hover:bg-oro-100 text-militar-800 font-semibold transition" data-canon="1000">$1.000</button>
                    <button type="button" class="btn-canon-shortcut px-2.5 py-1 text-[11px] rounded-lg bg-beige-100 hover:bg-oro-100 text-militar-800 font-semibold transition" data-canon="1800">$1.800</button>
                  </div>
                </div>

                <!-- Meses de Depósito -->
                <div class="bg-beige-50/70 p-4 rounded-2xl border border-beige-200">
                  <label class="block text-xs font-bold text-militar-800 mb-1">
                    Meses de depósito en garantía (reembolsables)
                  </label>
                  <select id="rent-deposit-months" class="input input-sm w-full bg-white rounded-xl text-xs sm:text-sm">
                    <option value="1">1 mes de depósito</option>
                    <option value="2" selected>2 meses de depósito (estándar Carabobo)</option>
                    <option value="3">3 meses de depósito (inmuebles totalmente amoblados o de lujo)</option>
                  </select>
                  <div class="flex justify-between text-[11px] text-militar-600 mt-2">
                    <span>Monto de depósito:</span>
                    <strong class="text-militar-900 font-bold" id="rent-deposit-usd">$ 0</strong>
                  </div>
                </div>

                <!-- Meses Adelantados -->
                <div class="bg-beige-50/70 p-4 rounded-2xl border border-beige-200">
                  <label class="block text-xs font-bold text-militar-800 mb-1">
                    Cánones pagados por adelantado
                  </label>
                  <select id="rent-advance-months" class="input input-sm w-full bg-white rounded-xl text-xs sm:text-sm">
                    <option value="1">1 mes adelantado</option>
                    <option value="3" selected>3 meses adelantados (modalidad trimestral habitual)</option>
                    <option value="6">6 meses adelantados (modalidad semestral)</option>
                    <option value="12">12 meses adelantados (modalidad anual)</option>
                  </select>
                  <div class="flex justify-between text-[11px] text-militar-600 mt-2">
                    <span>Monto adelantado:</span>
                    <strong class="text-militar-900 font-bold" id="rent-advance-usd">$ 0</strong>
                  </div>
                </div>

                <!-- Honorarios y Gastos Legales -->
                <div class="space-y-3 bg-oro-50/50 p-4 rounded-2xl border border-oro-200">
                  <div class="flex justify-between text-xs text-militar-800">
                    <span>Honorarios de gestión inmobiliaria (1 mes):</span>
                    <strong class="text-militar-950 font-bold" id="rent-fee-usd">$ 0</strong>
                  </div>
                  <div class="flex justify-between text-xs text-militar-800">
                    <span>Redacción y visado de contrato jurídico:</span>
                    <strong class="text-militar-950 font-bold">$ 150</strong>
                  </div>
                  <p class="text-[10px] text-militar-500 pt-1 border-t border-oro-200/60">
                    Incluye revisión de solvencias comerciales y autenticación de documento.
                  </p>
                </div>

                <!-- Acciones -->
                <div class="pt-2 space-y-2 print:hidden">
                  <button type="button" id="btn-share-rent" class="btn btn-primary w-full justify-center py-3 rounded-xl shadow-gold text-xs sm:text-sm font-semibold">
                    ${I('whatsapp', 'w-4 h-4')} Compartir cotización por WhatsApp
                  </button>
                  <button type="button" id="btn-print-rent" class="btn btn-ghost-light w-full justify-center py-2.5 rounded-xl text-xs sm:text-sm border border-beige-300 text-militar-800 hover:bg-beige-100">
                    ${I('document', 'w-4 h-4')} Imprimir / Descargar presupuesto en PDF
                  </button>
                </div>
              </div>

              <!-- RESULTADOS DE ALQUILER -->
              <div class="lg:col-span-7 space-y-6">
                
                <!-- HERO CARD PRINCIPAL DE ALQUILER -->
                <div class="bg-gradient-to-br from-militar-900 via-militar-950 to-militar-900 text-beige-100 p-6 sm:p-8 rounded-3xl border border-oro-500/30 shadow-xl space-y-6">
                  <div>
                    <span class="text-xs font-bold uppercase tracking-widest text-oro-400 block mb-1">Presupuesto de Entrada Requerido</span>
                    <div class="flex items-baseline gap-2">
                      <span class="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-oro-400" id="res-rent-total">$ 0</span>
                      <span class="text-beige-300 text-xs sm:text-sm" id="res-rent-months-equiv">(Equivale a 6 meses de canon)</span>
                    </div>
                  </div>

                  <!-- 4 BLOQUES DEL PRESUPUESTO -->
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-xs">
                    <div class="p-3 bg-white/5 rounded-2xl border border-white/10">
                      <span class="text-[10px] uppercase font-bold text-beige-400 block">Canon mensual</span>
                      <strong class="font-display text-base sm:text-lg text-beige-50 block mt-1" id="card-rent-canon">$ 0</strong>
                      <span class="text-[10px] text-beige-400 mt-0.5 block">Valor acordado</span>
                    </div>
                    <div class="p-3 bg-white/5 rounded-2xl border border-white/10">
                      <span class="text-[10px] uppercase font-bold text-beige-400 block" id="card-rent-deposit-title">Depósito (2m)</span>
                      <strong class="font-display text-base sm:text-lg text-beige-50 block mt-1" id="card-rent-deposit-val">$ 0</strong>
                      <span class="text-[10px] text-beige-400 mt-0.5 block">Reembolsable</span>
                    </div>
                    <div class="p-3 bg-white/5 rounded-2xl border border-white/10">
                      <span class="text-[10px] uppercase font-bold text-beige-400 block" id="card-rent-advance-title">Adelanto (3m)</span>
                      <strong class="font-display text-base sm:text-lg text-beige-50 block mt-1" id="card-rent-advance-val">$ 0</strong>
                      <span class="text-[10px] text-beige-400 mt-0.5 block">Cánones iniciales</span>
                    </div>
                    <div class="p-3 bg-white/5 rounded-2xl border border-oro-500/30 bg-oro-950/20">
                      <span class="text-[10px] uppercase font-bold text-oro-300 block">Honorarios + Contrato</span>
                      <strong class="font-display text-base sm:text-lg text-oro-400 block mt-1" id="card-rent-fees-val">$ 0</strong>
                      <span class="text-[10px] text-oro-300/80 mt-0.5 block">1 mes + $150 redac.</span>
                    </div>
                  </div>
                </div>

                <!-- REQUISITOS DEL INQUILINO -->
                <div class="bg-white p-6 rounded-3xl border border-beige-200 shadow-sm space-y-4">
                  <h3 class="font-display text-lg text-militar-950 font-bold flex items-center gap-2">
                    ${I('checkCircle', 'w-5 h-5 text-oro-600')} Requisitos Habituales para Alquilar en Venezuela
                  </h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-militar-700">
                    <div class="p-3.5 bg-beige-50 rounded-2xl border border-beige-200">
                      <strong class="text-militar-900 block font-bold mb-1">Perfil Persona Jurídica (Empresas)</strong>
                      <ul class="text-[11px] space-y-1 text-militar-600 list-disc list-inside">
                        <li>Registro Mercantil y RIF actualizado.</li>
                        <li>Cédula y RIF del Representante Legal.</li>
                        <li>Última declaración de ISLR y balance general.</li>
                        <li>Referencias comerciales de clientes/proveedores.</li>
                      </ul>
                    </div>
                    <div class="p-3.5 bg-beige-50 rounded-2xl border border-beige-200">
                      <strong class="text-militar-900 block font-bold mb-1">Perfil Persona Natural con Fiador</strong>
                      <ul class="text-[11px] space-y-1 text-militar-600 list-disc list-inside">
                        <li>Carta de trabajo o certificación de ingresos visada.</li>
                        <li>3 últimos estados de cuenta bancarios.</li>
                        <li>Fiador solidario con solvencia comercial propia.</li>
                        <li>Referencias personales y bancarias comprobables.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <!-- INMUEBLES EN ALQUILER SUGERIDOS -->
                <div class="bg-white p-6 rounded-3xl border border-beige-200 shadow-sm space-y-4 print:hidden">
                  <div class="flex items-center justify-between">
                    <div>
                      <h3 class="font-display text-lg text-militar-950 font-bold">Inmuebles en alquiler afines</h3>
                      <p class="text-xs text-militar-500">Propiedades dentro de este rango de canon</p>
                    </div>
                    <a href="#/propiedades?op=alquiler" class="text-xs text-oro-700 font-bold hover:underline">Ver catálogo completo →</a>
                  </div>
                  <div id="rent-matching-properties" class="space-y-3">
                    <!-- Se llena con JS -->
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- ========================================================= -->
          <!-- PREGUNTAS FRECUENTES SOBRE PAGOS INMOBILIARIOS EN VENEZUELA -->
          <!-- ========================================================= -->
          <div class="mt-14 bg-white p-6 sm:p-10 rounded-3xl border border-beige-200 shadow-sm space-y-6 print:hidden">
            <div class="text-center max-w-xl mx-auto">
              <span class="text-xs font-bold uppercase tracking-widest text-oro-700">Asesoría Profesional</span>
              <h2 class="font-display text-2xl sm:text-3xl font-bold text-militar-950 mt-1">Preguntas Frecuentes sobre Operaciones Inmobiliarias</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-militar-700">
              <div class="p-5 rounded-2xl bg-beige-50 border border-beige-200 space-y-2">
                <h4 class="font-bold text-militar-950 text-base">¿Por qué no se utiliza financiamiento bancario hipotecario en Venezuela?</h4>
                <p class="text-xs text-militar-600 leading-relaxed">
                  En el mercado actual venezolano, la banca nacional no tiene disponible la cartera hipotecaria a largo plazo con tasas fijas. Por ello, el 100% de las operaciones se efectúan de contado o a través de planes fraccionados privados acordados directamente entre comprador y vendedor (habitualmente 10% de Reserva formal, 40% a la firma de Opción de Compra y 50% de Saldo definitivo ante el Registro Inmobiliario en un plazo de 30 a 60 días).
                </p>
              </div>

              <div class="p-5 rounded-2xl bg-beige-50 border border-beige-200 space-y-2">
                <h4 class="font-bold text-militar-950 text-base">¿Qué es el SAREN y cómo se calculan sus aranceles?</h4>
                <p class="text-xs text-militar-600 leading-relaxed">
                  El SAREN es el Servicio Autónomo de Registros y Notarías de Venezuela. Al formalizar la compraventa, emite una Planilla Única Bancaria (PUB) calculada en base a las tablas de aranceles vigentes (entre el 2.0% y 2.5% del valor protocolizado). Este pago se cancela en la banca nacional antes del otorgamiento formal.
                </p>
              </div>

              <div class="p-5 rounded-2xl bg-beige-50 border border-beige-200 space-y-2">
                <h4 class="font-bold text-militar-950 text-base">¿Qué documentos se necesitan para vender un inmueble?</h4>
                <p class="text-xs text-militar-600 leading-relaxed">
                  Documento de propiedad registrado original, Ficha Catastral vigente a nombre del propietario, Solvencia Municipal de Derecho de Frente, solvencia de aseo e Hidrocentro, y la cédula de identidad y RIF vigentes de todas las partes firmantes. En ProLíder gestionamos la recopilación y verificación de cada recaudo.
                </p>
              </div>

              <div class="p-5 rounded-2xl bg-beige-50 border border-beige-200 space-y-2">
                <h4 class="font-bold text-militar-950 text-base">¿Cómo se garantiza la seguridad de las divisas en el pago?</h4>
                <p class="text-xs text-militar-600 leading-relaxed">
                  Los pagos en moneda extranjera se coordinan mediante cheques de gerencia, transferencias bancarias internacionales o depósitos en cuentas custodia verificadas simultáneamente al otorgamiento del documento ante el Registrador Inmobiliario, garantizando que ninguna de las partes asuma riesgos de incumplimiento.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  function mount(root, ctx) {
    // -------------------------------------------------------------
    // PESTAÑAS (COMPRA vs ALQUILER)
    // -------------------------------------------------------------
    const tabBtnVenta = root.querySelector('#tab-btn-venta');
    const tabBtnAlquiler = root.querySelector('#tab-btn-alquiler');
    const secVenta = root.querySelector('#section-venta');
    const secAlquiler = root.querySelector('#section-alquiler');

    function switchTab(op) {
      if (op === 'alquiler') {
        tabBtnAlquiler.classList.add('bg-militar-900', 'text-beige-50', 'shadow-md');
        tabBtnAlquiler.classList.remove('text-militar-700');
        tabBtnVenta.classList.remove('bg-militar-900', 'text-beige-50', 'shadow-md');
        tabBtnVenta.classList.add('text-militar-700');
        secVenta.classList.add('hidden');
        secAlquiler.classList.remove('hidden');
        calcRent();
      } else {
        tabBtnVenta.classList.add('bg-militar-900', 'text-beige-50', 'shadow-md');
        tabBtnVenta.classList.remove('text-militar-700');
        tabBtnAlquiler.classList.remove('bg-militar-900', 'text-beige-50', 'shadow-md');
        tabBtnAlquiler.classList.add('text-militar-700');
        secAlquiler.classList.add('hidden');
        secVenta.classList.remove('hidden');
        calcBuy();
      }
    }

    tabBtnVenta?.addEventListener('click', () => switchTab('venta'));
    tabBtnAlquiler?.addEventListener('click', () => switchTab('alquiler'));

    // -------------------------------------------------------------
    // LÓGICA DE COMPRAVENTA
    // -------------------------------------------------------------
    const buyPriceInput = root.querySelector('#buy-price-input');
    const buyPriceRange = root.querySelector('#buy-price-range');
    const buyReservaRange = root.querySelector('#buy-reserva-range');
    const buyReservaPctLabel = root.querySelector('#buy-reserva-pct-label');
    const buyReservaUsd = root.querySelector('#buy-reserva-usd');
    const buyOpcionRange = root.querySelector('#buy-opcion-range');
    const buyOpcionPctLabel = root.querySelector('#buy-opcion-pct-label');
    const buyOpcionUsd = root.querySelector('#buy-opcion-usd');
    const buyRegistroPctLabel = root.querySelector('#buy-registro-pct-label');
    const buyRegistroUsd = root.querySelector('#buy-registro-usd');
    const buySarenRate = root.querySelector('#buy-saren-rate');

    const resBuyTotal = root.querySelector('#res-buy-total');
    const cardReservaPct = root.querySelector('#card-reserva-pct');
    const cardReservaVal = root.querySelector('#card-reserva-val');
    const cardOpcionPct = root.querySelector('#card-opcion-pct');
    const cardOpcionVal = root.querySelector('#card-opcion-val');
    const cardRegistroPct = root.querySelector('#card-registro-pct');
    const cardRegistroVal = root.querySelector('#card-registro-val');
    const resBuyFeesTotal = root.querySelector('#res-buy-fees-total');
    const cardSarenVal = root.querySelector('#card-saren-val');
    const buyMatchingList = root.querySelector('#buy-matching-properties');

    function calcBuy() {
      const price = Math.max(1000, +buyPriceInput.value || 0);
      const reservaPct = +buyReservaRange.value;
      const opcionPct = +buyOpcionRange.value;
      const sarenRate = +buySarenRate.value;
      const fixedLegalFee = 350; // Redacción, visado y solvencias

      // El saldo a registro es el remanente de 100%
      const registroPct = Math.max(0, 100 - reservaPct - opcionPct);

      const reservaUsd = Math.round(price * (reservaPct / 100));
      const opcionUsd = Math.round(price * (opcionPct / 100));
      const registroUsd = Math.round(price * (registroPct / 100));
      const sarenUsd = Math.round(price * sarenRate);
      const feesTotal = sarenUsd + fixedLegalFee;
      const grandTotal = price + feesTotal;

      // Actualizar campos de entrada
      buyReservaPctLabel.textContent = `${reservaPct}%`;
      buyReservaUsd.textContent = U.fmtMoney(reservaUsd);
      buyOpcionPctLabel.textContent = `${opcionPct}%`;
      buyOpcionUsd.textContent = U.fmtMoney(opcionUsd);
      buyRegistroPctLabel.textContent = `${registroPct}%`;
      buyRegistroUsd.textContent = U.fmtMoney(registroUsd);

      // Actualizar tarjeta de resultados
      resBuyTotal.textContent = U.fmtMoney(grandTotal);
      cardReservaPct.textContent = `${reservaPct}%`;
      cardReservaVal.textContent = U.fmtMoney(reservaUsd);
      cardOpcionPct.textContent = `${opcionPct}%`;
      cardOpcionVal.textContent = U.fmtMoney(opcionUsd);
      cardRegistroPct.textContent = `${registroPct}%`;
      cardRegistroVal.textContent = U.fmtMoney(registroUsd);
      resBuyFeesTotal.textContent = U.fmtMoney(feesTotal);
      cardSarenVal.textContent = U.fmtMoney(sarenUsd);

      // Inmuebles en venta afines
      const props = PL.store.properties.public()
        .filter((p) => p.operation === 'venta' && Math.abs(p.price - price) <= price * 0.40)
        .slice(0, 3);

      if (props.length) {
        buyMatchingList.innerHTML = props.map((p) => `
          <a href="#/propiedad/${p.id}" class="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-beige-50 transition border border-beige-200">
            <img src="${U.esc(PL.media.url(p.media?.photos?.[0]))}" class="w-16 h-12 rounded-xl object-cover shrink-0" ${PL.media.onErr}>
            <div class="flex-1 min-w-0">
              <h4 class="text-xs font-semibold text-militar-900 truncate">${U.esc(p.title)}</h4>
              <p class="text-[11px] text-militar-500">${U.esc(p.location.sector)}, ${U.esc(p.location.municipality)}</p>
            </div>
            <strong class="text-xs font-bold text-oro-700">${U.fmtMoney(p.price, p.currency)}</strong>
          </a>
        `).join('');
      } else {
        buyMatchingList.innerHTML = `<p class="text-xs text-militar-500 py-2">Explora nuestro catálogo para ver todos los inmuebles disponibles.</p>`;
      }
    }

    buyPriceInput?.addEventListener('input', () => {
      buyPriceRange.value = buyPriceInput.value;
      calcBuy();
    });
    buyPriceRange?.addEventListener('input', () => {
      buyPriceInput.value = buyPriceRange.value;
      calcBuy();
    });
    buyReservaRange?.addEventListener('input', calcBuy);
    buyOpcionRange?.addEventListener('input', calcBuy);
    buySarenRate?.addEventListener('change', calcBuy);

    root.querySelectorAll('.btn-price-shortcut').forEach((btn) => {
      btn.addEventListener('click', () => {
        const p = btn.dataset.price;
        buyPriceInput.value = p;
        buyPriceRange.value = p;
        calcBuy();
      });
    });

    // Compartir por WhatsApp compra
    root.querySelector('#btn-share-buy')?.addEventListener('click', () => {
      const price = buyPriceInput.value;
      const res = cardReservaVal.textContent;
      const op = cardOpcionVal.textContent;
      const reg = cardRegistroVal.textContent;
      const fees = resBuyFeesTotal.textContent;
      const total = resBuyTotal.textContent;
      const text = `Hola ProLíder, realicé una cotización de compraventa en su portal:\n- Valor Inmueble: $${price}\n- 1. Reserva (10%): ${res}\n- 2. Opción a Compra (40%): ${op}\n- 3. Saldo a Registro (50%): ${reg}\n- Gastos Legales SAREN: ${fees}\n- Inversión Total: ${total}\n¿Podrían brindarme asesoría para este rango de inversión?`;
      window.open(`https://wa.me/584148287450?text=${encodeURIComponent(text)}`, '_blank');
    });

    root.querySelector('#btn-print-buy')?.addEventListener('click', () => window.print());

    // -------------------------------------------------------------
    // LÓGICA DE ALQUILER
    // -------------------------------------------------------------
    const rentCanonInput = root.querySelector('#rent-canon-input');
    const rentCanonRange = root.querySelector('#rent-canon-range');
    const rentDepositMonths = root.querySelector('#rent-deposit-months');
    const rentDepositUsd = root.querySelector('#rent-deposit-usd');
    const rentAdvanceMonths = root.querySelector('#rent-advance-months');
    const rentAdvanceUsd = root.querySelector('#rent-advance-usd');
    const rentFeeUsd = root.querySelector('#rent-fee-usd');

    const resRentTotal = root.querySelector('#res-rent-total');
    const resRentMonthsEquiv = root.querySelector('#res-rent-months-equiv');
    const cardRentCanon = root.querySelector('#card-rent-canon');
    const cardRentDepositTitle = root.querySelector('#card-rent-deposit-title');
    const cardRentDepositVal = root.querySelector('#card-rent-deposit-val');
    const cardRentAdvanceTitle = root.querySelector('#card-rent-advance-title');
    const cardRentAdvanceVal = root.querySelector('#card-rent-advance-val');
    const cardRentFeesVal = root.querySelector('#card-rent-fees-val');
    const rentMatchingList = root.querySelector('#rent-matching-properties');

    function calcRent() {
      const canon = Math.max(50, +rentCanonInput.value || 0);
      const depositM = +rentDepositMonths.value;
      const advanceM = +rentAdvanceMonths.value;
      const fixedContractFee = 150; // Redacción y visado

      const depositUsd = canon * depositM;
      const advanceUsd = canon * advanceM;
      const agencyFeeUsd = canon; // 1 mes de honorarios
      const totalFeesUsd = agencyFeeUsd + fixedContractFee;
      const grandTotal = depositUsd + advanceUsd + totalFeesUsd;
      const totalMonths = depositM + advanceM + 1;

      // Inputs
      rentDepositUsd.textContent = U.fmtMoney(depositUsd);
      rentAdvanceUsd.textContent = U.fmtMoney(advanceUsd);
      rentFeeUsd.textContent = U.fmtMoney(agencyFeeUsd);

      // Hero Card
      resRentTotal.textContent = U.fmtMoney(grandTotal);
      resRentMonthsEquiv.textContent = `(Equivale a ${totalMonths} meses de canon + $150 de contrato)`;
      cardRentCanon.textContent = U.fmtMoney(canon);
      cardRentDepositTitle.textContent = `Depósito (${depositM}m)`;
      cardRentDepositVal.textContent = U.fmtMoney(depositUsd);
      cardRentAdvanceTitle.textContent = `Adelanto (${advanceM}m)`;
      cardRentAdvanceVal.textContent = U.fmtMoney(advanceUsd);
      cardRentFeesVal.textContent = U.fmtMoney(totalFeesUsd);

      // Inmuebles en alquiler afines
      const props = PL.store.properties.public()
        .filter((p) => p.operation === 'alquiler' && Math.abs(p.price - canon) <= canon * 0.50)
        .slice(0, 3);

      if (props.length) {
        rentMatchingList.innerHTML = props.map((p) => `
          <a href="#/propiedad/${p.id}" class="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-beige-50 transition border border-beige-200">
            <img src="${U.esc(PL.media.url(p.media?.photos?.[0]))}" class="w-16 h-12 rounded-xl object-cover shrink-0" ${PL.media.onErr}>
            <div class="flex-1 min-w-0">
              <h4 class="text-xs font-semibold text-militar-900 truncate">${U.esc(p.title)}</h4>
              <p class="text-[11px] text-militar-500">${U.esc(p.location.sector)}, ${U.esc(p.location.municipality)}</p>
            </div>
            <strong class="text-xs font-bold text-oro-700">${U.fmtMoney(p.price, p.currency)}/mes</strong>
          </a>
        `).join('');
      } else {
        rentMatchingList.innerHTML = `<p class="text-xs text-militar-500 py-2">Explora nuestro catálogo para ver todos los inmuebles en alquiler.</p>`;
      }
    }

    rentCanonInput?.addEventListener('input', () => {
      rentCanonRange.value = rentCanonInput.value;
      calcRent();
    });
    rentCanonRange?.addEventListener('input', () => {
      rentCanonInput.value = rentCanonRange.value;
      calcRent();
    });
    rentDepositMonths?.addEventListener('change', calcRent);
    rentAdvanceMonths?.addEventListener('change', calcRent);

    root.querySelectorAll('.btn-canon-shortcut').forEach((btn) => {
      btn.addEventListener('click', () => {
        const c = btn.dataset.canon;
        rentCanonInput.value = c;
        rentCanonRange.value = c;
        calcRent();
      });
    });

    // Compartir por WhatsApp alquiler
    root.querySelector('#btn-share-rent')?.addEventListener('click', () => {
      const canon = rentCanonInput.value;
      const dep = cardRentDepositVal.textContent;
      const adv = cardRentAdvanceVal.textContent;
      const fees = cardRentFeesVal.textContent;
      const total = resRentTotal.textContent;
      const text = `Hola ProLíder, calculé un presupuesto de alquiler en su portal:\n- Canon mensual: $${canon}\n- Depósito en garantía: ${dep}\n- Cánones adelantados: ${adv}\n- Honorarios y contrato: ${fees}\n- Total inicial requerido: ${total}\n¿Podrían indicarme qué opciones tienen disponibles con este canon?`;
      window.open(`https://wa.me/584148287450?text=${encodeURIComponent(text)}`, '_blank');
    });

    root.querySelector('#btn-print-rent')?.addEventListener('click', () => window.print());

    // Inicializar cálculos
    calcBuy();
    calcRent();
  }

  return {
    title: 'Cotizador de Operación y Gastos de Cierre | ProLíder Inmobiliaria',
    layout: 'public',
    render,
    mount,
  };
})();
