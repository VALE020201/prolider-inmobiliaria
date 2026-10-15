/**
 * ProLider - Simulador de Valoración Inmobiliaria para Propietarios
 * -----------------------------------------------------------------
 * Permite a cualquier propietario ingresar todas las características de su inmueble:
 * - Operación (Venta / Alquiler)
 * - Tipo de propiedad (Casa, Apartamento, Penthouse, Townhouse, Local, etc.)
 * - Ubicación exacta (Estado, Municipio, Sector / Residencia)
 * - Metraje (m² construcción y terreno)
 * - Distribución (Habitaciones, Baños, Medios baños, Puestos de estacionamiento y tipo)
 * - Condición del inmueble y nivel/planta
 * - Amoblado y listado detallado de electrodomésticos / línea blanca que deja
 * - Bondades y servicios del conjunto (Pozo, Planta 100%, Gas directo, Vigilancia 24/7, etc.)
 * - Datos del propietario y expectativa de precio
 *
 * Incluye un simulador algorítmico en tiempo real con rango de mercado y plusvalía,
 * y redirige con un solo clic directamente al WhatsApp de un asesor (con preferencia
 * a Ana Gabriela Farfán o aleatorio) con el reporte estructurado completo.
 */
window.PL = window.PL || {};
PL.pages = PL.pages || {};

