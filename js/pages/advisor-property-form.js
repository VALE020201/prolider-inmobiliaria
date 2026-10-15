/**
 * ProLider - Formulario Exhaustivo de Creación y Edición de Inmuebles
 * ---------------------------------------------------------------
 * El componente más crítico para los asesores:
 *  - Ultrarrápido, intuitivo y guiado con barra de completitud en tiempo real
 *  - Selección de Operación y Tipo de Inmueble con códigos autogenerados
 *  - Título y Descripción con botón de plantilla oficial ProLíder
 *  - Precios, canon, moneda y negociabilidad
 *  - Ubicación con estados, municipios de Venezuela y coordenadas
 *  - Características arquitectónicas exhaustivas (m², habs, baños, puestos, etc.)
 *  - Amenidades organizadas por grupos interactivos con chips
 *  - Zona de carga multimedia Drag & Drop para múltiples fotos a la vez,
 *    con compresión automática, selección de portada y carga de planos/videos
 *  - Datos internos de captación (propietario, comisión, notas)
 */
window.PL = window.PL || {};
PL.pages = PL.pages || {};

PL.pages.advisorPropertyForm = (() => {
  const U = PL.utils;
  const C = PL.catalogs;
  const I = PL.icon;

  function render(ctx) {
    const isEdit = !!ctx.params.id;
    const existing = isEdit ? PL.store.properties.get(ctx.params.id) : null;
    const advisor = PL.auth.currentAdvisor();

    // Valores iniciales (para creación o edición)
    const p = existing || {
      id: '',
      code: PL.store.properties.nextCode('casa'),
      title: '',
      operation: 'venta',
      type: 'casa',
      status: 'disponible',
      featured: false,
      currency: 'USD',
      price: '',
      rentPrice: '',
      negotiable: false,
      condoFee: '',
      depositMonths: 2,
      description: '',
      location: {
        state: 'Carabobo',
        municipality: 'San Diego',
        sector: '',
        address: '',
        reference: '',
        lat: 10.2558,
        lng: -67.9539,
      },
      builtArea: '',
      landArea: '',
      yearBuilt: '',
      condition: 'Bueno',
      levels: 1,
      floorNumber: '',
      bedrooms: 3,
      bathrooms: 2,
      halfBaths: 0,
      serviceRoom: false,
      parking: 2,
      parkingType: 'Techado',
      furnished: 'sin_amoblar',
      orientation: 'Norte',
      amenities: ['Vigilancia 24h', 'Tanque de agua', 'Pozo de agua'],
      services: ['Electricidad', 'Agua', 'Internet fibra óptica', 'Gas'],
      nearby: ['Supermercado', 'Farmacia', 'Transporte público'],
      media: {
        photos: [],
        plans: [],
        videos: [],
        videoUrl: '',
        tourUrl: '',
      },
      internal: {
        ownerName: '',
        ownerPhone: '',
        captureDate: new Date().toISOString().split('T')[0],
        commission: 5,
        notes: '',
      },
      advisorId: advisor.id,
    };

    return `
      <div class="space-y-6 pb-24">
        <!-- BARRA SUPERIOR DE ESTADO Y CALIDAD -->
        <div class="bg-white p-5 rounded-3xl border border-beige-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-16 md:top-20 z-20 backdrop-blur-md bg-white/95">
          <div class="flex items-center gap-3">
            <a href="#/asesor/inmuebles" class="icon-btn" title="Volver al listado">
              ${I('arrowLeft', 'w-4 h-4')}
            </a>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold uppercase tracking-wider text-oro-700 bg-oro-50 border border-oro-200 px-2 py-0.5 rounded" id="form-code-badge">
                  ${p.code}
                </span>
                <span class="text-xs text-militar-500 font-medium">
                  ${isEdit ? 'Editando inmueble' : 'Nueva publicación'}
                </span>
              </div>
              <h1 class="font-display text-xl sm:text-2xl font-bold text-militar-950 truncate max-w-sm sm:max-w-md" id="form-title-preview">
                ${p.title ? U.esc(p.title) : 'Publicación de Inmueble'}
              </h1>
            </div>
          </div>

          <!-- MEDIDOR DE COMPLETITUD Y CALIDAD -->
          <div class="flex items-center gap-4">
            <div class="text-right">
              <span class="text-[11px] font-bold uppercase tracking-wider text-militar-500 block">Calidad de ficha</span>
              <div class="flex items-center gap-2 mt-0.5">
                <div class="w-24 sm:w-32 h-2.5 bg-beige-200 rounded-full overflow-hidden">
                  <div class="h-full bg-oro-500 transition-all duration-300" id="gauge-bar" style="width: 50%"></div>
                </div>
                <strong class="text-xs font-bold text-militar-900" id="gauge-score">50%</strong>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button type="button" class="btn btn-sm btn-ghost text-xs" id="btn-save-draft">
                Guardar borrador
              </button>
              <button type="button" class="btn btn-sm btn-primary shadow-gold text-xs font-semibold px-4" id="btn-submit-property">
                ${I('save', 'w-4 h-4')} ${isEdit ? 'Actualizar inmueble' : 'Publicar inmueble'}
              </button>
            </div>
          </div>
        </div>

        <form id="property-full-form" class="space-y-8">
          <!-- 1. OPERACIÓN Y TIPO DE INMUEBLE -->
          <section class="bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm space-y-6">
            <div class="border-b border-beige-200 pb-3 flex items-center justify-between">
              <div>
                <h2 class="font-display text-xl font-bold text-militar-950 flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-oro-100 text-oro-800 text-xs flex items-center justify-center font-bold">1</span>
                  Tipo de Operación y Propiedad
                </h2>
                <p class="text-xs text-militar-500">Define la modalidad comercial y la categoría arquitectónica</p>
              </div>
            </div>

            <!-- Selector de Operación (Venta / Alquiler / Ambos) -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-militar-700 mb-2">Modalidad Comercial *</label>
              <div class="grid grid-cols-3 gap-3" id="operation-selector">
                ${C.operations.map((o) => `
                  <label class="p-3 rounded-2xl border-2 text-center cursor-pointer transition ${p.operation === o.key ? 'border-militar-900 bg-militar-900 text-beige-50 shadow-md' : 'border-beige-200 bg-beige-50 text-militar-800 hover:border-oro-400'}">
                    <input type="radio" name="operation" value="${o.key}" class="sr-only" ${p.operation === o.key ? 'checked' : ''}>
                    <strong class="block text-sm font-semibold">${o.label}</strong>
                    <span class="text-[11px] opacity-75">${o.verb}</span>
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- Selector de Tipo de Inmueble (Iconos & Botones) -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-militar-700 mb-2">Categoría del Inmueble *</label>
              <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5" id="type-selector">
                ${C.types.map((t) => `
                  <label class="p-3 rounded-2xl border text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 ${p.type === t.key ? 'border-oro-500 bg-oro-50 text-oro-950 font-bold ring-2 ring-oro-400/40' : 'border-beige-200 bg-beige-50/60 text-militar-700 hover:border-beige-300'}">
                    <input type="radio" name="type" value="${t.key}" class="sr-only" ${p.type === t.key ? 'checked' : ''}>
                    <span class="p-2 rounded-xl ${p.type === t.key ? 'bg-oro-500 text-militar-950' : 'bg-white text-oro-700 shadow-sm'}">${I(t.icon, 'w-5 h-5')}</span>
                    <span class="text-xs leading-tight">${t.label}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          </section>

          <!-- 2. INFORMACIÓN PRINCIPAL Y PRECIOS -->
          <section class="bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm space-y-6">
            <div class="border-b border-beige-200 pb-3 flex items-center justify-between">
              <div>
                <h2 class="font-display text-xl font-bold text-militar-950 flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-oro-100 text-oro-800 text-xs flex items-center justify-center font-bold">2</span>
                  Información Comercial y Precios
                </h2>
                <p class="text-xs text-militar-500">Título atractivo, descripción completa y términos económicos</p>
              </div>
              <button type="button" class="btn btn-sm btn-outline text-xs" id="btn-use-template">
                ${I('sparkles', 'w-3.5 h-3.5')} Cargar plantilla oficial
              </button>
            </div>

            <!-- Título Comercial -->
            <div class="field">
              <label class="field-label text-xs">Título de la Publicación *</label>
              <input type="text" name="title" id="input-title" required value="${U.esc(p.title)}"
                     placeholder="Ej. Casa en venta en San Diego, Urb. Valle de Oro, condominio La Trilla"
                     class="input input-sm text-sm font-semibold w-full">
              <span class="text-[11px] text-militar-400 mt-1 block">Un buen título incluye el tipo, la urbanización y el municipio.</span>
            </div>

            <!-- Precios y Moneda -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="field">
                <label class="field-label text-xs">Precio de Venta *</label>
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-oro-600 font-bold">$</span>
                  <input type="number" name="price" id="input-price" required min="0" step="500" value="${p.price || ''}"
                         placeholder="75000" class="input input-sm pl-8 text-sm font-bold w-full">
                </div>
              </div>

              <div class="field">
                <label class="field-label text-xs">Canon de Alquiler (si aplica)</label>
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-militar-400 font-bold">$</span>
                  <input type="number" name="rentPrice" min="0" step="50" value="${p.rentPrice || ''}"
                         placeholder="350" class="input input-sm pl-8 text-sm w-full">
                </div>
              </div>

              <div class="field">
                <label class="field-label text-xs">Moneda</label>
                <select name="currency" class="input input-sm text-xs">
                  <option value="USD" ${p.currency === 'USD' ? 'selected' : ''}>Dólares (USD)</option>
                  <option value="EUR" ${p.currency === 'EUR' ? 'selected' : ''}>Euros (EUR)</option>
                  <option value="VES" ${p.currency === 'VES' ? 'selected' : ''}>Bolívares (VES)</option>
                </select>
              </div>

              <div class="field">
                <label class="field-label text-xs">Condominio mensual ($)</label>
                <input type="number" name="condoFee" value="${p.condoFee || ''}" placeholder="Ej. 25" class="input input-sm text-xs">
              </div>
            </div>

            <div class="flex items-center gap-6 pt-1">
              <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-militar-800">
                <input type="checkbox" name="negotiable" class="checkbox" ${p.negotiable ? 'checked' : ''}>
                <span>Precio Negociable</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer text-xs font-semibold text-oro-800">
                <input type="checkbox" name="featured" class="checkbox" ${p.featured ? 'checked' : ''}>
                <span>Destacar en la página de inicio (Home)</span>
              </label>
            </div>

            <!-- Descripción Larga -->
            <div class="field">
              <div class="flex items-center justify-between mb-1">
                <label class="field-label text-xs mb-0">Descripción Exhaustiva *</label>
                <span class="text-[11px] text-militar-400" id="desc-char-count">0 caracteres</span>
              </div>
              <textarea name="description" id="input-description" rows="8" required
                        placeholder="Detalla la distribución interior, acabados de primera, bondades del conjunto, seguridad y plusvalía..."
                        class="input input-sm text-xs leading-relaxed font-sans">${U.esc(p.description)}</textarea>
            </div>
          </section>

          <!-- 3. UBICACIÓN DETALLADA -->
          <section class="bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm space-y-6">
            <div class="border-b border-beige-200 pb-3">
              <h2 class="font-display text-xl font-bold text-militar-950 flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-oro-100 text-oro-800 text-xs flex items-center justify-center font-bold">3</span>
                Ubicación Geográfica
              </h2>
              <p class="text-xs text-militar-500">Localización exacta en Carabobo u otros estados del país</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="field">
                <label class="field-label text-xs">Estado *</label>
                <select name="location.state" id="loc-state" class="input input-sm text-xs">
                  ${C.states.map((st) => `<option value="${st}" ${p.location.state === st ? 'selected' : ''}>${st}</option>`).join('')}
                </select>
              </div>

              <div class="field">
                <label class="field-label text-xs">Municipio *</label>
                <input type="text" name="location.municipality" id="loc-muni" required value="${U.esc(p.location.municipality)}"
                       placeholder="Ej. San Diego, Valencia, Naguanagua" class="input input-sm text-xs">
              </div>

              <div class="field">
                <label class="field-label text-xs">Sector / Urbanización *</label>
                <input type="text" name="location.sector" required value="${U.esc(p.location.sector)}"
                       placeholder="Ej. Valle de Oro, La Trilla, El Parral" class="input input-sm text-xs">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="field">
                <label class="field-label text-xs">Dirección Exacta (Privada, solo asesores)</label>
                <input type="text" name="location.address" value="${U.esc(p.location.address || '')}"
                       placeholder="Calle, manzana, número de casa o edificio" class="input input-sm text-xs">
              </div>
              <div class="field">
                <label class="field-label text-xs">Punto de Referencia Comercial</label>
                <input type="text" name="location.reference" value="${U.esc(p.location.reference || '')}"
                       placeholder="Frente a la plaza, diagonal al C.C., etc." class="input input-sm text-xs">
              </div>
            </div>

            <!-- Coordenadas Geográficas -->
            <div class="p-4 bg-beige-50 rounded-2xl border border-beige-200 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold uppercase tracking-wider text-militar-700">Coordenadas aproximadas para el mapa</span>
                <button type="button" class="text-xs text-oro-700 hover:underline font-semibold" id="btn-sync-coords">
                  Centrar en San Diego / Valencia
                </button>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] text-militar-500 mb-0.5">Latitud</label>
                  <input type="number" step="0.00001" name="location.lat" id="loc-lat" value="${p.location.lat || 10.2558}" class="input input-sm text-xs bg-white">
                </div>
                <div>
                  <label class="block text-[11px] text-militar-500 mb-0.5">Longitud</label>
                  <input type="number" step="0.00001" name="location.lng" id="loc-lng" value="${p.location.lng || -67.9539}" class="input input-sm text-xs bg-white">
                </div>
              </div>
            </div>
          </section>

          <!-- 4. CARACTERÍSTICAS ARQUITECTÓNICAS -->
          <section class="bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm space-y-6">
            <div class="border-b border-beige-200 pb-3">
              <h2 class="font-display text-xl font-bold text-militar-950 flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-oro-100 text-oro-800 text-xs flex items-center justify-center font-bold">4</span>
                Especificaciones Arquitectónicas
              </h2>
              <p class="text-xs text-militar-500">Metrajes, distribución, niveles y capacidad de estacionamiento</p>
            </div>

            <!-- Metrajes -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div class="field">
                <label class="field-label text-xs">Área Construcción (m²) *</label>
                <input type="number" name="builtArea" min="0" step="0.5" value="${p.builtArea || ''}" placeholder="160" class="input input-sm text-xs font-bold">
              </div>
              <div class="field">
                <label class="field-label text-xs">Área Terreno (m²)</label>
                <input type="number" name="landArea" min="0" step="0.5" value="${p.landArea || ''}" placeholder="174" class="input input-sm text-xs font-bold">
              </div>
              <div class="field">
                <label class="field-label text-xs">Año Construcción</label>
                <input type="number" name="yearBuilt" min="1900" max="2030" value="${p.yearBuilt || ''}" placeholder="2015" class="input input-sm text-xs">
              </div>
              <div class="field">
                <label class="field-label text-xs">Plantas / Niveles</label>
                <input type="number" name="levels" min="1" max="10" value="${p.levels || 1}" class="input input-sm text-xs">
              </div>
            </div>

            <!-- Habitaciones y Baños -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div class="field">
                <label class="field-label text-xs">Habitaciones *</label>
                <input type="number" name="bedrooms" min="0" max="50" value="${p.bedrooms}" class="input input-sm text-xs font-bold">
              </div>
              <div class="field">
                <label class="field-label text-xs">Baños *</label>
                <input type="number" name="bathrooms" min="0" max="50" value="${p.bathrooms}" class="input input-sm text-xs font-bold">
              </div>
              <div class="field">
                <label class="field-label text-xs">Medios Baños</label>
                <input type="number" name="halfBaths" min="0" max="10" value="${p.halfBaths || 0}" class="input input-sm text-xs">
              </div>
              <div class="field">
                <label class="field-label text-xs">Puestos Estacionamiento *</label>
                <input type="number" name="parking" min="0" max="100" value="${p.parking || 2}" class="input input-sm text-xs font-bold">
              </div>
            </div>

            <!-- Condición y Amoblado -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="field">
                <label class="field-label text-xs">Condición del Inmueble</label>
                <select name="condition" class="input input-sm text-xs">
                  ${C.conditions.map((c) => `<option value="${c}" ${p.condition === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
              </div>

              <div class="field">
                <label class="field-label text-xs">Mobiliario</label>
                <select name="furnished" class="input input-sm text-xs">
                  ${C.furnished.map((f) => `<option value="${f.key}" ${p.furnished === f.key ? 'selected' : ''}>${f.label}</option>`).join('')}
                </select>
              </div>

              <div class="field">
                <label class="field-label text-xs">Tipo de Estacionamiento</label>
                <select name="parkingType" class="input input-sm text-xs">
                  ${C.parkingTypes.map((pt) => `<option value="${pt}" ${p.parkingType === pt ? 'selected' : ''}>${pt}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="pt-2">
              <label class="flex items-center gap-2 cursor-pointer text-xs font-medium text-militar-800">
                <input type="checkbox" name="serviceRoom" class="checkbox" ${p.serviceRoom ? 'checked' : ''}>
                <span>Posee habitación y baño de servicio independiente</span>
              </label>
            </div>
          </section>

          <!-- 5. AMENIDADES Y SERVICIOS (Chips agrupados) -->
          <section class="bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm space-y-6">
            <div class="border-b border-beige-200 pb-3">
              <h2 class="font-display text-xl font-bold text-militar-950 flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-oro-100 text-oro-800 text-xs flex items-center justify-center font-bold">5</span>
                Amenidades, Seguridad y Servicios
              </h2>
              <p class="text-xs text-militar-500">Selecciona los atributos clave que valorizan esta propiedad</p>
            </div>

            ${C.amenityGroups.map((grp) => `
              <div class="space-y-2">
                <span class="text-xs font-bold uppercase tracking-wider text-militar-700 flex items-center gap-1.5">
                  ${I(grp.icon, 'w-4 h-4 text-oro-600')} ${grp.label}
                </span>
                <div class="flex flex-wrap gap-2">
                  ${grp.items.map((item) => {
                    const active = (p.amenities || []).includes(item);
                    return `
                      <label class="amenity-chip cursor-pointer text-xs ${active ? 'active' : ''}">
                        <input type="checkbox" name="amenity" value="${U.esc(item)}" class="sr-only" ${active ? 'checked' : ''}>
                        <span>${U.esc(item)}</span>
                      </label>
                    `;
                  }).join('')}
                </div>
              </div>
            `).join('')}
          </section>

          <!-- 6. ZONA DE CARGA MULTIMEDIA FLUIDA (DRAG & DROP) -->
          <section class="bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm space-y-6">
            <div class="border-b border-beige-200 pb-3 flex items-center justify-between">
              <div>
                <h2 class="font-display text-xl font-bold text-militar-950 flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-oro-100 text-oro-800 text-xs flex items-center justify-center font-bold">6</span>
                  Zona Multimedia (Fotos, Planos y Videos)
                </h2>
                <p class="text-xs text-militar-500">Arrastra múltiples fotos a la vez. Se comprimen automáticamente en el navegador.</p>
              </div>
              <span class="badge badge-gold text-xs" id="photo-counter-badge">
                ${p.media.photos.length} fotos cargadas
              </span>
            </div>

            <!-- ÁREA DROPZONE -->
            <div id="photo-dropzone" class="border-2 border-dashed border-oro-400 bg-oro-50/30 hover:bg-oro-50/70 p-8 rounded-3xl text-center cursor-pointer transition duration-200 space-y-3">
              <div class="mx-auto w-14 h-14 rounded-full bg-oro-100 text-oro-800 flex items-center justify-center shadow-inner">
                ${I('upload', 'w-7 h-7')}
              </div>
              <div>
                <h3 class="font-display text-lg font-bold text-militar-950">
                  Arrastra tus fotos aquí o haz clic para seleccionar
                </h3>
                <p class="text-xs text-militar-600 mt-0.5">
                  Soporta JPG, PNG, WebP. Puedes cargar 10, 20 o más fotos simultáneamente.
                </p>
              </div>
              <input type="file" id="photo-file-input" multiple accept="image/*" class="sr-only">
            </div>

            <!-- CUADRÍCULA DE FOTOS CARGADAS -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-bold uppercase tracking-wider text-militar-700">Fotografías del Inmueble</span>
                <span class="text-[11px] text-militar-500">La primera imagen se utilizará como portada en el catálogo</span>
              </div>
              <div id="photos-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <!-- Se llena dinámicamente con JS -->
              </div>
            </div>

            <!-- TOUR VIRTUAL / VIDEO YOUTUBE -->
            <div class="p-4 bg-beige-50 rounded-2xl border border-beige-200 space-y-3">
              <span class="text-xs font-bold uppercase tracking-wider text-militar-700 block">Video de recorrido o Tour Virtual</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-[11px] text-militar-500 mb-0.5">Enlace de YouTube o Vimeo</label>
                  <input type="url" name="media.videoUrl" value="${U.esc(p.media.videoUrl || '')}"
                         placeholder="https://www.youtube.com/watch?v=..." class="input input-sm text-xs bg-white">
                </div>
                <div>
                  <label class="block text-[11px] text-militar-500 mb-0.5">Enlace de Tour 360° (Matterport)</label>
                  <input type="url" name="media.tourUrl" value="${U.esc(p.media.tourUrl || '')}"
                         placeholder="https://my.matterport.com/show/?m=..." class="input input-sm text-xs bg-white">
                </div>
              </div>
            </div>
          </section>

          <!-- 7. DATOS INTERNOS DE CAPTACIÓN (Solo para asesores) -->
          <section class="bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm space-y-6">
            <div class="border-b border-beige-200 pb-3">
              <h2 class="font-display text-xl font-bold text-militar-950 flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-oro-100 text-oro-800 text-xs flex items-center justify-center font-bold">7</span>
                Datos Privados de Captación (Interno)
              </h2>
              <p class="text-xs text-militar-500">Información confidencial para el seguimiento del asesor y contrato</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="field">
                <label class="field-label text-xs">Nombre del Propietario</label>
                <input type="text" name="internal.ownerName" value="${U.esc(p.internal?.ownerName || '')}" placeholder="Ej. Rodolfo Manrique" class="input input-sm text-xs">
              </div>
              <div class="field">
                <label class="field-label text-xs">Teléfono del Propietario</label>
                <input type="tel" name="internal.ownerPhone" value="${U.esc(p.internal?.ownerPhone || '')}" placeholder="0412-1234567" class="input input-sm text-xs">
              </div>
              <div class="field">
                <label class="field-label text-xs">Comisión Pactada (%)</label>
                <input type="number" name="internal.commission" min="1" max="100" value="${p.internal?.commission || 5}" class="input input-sm text-xs font-bold">
              </div>
            </div>

            <div class="field">
              <label class="field-label text-xs">Notas Privadas del Asesor</label>
              <textarea name="internal.notes" rows="2" placeholder="Detalles de llaves, disponibilidad para visitas, estatus de documentación jurídica..." class="input input-sm text-xs">${U.esc(p.internal?.notes || '')}</textarea>
            </div>
          </section>

          <!-- BOTONES FINALES DE ENVÍO -->
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" class="btn btn-outline" id="btn-cancel-bottom">
              Cancelar
            </button>
            <button type="button" class="btn btn-primary shadow-gold px-8 py-3 font-semibold text-sm" id="btn-submit-bottom">
              ${I('save', 'w-4 h-4')} ${isEdit ? 'Guardar Cambios' : 'Publicar Inmueble Completo'}
            </button>
          </div>
        </form>
      </div>
    `;
  }

  function mount(root, ctx) {
    const isEdit = !!ctx.params.id;
    const existing = isEdit ? PL.store.properties.get(ctx.params.id) : null;
    const advisor = PL.auth.currentAdvisor();

    // Estado reactivo de fotos cargadas
    let currentPhotos = existing?.media?.photos ? [...existing.media.photos] : [];
    let currentOp = existing?.operation || 'venta';
    let currentType = existing?.type || 'casa';

    const form = root.querySelector('#property-full-form');
    const titleInput = root.querySelector('#input-title');
    const descInput = root.querySelector('#input-description');
    const descCount = root.querySelector('#desc-char-count');
    const titlePreview = root.querySelector('#form-title-preview');
    const codeBadge = root.querySelector('#form-code-badge');
    const photosGrid = root.querySelector('#photos-grid');
    const photoCounter = root.querySelector('#photo-counter-badge');
    const gaugeBar = root.querySelector('#gauge-bar');
    const gaugeScore = root.querySelector('#gauge-score');

    // Contador de caracteres de la descripción
    function updateDescCount() {
      descCount.textContent = `${descInput.value.length} caracteres`;
    }
    descInput?.addEventListener('input', updateDescCount);
    updateDescCount();

    // Actualizar previsualización de título
    titleInput?.addEventListener('input', (e) => {
      titlePreview.textContent = e.target.value.trim() || 'Publicación de Inmueble';
      updateCompleteness();
    });

    // Selector de Operación
    root.querySelectorAll('#operation-selector label').forEach((lbl) => {
      lbl.addEventListener('click', () => {
        root.querySelectorAll('#operation-selector label').forEach((l) => {
          l.className = 'p-3 rounded-2xl border-2 text-center cursor-pointer transition border-beige-200 bg-beige-50 text-militar-800 hover:border-oro-400';
        });
        lbl.className = 'p-3 rounded-2xl border-2 text-center cursor-pointer transition border-militar-900 bg-militar-900 text-beige-50 shadow-md';
        currentOp = lbl.querySelector('input').value;
        updateCompleteness();
      });
    });

    // Selector de Tipo de Inmueble
    root.querySelectorAll('#type-selector label').forEach((lbl) => {
      lbl.addEventListener('click', () => {
        root.querySelectorAll('#type-selector label').forEach((l) => {
          l.className = 'p-3 rounded-2xl border text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 border-beige-200 bg-beige-50/60 text-militar-700 hover:border-beige-300';
          const iconSpan = l.querySelector('span');
          if (iconSpan) iconSpan.className = 'p-2 rounded-xl bg-white text-oro-700 shadow-sm';
        });
        lbl.className = 'p-3 rounded-2xl border text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 border-oro-500 bg-oro-50 text-oro-950 font-bold ring-2 ring-oro-400/40';
        const activeSpan = lbl.querySelector('span');
        if (activeSpan) activeSpan.className = 'p-2 rounded-xl bg-oro-500 text-militar-950';

        currentType = lbl.querySelector('input').value;
        if (!isEdit) {
          const nextCode = PL.store.properties.nextCode(currentType);
          codeBadge.textContent = nextCode;
        }
        updateCompleteness();
      });
    });

    // Toggle de chips de amenidades
    root.querySelectorAll('.amenity-chip').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        const cb = chip.querySelector('input');
        cb.checked = !cb.checked;
        chip.classList.toggle('active', cb.checked);
        updateCompleteness();
      });
    });

    // Plantilla oficial ProLíder para descripción rápida
    root.querySelector('#btn-use-template')?.addEventListener('click', () => {
      const typeLabel = C.type(currentType).label;
      const opLabel = C.operation(currentOp).label.toUpperCase();
      const template = `✨ ProLíder Inmobiliaria ✨\n\n${opLabel}\n\nEspectacular ${typeLabel} con excelente distribución y acabados de primera calidad.\n\nConsta de:\n• Metraje de construcción impecable\n• Amplia sala y comedor integrados\n• Cocina empotrada moderna con tope de granito\n• Habitaciones cómodas con closets\n• Baños remodelados\n• Puestos de estacionamiento techados\n\nBondades del inmueble:\n• Pozo de agua y tanque con hidroneumático\n• Planta eléctrica\n• Vigilancia privada y estricto control de acceso 24/7\n\nPlusvalía:\n• Cercano a colegios, supermercados, farmacias y vías principales.\n\n¡Liderando con propiedad! Agenda tu visita con nosotros.`;
      descInput.value = template;
      updateDescCount();
      updateCompleteness();
      PL.ui.toast('Plantilla oficial cargada en la descripción');
    });

    // Gestión de Fotos (Render, Eliminar, Portada)
    function renderPhotos() {
      photoCounter.textContent = `${currentPhotos.length} fotos cargadas`;
      if (!currentPhotos.length) {
        photosGrid.innerHTML = `<p class="col-span-full text-xs text-militar-400 py-3 italic">Aún no has cargado fotos para este inmueble.</p>`;
        return;
      }

      photosGrid.innerHTML = currentPhotos.map((ref, idx) => `
        <div class="relative aspect-square rounded-2xl overflow-hidden bg-militar-800 shadow-sm group border-2 ${idx === 0 ? 'border-oro-500 ring-2 ring-oro-400/40' : 'border-beige-200'}">
          <img src="${U.esc(PL.media.url(ref))}" class="w-full h-full object-cover" ${PL.media.onErr}>
          ${idx === 0 ? `
            <span class="absolute top-1.5 left-1.5 badge badge-gold text-[9px] px-1.5 py-0.5">Portada</span>
          ` : `
            <button type="button" data-set-cover="${idx}" class="absolute top-1.5 left-1.5 btn btn-xs btn-glass text-[9px] opacity-0 group-hover:opacity-100 transition">
              Hacer portada
            </button>
          `}
          <button type="button" data-remove-photo="${idx}" class="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 opacity-0 group-hover:opacity-100 transition shadow">
            ${I('trash', 'w-3 h-3')}
          </button>
        </div>
      `).join('');
    }

    // Procesar archivos subidos
    async function handleFiles(files) {
      if (!files || !files.length) return;
      PL.ui.toast(`Cargando y procesando ${files.length} foto(s)...`, 'info');

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const compressed = await PL.media.compressImage(file);
        const ref = await PL.media.put(compressed, file.name);
        currentPhotos.push(ref);
      }

      renderPhotos();
      updateCompleteness();
      PL.ui.toast('¡Fotos añadidas con éxito!');
    }

    // Drag & Drop
    const dropzone = root.querySelector('#photo-dropzone');
    const fileInput = root.querySelector('#photo-file-input');

    dropzone?.addEventListener('click', () => fileInput.click());
    fileInput?.addEventListener('change', (e) => handleFiles(e.target.files));

    ['dragenter', 'dragover'].forEach((ev) => {
      dropzone?.addEventListener(ev, (e) => {
        e.preventDefault();
        dropzone.classList.add('border-oro-600', 'bg-oro-100/50');
      });
    });
    ['dragleave', 'drop'].forEach((ev) => {
      dropzone?.addEventListener(ev, (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-oro-600', 'bg-oro-100/50');
      });
    });
    dropzone?.addEventListener('drop', (e) => {
      handleFiles(e.dataTransfer.files);
    });

    // Delegación en cuadrícula de fotos
    photosGrid?.addEventListener('click', (e) => {
      const coverBtn = e.target.closest('[data-set-cover]');
      if (coverBtn) {
        const idx = +coverBtn.dataset.setCover;
        const picked = currentPhotos.splice(idx, 1)[0];
        currentPhotos.unshift(picked);
        renderPhotos();
        PL.ui.toast('Foto de portada actualizada');
        return;
      }

      const delBtn = e.target.closest('[data-remove-photo]');
      if (delBtn) {
        const idx = +delBtn.dataset.removePhoto;
        currentPhotos.splice(idx, 1);
        renderPhotos();
        updateCompleteness();
      }
    });

    // Sincronizar coordenadas por defecto
    root.querySelector('#btn-sync-coords')?.addEventListener('click', () => {
      root.querySelector('#loc-lat').value = 10.2558;
      root.querySelector('#loc-lng').value = -67.9539;
      PL.ui.toast('Coordenadas fijadas en San Diego / Valencia');
    });

    // Recolectar datos del formulario
    function collectData() {
      const fd = new FormData(form);
      const amenities = Array.from(root.querySelectorAll('input[name="amenity"]:checked')).map((c) => c.value);

      return {
        code: codeBadge.textContent.trim(),
        title: titleInput.value.trim(),
        operation: currentOp,
        type: currentType,
        featured: fd.get('featured') === 'on',
        currency: fd.get('currency') || 'USD',
        price: +fd.get('price') || 0,
        rentPrice: +fd.get('rentPrice') || 0,
        negotiable: fd.get('negotiable') === 'on',
        condoFee: +fd.get('condoFee') || 0,
        description: descInput.value.trim(),
        location: {
          state: fd.get('location.state'),
          municipality: fd.get('location.municipality'),
          sector: fd.get('location.sector'),
          address: fd.get('location.address'),
          reference: fd.get('location.reference'),
          lat: +fd.get('location.lat') || 10.2558,
          lng: +fd.get('location.lng') || -67.9539,
        },
        builtArea: +fd.get('builtArea') || 0,
        landArea: +fd.get('landArea') || 0,
        yearBuilt: +fd.get('yearBuilt') || 0,
        levels: +fd.get('levels') || 1,
        bedrooms: +fd.get('bedrooms') || 0,
        bathrooms: +fd.get('bathrooms') || 0,
        halfBaths: +fd.get('halfBaths') || 0,
        serviceRoom: fd.get('serviceRoom') === 'on',
        parking: +fd.get('parking') || 0,
        parkingType: fd.get('parkingType'),
        condition: fd.get('condition'),
        furnished: fd.get('furnished'),
        amenities,
        media: {
          photos: currentPhotos,
          plans: existing?.media?.plans || [],
          videos: existing?.media?.videos || [],
          videoUrl: fd.get('media.videoUrl'),
          tourUrl: fd.get('media.tourUrl'),
        },
        internal: {
          ownerName: fd.get('internal.ownerName'),
          ownerPhone: fd.get('internal.ownerPhone'),
          commission: +fd.get('internal.commission') || 5,
          notes: fd.get('internal.notes'),
        },
        advisorId: existing?.advisorId || advisor.id,
      };
    }

    // Actualizar indicador de completitud
    function updateCompleteness() {
      const data = collectData();
      const comp = PL.store.completeness(data);
      gaugeBar.style.width = `${comp.score}%`;
      gaugeScore.textContent = `${comp.score}%`;
      gaugeBar.className = `h-full transition-all duration-300 ${comp.score >= 80 ? 'bg-emerald-600' : comp.score >= 50 ? 'bg-oro-500' : 'bg-red-500'}`;
    }

    // Guardar borrador
    root.querySelector('#btn-save-draft')?.addEventListener('click', () => {
      const data = collectData();
      data.status = 'borrador';
      if (isEdit) {
        PL.store.properties.update(existing.id, data);
        PL.ui.toast('Borrador actualizado con éxito');
      } else {
        const created = PL.store.properties.create(data);
        PL.ui.toast('Borrador guardado');
        PL.router.go(`/asesor/inmuebles/editar/${created.id}`);
      }
    });

    // Guardar / Publicar definitivo
    const submitBtn = root.querySelector('#btn-submit-property');
    const submitBottom = root.querySelector('#btn-submit-bottom');

    async function handlePublish() {
      const data = collectData();
      const comp = PL.store.completeness(data);

      if (comp.missingRequired.length) {
        const missingLabels = comp.missingRequired.map((m) => `• ${m.label}`).join('\n');
        PL.ui.toast(`Por favor completa los campos obligatorios:\n${missingLabels}`, 'error', 5000);
        return;
      }

      data.status = 'disponible';

      if (isEdit) {
        PL.store.properties.update(existing.id, data);
        PL.ui.toast('¡Inmueble actualizado y publicado exitosamente!');
      } else {
        PL.store.properties.create(data);
        PL.ui.toast('¡Inmueble publicado con éxito en el catálogo público!');
      }

      PL.router.go('/asesor/inmuebles');
    }

    submitBtn?.addEventListener('click', handlePublish);
    submitBottom?.addEventListener('click', handlePublish);
    root.querySelector('#btn-cancel-bottom')?.addEventListener('click', () => PL.router.go('/asesor/inmuebles'));

    renderPhotos();
    updateCompleteness();
  }

  return {
    title: 'Publicar / Editar Inmueble | ProLíder Backoffice',
    layout: 'admin',
    guard: 'advisor',
    render,
    mount,
  };
})();

