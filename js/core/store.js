/**
 * ProLider - Capa de datos (Store)
 * ---------------------------------------------------------------
 * Persistencia local (localStorage) que simula el backend/API REST.
 * Expone colecciones con métodos CRUD: properties, advisors, clients,
 * offers, notifications, leads y favorites.
 *
 * MIGRACIÓN A PRODUCCIÓN: cada método de este módulo corresponde 1:1 a un
 * endpoint (GET /properties, POST /offers, PATCH /offers/:id ...). Basta con
 * reemplazar la implementación por llamadas fetch() sin tocar las vistas.
 */
window.PL = window.PL || {};

PL.store = (() => {
  const U = PL.utils;
  const KEY = 'prolider.db';
  const FAV_KEY = 'prolider.favorites';
  const DB_VERSION = 3;
  const listeners = new Set();
  let db = null;

  /* ------------------------------------------------------------------ */
  /* Normalización del seed importado desde proliderve.com              */
  /* ------------------------------------------------------------------ */
  const AMENITY_ALIAS = {
    'aire acondicionado': 'Aire acondicionado', 'vigilancia privada': 'Vigilancia 24h', 'pozo de agua': 'Pozo de agua',
    jardin: 'Jardín', 'tanque de agua': 'Tanque de agua', 'cocina emp.': 'Cocina empotrada', 'gas directo': 'Gas directo',
    'sist. seguridad': 'Sistema de seguridad', ascensor: 'Ascensor', parrillera: 'Caney / Parrillera',
    'estac. publico': 'Estacionamiento de visitantes', terraza: 'Terraza', piscina: 'Piscina', estudio: 'Estudio',
    'planta electrica': 'Planta eléctrica', gimnasio: 'Gimnasio', 'cableado red': 'Cableado de red', 'zona de carga': 'Andén de carga',
    maletero: 'Maletero', 'parque infantil': 'Parque infantil', 'salon de fiestas': 'Salón de fiestas', 'cancha de tenis': 'Cancha deportiva',
    jacuzzi: 'Jacuzzi', 'calle privada': 'Calle privada', depositos: 'Depósito', recepcion: 'Recepción', 'sala de reuniones': 'Sala de reuniones',
    'sala / comedor': 'Sala / comedor', 'salon / comedor': 'Sala / comedor', 'sala de espera': 'Sala de espera', 'area comercial': 'Área comercial',
    'central telefonica': 'Central telefónica', 'lineas telefonica': 'Líneas telefónicas', 'bano auxiliar': 'Baño auxiliar', ceramica: 'Pisos de cerámica',
    parquet: 'Pisos de parquet', 'area secretaria': 'Área de secretaria',
  };
  const AMENITY_DROP = new Set(['otros', 'cable', 'amoblado', 'semiamoblado', 'equipado', 'hab. servicio', 'estac. techado', 'comedor', 'salon', 'estar', 'archivo', 'taquilla']);
  const SERVICE_ALIAS = { 'agua servidas': 'Aguas servidas', 'tv fibra optica': 'Internet fibra óptica', wifi: 'Internet', 'tv satelital': 'TV satelital', 'aseo urbano': 'Aseo urbano' };
  const NEARBY_ALIAS = { escuela: 'Colegio', instituto: 'Colegio', autobus: 'Transporte público', taxi: 'Transporte público', guarderia: 'Guardería', 'area comercial': 'Centro comercial', compras: 'Centro comercial', gasolinerias: 'Gasolinera', 'parque infantil': 'Parque', auditorio: 'Centro cultural' };
  const CONDITION_ALIAS = { 'primer uso': 'Primer uso', 'para ser renovado': 'Para remodelar' };

  const mapList = (list, alias, drop = new Set()) =>
    [...new Set((list || []).map((x) => {
      const k = U.norm(x);
      if (drop.has(k)) return null;
      return alias[k] || x.charAt(0).toUpperCase() + x.slice(1).toLowerCase();
    }).filter(Boolean))];

  function normalizeProperty(p) {
    const raw = (p.amenities || []).map(U.norm);
    return {
      ...p,
      title: U.titleCase(p.title).replace(/^En Venta /, ''),
      condition: CONDITION_ALIAS[U.norm(p.condition)] || p.condition || '',
      serviceRoom: raw.includes('hab. servicio'),
      parkingType: raw.includes('estac. techado') ? 'Techado' : '',
      furnished: raw.includes('amoblado') ? 'amoblado' : raw.includes('semiamoblado') ? 'semi_amoblado' : 'sin_amoblar',
      amenities: mapList(p.amenities, AMENITY_ALIAS, AMENITY_DROP),
      services: mapList(p.services, SERVICE_ALIAS),
      nearby: mapList(p.nearby, NEARBY_ALIAS),
      paymentOptions: ['Contado'],
    };
  }

  /** Construye la base de datos inicial a partir de window.PL_SEED */
  function buildInitialDb() {
    const seed = window.PL_SEED || { advisors: [], properties: [] };
    const DEFAULT_PASS = U.hash('prolider2026');
    const bios = [
      'Especialista en inmuebles residenciales de Carabobo. Te acompaño en cada paso: desde la visita hasta la firma en el registro.',
      'Asesoría personalizada, negociación transparente y conocimiento profundo del mercado de Valencia y San Diego.',
      'Más que vender inmuebles, ayudo a familias a encontrar su hogar. Atención rápida y seguimiento continuo.',
    ];
    const advisors = seed.advisors.map((a, i) => ({
      ...a, bio: bios[i % bios.length], passwordHash: DEFAULT_PASS, active: true, createdAt: '2026-05-21T14:00:00.000Z',
    }));
    // Usuario de gerencia (ve todo el portafolio). No aparece en el portal público.
    advisors.push({
      id: 'admin', name: 'Gerencia ProLíder', email: 'admin@proliderve.com', phone: '', photo: '', instagram: 'proliderve',
      role: 'admin', title: 'Gerencia General', zone: 'Venezuela', bio: '', passwordHash: U.hash('admin2026'), active: true,
    });

    const properties = seed.properties.map(normalizeProperty);
    const clients = [
      { id: 'c_demo', name: 'Daniela Rojas', email: 'cliente@demo.com', phone: '04141234567', passwordHash: U.hash('cliente123'), createdAt: new Date().toISOString() },
      { id: 'c_demo2', name: 'Luis Herrera', email: 'luis.herrera@demo.com', phone: '04245558899', passwordHash: U.hash('cliente123'), createdAt: new Date().toISOString() },
    ];

    // Ofertas de demostración para que el panel no arranque vacío
    const offers = [];
    const notifications = [];
    const ago = (h) => new Date(Date.now() - h * 3600e3).toISOString();
    const byAdv = (id) => properties.filter((p) => p.advisorId === id && p.price > 0);
    const jenny = byAdv('2rO1XPZKHqNBTAOpYEqHA5wGJgf2');
    const carolina = byAdv('3d3bhgfTS6YpFXqOyesPaNCPSvi2');
    const mk = (p, c, pct, status, hours, extra = {}) => {
      const amount = Math.round((p.price * pct) / 500) * 500;
      const o = {
        id: U.uid('o_'), propertyId: p.id, advisorId: p.advisorId, clientId: c.id, clientName: c.name, clientEmail: c.email,
        clientPhone: c.phone, amount, currency: p.currency, financing: 'Contado', downPayment: 0,
        message: 'Buenas tardes, me interesa mucho el inmueble. Puedo concretar la compra en un plazo de 30 días con documentos al día.',
        status, counterAmount: null, createdAt: ago(hours), updatedAt: ago(hours),
        history: [{ at: ago(hours), by: 'cliente', action: 'oferta', amount, message: 'Oferta inicial' }], ...extra,
      };
      offers.push(o);
      return o;
    };
    if (jenny[0]) mk(jenny[0], clients[0], 0.9, 'pendiente', 5);
    if (jenny[1]) {
      const o = mk(jenny[1], clients[1], 0.85, 'contraoferta', 30, { financing: 'Crédito bancario', downPayment: 30 });
      o.counterAmount = Math.round((jenny[1].price * 0.94) / 500) * 500;
      o.history.push({ at: ago(20), by: 'asesor', action: 'contraoferta', amount: o.counterAmount, message: 'El propietario puede considerar este monto con firma en 45 días.' });
      o.updatedAt = ago(20);
    }
    if (carolina[0]) mk(carolina[0], clients[0], 0.88, 'pendiente', 2);
    offers.forEach((o) => notifications.push({
      id: U.uid('n_'), userId: o.advisorId, text: `Nueva oferta de ${o.clientName}`, link: `#/asesor/ofertas?id=${o.id}`, read: false, at: o.createdAt,
    }));

    return { version: DB_VERSION, advisors, properties, clients, offers, notifications, leads: [], createdAt: new Date().toISOString() };
  }

  /* ------------------------------------------------------------------ */
  /* Persistencia                                                        */
  /* ------------------------------------------------------------------ */
  function load() {
    try { db = JSON.parse(localStorage.getItem(KEY)); } catch { db = null; }
    if (!db || db.version !== DB_VERSION) { db = buildInitialDb(); persist(); }
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); }
    catch (e) { console.error(e); PL.ui?.toast('Almacenamiento local lleno. Elimine archivos antiguos.', 'error'); }
  }
  const emit = (evt) => listeners.forEach((fn) => { try { fn(evt); } catch (e) { console.error(e); } });
  const commit = (evt) => { persist(); emit(evt); };
  const on = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
  const now = () => new Date().toISOString();

  /* ------------------------------------------------------------------ */
  /* Inmuebles                                                           */
  /* ------------------------------------------------------------------ */
  const isPublic = (p) => PL.catalogs.status(p.status).public;

  const properties = {
    all: () => db.properties,
    public: () => db.properties.filter(isPublic),
    get: (id) => db.properties.find((p) => p.id === id),
    byAdvisor: (aid) => db.properties.filter((p) => p.advisorId === aid),

    /** Búsqueda/filtrado usado por el catálogo público y el panel */
    search(f = {}, source = properties.public()) {
      const q = U.norm(f.q);
      const types = f.type ? String(f.type).split(',') : [];
      const amen = f.amenities ? String(f.amenities).split(',') : [];
      let list = source.filter((p) => {
        if (f.op === 'venta' && !['venta', 'venta_alquiler'].includes(p.operation)) return false;
        if (f.op === 'alquiler' && !['alquiler', 'venta_alquiler'].includes(p.operation)) return false;
        if (types.length && !types.includes(p.type)) return false;
        if (f.status && p.status !== f.status) return false;
        if (f.municipality && U.norm(p.location.municipality) !== U.norm(f.municipality)) return false;
        const price = f.op === 'alquiler' && p.operation === 'venta_alquiler' ? p.rentPrice || p.price : p.price;
        if (f.minPrice && price < +f.minPrice) return false;
        if (f.maxPrice && price > +f.maxPrice) return false;
        if (f.beds && p.bedrooms < +f.beds) return false;
        if (f.baths && p.bathrooms < +f.baths) return false;
        if (f.parking && p.parking < +f.parking) return false;
        if (f.minArea && Math.max(p.builtArea, p.landArea) < +f.minArea) return false;
        if (amen.length && !amen.every((a) => p.amenities.includes(a))) return false;
        if (f.advisor && p.advisorId !== f.advisor) return false;
        if (q) {
          const hay = U.norm([p.title, p.code, p.location.municipality, p.location.sector, p.location.state, PL.catalogs.type(p.type).label].join(' '));
          if (!q.split(/\s+/).every((t) => hay.includes(t))) return false;
        }
        return true;
      });
      const sorters = {
        recent: (a, b) => b.createdAt.localeCompare(a.createdAt),
        price_asc: (a, b) => (a.price || Infinity) - (b.price || Infinity),
        price_desc: (a, b) => b.price - a.price,
        area_desc: (a, b) => Math.max(b.builtArea, b.landArea) - Math.max(a.builtArea, a.landArea),
        featured: (a, b) => (b.featured - a.featured) || b.createdAt.localeCompare(a.createdAt),
      };
      list = [...list].sort(sorters[f.sort] || sorters.featured);
      return list;
    },

    /** Genera el siguiente código interno según el tipo (LDC-174) */
    nextCode(type) {
      const prefix = PL.catalogs.type(type).prefix;
      const max = db.properties.reduce((m, p) => {
        const mm = String(p.code || '').match(new RegExp(`^${prefix}-(\\d+)$`));
        return mm ? Math.max(m, +mm[1]) : m;
      }, 0);
      return `${prefix}-${String(max + 1).padStart(3, '0')}`;
    },

    create(data) {
      const p = { ...data, id: U.uid('p_'), views: 0, createdAt: now(), updatedAt: now() };
      if (!p.code) p.code = properties.nextCode(p.type);
      db.properties.unshift(p);
      commit({ type: 'property:create', id: p.id });
      return p;
    },
    update(id, patch) {
      const i = db.properties.findIndex((p) => p.id === id);
      if (i < 0) return null;
      db.properties[i] = { ...db.properties[i], ...patch, id, updatedAt: now() };
      commit({ type: 'property:update', id });
      return db.properties[i];
    },
    remove(id) {
      const p = properties.get(id);
      if (!p) return;
      [...(p.media.photos || []), ...(p.media.plans || []), ...(p.media.videos || [])].forEach((m) => PL.media.remove(m.ref || m));
      db.properties = db.properties.filter((x) => x.id !== id);
      commit({ type: 'property:remove', id });
    },
    duplicate(id) {
      const src = properties.get(id);
      if (!src) return null;
      const copy = U.clone(src);
      delete copy.id; delete copy.code;
      copy.title = `${src.title} (copia)`;
      copy.status = 'borrador';
      return properties.create(copy);
    },
    addView(id) {
      const p = properties.get(id);
      if (p) { p.views = (p.views || 0) + 1; persist(); }
    },
    /** Lista de municipios con inmuebles publicados (para filtros) */
    municipalities: () => [...new Set(properties.public().map((p) => p.location.municipality).filter(Boolean))].sort(),
    sectors: () => [...new Set(db.properties.map((p) => p.location.sector).filter(Boolean))].sort(),
  };

  /**
   * Calidad/completitud de una ficha. Lo usa el formulario (barra de progreso,
   * validación de publicación) y el dashboard.
   */
  function completeness(p) {
    const t = PL.catalogs.type(p.type);
    const photos = (p.media?.photos || []).length;
    const checks = [
      { ok: !!p.operation, w: 3, req: true, label: 'Tipo de operación', step: 'tipo' },
      { ok: !!p.type, w: 3, req: true, label: 'Tipo de inmueble', step: 'tipo' },
      { ok: (p.title || '').trim().length >= 10, w: 3, req: true, label: 'Título (mín. 10 caracteres)', step: 'info' },
      { ok: (p.description || '').trim().length >= 80, w: 3, req: true, label: 'Descripción (mín. 80 caracteres)', step: 'info' },
      { ok: +p.price > 0, w: 3, req: true, label: 'Precio', step: 'precio' },
      { ok: !!(p.location?.state && p.location?.municipality && p.location?.sector), w: 3, req: true, label: 'Estado, municipio y sector', step: 'ubicacion' },
      { ok: +p.builtArea > 0 || +p.landArea > 0, w: 3, req: true, label: 'Metraje (construcción o terreno)', step: 'caracteristicas' },
      { ok: photos >= 3, w: 3, req: true, label: 'Mínimo 3 fotografías', step: 'multimedia' },
      { ok: !t.residential || +p.bedrooms > 0, w: 2, label: 'Número de habitaciones', step: 'caracteristicas' },
      { ok: t.land || +p.bathrooms > 0, w: 2, label: 'Número de baños', step: 'caracteristicas' },
      { ok: !!(p.location?.lat && p.location?.lng), w: 2, label: 'Ubicación en el mapa', step: 'ubicacion' },
      { ok: !!p.location?.address, w: 1, label: 'Dirección exacta (privada)', step: 'ubicacion' },
      { ok: (p.amenities || []).length >= 3, w: 2, label: 'Al menos 3 amenidades', step: 'amenidades' },
      { ok: (p.nearby || []).length >= 2, w: 1, label: 'Puntos de interés cercanos', step: 'amenidades' },
      { ok: t.land || +p.yearBuilt > 1900, w: 1, label: 'Año de construcción', step: 'caracteristicas' },
      { ok: !!p.condition, w: 1, label: 'Condición del inmueble', step: 'caracteristicas' },
      { ok: photos >= 8, w: 2, label: '8 fotos o más (recomendado)', step: 'multimedia' },
      { ok: (p.media?.plans || []).length > 0, w: 1, label: 'Planos del inmueble', step: 'multimedia' },
      { ok: !!(p.media?.videoUrl || p.media?.tourUrl || (p.media?.videos || []).length), w: 2, label: 'Video o tour virtual', step: 'multimedia' },
    ];
    const total = checks.reduce((s, c) => s + c.w, 0);
    const got = checks.reduce((s, c) => s + (c.ok ? c.w : 0), 0);
    return {
      score: Math.round((got / total) * 100),
      missingRequired: checks.filter((c) => c.req && !c.ok),
      missingRecommended: checks.filter((c) => !c.req && !c.ok),
    };
  }

  /* ------------------------------------------------------------------ */
  /* Asesores                                                            */
  /* ------------------------------------------------------------------ */
  const advisors = {
    all: () => db.advisors,
    public: () => db.advisors.filter((a) => a.role !== 'admin' && a.active !== false),
    get: (id) => db.advisors.find((a) => a.id === id),
    byEmail: (email) => db.advisors.find((a) => a.email.toLowerCase() === String(email).trim().toLowerCase()),
    update(id, patch) {
      const a = advisors.get(id);
      if (!a) return null;
      Object.assign(a, patch);
      commit({ type: 'advisor:update', id });
      return a;
    },
    stats(id) {
      const list = properties.byAdvisor(id);
      return {
        total: list.length,
        active: list.filter(isPublic).length,
        venta: list.filter((p) => isPublic(p) && p.operation !== 'alquiler').length,
        alquiler: list.filter((p) => isPublic(p) && p.operation !== 'venta').length,
      };
    },
  };

  /* ------------------------------------------------------------------ */
  /* Clientes                                                            */
  /* ------------------------------------------------------------------ */
  const clients = {
    get: (id) => db.clients.find((c) => c.id === id),
    byEmail: (email) => db.clients.find((c) => c.email.toLowerCase() === String(email).trim().toLowerCase()),
    create(data) {
      const c = { ...data, id: U.uid('c_'), createdAt: now() };
      db.clients.push(c);
      commit({ type: 'client:create', id: c.id });
      return c;
    },
    update(id, patch) {
      const c = clients.get(id);
      if (c) { Object.assign(c, patch); commit({ type: 'client:update', id }); }
      return c;
    },
  };

  /* ------------------------------------------------------------------ */
  /* Notificaciones in-app                                               */
  /* ------------------------------------------------------------------ */
  const notifications = {
    forUser: (uid) => db.notifications.filter((n) => n.userId === uid).sort((a, b) => b.at.localeCompare(a.at)),
    unread: (uid) => db.notifications.filter((n) => n.userId === uid && !n.read).length,
    push(userId, text, link = '', silent = false) {
      db.notifications.push({ id: U.uid('n_'), userId, text, link, read: false, at: now() });
      if (!silent) commit({ type: 'notification', userId });
    },
    markAllRead(uid) {
      db.notifications.forEach((n) => { if (n.userId === uid) n.read = true; });
      commit({ type: 'notification:read', userId: uid });
    },
  };

  /* ------------------------------------------------------------------ */
  /* Ofertas / negociación                                               */
  /* ------------------------------------------------------------------ */
  const offers = {
    all: () => db.offers,
    get: (id) => db.offers.find((o) => o.id === id),
    byAdvisor: (aid) => db.offers.filter((o) => aid === 'admin' || o.advisorId === aid).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    byClient: (cid) => db.offers.filter((o) => o.clientId === cid).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    byProperty: (pid) => db.offers.filter((o) => o.propertyId === pid),
    activeFor: (pid, cid) => db.offers.find((o) => o.propertyId === pid && o.clientId === cid && ['pendiente', 'contraoferta'].includes(o.status)),

    /** El cliente envía una oferta formal */
    create({ property, client, amount, financing, downPayment, message, phone }) {
      const o = {
        id: U.uid('o_'), propertyId: property.id, advisorId: property.advisorId, clientId: client.id,
        clientName: client.name, clientEmail: client.email, clientPhone: phone || client.phone,
        amount: +amount, currency: property.currency, financing, downPayment: +downPayment || 0, message,
        status: 'pendiente', counterAmount: null, createdAt: now(), updatedAt: now(),
        history: [{ at: now(), by: 'cliente', action: 'oferta', amount: +amount, message }],
      };
      db.offers.push(o);
      notifications.push(property.advisorId, `Nueva oferta de ${client.name} por ${U.fmtMoney(amount, property.currency)} · ${property.code}`, `#/asesor/ofertas?id=${o.id}`, true);
      notifications.push('admin', `Nueva oferta en ${property.code} (${client.name})`, `#/asesor/ofertas?id=${o.id}`, true);
      commit({ type: 'offer:create', id: o.id });
      return o;
    },

    /**
     * Respuesta del asesor: accept | reject | counter
     * Notifica automáticamente al cliente.
     */
    respond(id, action, { amount, message, reserve } = {}) {
      const o = offers.get(id);
      if (!o) return null;
      const p = properties.get(o.propertyId);
      const map = { accept: 'aceptada', reject: 'rechazada', counter: 'contraoferta' };
      o.status = map[action];
      if (action === 'counter') o.counterAmount = +amount;
      o.updatedAt = now();
      o.history.push({ at: now(), by: 'asesor', action: o.status, amount: action === 'counter' ? +amount : o.amount, message: message || '' });
      if (action === 'accept' && reserve && p) { p.status = 'reservado'; p.updatedAt = now(); }
      const txt = {
        accept: `🎉 ¡Tu oferta por ${p?.code || ''} fue ACEPTADA! El asesor te contactará para los próximos pasos.`,
        reject: `Tu oferta por ${p?.code || ''} fue rechazada.${message ? ' Motivo: ' + message : ''}`,
        counter: `Recibiste una CONTRAOFERTA de ${U.fmtMoney(amount, o.currency)} por ${p?.code || ''}.`,
      }[action];
      notifications.push(o.clientId, txt, `#/mi-cuenta?tab=ofertas&id=${o.id}`, true);
      commit({ type: 'offer:update', id });
      return o;
    },

    /** Respuesta del cliente a una contraoferta o retiro: accept | reject | new | withdraw */
    clientRespond(id, action, { amount, message } = {}) {
      const o = offers.get(id);
      if (!o) return null;
      const p = properties.get(o.propertyId);
      if (action === 'accept') { o.status = 'aceptada'; o.amount = o.counterAmount || o.amount; }
      if (action === 'reject') o.status = 'rechazada';
      if (action === 'withdraw') o.status = 'retirada';
      if (action === 'new') { o.status = 'pendiente'; o.amount = +amount; }
      o.updatedAt = now();
      const actionLabel = { accept: 'aceptada', reject: 'rechazada', withdraw: 'retirada', new: 'nueva_oferta' }[action];
      o.history.push({ at: now(), by: 'cliente', action: actionLabel, amount: o.amount, message: message || '' });
      const txt = {
        accept: `${o.clientName} ACEPTÓ tu contraoferta en ${p?.code}`,
        reject: `${o.clientName} rechazó la contraoferta en ${p?.code}`,
        withdraw: `${o.clientName} retiró su oferta en ${p?.code}`,
        new: `${o.clientName} envió una nueva oferta de ${U.fmtMoney(amount, o.currency)} en ${p?.code}`,
      }[action];
      notifications.push(o.advisorId, txt, `#/asesor/ofertas?id=${o.id}`, true);
      commit({ type: 'offer:update', id });
      return o;
    },
  };

  /* ------------------------------------------------------------------ */
  /* Captaciones (propietarios que quieren publicar) y favoritos         */
  /* ------------------------------------------------------------------ */
  const leads = {
    all: () => [...(db.leads || [])].sort((a, b) => b.at.localeCompare(a.at)),
    create(data) {
      db.leads = db.leads || [];
      const l = { ...data, id: U.uid('l_'), at: now(), status: 'nuevo' };
      db.leads.push(l);
      notifications.push('admin', `Nueva captación: ${data.name} quiere ${data.operation === 'alquiler' ? 'alquilar' : 'vender'} su inmueble`, '#/asesor', true);
      commit({ type: 'lead:create' });
      return l;
    },
  };

  const favorites = {
    list: () => { try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { return []; } },
    has: (id) => favorites.list().includes(id),
    toggle(id) {
      const l = favorites.list();
      const i = l.indexOf(id);
      i >= 0 ? l.splice(i, 1) : l.push(id);
      localStorage.setItem(FAV_KEY, JSON.stringify(l));
      emit({ type: 'favorites' });
      return i < 0;
    },
  };

  /** Restablece los datos de demostración */
  function reset() {
    localStorage.removeItem(KEY);
    load();
    emit({ type: 'reset' });
  }

  load();
  return { on, properties, advisors, clients, offers, notifications, leads, favorites, completeness, reset, isPublic };
})();