PL.pages.valuation = (() => {
  const U = PL.utils;
  const I = PL.icon;

  function render() {
    return `
      <div class="bg-beige-50 min-h-screen py-8 sm:py-14 print:bg-white print:py-0">
        <div class="container-x max-w-6xl">
          
          <!-- CABECERA DE LA PÁGINA -->
          <div class="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-oro-100/80 text-oro-800 text-xs font-bold uppercase tracking-[0.2em] mb-2.5 border border-oro-200">
              ${I('sparkles', 'w-3.5 h-3.5 text-oro-700')} Exclusivo para Propietarios
            </span>
            <h1 class="font-display text-3xl sm:text-4xl lg:text-5xl text-militar-950 font-bold leading-tight">
              Simulador de Valoración Inmobiliaria
            </h1>
            <p class="text-militar-600 mt-3 text-sm sm:text-base leading-relaxed">
              Describe tu propiedad en detalle para calcular una estimación preliminar de mercado y coordinar la valoración oficial con nuestro equipo de asesores certificados.
            </p>
          </div>

          <!-- LAYOUT PRINCIPAL (FORMULARIO + PANEL DE SIMULACIÓN Y ASESOR) -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <!-- ======================================================= -->
            <!-- COLUMNA IZQUIERDA: FORMULARIO DETALLADO DEL INMUEBLE    -->
            <!-- ======================================================= -->
            <div class="lg:col-span-7 space-y-6">
              
              <!-- BLOQUE 1: OPERACIÓN Y TIPO DE PROPIEDAD -->
              <div class="bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm space-y-5">
                <div class="flex items-center gap-2.5 border-b border-beige-200 pb-3">
                  <span class="w-7 h-7 rounded-full bg-militar-900 text-oro-400 font-bold text-xs flex items-center justify-center shrink-0">1</span>
                  <div>
                    <h2 class="font-display text-lg sm:text-xl text-militar-950 font-bold">Tipo de Operación y Propiedad</h2>
                    <p class="text-xs text-militar-500">¿Qué deseas hacer y qué tipo de inmueble tienes?</p>
                  </div>
                </div>

                <!-- Selector de Operación -->
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-militar-700 mb-2">Operación Comercial</label>
                  <div class="grid grid-cols-2 gap-3" id="val-operation-group">
                    <label class="cursor-pointer">
                      <input type="radio" name="val-op" value="venta" class="peer sr-only" checked>
                      <div class="p-3.5 rounded-2xl border-2 border-beige-200 bg-beige-50/50 text-center peer-checked:border-oro-500 peer-checked:bg-oro-50/40 peer-checked:text-militar-950 transition">
                        <span class="font-display font-bold text-sm block">Vender Inmueble</span>
                        <span class="text-[11px] text-militar-500 block mt-0.5">Captación para compraventa</span>
                      </div>
                    </label>
                    <label class="cursor-pointer">
                      <input type="radio" name="val-op" value="alquiler" class="peer sr-only">
                      <div class="p-3.5 rounded-2xl border-2 border-beige-200 bg-beige-50/50 text-center peer-checked:border-oro-500 peer-checked:bg-oro-50/40 peer-checked:text-militar-950 transition">
                        <span class="font-display font-bold text-sm block">Alquilar Inmueble</span>
                        <span class="text-[11px] text-militar-500 block mt-0.5">Fijar canon de arrendamiento</span>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Selector de Tipo de Propiedad -->
                <div>
                  <label class="block text-xs font-bold uppercase tracking-wider text-militar-700 mb-2">Categoría del Inmueble</label>
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5" id="val-type-group">
                    ${[
                      { key: 'apartamento', label: 'Apartamento', icon: 'building' },
                      { key: 'casa', label: 'Casa', icon: 'home' },
                      { key: 'townhouse', label: 'Townhouse', icon: 'townhouse' },
                      { key: 'penthouse', label: 'Penthouse', icon: 'crown' },
                      { key: 'local', label: 'Local Comercial', icon: 'store' },
                      { key: 'oficina', label: 'Oficina', icon: 'briefcase' },
                      { key: 'galpon', label: 'Galpón', icon: 'warehouse' },
                      { key: 'terreno', label: 'Terreno / Parcela', icon: 'map' },
                    ].map((t, idx) => `
                      <label class="cursor-pointer">
                        <input type="radio" name="val-type" value="${t.key}" class="peer sr-only" ${idx === 0 ? 'checked' : ''}>
                        <div class="p-2.5 rounded-xl border border-beige-200 bg-beige-50 text-center peer-checked:border-oro-500 peer-checked:bg-militar-900 peer-checked:text-beige-50 transition flex flex-col items-center gap-1">
                          ${I(t.icon, 'w-4 h-4 text-oro-400')}
                          <span class="text-xs font-semibold">${t.label}</span>
                        </div>
                      </label>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- BLOQUE 2: UBICACIÓN EXACTA -->
              <div class="bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm space-y-4">
                <div class="flex items-center gap-2.5 border-b border-beige-200 pb-3">
                  <span class="w-7 h-7 rounded-full bg-militar-900 text-oro-400 font-bold text-xs flex items-center justify-center shrink-0">2</span>
                  <div>
                    <h2 class="font-display text-lg sm:text-xl text-militar-950 font-bold">Ubicación</h2>
                    <p class="text-xs text-militar-500">La zona influye directamente en el precio por metro cuadrado.</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-militar-700 mb-1">Estado</label>
                    <select id="val-state" class="input input-sm w-full bg-beige-50 rounded-xl text-xs sm:text-sm">
                      <option value="Carabobo" selected>Carabobo</option>
                      <option value="Aragua">Aragua</option>
                      <option value="Distrito Capital">Distrito Capital (Caracas)</option>
                      <option value="Miranda">Miranda</option>
                      <option value="Lara">Lara</option>
                      <option value="Yaracuy">Yaracuy</option>
                      <option value="Otro">Otro estado</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-militar-700 mb-1">Municipio *</label>
                    <select id="val-municipality" class="input input-sm w-full bg-beige-50 rounded-xl text-xs sm:text-sm font-semibold text-militar-950">
                      <option value="Valencia" selected>Valencia</option>
                      <option value="San Diego">San Diego</option>
                      <option value="Naguanagua">Naguanagua</option>
                      <option value="Guacara">Guacara</option>
                      <option value="Los Guayos">Los Guayos</option>
                      <option value="Libertador">Libertador (Tocuyito)</option>
                      <option value="Puerto Cabello">Puerto Cabello</option>
                      <option value="San Joaquín">San Joaquín</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-militar-700 mb-1">Sector, Urbanización o Nombre del Conjunto *</label>
                  <input type="text" id="val-sector" class="input input-sm w-full bg-beige-50 rounded-xl text-xs sm:text-sm"
                         placeholder="Ej. La Trigaleña, Valle de Oro, Los Colorados, Res. Monte Mayor, Prebo, Mañongo..." required>
                </div>
              </div>

              <!-- BLOQUE 3: METRAJE, NIVELES Y DISTRIBUCIÓN -->
              <div class="bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm space-y-5">
                <div class="flex items-center gap-2.5 border-b border-beige-200 pb-3">
                  <span class="w-7 h-7 rounded-full bg-militar-900 text-oro-400 font-bold text-xs flex items-center justify-center shrink-0">3</span>
                  <div>
                    <h2 class="font-display text-lg sm:text-xl text-militar-950 font-bold">Metraje y Distribución</h2>
                    <p class="text-xs text-militar-500">Superficie construida y cantidad de ambientes.</p>
                  </div>
                </div>

                <!-- Metraje de construcción con sincronización -->
                <div class="space-y-2">
                  <div class="flex justify-between items-center text-xs font-bold text-militar-700">
                    <span>Metros de Construcción (m²) *</span>
                    <span class="text-oro-700 font-bold text-sm" id="val-area-label">85 m²</span>
                  </div>
                  <div class="relative">
                    <input type="number" id="val-area-input" value="85" min="15" max="2500"
                           class="input input-sm pr-12 font-bold text-militar-950 bg-beige-50 rounded-xl w-full">
                    <span class="absolute right-3.5 top-2.5 text-xs text-militar-500 font-bold">m²</span>
                  </div>
                  <input type="range" id="val-area-range" min="20" max="600" step="5" value="85" class="w-full accent-oro-500 cursor-pointer">
                </div>

                <!-- Metraje de terreno (opcional) -->
                <div id="val-land-box" class="space-y-1">
                  <label class="block text-xs font-bold text-militar-700">Metros de Terreno / Parcela (m²) <span class="text-militar-400 font-normal">(si aplica para casas o terrenos)</span></label>
                  <div class="relative">
                    <input type="number" id="val-land-input" value="0" min="0" max="10000"
                           class="input input-sm pr-12 text-xs bg-beige-50 rounded-xl w-full" placeholder="0">
                    <span class="absolute right-3.5 top-2.5 text-xs text-militar-500 font-bold">m²</span>
                  </div>
                </div>

                <!-- Ambientes: Habitaciones, Baños y Puestos -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label class="block text-xs font-bold text-militar-700 mb-1">Habitaciones</label>
                    <select id="val-bedrooms" class="input input-sm w-full bg-beige-50 rounded-xl text-xs sm:text-sm font-semibold">
                      <option value="1">1 habitación</option>
                      <option value="2">2 habitaciones</option>
                      <option value="3" selected>3 habitaciones</option>
                      <option value="4">4 habitaciones</option>
                      <option value="5">5 o más</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-militar-700 mb-1">Baños completos</label>
                    <select id="val-bathrooms" class="input input-sm w-full bg-beige-50 rounded-xl text-xs sm:text-sm font-semibold">
                      <option value="1">1 baño</option>
                      <option value="2" selected>2 baños</option>
                      <option value="3">3 baños</option>
                      <option value="4">4 baños</option>
                      <option value="5">5 o más</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-militar-700 mb-1">Puestos de estacionamiento</label>
                    <select id="val-parking" class="input input-sm w-full bg-beige-50 rounded-xl text-xs sm:text-sm font-semibold">
                      <option value="0">Sin puesto</option>
                      <option value="1" selected>1 puesto</option>
                      <option value="2">2 puestos</option>
                      <option value="3">3 puestos</option>
                      <option value="4">4 o más</option>
                    </select>
                  </div>
                </div>

                <!-- Nivel / Piso y Tipo de estacionamiento -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-militar-700 mb-1">Nivel / Altura</label>
                    <select id="val-floor" class="input input-sm w-full bg-beige-50 rounded-xl text-xs sm:text-sm">
                      <option value="Planta Baja">Planta Baja</option>
                      <option value="Piso Bajo (1 a 3)">Piso Bajo (1 a 3)</option>
                      <option value="Piso Medio (4 a 7)" selected>Piso Medio (4 a 7)</option>
                      <option value="Piso Alto (8+)">Piso Alto (8 en adelante)</option>
                      <option value="Penthouse">Nivel Penthouse</option>
                      <option value="Casa / 2 Niveles">Casa / 2 Niveles</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-militar-700 mb-1">Tipo de Estacionamiento</label>
                    <select id="val-parking-type" class="input input-sm w-full bg-beige-50 rounded-xl text-xs sm:text-sm">
                      <option value="Techado" selected>Techado</option>
                      <option value="Descubierto">Descubierto</option>
                      <option value="En Sótano">En Sótano</option>
                      <option value="Garaje cerrado privado">Garaje cerrado privado</option>
                    </select>
                  </div>
                </div>

              </div>

              <!-- BLOQUE 4: CONDICIÓN Y MOBILIARIO -->
              <div class="bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm space-y-4">
                <div class="flex items-center gap-2.5 border-b border-beige-200 pb-3">
                  <span class="w-7 h-7 rounded-full bg-militar-900 text-oro-400 font-bold text-xs flex items-center justify-center shrink-0">4</span>
                  <div>
                    <h2 class="font-display text-lg sm:text-xl text-militar-950 font-bold">Estado y Mobiliario</h2>
                    <p class="text-xs text-militar-500">Los acabados y si se vende o alquila amoblado influyen notablemente.</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-militar-700 mb-1.5">Estado / Condición</label>
                    <select id="val-condition" class="input input-sm w-full bg-beige-50 rounded-xl text-xs sm:text-sm font-semibold">
                      <option value="Remodelado de Lujo">Remodelado de Lujo (Acabados importados/modernos)</option>
                      <option value="Excelente / Actualizado" selected>Excelente / Actualizado y bien mantenido</option>
                      <option value="Original Conservado">Original de época pero bien conservado</option>
                      <option value="Para Remodelar">Para remodelar o actualizar acabados</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-militar-700 mb-1.5">Mobiliario General</label>
                    <select id="val-furnished" class="input input-sm w-full bg-beige-50 rounded-xl text-xs sm:text-sm font-semibold">
                      <option value="Sin amoblar" selected>Sin amoblar (Solo empotrados)</option>
                      <option value="Semi-amoblado">Semi-amoblado (Muebles clave y camas)</option>
                      <option value="Totalmente Amoblado">Totalmente Amoblado y Equipado</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- BLOQUE 5: ELECTRODOMÉSTICOS Y LÍNEA BLANCA QUE DEJA -->
              <div class="bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm space-y-4">
                <div class="flex items-center gap-2.5 border-b border-beige-200 pb-3">
                  <span class="w-7 h-7 rounded-full bg-militar-900 text-oro-400 font-bold text-xs flex items-center justify-center shrink-0">5</span>
                  <div>
                    <h2 class="font-display text-lg sm:text-xl text-militar-950 font-bold">Electrodomésticos y Equipamiento que Deja</h2>
                    <p class="text-xs text-militar-500">Selecciona todo lo que queda incluido en la negociación.</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5" id="val-appliances-list">
                  ${[
                    { id: 'app-nevera', label: 'Nevera / Refri', icon: 'zap' },
                    { id: 'app-cocina', label: 'Cocina / Tope', icon: 'zap', checked: true },
                    { id: 'app-horno', label: 'Horno empotrado', icon: 'zap' },
                    { id: 'app-campana', label: 'Campana extractora', icon: 'zap', checked: true },
                    { id: 'app-microondas', label: 'Microondas', icon: 'zap' },
                    { id: 'app-lavadora', label: 'Lavadora', icon: 'zap' },
                    { id: 'app-secadora', label: 'Secadora', icon: 'zap' },
                    { id: 'app-calentador', label: 'Calentador de agua', icon: 'zap', checked: true },
                    { id: 'app-tanque', label: 'Tanque con bomba propia', icon: 'droplet', checked: true },
                    { id: 'app-tv', label: 'Televisor / Smart TV', icon: 'tv' },
                    { id: 'app-sala', label: 'Juego de sala / comedor', icon: 'home' },
                    { id: 'app-camas', label: 'Camas / dormitorios', icon: 'bed' },
                  ].map((a) => `
                    <label class="flex items-center gap-2 p-2.5 rounded-xl border border-beige-200 bg-beige-50/70 hover:bg-beige-100 transition cursor-pointer select-none">
                      <input type="checkbox" id="${a.id}" class="val-appliance-check rounded accent-oro-600 w-4 h-4" ${a.checked ? 'checked' : ''}>
                      <span class="text-xs font-semibold text-militar-800">${a.label}</span>
                    </label>
                  `).join('')}
                </div>

                <!-- Selector de cantidad de aires acondicionados -->
                <div class="p-3.5 bg-oro-50/60 rounded-2xl border border-oro-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span class="text-xs font-bold text-militar-900 block">Aires Acondicionados Split</span>
                    <span class="text-[11px] text-militar-600">Equipos operativos que se quedan en la propiedad</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <select id="val-ac-count" class="input input-sm bg-white rounded-xl text-xs font-bold text-militar-950">
                      <option value="0">0 (Ninguno)</option>
                      <option value="1">1 aire split</option>
                      <option value="2">2 aires split</option>
                      <option value="3" selected>3 aires split</option>
                      <option value="4">4 aires split</option>
                      <option value="5">5 o más aires split</option>
                      <option value="Aire Central">Aire Acondicionado Central</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- BLOQUE 6: BONDADES Y SERVICIOS DEL CONJUNTO / INMUEBLE -->
              <div class="bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm space-y-4">
                <div class="flex items-center gap-2.5 border-b border-beige-200 pb-3">
                  <span class="w-7 h-7 rounded-full bg-militar-900 text-oro-400 font-bold text-xs flex items-center justify-center shrink-0">6</span>
                  <div>
                    <h2 class="font-display text-lg sm:text-xl text-militar-950 font-bold">Bondades y Servicios Estratégicos</h2>
                    <p class="text-xs text-militar-500">Factores de máxima plusvalía y demanda en Carabobo.</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5" id="val-amenities-list">
                  ${[
                    { id: 'amen-pozo', label: 'Pozo de agua propio activo', desc: 'Suministro continuo sin racionamiento', checked: true },
                    { id: 'amen-planta100', label: 'Planta eléctrica 100%', desc: 'Cubre todo el apartamento/casa', checked: false },
                    { id: 'amen-plantaComun', label: 'Planta eléctrica áreas comunes', desc: 'Ascensores y bombas de agua', checked: true },
                    { id: 'amen-gas', label: 'Gas directo por tubería', desc: 'Sin necesidad de bombonas', checked: true },
                    { id: 'amen-vigilancia', label: 'Vigilancia 24/7 y Garita', desc: 'Control de acceso presencial', checked: true },
                    { id: 'amen-fibra', label: 'Internet de fibra óptica activo', desc: 'Conectividad de alta velocidad', checked: true },
                    { id: 'amen-piscina', label: 'Piscina en conjunto', desc: 'Área social operativa', checked: false },
                    { id: 'amen-parque', label: 'Parque infantil / Caney', desc: 'Áreas recreativas familiares', checked: true },
                  ].map((m) => `
                    <label class="flex items-start gap-2.5 p-3 rounded-2xl border border-beige-200 bg-beige-50/70 hover:bg-beige-100 transition cursor-pointer select-none">
                      <input type="checkbox" id="${m.id}" class="val-amenity-check mt-0.5 rounded accent-oro-600 w-4 h-4 shrink-0" ${m.checked ? 'checked' : ''}>
                      <div>
                        <span class="text-xs font-bold text-militar-900 block leading-tight">${m.label}</span>
                        <span class="text-[10px] text-militar-500 block mt-0.5">${m.desc}</span>
                      </div>
                    </label>
                  `).join('')}
                </div>
              </div>

              <!-- BLOQUE 7: DATOS DEL PROPIETARIO -->
              <div class="bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm space-y-4">
                <div class="flex items-center gap-2.5 border-b border-beige-200 pb-3">
                  <span class="w-7 h-7 rounded-full bg-militar-900 text-oro-400 font-bold text-xs flex items-center justify-center shrink-0">7</span>
                  <div>
                    <h2 class="font-display text-lg sm:text-xl text-militar-950 font-bold">Datos de Contacto del Propietario</h2>
                    <p class="text-xs text-militar-500">Para coordinar la inspección técnica y el análisis formal.</p>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-militar-700 mb-1">Nombre y Apellido *</label>
                    <input type="text" id="val-owner-name" class="input input-sm w-full bg-beige-50 rounded-xl text-xs sm:text-sm font-semibold"
                           placeholder="Ej. Carlos Pérez" required>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-militar-700 mb-1">Teléfono / WhatsApp *</label>
                    <input type="tel" id="val-owner-phone" class="input input-sm w-full bg-beige-50 rounded-xl text-xs sm:text-sm font-semibold"
                           placeholder="Ej. 0414-1234567" required>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-bold text-militar-700 mb-1">Correo electrónico <span class="text-militar-400 font-normal">(opcional)</span></label>
                    <input type="email" id="val-owner-email" class="input input-sm w-full bg-beige-50 rounded-xl text-xs sm:text-sm"
                           placeholder="propietario@email.com">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-militar-700 mb-1">¿Tienes un precio en mente? <span class="text-militar-400 font-normal">(USD opcional)</span></label>
                    <div class="relative">
                      <span class="absolute left-3 top-2 text-oro-600 font-bold text-xs">$</span>
                      <input type="number" id="val-owner-expectation" class="input input-sm pl-7 text-xs sm:text-sm bg-beige-50 rounded-xl w-full"
                             placeholder="Ej. 65000">
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-militar-700 mb-1">Comentarios o detalles especiales <span class="text-militar-400 font-normal">(opcional)</span></label>
                  <textarea id="val-owner-notes" rows="2" class="input input-sm w-full bg-beige-50 rounded-xl text-xs sm:text-sm resize-none"
                            placeholder="Ej. Piso de porcelanato recién instalado, tuberías nuevas, vista panorámica..."></textarea>
                </div>
              </div>

            </div>

            <!-- ======================================================= -->
            <!-- COLUMNA DERECHA: RESULTADO EN VIVO Y ASESOR ASIGNADO   -->
            <!-- ======================================================= -->
            <div class="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
              
              <!-- CARD HERO: ESTIMACIÓN DE MERCADO EN TIEMPO REAL -->
              <div class="bg-gradient-to-br from-militar-900 via-militar-950 to-militar-900 text-beige-100 p-6 sm:p-8 rounded-3xl border border-oro-500/30 shadow-xl space-y-6">
                <div>
                  <span class="text-xs font-bold uppercase tracking-widest text-oro-400 block mb-1">
                    Simulación de Mercado ProLíder
                  </span>
                  <div class="flex items-baseline gap-2">
                    <span class="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-oro-400" id="res-val-range">$ 0</span>
                    <span class="text-beige-300 text-xs sm:text-sm" id="res-val-suffix">USD estimado</span>
                  </div>
                  <span class="text-xs text-beige-300/80 block mt-1" id="res-val-sqm">Aprox. $ 0 / m² de construcción</span>
                </div>

                <!-- INDICADOR DE DEMANDA Y PLUSVALÍA -->
                <div class="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-beige-300 font-semibold">Índice de Liquidez y Demanda:</span>
                    <strong class="text-oro-300 font-bold" id="res-val-badge">Muy Alta</strong>
                  </div>
                  <div class="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div id="res-val-bar" class="bg-gradient-to-r from-oro-600 via-oro-400 to-oro-300 h-full rounded-full transition-all duration-300" style="width: 85%;"></div>
                  </div>
                  <p class="text-[11px] text-beige-300/90 leading-tight" id="res-val-insights">
                    Propiedad favorecida por ubicación estratégica, servicios continuos y equipamiento integrado.
                  </p>
                </div>

                <!-- RESUMEN DE CARACTERÍSTICAS COMPUTADAS -->
                <div class="grid grid-cols-2 gap-2 text-xs text-beige-200 pt-2 border-t border-white/10">
                  <div class="p-2 rounded-xl bg-white/5">
                    <span class="text-[10px] uppercase text-beige-400 block font-bold">Tipo & Operación</span>
                    <strong class="text-beige-100 truncate block mt-0.5" id="sum-type-op">Apartamento (Venta)</strong>
                  </div>
                  <div class="p-2 rounded-xl bg-white/5">
                    <span class="text-[10px] uppercase text-beige-400 block font-bold">Metraje</span>
                    <strong class="text-beige-100 truncate block mt-0.5" id="sum-area">85 m² const.</strong>
                  </div>
                  <div class="p-2 rounded-xl bg-white/5">
                    <span class="text-[10px] uppercase text-beige-400 block font-bold">Distribución</span>
                    <strong class="text-beige-100 truncate block mt-0.5" id="sum-distrib">3 Hab / 2 Baños</strong>
                  </div>
                  <div class="p-2 rounded-xl bg-white/5">
                    <span class="text-[10px] uppercase text-beige-400 block font-bold">Línea Blanca / Equipos</span>
                    <strong class="text-oro-300 truncate block mt-0.5" id="sum-appliances">4 equipos + 3 A/A</strong>
                  </div>
                </div>

                <p class="text-[11px] text-beige-400/80 italic text-center leading-relaxed">
                  * Esta simulación es un modelo estadístico referencial. Tu asesor asignado evaluará la propiedad in situ para fijar el precio definitivo de comercialización.
                </p>
              </div>

              <!-- CARD DEL ASESOR ASIGNADO (PREFERIBLEMENTE ANA FARFÁN) -->
              <div class="bg-white p-6 rounded-3xl border border-beige-200 shadow-sm space-y-4">
                <div class="flex items-center justify-between border-b border-beige-200 pb-3">
                  <span class="text-xs font-bold uppercase tracking-wider text-militar-700">Asesor Especializado Asignado</span>
                  <button type="button" id="btn-change-advisor" class="text-xs text-oro-700 font-bold hover:underline flex items-center gap-1">
                    ${I('refresh', 'w-3.5 h-3.5')} Cambiar asesor
                  </button>
                </div>

                <div class="flex items-center gap-3.5" id="advisor-assigned-card">
                  <!-- Se llena con JS con Ana Farfán por defecto -->
                </div>

                <div class="p-3 bg-beige-50 rounded-2xl border border-beige-200 text-xs text-militar-600 space-y-1">
                  <div class="flex items-center gap-1.5 font-bold text-militar-900">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Asesoría personalizada sin costo ni compromiso
                  </div>
                  <p class="text-[11px] leading-tight">
                    Tu asesor revisará el inventario detallado de electrodomésticos y características para coordinar la inspección o sesión fotográfica.
                  </p>
                </div>

                <!-- BOTÓN PRINCIPAL: ENVIAR A WHATSAPP -->
                <button type="button" id="btn-submit-whatsapp"
                        class="btn btn-primary w-full justify-center py-3.5 rounded-2xl shadow-gold text-sm font-bold flex items-center gap-2">
                  ${I('whatsapp', 'w-5 h-5')} Enviar Información y Solicitar Valoración
                </button>

                <p class="text-[10px] text-center text-militar-500">
                  Al pulsar el botón se abrirá WhatsApp con el reporte completo ya redactado y listo para enviar.
                </p>
              </div>

            </div>

          </div>

        </div>
      </div>
    `;
  }

  function mount(root) {
    const U = PL.utils;

    // -------------------------------------------------------------
    // GESTIÓN DEL ASESOR (PREFERIBLEMENTE ANA GABRIELA FARFÁN)
    // -------------------------------------------------------------
    const allAdvisors = PL.store.advisors.public();
    
    // Buscar a Ana Farfán con múltiples heurísticas de seguridad
    const anaFarfan = allAdvisors.find(a => U.norm(a.name).includes('ana') && U.norm(a.name).includes('farfan'))
      || allAdvisors.find(a => (a.phone || '').includes('04148287450') || (a.phone || '').includes('8287450'))
      || {
        id: 'krsp5yTqmHYVYB19unDHPUwSbZC3',
        name: 'Ana Gabriela Farfán',
        title: 'Asesor Inmobiliario',
        phone: '04148287450',
        email: 'anagabrielaf.prolider@gmail.com',
        photo: 'https://app.proliderve.com/imagenes/krsp5yTqmHYVYB19unDHPUwSbZC3/c6c6cdd54bfb871f323ca43d8b9195e1d46a182401779388655.jpg',
        zone: 'Carabobo',
      };

    let selectedAdvisor = anaFarfan;

    function renderAdvisorCard() {
      const c = root.querySelector('#advisor-assigned-card');
      if (!c) return;
      c.innerHTML = `
        <img src="${U.esc(PL.media.url(selectedAdvisor.photo))}" alt="${U.esc(selectedAdvisor.name)}"
             class="w-14 h-14 rounded-2xl object-cover border-2 border-oro-400 shadow-sm shrink-0" ${PL.media.onErr}>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <h3 class="font-display font-bold text-militar-950 text-sm truncate">${U.esc(selectedAdvisor.name)}</h3>
            ${selectedAdvisor.id === anaFarfan.id ? `<span class="px-1.5 py-0.5 rounded-md bg-oro-100 text-oro-800 text-[10px] font-bold">Líder</span>` : ''}
          </div>
          <p class="text-xs text-militar-600 truncate">${U.esc(selectedAdvisor.title || 'Asesor Inmobiliario')}</p>
          <span class="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-0.5">
            ${I('phone', 'w-3 h-3')} ${U.esc(selectedAdvisor.phone)}
          </span>
        </div>
      `;
    }

    renderAdvisorCard();

    // Botón para cambiar asesor (rota aleatoriamente o vuelve a Ana Farfán)
    root.querySelector('#btn-change-advisor')?.addEventListener('click', () => {
      if (allAdvisors.length > 1) {
        const others = allAdvisors.filter(a => a.id !== selectedAdvisor.id);
        const randomAdvisor = others[Math.floor(Math.random() * others.length)];
        selectedAdvisor = randomAdvisor || anaFarfan;
      } else {
        selectedAdvisor = anaFarfan;
      }
      renderAdvisorCard();
      PL.ui.toast(`Asesor asignado: ${selectedAdvisor.name}`, 'info');
    });

    // -------------------------------------------------------------
    // ELEMENTOS DEL FORMULARIO
    // -------------------------------------------------------------
    const opRadios = root.querySelectorAll('input[name="val-op"]');
    const typeRadios = root.querySelectorAll('input[name="val-type"]');
    const stateSelect = root.querySelector('#val-state');
    const muniSelect = root.querySelector('#val-municipality');
    const sectorInput = root.querySelector('#val-sector');

    const areaInput = root.querySelector('#val-area-input');
    const areaRange = root.querySelector('#val-area-range');
    const areaLabel = root.querySelector('#val-area-label');
    const landInput = root.querySelector('#val-land-input');

    const bedroomsSelect = root.querySelector('#val-bedrooms');
    const bathroomsSelect = root.querySelector('#val-bathrooms');
    const parkingSelect = root.querySelector('#val-parking');
    const floorSelect = root.querySelector('#val-floor');
    const parkingTypeSelect = root.querySelector('#val-parking-type');

    const conditionSelect = root.querySelector('#val-condition');
    const furnishedSelect = root.querySelector('#val-furnished');
    const acCountSelect = root.querySelector('#val-ac-count');

    const ownerNameInput = root.querySelector('#val-owner-name');
    const ownerPhoneInput = root.querySelector('#val-owner-phone');
    const ownerEmailInput = root.querySelector('#val-owner-email');
    const ownerExpInput = root.querySelector('#val-owner-expectation');
    const ownerNotesInput = root.querySelector('#val-owner-notes');

    // Elementos de Resultados
    const resRange = root.querySelector('#res-val-range');
    const resSuffix = root.querySelector('#res-val-suffix');
    const resSqm = root.querySelector('#res-val-sqm');
    const resBadge = root.querySelector('#res-val-badge');
    const resBar = root.querySelector('#res-val-bar');
    const resInsights = root.querySelector('#res-val-insights');

    const sumTypeOp = root.querySelector('#sum-type-op');
    const sumArea = root.querySelector('#sum-area');
    const sumDistrib = root.querySelector('#sum-distrib');
    const sumAppliances = root.querySelector('#sum-appliances');

    // -------------------------------------------------------------
    // MOTOR DE CÁLCULO ALGORÍTMICO EN TIEMPO REAL
    // -------------------------------------------------------------
    function calculate() {
      const op = root.querySelector('input[name="val-op"]:checked')?.value || 'venta';
      const type = root.querySelector('input[name="val-type"]:checked')?.value || 'apartamento';
      const muni = muniSelect.value;
      const area = Math.max(15, +areaInput.value || 80);
      const condition = conditionSelect.value;
      const furnished = furnishedSelect.value;
      const acVal = acCountSelect.value;

      // Base precio/m2 por municipio
      const muniBaseSqm = {
        'Valencia': 680,
        'San Diego': 620,
        'Naguanagua': 560,
        'Guacara': 380,
        'Los Guayos': 320,
        'Libertador': 290,
        'Puerto Cabello': 440,
        'San Joaquín': 330,
      }[muni] || 450;

      // Multiplicador por tipo de inmueble
      const typeMult = {
        'apartamento': 1.0,
        'casa': 0.92,
        'penthouse': 1.35,
        'townhouse': 1.10,
        'local': 1.25,
        'oficina': 0.95,
        'galpon': 0.58,
        'terreno': 0.35,
      }[type] || 1.0;

      // Multiplicador por condición
      const condMult = {
        'Remodelado de Lujo': 1.25,
        'Excelente / Actualizado': 1.10,
        'Original Conservado': 1.0,
        'Para Remodelar': 0.80,
      }[condition] || 1.0;

      // Plus de mobiliario
      let furnitureBonus = 0;
      if (furnished === 'Totalmente Amoblado') furnitureBonus = 5000;
      else if (furnished === 'Semi-amoblado') furnitureBonus = 2200;

      // Conteo de electrodomésticos
      const checkedApps = root.querySelectorAll('.val-appliance-check:checked');
      const appliancesBonus = checkedApps.length * 350;

      // Conteo de aires acondicionados
      let acBonus = 0;
      if (acVal === 'Aire Central') acBonus = 2500;
      else {
        const acN = parseInt(acVal, 10) || 0;
        acBonus = acN * 300;
      }

      // Conteo de bondades críticas en Venezuela
      const hasPozo = root.querySelector('#amen-pozo')?.checked;
      const hasPlanta100 = root.querySelector('#amen-planta100')?.checked;
      const hasPlantaComun = root.querySelector('#amen-plantaComun')?.checked;
      const hasGas = root.querySelector('#amen-gas')?.checked;
      const hasVig = root.querySelector('#amen-vigilancia')?.checked;
      const hasPiscina = root.querySelector('#amen-piscina')?.checked;

      let amenitiesBonus = 0;
      if (hasPozo) amenitiesBonus += 4500;
      if (hasPlanta100) amenitiesBonus += 6500;
      else if (hasPlantaComun) amenitiesBonus += 2500;
      if (hasGas) amenitiesBonus += 1000;
      if (hasVig) amenitiesBonus += 1500;
      if (hasPiscina) amenitiesBonus += 2000;

      // Cálculo de valor base en venta
      const rawSqm = muniBaseSqm * typeMult * condMult;
      const basePropertyValue = Math.round(area * rawSqm);
      const totalEstimatedSale = Math.round(basePropertyValue + furnitureBonus + appliancesBonus + acBonus + amenitiesBonus);

      // Sincronizar etiquetas de resumen
      areaLabel.textContent = `${area} m²`;
      sumTypeOp.textContent = `${U.titleCase(type)} (${op === 'venta' ? 'Venta' : 'Alquiler'})`;
      sumArea.textContent = `${area} m² const.`;
      sumDistrib.textContent = `${bedroomsSelect.value} Hab / ${bathroomsSelect.value} Baños / ${parkingSelect.value} Est.`;
      sumAppliances.textContent = `${checkedApps.length} equipos + ${acVal}`;

      // Diagnóstico de liquidez
      let liquidityScore = 65;
      if (hasPozo) liquidityScore += 15;
      if (hasPlanta100) liquidityScore += 15;
      if (condition === 'Remodelado de Lujo') liquidityScore += 10;
      if (liquidityScore > 100) liquidityScore = 100;

      resBar.style.width = `${liquidityScore}%`;
      if (liquidityScore >= 85) {
        resBadge.textContent = 'Muy Alta (Inmueble Líder)';
        resBadge.className = 'text-oro-400 font-bold';
        resInsights.textContent = 'Propiedad de altísima demanda en Carabobo por contar con pozo propio y/o planta eléctrica garantizada.';
      } else if (liquidityScore >= 70) {
        resBadge.textContent = 'Alta y Competitiva';
        resBadge.className = 'text-oro-300 font-bold';
        resInsights.textContent = 'Propiedad con excelentes atributos que facilitan una venta o alquiler en tiempos reducidos.';
      } else {
        resBadge.textContent = 'Moderada';
        resBadge.className = 'text-beige-300 font-bold';
        resInsights.textContent = 'Propiedad atractiva; se recomienda destacar mejoras de mantenimiento para optimizar el valor de cierre.';
      }

      if (op === 'venta') {
        const low = Math.round((totalEstimatedSale * 0.92) / 500) * 500;
        const high = Math.round((totalEstimatedSale * 1.08) / 500) * 500;
        const avgSqm = Math.round(totalEstimatedSale / area);

        resRange.textContent = `$ ${U.fmtNumber(low)} - ${U.fmtNumber(high)}`;
        resSuffix.textContent = 'USD estimado';
        resSqm.textContent = `Aprox. $ ${U.fmtNumber(avgSqm)} / m² de construcción`;
      } else {
        // En alquiler: canon referencial mensual
        const baseRent = Math.max(150, Math.round((totalEstimatedSale * 0.0055) / 25) * 25);
        const lowRent = Math.round((baseRent * 0.90) / 10) * 10;
        const highRent = Math.round((baseRent * 1.10) / 10) * 10;

        resRange.textContent = `$ ${U.fmtNumber(lowRent)} - ${U.fmtNumber(highRent)}`;
        resSuffix.textContent = 'USD / mes';
        resSqm.textContent = `Canon mensual proyectado según inventario`;
      }
    }

    // Sincronizar inputs
    areaInput?.addEventListener('input', () => {
      areaRange.value = areaInput.value;
      calculate();
    });
    areaRange?.addEventListener('input', () => {
      areaInput.value = areaRange.value;
      calculate();
    });

    opRadios.forEach(r => r.addEventListener('change', calculate));
    typeRadios.forEach(r => r.addEventListener('change', calculate));
    muniSelect?.addEventListener('change', calculate);
    bedroomsSelect?.addEventListener('change', calculate);
    bathroomsSelect?.addEventListener('change', calculate);
    parkingSelect?.addEventListener('change', calculate);
    floorSelect?.addEventListener('change', calculate);
    conditionSelect?.addEventListener('change', calculate);
    furnishedSelect?.addEventListener('change', calculate);
    acCountSelect?.addEventListener('change', calculate);

    root.querySelectorAll('.val-appliance-check').forEach(c => c.addEventListener('change', calculate));
    root.querySelectorAll('.val-amenity-check').forEach(c => c.addEventListener('change', calculate));

    calculate();

    // -------------------------------------------------------------
    // ACCIÓN PRINCIPAL: CONSTRUCCIÓN Y REDIRECCIÓN A WHATSAPP
    // -------------------------------------------------------------
    root.querySelector('#btn-submit-whatsapp')?.addEventListener('click', () => {
      const name = (ownerNameInput.value || '').trim();
      const phone = (ownerPhoneInput.value || '').trim();
      const sector = (sectorInput.value || '').trim();

      // Validaciones amigables
      if (!name) {
        ownerNameInput.focus();
        PL.ui.toast('Por favor, indica tu nombre para que el asesor pueda dirigirse a ti.', 'warn');
        return;
      }
      if (!phone || phone.length < 7) {
        ownerPhoneInput.focus();
        PL.ui.toast('Por favor, ingresa un número de teléfono o WhatsApp de contacto válido.', 'warn');
        return;
      }
      if (!sector) {
        sectorInput.focus();
        PL.ui.toast('Por favor, indica el sector o urbanización de la propiedad.', 'warn');
        return;
      }

      const op = root.querySelector('input[name="val-op"]:checked')?.value || 'venta';
      const type = root.querySelector('input[name="val-type"]:checked')?.value || 'apartamento';
      const state = stateSelect.value;
      const muni = muniSelect.value;
      const area = areaInput.value;
      const land = landInput.value;
      const bedrooms = bedroomsSelect.value;
      const bathrooms = bathroomsSelect.value;
      const parking = parkingSelect.value;
      const parkingType = parkingTypeSelect.value;
      const floor = floorSelect.value;
      const condition = conditionSelect.value;
      const furnished = furnishedSelect.value;
      const acVal = acCountSelect.value;
      const expectation = ownerExpInput.value ? `$ ${U.fmtNumber(ownerExpInput.value)} USD` : 'Abierta a recomendación del asesor';
      const notes = (ownerNotesInput.value || '').trim();

      // Recopilar electrodomésticos seleccionados
      const appliancesList = [];
      root.querySelectorAll('.val-appliance-check:checked').forEach(c => {
        const text = c.parentElement.querySelector('span')?.textContent;
        if (text) appliancesList.push(text);
      });
      if (acVal && acVal !== '0') appliancesList.push(`Aires acondicionados: ${acVal}`);

      // Recopilar bondades y servicios seleccionados
      const amenitiesList = [];
      root.querySelectorAll('.val-amenity-check:checked').forEach(c => {
        const text = c.parentElement.querySelector('span')?.textContent;
        if (text) amenitiesList.push(text);
      });

      const simRange = resRange.textContent + ' ' + resSuffix.textContent;

      // Construcción del mensaje para WhatsApp con formato estructurado
      const msg = [
        `¡Hola ${selectedAdvisor.name.split(' ')[0]}! 🏡 Deseo una valoración profesional de mi inmueble con ProLíder:`,
        ``,
        `📋 *DATOS DE LA PROPIEDAD:*`,
        `• *Operación:* ${op === 'venta' ? 'Venta' : 'Alquiler'}`,
        `• *Tipo de Inmueble:* ${U.titleCase(type)}`,
        `• *Ubicación:* ${sector}, ${muni}, Edo. ${state}`,
        `• *Metraje de Construcción:* ${area} m²${+land > 0 ? ` (Terreno: ${land} m²)` : ''}`,
        `• *Distribución:* ${bedrooms} Hab. | ${bathrooms} Baños | ${parking} Estacionamiento (${parkingType})`,
        `• *Nivel / Planta:* ${floor}`,
        `• *Condición:* ${condition}`,
        `• *Mobiliario:* ${furnished}`,
        ``,
        `🍳 *ELECTRODOMÉSTICOS Y EQUIPAMIENTO QUE DEJA:*`,
        appliancesList.length ? appliancesList.map(a => `• ${a}`).join('\n') : '• Solo empotrados fijos',
        ``,
        `✨ *BONDADES Y SERVICIOS:*`,
        amenitiesList.length ? amenitiesList.map(m => `• ${m}`).join('\n') : '• Servicios básicos residenciales',
        ``,
        `💰 *ESTIMACIÓN DEL SIMULADOR PROLÍDER:*`,
        `• Rango preliminar: *${simRange}*`,
        `• Expectativa del propietario: *${expectation}*`,
        notes ? `• Notas adicionales: _"${notes}"_` : '',
        ``,
        `👤 *DATOS DEL PROPIETARIO:*`,
        `• Nombre: *${name}*`,
        `• Teléfono: *${phone}*`,
        ownerEmailInput.value ? `• Correo: ${ownerEmailInput.value}` : '',
        ``,
        `¿Podrías por favor orientarme sobre los pasos para la valoración formal y fijar el precio ideal de comercialización? ¡Muchas gracias!`,
      ].filter(Boolean).join('\n');

      // Formatear teléfono para WhatsApp internacional (58...)
      let cleanPhone = (selectedAdvisor.phone || '04148287450').replace(/\D/g, '');
      if (cleanPhone.startsWith('0')) cleanPhone = '58' + cleanPhone.slice(1);
      if (!cleanPhone.startsWith('58')) cleanPhone = '58' + cleanPhone;

      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;

      // Guardar lead internamente en el sistema
      try {
        PL.store.leads.create({
          name,
          phone,
          email: ownerEmailInput.value || '',
          operation: op,
          type,
          zone: `${sector}, ${muni}`,
          source: 'simulador_valoracion',
          advisorId: selectedAdvisor.id,
          advisorName: selectedAdvisor.name,
          simulatedValue: simRange,
          expectation,
          details: {
            area,
            bedrooms,
            bathrooms,
            parking,
            appliances: appliancesList,
            amenities: amenitiesList,
            notes,
          },
        });
      } catch (err) {
        console.warn('Error saving lead:', err);
      }

      // Notificar éxito al usuario y abrir WhatsApp
      PL.ui.toast('Abriendo WhatsApp con el reporte detallado...', 'success');
      
      const opened = window.open(waUrl, '_blank');
      if (!opened) {
        // En caso de que el navegador bloquee el popup automático, mostrar modal amigable
        PL.ui.modal({
          title: '¡Reporte de Valoración Generado!',
          body: `
            <div class="space-y-4 text-center py-2">
              <div class="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-2xl">
                ${I('whatsapp', 'w-8 h-8')}
              </div>
              <p class="text-sm text-militar-700">
                Tu cotización está lista para ser enviada a <strong>${U.esc(selectedAdvisor.name)}</strong>. Haz clic a continuación para abrir WhatsApp:
              </p>
              <a href="${waUrl}" target="_blank" class="btn btn-primary w-full justify-center py-3 rounded-xl shadow-gold text-sm font-bold">
                ${I('whatsapp', 'w-4 h-4')} Abrir chat de WhatsApp
              </a>
            </div>
          `,
        });
      }
    });
  }

  return {
    title: 'Simulador de Valoración Inmobiliaria | ProLíder Inmobiliaria',
    layout: 'public',
    render,
    mount,
  };
})();
