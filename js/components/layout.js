/**
 * ProLider - Layouts (portal público y panel de asesores)
 */
window.PL = window.PL || {};

PL.layout = (() => {
  const U = PL.utils;
  const I = PL.icon;

  /** Isotipo + logotipo de la marca */
  const logo = (dark = true, size = 'md') => `
    <a href="#/" class="flex items-center gap-2.5 shrink-0" aria-label="ProLíder Inmobiliaria - Inicio">
      <svg class="${size === 'lg' ? 'w-12 h-12' : 'w-10 h-10'}" viewBox="0 0 40 40" aria-hidden="true">
        <rect x="1" y="1" width="38" height="38" rx="11" fill="#2f3624" stroke="#d4b25e" stroke-width="1.4"/>
        <path d="M9.5 20.5 20 11.5l10.5 9" stroke="#d4b25e" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M16 29.5V21h5.2a3.1 3.1 0 0 1 0 6.2H16" stroke="#ebd9a0" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="leading-none">
        <span class="font-display ${size === 'lg' ? 'text-3xl' : 'text-[1.6rem]'} font-semibold tracking-wide ${dark ? 'text-beige-50' : 'text-militar-900'}">Pro<span class="text-oro-400">Líder</span></span>
        <span class="block text-[9.5px] tracking-[0.42em] uppercase mt-0.5 ${dark ? 'text-beige-300/80' : 'text-militar-500'}">Inmobiliaria</span>
      </span>
    </a>`;

  const avatar = (person, cls = 'w-10 h-10') => person?.photo
    ? `<img src="${U.esc(PL.media.url(person.photo))}" alt="${U.esc(person.name)}" class="${cls} rounded-full object-cover" ${PL.media.onErr}>`
    : `<span class="${cls} rounded-full bg-oro-500 text-militar-950 font-bold flex items-center justify-center text-sm">${U.initials(person?.name)}</span>`;

  /** Panel desplegable de notificaciones (cliente o asesor) */
  function notifPanel(userId) {
    const list = PL.store.notifications.forUser(userId).slice(0, 12);
    return `
      <div class="dropdown-panel w-[22rem] max-w-[calc(100vw-2rem)]" data-notif-panel hidden>
        <div class="flex items-center justify-between px-4 py-3 border-b border-beige-200">
          <strong class="text-militar-900">Notificaciones</strong>
          <button class="text-xs text-oro-700 hover:underline" data-mark-read>Marcar todo como leído</button>
        </div>
        <div class="max-h-96 overflow-y-auto divide-y divide-beige-100">
          ${list.length ? list.map((n) => `
            <a href="${n.link || '#'}" class="flex gap-3 px-4 py-3 hover:bg-beige-50 ${n.read ? '' : 'bg-oro-50/60'}">
              <span class="mt-1 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-beige-300' : 'bg-oro-500'}"></span>
              <span class="text-sm text-militar-800 leading-snug">${U.esc(n.text)}<span class="block text-xs text-militar-500 mt-1">${U.timeAgo(n.at)}</span></span>
            </a>`).join('') : `<p class="p-6 text-center text-sm text-militar-500">No tienes notificaciones.</p>`}
        </div>
      </div>`;
  }

  /** Comportamiento común de campana + dropdowns */
  function mountDropdowns(root, userId) {
    root.querySelectorAll('[data-dropdown]').forEach((btn) => {
      const panel = btn.parentElement.querySelector(btn.dataset.dropdown);
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = panel.hidden;
        root.querySelectorAll('.dropdown-panel').forEach((p) => (p.hidden = true));
        panel.hidden = !open;
      });
    });
    const closeAll = () => root.querySelectorAll('.dropdown-panel').forEach((p) => (p.hidden = true));
    document.addEventListener('click', closeAll);
    root.querySelector('[data-mark-read]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      PL.store.notifications.markAllRead(userId);
    });
    return () => document.removeEventListener('click', closeAll);
  }

  /* ================================================================= */
  /* PORTAL PÚBLICO                                                     */
  /* ================================================================= */
  function publicLayout(content, ctx) {
    const client = PL.auth.currentClient();
    const favs = PL.store.favorites.list().length;
    const unread = client ? PL.store.notifications.unread(client.id) : 0;
    const transparent = ctx.path === '/';
    const op = ctx.query.op;
    const links = [
      { href: '#/', label: 'Inicio', active: ctx.path === '/' },
      { href: '#/propiedades?op=venta', label: 'Comprar', active: ctx.path === '/propiedades' && op === 'venta' },
      { href: '#/propiedades?op=alquiler', label: 'Alquilar', active: ctx.path === '/propiedades' && op === 'alquiler' },
      { href: '#/propiedades', label: 'Propiedades', active: ctx.path === '/propiedades' && !op },
      { href: '#/asesores', label: 'Asesores', active: ctx.path.startsWith('/asesores') },
      { href: '#/cotizador', label: 'Cotizador', active: ctx.path === '/cotizador' },
    ];
    return `
      <header id="site-header" class="site-header ${transparent ? 'is-transparent' : ''}">
        <div class="container-x h-16 md:h-20 flex items-center justify-between gap-4">
          ${logo(true)}
          <nav class="hidden lg:flex items-center gap-1" aria-label="Principal">
            ${links.map((l) => `<a href="${l.href}" class="nav-link ${l.active ? 'active' : ''}">${l.label}</a>`).join('')}
          </nav>
          <div class="flex items-center gap-1.5 sm:gap-2">
            <a href="#/favoritos" class="icon-btn icon-btn-dark relative hidden sm:inline-flex" aria-label="Favoritos">
              ${I('heart')}${favs ? `<span class="dot-badge" data-fav-count>${favs}</span>` : ''}
            </a>
            ${client ? `
              <div class="relative">
                <button class="icon-btn icon-btn-dark relative" data-dropdown="[data-notif-panel]" aria-label="Notificaciones">
                  ${I('bell')}${unread ? `<span class="dot-badge">${unread}</span>` : ''}
                </button>
                ${notifPanel(client.id)}
              </div>
              <div class="relative">
                <button class="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 hover:bg-white/10 transition" data-dropdown="[data-user-panel]">
                  ${avatar(client, 'w-8 h-8')}
                  <span class="hidden md:block text-sm text-beige-100 font-medium">${U.esc(client.name.split(' ')[0])}</span>
                  ${I('chevronDown', 'w-4 h-4 text-beige-300 hidden md:block')}
                </button>
                <div class="dropdown-panel w-56" data-user-panel hidden>
                  <a href="#/mi-cuenta?tab=ofertas" class="dropdown-item">${I('handshake', 'w-4 h-4')} Mis ofertas</a>
                  <a href="#/mi-cuenta?tab=notificaciones" class="dropdown-item">${I('bell', 'w-4 h-4')} Notificaciones</a>
                  <a href="#/favoritos" class="dropdown-item">${I('heart', 'w-4 h-4')} Favoritos</a>
                  <a href="#/mi-cuenta?tab=perfil" class="dropdown-item">${I('user', 'w-4 h-4')} Mi perfil</a>
                  <button class="dropdown-item w-full text-red-700" data-client-logout>${I('logout', 'w-4 h-4')} Cerrar sesión</button>
                </div>
              </div>` : `
              <a href="#/ingresar" class="hidden sm:inline-flex btn btn-sm btn-ghost-light">${I('user', 'w-4 h-4')} Ingresar</a>`}
            <a href="#/asesor" class="hidden md:inline-flex btn btn-sm btn-gold">${I('key', 'w-4 h-4')} Portal Asesores</a>
            <button class="icon-btn icon-btn-dark lg:hidden" data-menu-toggle aria-label="Menú">${I('menu', 'w-6 h-6')}</button>
          </div>
        </div>
        <div class="mobile-drawer lg:hidden" data-mobile-drawer hidden>
          <nav class="container-x py-4 flex flex-col gap-1">
            ${links.map((l) => `<a href="${l.href}" class="mobile-link ${l.active ? 'active' : ''}">${l.label}</a>`).join('')}
            <div class="grid grid-cols-2 gap-3 pt-4 mt-2 border-t border-white/10">
              ${client ? `<a href="#/mi-cuenta" class="btn btn-ghost-light">${I('user', 'w-4 h-4')} Mi cuenta</a>` : `<a href="#/ingresar" class="btn btn-ghost-light">${I('user', 'w-4 h-4')} Ingresar</a>`}
              <a href="#/asesor" class="btn btn-gold">${I('key', 'w-4 h-4')} Asesores</a>
            </div>
          </nav>
        </div>
      </header>

      <main id="main" class="page-enter ${transparent ? '' : 'pt-16 md:pt-20'}">${content}</main>

      ${footer()}

      <!-- Navegación inferior móvil (mobile-first) -->
      <nav class="bottom-nav lg:hidden" aria-label="Navegación móvil">
        ${[
          ['#/', 'home', 'Inicio', ctx.path === '/'],
          ['#/propiedades', 'search', 'Buscar', ctx.path === '/propiedades'],
          ['#/favoritos', 'heart', 'Favoritos', ctx.path === '/favoritos'],
          ['#/asesores', 'users', 'Asesores', ctx.path.startsWith('/asesores')],
          [client ? '#/mi-cuenta' : '#/ingresar', 'user', client ? 'Cuenta' : 'Ingresar', ['/mi-cuenta', '/ingresar'].includes(ctx.path)],
        ].map(([h, ic, l, a]) => `<a href="${h}" class="${a ? 'active' : ''}">${I(ic, 'w-5 h-5')}<span>${l}</span></a>`).join('')}
      </nav>`;
  }

  function footer() {
    return `
      <footer class="bg-militar-950 text-beige-200 pt-16 pb-28 lg:pb-10 mt-20 relative overflow-hidden">
        <div class="absolute inset-0 opacity-[0.06] pointer-events-none bg-pattern"></div>
        <div class="container-x relative grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div class="space-y-4">
            ${logo(true, 'lg')}
            <p class="text-sm text-beige-300/80 leading-relaxed max-w-xs">Compra, venta y alquiler de inmuebles en Venezuela con asesoría profesional. <em class="text-oro-300 not-italic">¡Liderando con propiedad!</em></p>
            <div class="flex gap-2">
              <a href="https://www.instagram.com/proliderve/" target="_blank" rel="noopener" class="icon-btn icon-btn-dark border border-white/10" aria-label="Instagram">${I('instagram')}</a>
              <a href="mailto:proliderve@agenciabrings.com" class="icon-btn icon-btn-dark border border-white/10" aria-label="Correo">${I('mail')}</a>
            </div>
          </div>
          <div>
            <h4 class="footer-title">Explorar</h4>
            <ul class="space-y-2 text-sm">
              <li><a class="footer-link" href="#/propiedades?op=venta">Inmuebles en venta</a></li>
              <li><a class="footer-link" href="#/propiedades?op=alquiler">Inmuebles en alquiler</a></li>
              <li><a class="footer-link" href="#/propiedades?type=casa">Casas</a></li>
              <li><a class="footer-link" href="#/propiedades?type=apartamento">Apartamentos</a></li>
              <li><a class="footer-link" href="#/propiedades?type=penthouse,townhouse">Penthouses y Townhouses</a></li>
            </ul>
          </div>
          <div>
            <h4 class="footer-title">ProLíder</h4>
            <ul class="space-y-2 text-sm">
              <li><a class="footer-link" href="#/asesores">Nuestros asesores</a></li>
              <li><a class="footer-link" href="#/cotizador">Cotizador y financiamiento</a></li>
              <li><a class="footer-link" href="#/?s=publicar">Publica tu inmueble</a></li>
              <li><a class="footer-link" href="#/asesor">Portal de asesores</a></li>
            </ul>
          </div>
          <div>
            <h4 class="footer-title">Contacto</h4>
            <ul class="space-y-3 text-sm text-beige-300">
              <li class="flex gap-2">${I('pin', 'w-4 h-4 text-oro-400 mt-0.5 shrink-0')} Valencia, Estado Carabobo, Venezuela</li>
              <li class="flex gap-2">${I('mail', 'w-4 h-4 text-oro-400 mt-0.5 shrink-0')} proliderve@agenciabrings.com</li>
              <li class="flex gap-2">${I('instagram', 'w-4 h-4 text-oro-400 mt-0.5 shrink-0')} @proliderve</li>
            </ul>
          </div>
        </div>
        <div class="container-x relative mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row gap-3 justify-between text-xs text-beige-300/60">
          <span>© ${new Date().getFullYear()} ProLíder Inmobiliaria. Todos los derechos reservados.</span>
          <span>Precios referenciales sujetos a cambios sin previo aviso.</span>
        </div>
      </footer>`;
  }

  function mountPublic(root) {
    const header = U.$('#site-header', root);
    const cleanups = [];
    // Header transparente -> sólido al hacer scroll
    if (header?.classList.contains('is-transparent')) {
      const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener('scroll', onScroll));
    }
    U.$('[data-menu-toggle]', root)?.addEventListener('click', () => {
      const d = U.$('[data-mobile-drawer]', root);
      d.hidden = !d.hidden;
      header.classList.toggle('menu-open', !d.hidden);
    });
    U.$('[data-client-logout]', root)?.addEventListener('click', () => {
      PL.auth.clientLogout();
      PL.ui.toast('Sesión cerrada');
      PL.router.resolve();
    });
    const client = PL.auth.currentClient();
    cleanups.push(mountDropdowns(root, client?.id));
    return () => cleanups.forEach((f) => f());
  }

  /* ================================================================= */
  /* PANEL DE ASESORES                                                  */
  /* ================================================================= */
  function adminLayout(content, ctx) {
    const me = PL.auth.currentAdvisor();
    const pending = PL.store.offers.byAdvisor(me.id).filter((o) => o.status === 'pendiente').length;
    const myProps = me.role === 'admin' ? PL.store.properties.all().length : PL.store.properties.byAdvisor(me.id).length;
    const unread = PL.store.notifications.unread(me.id);
    const is = (p) => (p === '/asesor' ? ctx.path === '/asesor' : ctx.path.startsWith(p));
    const nav = [
      { href: '#/asesor', icon: 'grid', label: 'Dashboard', active: is('/asesor') },
      { href: '#/asesor/inmuebles', icon: 'building', label: me.role === 'admin' ? 'Todos los inmuebles' : 'Mis inmuebles', active: is('/asesor/inmuebles') && !ctx.path.includes('nuevo') && !ctx.path.includes('editar'), count: myProps },
      { href: '#/asesor/ofertas', icon: 'handshake', label: 'Ofertas', active: is('/asesor/ofertas'), count: pending, hot: pending > 0 },
      { href: '#/asesor/perfil', icon: 'user', label: 'Mi perfil', active: is('/asesor/perfil') },
    ];
    return `
      <div class="min-h-screen bg-beige-50">
        <aside class="admin-sidebar hidden lg:flex">
          <div class="px-6 h-20 flex items-center border-b border-white/5">${logo(true)}</div>
          <div class="px-4 pt-6">
            <a href="#/asesor/inmuebles/nuevo" class="btn btn-gold w-full justify-center py-3 shadow-gold">${I('plus')} Publicar inmueble</a>
          </div>
          <nav class="flex-1 px-3 py-6 space-y-1" aria-label="Panel">
            <p class="px-3 pb-2 text-[10px] uppercase tracking-[0.3em] text-beige-300/50">Gestión</p>
            ${nav.map((n) => `
              <a href="${n.href}" class="side-link ${n.active ? 'active' : ''}">
                ${I(n.icon, 'w-5 h-5')}<span class="flex-1">${n.label}</span>
                ${n.count ? `<span class="side-count ${n.hot ? 'hot' : ''}">${n.count}</span>` : ''}
              </a>`).join('')}
            <p class="px-3 pt-6 pb-2 text-[10px] uppercase tracking-[0.3em] text-beige-300/50">Portal</p>
            <a href="#/" class="side-link">${I('globe', 'w-5 h-5')}<span class="flex-1">Ver portal público</span>${I('external', 'w-4 h-4 opacity-50')}</a>
            ${me.role !== 'admin' ? `<a href="#/asesores/${me.id}" class="side-link">${I('eye', 'w-5 h-5')}<span>Mi perfil público</span></a>` : ''}
          </nav>
          <div class="p-4 border-t border-white/5 flex items-center gap-3">
            ${avatar(me, 'w-10 h-10 ring-2 ring-oro-500/40')}
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-beige-50 truncate">${U.esc(me.name)}</p>
              <p class="text-xs text-beige-300/60 truncate">${U.esc(me.title || '')}</p>
            </div>
            <button class="icon-btn icon-btn-dark" data-advisor-logout title="Cerrar sesión" aria-label="Cerrar sesión">${I('logout')}</button>
          </div>
        </aside>

        <div class="lg:pl-72 min-w-0">
          <header class="admin-topbar">
            <div class="lg:hidden">${logo(false)}</div>
            <div class="hidden lg:block text-sm text-militar-500">${U.greeting()}, <strong class="text-militar-900">${U.esc(me.name.split(' ')[0])}</strong></div>
            <div class="flex items-center gap-2">
              <a href="#/asesor/inmuebles/nuevo" class="btn btn-sm btn-primary hidden sm:inline-flex lg:hidden">${I('plus', 'w-4 h-4')} Publicar</a>
              <div class="relative">
                <button class="icon-btn relative" data-dropdown="[data-notif-panel]" aria-label="Notificaciones">
                  ${I('bell')}${unread ? `<span class="dot-badge">${unread}</span>` : ''}
                </button>
                ${notifPanel(me.id)}
              </div>
              <div class="relative">
                <button class="flex items-center gap-2 rounded-full p-1 hover:bg-beige-100" data-dropdown="[data-user-panel]">${avatar(me, 'w-9 h-9')}</button>
                <div class="dropdown-panel w-56" data-user-panel hidden>
                  <div class="px-4 py-3 border-b border-beige-200"><p class="font-semibold text-sm">${U.esc(me.name)}</p><p class="text-xs text-militar-500 truncate">${U.esc(me.email)}</p></div>
                  <a href="#/asesor/perfil" class="dropdown-item">${I('user', 'w-4 h-4')} Mi perfil</a>
                  <a href="#/" class="dropdown-item">${I('globe', 'w-4 h-4')} Ver portal público</a>
                  <button class="dropdown-item w-full text-red-700" data-advisor-logout>${I('logout', 'w-4 h-4')} Cerrar sesión</button>
                </div>
              </div>
            </div>
          </header>
          <main class="page-enter px-4 md:px-8 py-6 md:py-8 pb-28 lg:pb-10 max-w-[1400px]">${content}</main>
        </div>

        <nav class="bottom-nav admin lg:hidden" aria-label="Navegación del panel">
          <a href="#/asesor" class="${is('/asesor') ? 'active' : ''}">${I('grid')}<span>Inicio</span></a>
          <a href="#/asesor/inmuebles" class="${nav[1].active ? 'active' : ''}">${I('building')}<span>Inmuebles</span></a>
          <a href="#/asesor/inmuebles/nuevo" class="fab" aria-label="Publicar inmueble">${I('plus', 'w-7 h-7')}</a>
          <a href="#/asesor/ofertas" class="relative ${is('/asesor/ofertas') ? 'active' : ''}">${I('handshake')}<span>Ofertas</span>${pending ? `<span class="dot-badge right-3">${pending}</span>` : ''}</a>
          <a href="#/asesor/perfil" class="${is('/asesor/perfil') ? 'active' : ''}">${I('user')}<span>Perfil</span></a>
        </nav>
      </div>`;
  }

  function mountAdmin(root) {
    U.$$('[data-advisor-logout]', root).forEach((b) => b.addEventListener('click', () => {
      PL.auth.advisorLogout();
      PL.ui.toast('Sesión cerrada. ¡Hasta pronto!');
      PL.router.go('/asesor/login');
    }));
    return mountDropdowns(root, PL.auth.currentAdvisor()?.id);
  }

  return { publicLayout, adminLayout, mountPublic, mountAdmin, logo, avatar };
})();
