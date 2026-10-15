/**
 * ProLider - Controlador Principal de la Aplicación (Bootloader)
 * ---------------------------------------------------------------
 * Registra todas las rutas del Portal Público y del Panel de Asesores,
 * gestiona el renderizado de layouts, títulos de página y montaje de componentes.
 */
window.PL = window.PL || {};

PL.app = (() => {
  const U = PL.utils;

  // Página 404 / No Encontrada
  PL.pages.notFound = {
    title: 'Página no encontrada | ProLíder Inmobiliaria',
    layout: 'public',
    render: () => `
      <div class="container-x py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <span class="font-display text-7xl font-bold text-oro-400 block mb-2">404</span>
        <h1 class="font-display text-3xl font-bold text-militar-950 mb-3">Página no encontrada</h1>
        <p class="text-militar-600 max-w-md mx-auto mb-8 text-sm">
          La ruta a la que intentas acceder no existe, ha cambiado de lugar o se encuentra en mantenimiento.
        </p>
        <a href="#/" class="btn btn-primary px-6 py-3 shadow-gold text-sm font-semibold">
          Volver a la página principal
        </a>
      </div>
    `,
    mount: () => {},
  };

  /**
   * Renderiza una página envolviéndola en el layout correspondiente
   */
  function render(page, ctx) {
    const root = U.$('#app');
    if (!root) return null;

    // Actualizar título de la pestaña del navegador
    document.title = page.title || 'ProLíder Inmobiliaria | Inmuebles en Venezuela';

    // Generar contenido interno
    const innerHtml = page.render(ctx);

    // Envolver en el layout
    let fullHtml = innerHtml;
    let mountLayout = null;

    if (page.layout === 'public') {
      fullHtml = PL.layout.publicLayout(innerHtml, ctx);
      mountLayout = PL.layout.mountPublic;
    } else if (page.layout === 'admin') {
      fullHtml = PL.layout.adminLayout(innerHtml, ctx);
      mountLayout = PL.layout.mountAdmin;
    }

    root.innerHTML = fullHtml;

    // Montar scripts del layout
    const layoutCleanup = mountLayout ? mountLayout(root, ctx) : null;

    // Montar scripts de la página
    const pageCleanup = page.mount ? page.mount(root, ctx) : null;

    return () => {
      if (typeof pageCleanup === 'function') pageCleanup();
      if (typeof layoutCleanup === 'function') layoutCleanup();
    };
  }

  /**
   * Inicialización global de la aplicación
   */
  async function init() {
    // Inicializar almacenamiento multimedia (IndexedDB)
    await PL.media.init();

    // Registrar rutas del Portal Público
    PL.router.add('/', 'home');
    PL.router.add('/propiedades', 'properties');
    PL.router.add('/propiedad/:id', 'propertyDetail');
    PL.router.add('/cotizador', 'calculator');
    PL.router.add('/asesores', 'advisors');
    PL.router.add('/asesores/:id', 'advisors');
    PL.router.add('/mi-cuenta', 'account');
    PL.router.add('/ingresar', 'account');
    PL.router.add('/favoritos', 'account');

    // Registrar rutas del Backoffice / CRM de Asesores
    PL.router.add('/asesor', 'advisorDashboard');
    PL.router.add('/asesor/login', 'advisorLogin');
    PL.router.add('/asesor/inmuebles', 'advisorProperties');
    PL.router.add('/asesor/inmuebles/nuevo', 'advisorPropertyForm');
    PL.router.add('/asesor/inmuebles/editar/:id', 'advisorPropertyForm');
    PL.router.add('/asesor/ofertas', 'advisorOffers');
    PL.router.add('/asesor/perfil', 'advisorProfile');

    // Resolver ruta inicial
    PL.router.resolve();
  }

  return { init, render };
})();

// Arrancar al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
  PL.app.init();
});

