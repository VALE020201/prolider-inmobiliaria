/**
 * ProLider - Catálogos de dominio
 * ---------------------------------------------------------------
 * Fuente única de verdad para tipos de inmueble, operaciones, estatus,
 * amenidades, estados de Venezuela, etc. Tanto el portal público como el
 * panel de asesores leen de aquí, de modo que agregar un nuevo tipo o
 * amenidad es tan simple como añadir una línea.
 */
window.PL = window.PL || {};

PL.catalogs = (() => {
  /** Tipos de inmueble. `prefix` se usa para autogenerar el código (LDC-001). */
  const types = [
    { key: 'casa',           label: 'Casa',              plural: 'Casas',              icon: 'home',      prefix: 'LDC',  residential: true },
    { key: 'apartamento',    label: 'Apartamento',       plural: 'Apartamentos',       icon: 'building',  prefix: 'LDA',  residential: true },
    { key: 'penthouse',      label: 'Penthouse',         plural: 'Penthouses',         icon: 'crown',     prefix: 'LDPH', residential: true },
    { key: 'townhouse',      label: 'Townhouse',         plural: 'Townhouses',         icon: 'townhouse', prefix: 'LDTH', residential: true },
    { key: 'quinta',         label: 'Quinta',            plural: 'Quintas',            icon: 'trees',     prefix: 'LDQ',  residential: true },
    { key: 'terreno',        label: 'Terreno',           plural: 'Terrenos',           icon: 'map',       prefix: 'LDT',  residential: false, land: true },
    { key: 'local',          label: 'Local comercial',   plural: 'Locales',            icon: 'store',     prefix: 'LDL',  residential: false },
    { key: 'oficina',        label: 'Oficina',           plural: 'Oficinas',           icon: 'briefcase', prefix: 'LDO',  residential: false },
    { key: 'galpon',         label: 'Galpón',            plural: 'Galpones',           icon: 'warehouse', prefix: 'LDG',  residential: false },
    { key: 'fondo_comercio', label: 'Fondo de comercio', plural: 'Fondos de comercio', icon: 'tag',       prefix: 'LDFC', residential: false },
    { key: 'edificio',       label: 'Edificio',          plural: 'Edificios',          icon: 'layers',    prefix: 'LDE',  residential: false },
    { key: 'finca',          label: 'Finca / Hacienda',  plural: 'Fincas',             icon: 'sprout',    prefix: 'LDF',  residential: false, land: true },
  ];

  /** Tipos destacados en el buscador rápido del Home. */
  const quickTypes = ['casa', 'apartamento', 'penthouse', 'townhouse', 'terreno', 'local', 'oficina', 'galpon'];

  const operations = [
    { key: 'venta',          label: 'Venta',             verb: 'Comprar' },
    { key: 'alquiler',       label: 'Alquiler',          verb: 'Alquilar' },
    { key: 'venta_alquiler', label: 'Venta y Alquiler',  verb: 'Comprar o alquilar' },
  ];

  /** Estatus comercial de un inmueble. `public` = visible en el portal. */
  const statuses = [
    { key: 'disponible', label: 'Disponible', cls: 'badge-ok',      public: true },
    { key: 'reservado',  label: 'Reservado',  cls: 'badge-warn',    public: true },
    { key: 'vendido',    label: 'Vendido',    cls: 'badge-closed',  public: false },
    { key: 'alquilado',  label: 'Alquilado',  cls: 'badge-closed',  public: false },
    { key: 'borrador',   label: 'Borrador',   cls: 'badge-muted',   public: false },
  ];

  const offerStatuses = [
    { key: 'pendiente',   label: 'Pendiente',     cls: 'badge-warn' },
    { key: 'contraoferta',label: 'Contraoferta',  cls: 'badge-gold' },
    { key: 'aceptada',    label: 'Aceptada',      cls: 'badge-ok' },
    { key: 'rechazada',   label: 'Rechazada',     cls: 'badge-closed' },
    { key: 'retirada',    label: 'Retirada',      cls: 'badge-muted' },
  ];

  const conditions = ['Primer uso', 'Remodelado', 'Excelente', 'Bueno', 'Satisfactorio', 'Para remodelar'];
  const furnished = [
    { key: 'amoblado', label: 'Amoblado' },
    { key: 'semi_amoblado', label: 'Semi-amoblado' },
    { key: 'sin_amoblar', label: 'Sin amoblar' },
  ];
  const parkingTypes = ['Techado', 'Descubierto', 'Garaje privado', 'Asignado en sótano', 'Puesto de visitante'];
  const orientations = ['Norte', 'Sur', 'Este', 'Oeste', 'Noreste', 'Noroeste', 'Sureste', 'Suroeste'];
  const currencies = [
    { key: 'USD', symbol: '$',   label: 'Dólares (USD)' },
    { key: 'EUR', symbol: '€',   label: 'Euros (EUR)' },
    { key: 'VES', symbol: 'Bs.', label: 'Bolívares (VES)' },
  ];
  const paymentOptions = ['Contado (Transferencia / Efectivo)', 'Pago en 2 partes (Opción y Registro - 30 a 45 días)', 'Plan corto acordado (hasta 60 días)', 'Permuta con diferencia'];

  /** Amenidades agrupadas (el formulario las muestra como chips por grupo). */
  const amenityGroups = [
    { key: 'seguridad', label: 'Seguridad', icon: 'shield', items: [
      'Vigilancia 24h', 'Acceso controlado', 'Calle privada', 'Cerco eléctrico', 'Cámaras CCTV', 'Sistema de seguridad', 'Garita', 'Portón eléctrico', 'Rejas de seguridad' ] },
    { key: 'energia', label: 'Agua y energía', icon: 'zap', items: [
      'Planta eléctrica', 'Paneles solares', 'Tanque de agua', 'Pozo de agua', 'Hidroneumático', 'Gas directo', 'Calentador' ] },
    { key: 'comunes', label: 'Áreas comunes', icon: 'users', items: [
      'Piscina', 'Jacuzzi', 'Gimnasio', 'Parque infantil', 'Salón de fiestas', 'Caney / Parrillera', 'Cancha deportiva', 'Áreas verdes', 'Ascensor', 'Estacionamiento de visitantes', 'Club house' ] },
    { key: 'interiores', label: 'Interiores y exteriores', icon: 'home', items: [
      'Maletero', 'Aire acondicionado', 'Cocina empotrada', 'Walk-in closet', 'Estudio', 'Family room', 'Lavandero', 'Terraza', 'Balcón', 'Jardín', 'Patio', 'Chimenea', 'Pisos de porcelanato', 'Techo de machihembrado' ] },
    { key: 'comercial', label: 'Comercial e industrial', icon: 'briefcase', items: [
      'Vitrina', 'Depósito', 'Recepción', 'Sala de reuniones', 'Baño privado', 'Cableado de red', 'Montacargas', 'Andén de carga', 'Mezzanina', 'Oficinas administrativas', 'Altura libre +8 m' ] },
  ];
  const services = ['Electricidad', 'Agua', 'Aguas servidas', 'Gas', 'Aseo urbano', 'Teléfono', 'Internet', 'Internet fibra óptica', 'TV satelital'];
  const nearby = ['Supermercado', 'Farmacia', 'Colegio', 'Guardería', 'Universidad', 'Hospital', 'Centro comercial', 'Transporte público', 'Autopista', 'Gasolinera', 'Parque', 'Banco', 'Restaurantes', 'Centro deportivo', 'Montaña', 'Aeropuerto'];

  /** Amenidades más buscadas: filtros rápidos del catálogo público. */
  const popularAmenities = ['Piscina', 'Vigilancia 24h', 'Planta eléctrica', 'Pozo de agua', 'Maletero', 'Ascensor', 'Aire acondicionado', 'Jardín'];

  const states = ['Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón', 'Guárico', 'La Guaira', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Yaracuy', 'Zulia'];

  /** Municipios frecuentes (sugerencias en el formulario). */
  const municipalities = {
    Carabobo: ['Valencia', 'San Diego', 'Naguanagua', 'Libertador', 'Los Guayos', 'Guacara', 'Diego Ibarra', 'Puerto Cabello', 'Bejuma', 'Carlos Arvelo', 'Montalbán', 'Juan José Mora', 'San Joaquín', 'Miranda'],
    'Distrito Capital': ['Libertador'],
    Miranda: ['Baruta', 'Chacao', 'El Hatillo', 'Sucre', 'Los Salias', 'Plaza', 'Zamora'],
    Aragua: ['Girardot', 'Mario Briceño Iragorry', 'Santiago Mariño', 'Sucre'],
  };

  /** Coordenadas por defecto para centrar mapas. */
  const defaultCenter = { lat: 10.2050, lng: -67.9900, zoom: 12 };

  // ---- Helpers de búsqueda en catálogos ----
  const find = (list, key) => list.find((x) => x.key === key);
  return {
    types, quickTypes, operations, statuses, offerStatuses, conditions, furnished, parkingTypes,
    orientations, currencies, paymentOptions, amenityGroups, services, nearby, popularAmenities,
    states, municipalities, defaultCenter,
    type: (k) => find(types, k) || { key: k, label: k || '—', plural: k, icon: 'home', prefix: 'LD' },
    operation: (k) => find(operations, k) || { key: k, label: k || '—' },
    status: (k) => find(statuses, k) || { key: k, label: k || '—', cls: 'badge-muted' },
    offerStatus: (k) => find(offerStatuses, k) || { key: k, label: k, cls: 'badge-muted' },
    currency: (k) => find(currencies, k) || currencies[0],
    furnishedLabel: (k) => (find(furnished, k) || { label: '—' }).label,
    allAmenities: () => amenityGroups.flatMap((g) => g.items),
  };
})();

