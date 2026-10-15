/**
 * ProLider - Portal del Cliente (Mi Cuenta / Ofertas / Favoritos / Login)
 * ---------------------------------------------------------------
 * - Sistema de seguimiento de ofertas y negociación
 * - Respuesta a contraofertas de asesores (Aceptar, Contraofertar, Rechazar)
 * - Gestión de favoritos
 * - Modal y página de login/registro de clientes
 */
window.PL = window.PL || {};
PL.pages = PL.pages || {};

PL.pages.account = (() => {
  const U = PL.utils;
  const C = PL.catalogs;
  const I = PL.icon;

  function render(ctx) {
    const client = PL.auth.currentClient();
    if (!client) {
      return renderAuthPage(ctx);
    }

    const tab = ctx.query.tab || 'ofertas';
    const myOffers = PL.store.offers.byClient(client.id);
    const favIds = PL.store.favorites.list();
    const favProps = PL.store.properties.public().filter((p) => favIds.includes(p.id));
    const notifs = PL.store.notifications.forUser(client.id);

    return `
      <div class="bg-beige-50 min-h-screen py-8 md:py-12">
        <div class="container-x max-w-5xl">
          <!-- CABECERA DEL CLIENTE -->
          <div class="bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <span class="w-16 h-16 rounded-full bg-oro-500 text-militar-950 text-2xl font-bold flex items-center justify-center shadow-md">
                ${U.initials(client.name)}
              </span>
              <div>
                <h1 class="font-display text-2xl sm:text-3xl font-bold text-militar-950">${U.esc(client.name)}</h1>
                <p class="text-xs text-militar-500 flex items-center gap-2 mt-0.5">
                  <span>${U.esc(client.email)}</span>
                  ${client.phone ? `<span>• ${U.fmtPhone(client.phone)}</span>` : ''}
                </p>
              </div>
            </div>

            <button type="button" id="btn-logout-client" class="btn btn-sm btn-ghost self-start sm:self-auto text-red-600 hover:bg-red-50">
              ${I('logout', 'w-4 h-4')} Cerrar sesión
            </button>
          </div>

          <!-- PESTAÑAS -->
          <div class="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar border-b border-beige-200">
            <a href="#/mi-cuenta?tab=ofertas" class="btn btn-sm rounded-full ${tab === 'ofertas' ? 'btn-primary' : 'btn-outline'} text-xs">
              ${I('handshake', 'w-4 h-4')} Mis Ofertas (${myOffers.length})
            </a>
            <a href="#/mi-cuenta?tab=favoritos" class="btn btn-sm rounded-full ${tab === 'favoritos' ? 'btn-primary' : 'btn-outline'} text-xs">
              ${I('heart', 'w-4 h-4')} Favoritos (${favProps.length})
            </a>
            <a href="#/mi-cuenta?tab=notificaciones" class="btn btn-sm rounded-full ${tab === 'notificaciones' ? 'btn-primary' : 'btn-outline'} text-xs">
              ${I('bell', 'w-4 h-4')} Notificaciones (${notifs.length})
            </a>
            <a href="#/mi-cuenta?tab=perfil" class="btn btn-sm rounded-full ${tab === 'perfil' ? 'btn-primary' : 'btn-outline'} text-xs">
              ${I('user', 'w-4 h-4')} Mi Perfil
            </a>
          </div>

          <!-- CONTENIDO DE LA PESTAÑA -->
          <div id="account-tab-content">
            ${tab === 'ofertas' ? renderOffersTab(myOffers) : ''}
            ${tab === 'favoritos' ? renderFavoritesTab(favProps) : ''}
            ${tab === 'notificaciones' ? renderNotificationsTab(notifs) : ''}
            ${tab === 'perfil' ? renderProfileTab(client) : ''}
          </div>
        </div>
      </div>
    `;
  }

  function renderOffersTab(offers) {
    if (!offers.length) {
      return PL.ui.empty('handshake', 'Aún no has enviado ofertas económicas', 'Explora nuestro catálogo y presenta tu propuesta formal en cualquier propiedad.', '<a href="#/propiedades" class="btn btn-primary">Ver propiedades</a>');
    }

    return `
      <div class="space-y-4">
        ${offers.map((o) => {
          const p = PL.store.properties.get(o.propertyId);
          const adv = PL.store.advisors.get(o.advisorId);
          const status = C.offerStatus(o.status);

          return `
            <div class="bg-white p-6 rounded-3xl border border-beige-200 shadow-sm space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-beige-100">
                <div>
                  <span class="text-xs font-semibold uppercase tracking-wider text-oro-700">${p ? p.code : 'Inmueble'}</span>
                  <h3 class="font-display text-lg text-militar-950 font-bold">
                    <a href="#/propiedad/${o.propertyId}" class="hover:text-oro-700">${U.esc(p ? p.title : 'Propiedad')}</a>
                  </h3>
                  <span class="text-xs text-militar-500">Asesor a cargo: ${U.esc(adv ? adv.name : 'Asesor ProLíder')}</span>
                </div>
                <div class="text-left sm:text-right">
                  <span class="badge ${status.cls} text-xs">${status.label}</span>
                  <span class="block text-xs text-militar-400 mt-1">${U.timeAgo(o.updatedAt)}</span>
                </div>
              </div>

              <!-- MONTOS Y MENSAJE -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div class="p-3 bg-beige-50 rounded-2xl border border-beige-100">
                  <span class="text-militar-500 block text-xs">Tu oferta enviada</span>
                  <strong class="font-display text-xl text-militar-950">${U.fmtMoney(o.amount, o.currency)}</strong>
                  <span class="block text-militar-500 text-[11px] mt-0.5">Modalidad: ${U.esc(o.financing)}</span>
                </div>

                ${o.status === 'contraoferta' && o.counterAmount ? `
                  <div class="p-3 bg-oro-50 rounded-2xl border border-oro-200">
                    <span class="text-oro-800 font-semibold block text-xs">Contraoferta del Asesor</span>
                    <strong class="font-display text-xl text-oro-800">${U.fmtMoney(o.counterAmount, o.currency)}</strong>
                    <span class="block text-oro-700 text-[11px] mt-0.5">Propuesta formal del propietario</span>
                  </div>
                ` : `
                  <div class="p-3 bg-beige-50 rounded-2xl border border-beige-100">
                    <span class="text-militar-500 block text-xs">Precio publicado de referencia</span>
                    <strong class="font-display text-xl text-militar-950">${p ? U.fmtMoney(p.price, p.currency) : '—'}</strong>
                  </div>
                `}
              </div>

              <!-- HISTORIAL DE NEGOCIACIÓN -->
              <div class="space-y-2 pt-2">
                <span class="text-xs font-bold uppercase tracking-wider text-militar-600">Historial de mensajes</span>
                <div class="space-y-2 text-xs bg-beige-50/70 p-3 rounded-2xl border border-beige-100 max-h-40 overflow-y-auto">
                  ${o.history.map((h) => `
                    <div class="flex items-start gap-2 ${h.by === 'asesor' ? 'text-oro-900 font-medium' : 'text-militar-800'}">
                      <span class="font-bold uppercase text-[10px] px-1.5 py-0.5 rounded ${h.by === 'asesor' ? 'bg-oro-200 text-oro-900' : 'bg-beige-200 text-militar-900'}">
                        ${h.by === 'asesor' ? 'Asesor' : 'Tú'}
                      </span>
                      <span class="flex-1">${U.esc(h.message || (h.action === 'contraoferta' ? `Contraoferta de ${U.fmtMoney(h.amount, o.currency)}` : 'Oferta registrada'))}</span>
                      <span class="text-[10px] text-militar-400 shrink-0">${U.fmtDate(h.at)}</span>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- ACCIONES EN CASO DE CONTRAOFERTA -->
              ${o.status === 'contraoferta' ? `
                <div class="flex flex-wrap gap-2 pt-2 border-t border-beige-100 justify-end" data-offer-actions="${o.id}">
                  <button type="button" class="btn btn-sm btn-ghost text-red-600" data-action="reject">Rechazar propuesta</button>
                  <button type="button" class="btn btn-sm btn-outline" data-action="new">Contraofertar nuevo monto</button>
                  <button type="button" class="btn btn-sm btn-primary shadow-gold" data-action="accept">Aceptar contraoferta (${U.fmtMoney(o.counterAmount, o.currency)})</button>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderFavoritesTab(props) {
    if (!props.length) {
      return PL.ui.empty('heart', 'No tienes propiedades favoritas guardadas', 'Haz clic en el icono del corazón en cualquier propiedad para guardarla y revisarla después.', '<a href="#/propiedades" class="btn btn-primary">Explorar catálogo</a>');
    }
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${props.map((p) => PL.cards.propertyCard(p)).join('')}
      </div>
    `;
  }

  function renderNotificationsTab(notifs) {
    if (!notifs.length) {
      return PL.ui.empty('bell', 'Bandeja de notificaciones vacía', 'Aquí recibirás actualizaciones sobre el estatus de tus ofertas y respuestas de los asesores.');
    }
    return `
      <div class="bg-white rounded-3xl border border-beige-200 shadow-sm divide-y divide-beige-100 overflow-hidden">
        ${notifs.map((n) => `
          <div class="p-4 flex items-start gap-3 hover:bg-beige-50 transition">
            <span class="mt-1 w-2.5 h-2.5 rounded-full ${n.read ? 'bg-beige-300' : 'bg-oro-500'} shrink-0"></span>
            <div class="flex-1 min-w-0">
              <p class="text-xs sm:text-sm text-militar-900 leading-snug">${U.esc(n.text)}</p>
              <span class="text-[11px] text-militar-400 mt-1 block">${U.timeAgo(n.at)}</span>
            </div>
            ${n.link ? `<a href="${n.link}" class="btn btn-sm btn-outline text-xs">Ver</a>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderProfileTab(client) {
    return `
      <div class="bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm max-w-xl">
        <h2 class="font-display text-xl text-militar-950 font-bold mb-4">Actualizar Datos de Contacto</h2>
        <form id="client-profile-form" class="space-y-4">
          <div class="field">
            <label class="field-label">Nombre completo</label>
            <input type="text" name="name" value="${U.esc(client.name)}" required class="input input-sm">
          </div>
          <div class="field">
            <label class="field-label">Correo electrónico</label>
            <input type="email" name="email" value="${U.esc(client.email)}" disabled class="input input-sm bg-beige-100 text-militar-500 cursor-not-allowed">
            <span class="text-[11px] text-militar-400">El correo está vinculado a tu cuenta y no puede cambiarse directamente.</span>
          </div>
          <div class="field">
            <label class="field-label">Teléfono de contacto (WhatsApp)</label>
            <input type="tel" name="phone" value="${U.esc(client.phone || '')}" placeholder="0414-1234567" class="input input-sm">
          </div>
          <button type="submit" class="btn btn-primary shadow-gold">Guardar cambios</button>
        </form>
      </div>
    `;
  }

  function renderAuthPage(ctx) {
    return `
      <div class="bg-beige-50 min-h-screen py-12 md:py-20 flex items-center justify-center">
        <div class="container-x max-w-md w-full">
          <div class="bg-white p-8 rounded-3xl border border-beige-200 shadow-xl space-y-6">
            <div class="text-center">
              <span class="inline-flex p-3 rounded-2xl bg-militar-900 text-oro-400 shadow-md mb-3">
                ${I('user', 'w-7 h-7')}
              </span>
              <h1 class="font-display text-3xl font-bold text-militar-950">Acceso a Clientes</h1>
              <p class="text-xs text-militar-600 mt-1">Gestiona tus ofertas formales y propiedades favoritas</p>
            </div>

            <!-- BOTONES DE INGRESO RÁPIDO DEMO -->
            <div class="p-3 bg-oro-50 border border-oro-200 rounded-2xl space-y-2 text-center">
              <span class="text-[11px] font-bold text-oro-900 uppercase tracking-wider block">Acceso Rápido para Demostración</span>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <button type="button" class="btn btn-sm btn-outline bg-white hover:bg-oro-100 text-xs py-1.5" id="btn-quick-daniela">
                  Daniela Rojas
                </button>
                <button type="button" class="btn btn-sm btn-outline bg-white hover:bg-oro-100 text-xs py-1.5" id="btn-quick-luis">
                  Luis Herrera
                </button>
              </div>
            </div>

            <!-- FORMULARIO DE LOGIN / REGISTRO -->
            <form id="client-login-form" class="space-y-4">
              <div class="field">
                <label class="field-label">Correo electrónico</label>
                <input type="email" name="email" required placeholder="tu@correo.com" class="input input-sm">
              </div>
              <div class="field">
                <label class="field-label">Contraseña</label>
                <input type="password" name="password" required placeholder="••••••••" class="input input-sm">
              </div>
              <button type="submit" class="btn btn-primary w-full justify-center py-2.5 rounded-xl shadow-gold font-semibold">
                Iniciar sesión
              </button>
            </form>

            <div class="text-center pt-2 border-t border-beige-200">
              <a href="#/asesor/login" class="text-xs text-oro-700 hover:underline font-medium">
                ¿Eres asesor inmobiliario? Entra al Backoffice aquí
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function mount(root, ctx) {
    const client = PL.auth.currentClient();

    if (!client) {
      // Demo logins
      root.querySelector('#btn-quick-daniela')?.addEventListener('click', () => {
        PL.auth.clientLogin('cliente@demo.com', 'cliente123');
        PL.ui.toast('¡Bienvenida, Daniela Rojas!');
        PL.router.resolve();
      });
      root.querySelector('#btn-quick-luis')?.addEventListener('click', () => {
        PL.auth.clientLogin('luis.herrera@demo.com', 'cliente123');
        PL.ui.toast('¡Bienvenido, Luis Herrera!');
        PL.router.resolve();
      });

      // Login form
      const form = root.querySelector('#client-login-form');
      form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const res = PL.auth.clientLogin(fd.get('email'), fd.get('password'));
        if (res.ok) {
          PL.ui.toast(`¡Bienvenido de vuelta, ${res.user.name}!`);
          PL.router.resolve();
        } else {
          PL.ui.toast(res.error, 'error');
        }
      });
      return;
    }

    // Logout
    root.querySelector('#btn-logout-client')?.addEventListener('click', () => {
      PL.auth.clientLogout();
      PL.ui.toast('Sesión cerrada');
      PL.router.go('/');
    });

    // Perfil form
    const profileForm = root.querySelector('#client-profile-form');
    profileForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(profileForm);
      PL.store.clients.update(client.id, {
        name: fd.get('name'),
        phone: fd.get('phone'),
      });
      PL.ui.toast('Perfil actualizado');
    });

    // Acciones sobre contraofertas recibidas
    root.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const wrap = btn.closest('[data-offer-actions]');
      if (!wrap) return;
      const offerId = wrap.dataset.offerActions;
      const action = btn.dataset.action;

      if (action === 'accept') {
        const ok = await PL.ui.confirm({
          title: '¿Aceptar contraoferta?',
          message: 'Al aceptar, el asesor y el propietario serán notificados para coordinar la firma y reserva del inmueble.',
          confirmText: 'Sí, aceptar contraoferta',
        });
        if (ok) {
          PL.store.offers.clientRespond(offerId, 'accept', { message: 'El cliente ha aceptado la contraoferta formalmente.' });
          PL.ui.toast('¡Contraoferta aceptada! El asesor se comunicará contigo.');
          PL.router.resolve();
        }
      } else if (action === 'reject') {
        const ok = await PL.ui.confirm({
          title: '¿Rechazar contraoferta?',
          message: 'La negociación actual quedará cerrada.',
          confirmText: 'Rechazar propuesta',
          danger: true,
        });
        if (ok) {
          PL.store.offers.clientRespond(offerId, 'reject', { message: 'El cliente no aceptó la contraoferta.' });
          PL.ui.toast('Propuesta rechazada.', 'info');
          PL.router.resolve();
        }
      } else if (action === 'new') {
        const m = PL.ui.modal({
          title: 'Enviar nueva contrapropuesta',
          body: `
            <div class="space-y-4">
              <div class="field">
                <label class="field-label text-xs">Nuevo monto a ofrecer (USD)</label>
                <input type="number" id="modal-new-amount" class="input input-sm text-base font-bold" min="1000" step="500">
              </div>
              <div class="field">
                <label class="field-label text-xs">Mensaje explicativo</label>
                <textarea id="modal-new-msg" rows="3" class="input input-sm text-xs" placeholder="Explica las condiciones de tu contraoferta..."></textarea>
              </div>
            </div>
          `,
          footer: `
            <button class="btn btn-ghost" data-close>Cancelar</button>
            <button class="btn btn-primary" id="btn-modal-send-counter">Enviar contrapropuesta</button>
          `,
        });

        m.el.querySelector('#btn-modal-send-counter').addEventListener('click', () => {
          const amount = +m.el.querySelector('#modal-new-amount').value;
          const msg = m.el.querySelector('#modal-new-msg').value;
          if (!amount || amount <= 0) {
            PL.ui.toast('Ingresa un monto válido', 'error');
            return;
          }
          PL.store.offers.clientRespond(offerId, 'new', { amount, message: msg });
          PL.ui.toast('¡Nueva contrapropuesta enviada al asesor!');
          m.close();
          PL.router.resolve();
        });
      }
    });
  }

  /**
   * Modal interactivo de autenticación para clientes (abierto al intentar ofertar)
   */
  function openAuthModal(reason = '', onSuccess) {
    const m = PL.ui.modal({
      title: 'Iniciar Sesión / Registro de Cliente',
      size: 'sm',
      body: `
        <div class="space-y-4">
          ${reason ? `<p class="text-xs text-militar-600 bg-oro-50 p-2.5 rounded-xl border border-oro-200">${U.esc(reason)}</p>` : ''}

          <div class="p-3 bg-beige-100 rounded-2xl text-center space-y-1.5">
            <span class="text-[11px] font-bold text-militar-800 uppercase tracking-wider block">Acceso Rápido de Prueba</span>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <button type="button" class="btn btn-sm btn-outline bg-white text-xs" id="modal-demo-daniela">Daniela Rojas</button>
              <button type="button" class="btn btn-sm btn-outline bg-white text-xs" id="modal-demo-luis">Luis Herrera</button>
            </div>
          </div>

          <form id="modal-client-auth-form" class="space-y-3 pt-2">
            <div class="field">
              <label class="field-label text-xs">Correo electrónico</label>
              <input type="email" name="email" required placeholder="tu@correo.com" class="input input-sm">
            </div>
            <div class="field">
              <label class="field-label text-xs">Contraseña</label>
              <input type="password" name="password" required placeholder="••••••••" class="input input-sm">
            </div>
            <button type="submit" class="btn btn-primary w-full justify-center py-2.5 rounded-xl shadow-gold text-xs font-semibold">
              Entrar y continuar
            </button>
          </form>
        </div>
      `,
    });

    m.el.querySelector('#modal-demo-daniela')?.addEventListener('click', () => {
      const res = PL.auth.clientLogin('cliente@demo.com', 'cliente123');
      m.close();
      onSuccess && onSuccess(res.user);
    });
    m.el.querySelector('#modal-demo-luis')?.addEventListener('click', () => {
      const res = PL.auth.clientLogin('luis.herrera@demo.com', 'cliente123');
      m.close();
      onSuccess && onSuccess(res.user);
    });

    m.el.querySelector('#modal-client-auth-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const res = PL.auth.clientLogin(fd.get('email'), fd.get('password'));
      if (res.ok) {
        m.close();
        onSuccess && onSuccess(res.user);
      } else {
        PL.ui.toast(res.error, 'error');
      }
    });
  }

  return {
    title: 'Mi Cuenta | ProLíder Inmobiliaria',
    layout: 'public',
    render,
    mount,
    openAuthModal,
  };
})();

