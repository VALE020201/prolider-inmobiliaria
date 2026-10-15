/**
 * ProLider - Gestión de Ofertas y Negociación (Backoffice del Asesor)
 * ---------------------------------------------------------------
 * - Visualización de propuestas formales enviadas por clientes
 * - Acciones interactivas: Aceptar, Rechazar, Contraofertar
 * - Cambio automático a "Reservado" al aceptar una oferta
 * - Historial y cronología completa de la negociación
 */
window.PL = window.PL || {};
PL.pages = PL.pages || {};

PL.pages.advisorOffers = (() => {
  const U = PL.utils;
  const C = PL.catalogs;
  const I = PL.icon;

  function render(ctx) {
    const advisor = PL.auth.currentAdvisor();
    const offers = PL.store.offers.byAdvisor(advisor.id);
    const qStatus = ctx.query.status || '';

    return `
      <div class="space-y-6">
        <!-- CABECERA -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-beige-200">
          <div>
            <span class="text-xs font-bold uppercase tracking-[0.2em] text-oro-700">Mesa de Negociación</span>
            <h1 class="font-display text-3xl font-bold text-militar-950">
              Gestión de Ofertas Económicas
            </h1>
            <p class="text-xs text-militar-600 mt-0.5">
              Revisa, contraoferta y formaliza acuerdos comerciales directamente con los compradores
            </p>
          </div>
        </div>

        <!-- FILTROS POR ESTATUS DE OFERTA -->
        <div class="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-beige-200" id="offer-status-tabs">
          <button type="button" data-status="" class="btn btn-sm rounded-full ${!qStatus ? 'btn-primary' : 'btn-outline'} text-xs">
            Todas (${offers.length})
          </button>
          <button type="button" data-status="pendiente" class="btn btn-sm rounded-full ${qStatus === 'pendiente' ? 'btn-primary' : 'btn-outline'} text-xs">
            Pendientes (${offers.filter((o) => o.status === 'pendiente').length})
          </button>
          <button type="button" data-status="contraoferta" class="btn btn-sm rounded-full ${qStatus === 'contraoferta' ? 'btn-primary' : 'btn-outline'} text-xs">
            En Contraoferta (${offers.filter((o) => o.status === 'contraoferta').length})
          </button>
          <button type="button" data-status="aceptada" class="btn btn-sm rounded-full ${qStatus === 'aceptada' ? 'btn-primary' : 'btn-outline'} text-xs">
            Aceptadas (${offers.filter((o) => o.status === 'aceptada').length})
          </button>
          <button type="button" data-status="rechazada" class="btn btn-sm rounded-full ${qStatus === 'rechazada' ? 'btn-primary' : 'btn-outline'} text-xs">
            Rechazadas (${offers.filter((o) => o.status === 'rechazada').length})
          </button>
        </div>

        <!-- LISTA DE OFERTAS -->
        <div class="space-y-4" id="offers-list-container">
          <!-- Se llena dinámicamente con JS -->
        </div>
      </div>
    `;
  }

  function mount(root, ctx) {
    const advisor = PL.auth.currentAdvisor();
    let currentStatus = ctx.query.status || '';
    const container = root.querySelector('#offers-list-container');

    function renderOffers() {
      const allOffers = PL.store.offers.byAdvisor(advisor.id);
      const filtered = currentStatus ? allOffers.filter((o) => o.status === currentStatus) : allOffers;

      if (!filtered.length) {
        container.innerHTML = PL.ui.empty(
          'handshake',
          'No hay ofertas en este estatus',
          'Las propuestas que envíen los clientes desde la vista de detalle de cada propiedad aparecerán aquí.'
        );
        return;
      }

      container.innerHTML = filtered.map((o) => {
        const p = PL.store.properties.get(o.propertyId);
        const status = C.offerStatus(o.status);
        const diff = p?.price ? Math.round(((o.amount - p.price) / p.price) * 100) : 0;
        const diffLabel = diff === 0 ? 'Precio de lista' : `${diff > 0 ? '+' : ''}${diff}% vs precio`;
        const waLink = o.clientPhone ? U.waLink(o.clientPhone, `Hola ${o.clientName.split(' ')[0]}, te saludo de ProLíder con respecto a tu oferta por ${p?.code || 'el inmueble'}.`) : '#';

        return `
          <div class="bg-white p-6 rounded-3xl border border-beige-200 shadow-sm space-y-4" data-offer-card="${o.id}">
            <!-- CABECERA DE LA OFERTA -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-beige-100">
              <div class="flex items-center gap-3">
                ${p ? `
                  <img src="${U.esc(PL.media.url(p.media?.photos?.[0]))}" class="w-14 h-12 rounded-xl object-cover shrink-0" ${PL.media.onErr}>
                ` : ''}
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-bold text-oro-700 bg-oro-50 border border-oro-200 px-1.5 py-0.2 rounded">${p ? p.code : 'Inmueble'}</span>
                    <span class="badge ${status.cls} text-[10px]">${status.label}</span>
                  </div>
                  <h3 class="font-display text-base font-bold text-militar-950 mt-0.5">
                    <a href="#/propiedad/${o.propertyId}" target="_blank" class="hover:text-oro-700">${U.esc(p ? p.title : 'Propiedad')}</a>
                  </h3>
                </div>
              </div>

              <div class="text-left sm:text-right">
                <span class="text-xs text-militar-400 block">${U.timeAgo(o.updatedAt)}</span>
                <span class="text-[11px] text-militar-500 font-medium">Registrada: ${U.fmtDate(o.createdAt)}</span>
              </div>
            </div>

            <!-- DETALLES DE MONTOS Y CLIENTE -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
              <!-- Datos del Cliente -->
              <div class="p-4 bg-beige-50 rounded-2xl border border-beige-100 space-y-1">
                <span class="text-[11px] font-bold uppercase tracking-wider text-militar-500 block">Comprador</span>
                <strong class="font-bold text-militar-900 text-sm block">${U.esc(o.clientName)}</strong>
                <span class="text-militar-600 block">${U.esc(o.clientEmail)}</span>
                ${o.clientPhone ? `
                  <div class="pt-2 flex items-center gap-2">
                    <a href="${waLink}" target="_blank" rel="noopener" class="btn btn-xs btn-outline-wa text-[11px] py-1 px-2.5">
                      ${I('whatsapp', 'w-3.5 h-3.5')} WhatsApp
                    </a>
                    <a href="tel:${U.esc(o.clientPhone)}" class="text-militar-700 hover:text-militar-950 text-xs font-semibold">
                      ${U.fmtPhone(o.clientPhone)}
                    </a>
                  </div>
                ` : ''}
              </div>

              <!-- Oferta Económica -->
              <div class="p-4 bg-beige-50 rounded-2xl border border-beige-100 space-y-1">
                <span class="text-[11px] font-bold uppercase tracking-wider text-militar-500 block">Propuesta Económica</span>
                <div class="flex items-baseline gap-2">
                  <strong class="font-display text-2xl font-bold text-militar-950">${U.fmtMoney(o.amount, o.currency)}</strong>
                  <span class="text-[11px] font-bold ${diff >= 0 ? 'text-emerald-700' : 'text-amber-700'}">${diffLabel}</span>
                </div>
                <span class="text-[11px] text-militar-500 block">Precio lista: ${p ? U.fmtMoney(p.price, p.currency) : '—'}</span>
                <span class="text-[11px] text-militar-600 block font-medium">Forma de pago: ${U.esc(o.financing)}</span>
              </div>

              <!-- Estado de Contraoferta / Propietario -->
              <div class="p-4 ${o.counterAmount ? 'bg-oro-50 border border-oro-200' : 'bg-beige-50 border border-beige-100'} rounded-2xl space-y-1">
                <span class="text-[11px] font-bold uppercase tracking-wider ${o.counterAmount ? 'text-oro-900' : 'text-militar-500'} block">
                  ${o.counterAmount ? 'Contraoferta enviada' : 'Estatus Actual'}
                </span>
                <strong class="font-display text-2xl font-bold ${o.counterAmount ? 'text-oro-800' : 'text-militar-900'}">
                  ${o.counterAmount ? U.fmtMoney(o.counterAmount, o.currency) : status.label}
                </strong>
                <p class="text-[11px] text-militar-600 leading-snug pt-1">
                  ${o.message ? `"${U.esc(o.message)}"` : 'Sin mensaje adicional'}
                </p>
              </div>
            </div>

            <!-- HISTORIAL DE NEGOCIACIÓN -->
            <div class="space-y-1 pt-1">
              <span class="text-[11px] font-bold uppercase tracking-wider text-militar-600">Cronología de negociación</span>
              <div class="space-y-1.5 text-xs bg-beige-50/70 p-3 rounded-2xl border border-beige-100 max-h-36 overflow-y-auto">
                ${o.history.map((h) => `
                  <div class="flex items-start gap-2">
                    <span class="font-bold uppercase text-[10px] px-1.5 py-0.5 rounded ${h.by === 'asesor' ? 'bg-oro-200 text-oro-900' : 'bg-beige-200 text-militar-900'}">
                      ${h.by === 'asesor' ? 'Tú (Asesor)' : 'Cliente'}
                    </span>
                    <span class="flex-1 text-militar-800">${U.esc(h.message || (h.action === 'contraoferta' ? `Contraoferta de ${U.fmtMoney(h.amount, o.currency)}` : `Oferta por ${U.fmtMoney(h.amount, o.currency)}`))}</span>
                    <span class="text-[10px] text-militar-400 shrink-0">${U.fmtDate(h.at)}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- BOTONES DE ACCIÓN PARA EL ASESOR -->
            ${['pendiente', 'contraoferta'].includes(o.status) ? `
              <div class="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-beige-100">
                <button type="button" class="btn btn-sm btn-ghost text-red-600 hover:bg-red-50" data-offer-action="reject" data-id="${o.id}">
                  Rechazar oferta
                </button>
                <button type="button" class="btn btn-sm btn-outline" data-offer-action="counter" data-id="${o.id}">
                  ${I('edit', 'w-3.5 h-3.5')} Enviar contraoferta formal
                </button>
                <button type="button" class="btn btn-sm btn-primary shadow-gold font-semibold" data-offer-action="accept" data-id="${o.id}">
                  ${I('check', 'w-3.5 h-3.5')} Aceptar propuesta económica
                </button>
              </div>
            ` : `
              <div class="pt-2 text-right">
                <span class="text-xs text-militar-500 font-medium">Esta negociación se encuentra finalizada (${status.label.toLowerCase()}).</span>
              </div>
            `}
          </div>
        `;
      }).join('');
    }

    // Pestañas de estatus
    root.querySelectorAll('#offer-status-tabs button').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentStatus = btn.dataset.status;
        root.querySelectorAll('#offer-status-tabs button').forEach((b) => {
          b.className = `btn btn-sm rounded-full ${b === btn ? 'btn-primary' : 'btn-outline'} text-xs`;
        });
        renderOffers();
      });
    });

    // Delegación de acciones de oferta (Aceptar, Contraofertar, Rechazar)
    container.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-offer-action]');
      if (!btn) return;
      const action = btn.dataset.offerAction;
      const offerId = btn.dataset.id;
      const offer = PL.store.offers.get(offerId);
      if (!offer) return;
      const prop = PL.store.properties.get(offer.propertyId);

      if (action === 'accept') {
        const ok = await PL.ui.confirm({
          title: '¿Aceptar propuesta económica?',
          message: `Estás aceptando formalmente la oferta de ${U.fmtMoney(offer.amount, offer.currency)} por ${prop?.code}. Se notificará al comprador y el inmueble pasará a estatus "Reservado".`,
          confirmText: 'Sí, aceptar y reservar',
        });
        if (ok) {
          PL.store.offers.respond(offerId, 'accept', { reserve: true, message: 'Oferta aceptada por el propietario y asesor.' });
          PL.ui.toast('¡Oferta aceptada! El inmueble ha quedado reservado.');
          renderOffers();
        }
      } else if (action === 'reject') {
        const m = PL.ui.modal({
          title: 'Rechazar propuesta económica',
          body: `
            <div class="space-y-4">
              <p class="text-xs text-militar-600">Indica el motivo del rechazo para orientar al cliente:</p>
              <textarea id="modal-reject-reason" rows="3" class="input input-sm text-xs" placeholder="Ej. El precio ofrecido no satisface las pretensiones mínimas del propietario..."></textarea>
            </div>
          `,
          footer: `
            <button class="btn btn-ghost" data-close>Cancelar</button>
            <button class="btn btn-danger" id="btn-modal-confirm-reject">Rechazar propuesta</button>
          `,
        });

        m.el.querySelector('#btn-modal-confirm-reject').addEventListener('click', () => {
          const reason = m.el.querySelector('#modal-reject-reason').value;
          PL.store.offers.respond(offerId, 'reject', { message: reason });
          PL.ui.toast('Propuesta rechazada formalmente.', 'info');
          m.close();
          renderOffers();
        });
      } else if (action === 'counter') {
        const m = PL.ui.modal({
          title: 'Enviar Contraoferta al Comprador',
          body: `
            <div class="space-y-4">
              <p class="text-xs text-militar-600">Presenta un monto formal acordado con el propietario:</p>
              <div class="field">
                <label class="field-label text-xs">Monto de la Contraoferta (USD)</label>
                <input type="number" id="modal-counter-amount" class="input input-sm font-bold text-base"
                       value="${prop?.price ? Math.round(prop.price * 0.95) : offer.amount}" min="1000" step="500">
              </div>
              <div class="field">
                <label class="field-label text-xs">Mensaje explicativo / Condiciones</label>
                <textarea id="modal-counter-message" rows="3" class="input input-sm text-xs" placeholder="Ej. El propietario puede aceptar este monto con un lapso máximo de 30 días para la firma..."></textarea>
              </div>
            </div>
          `,
          footer: `
            <button class="btn btn-ghost" data-close>Cancelar</button>
            <button class="btn btn-primary" id="btn-modal-confirm-counter">Enviar contraoferta</button>
          `,
        });

        m.el.querySelector('#btn-modal-confirm-counter').addEventListener('click', () => {
          const amount = +m.el.querySelector('#modal-counter-amount').value;
          const msg = m.el.querySelector('#modal-counter-message').value;
          if (!amount || amount <= 0) {
            PL.ui.toast('Ingresa un monto válido', 'error');
            return;
          }
          PL.store.offers.respond(offerId, 'counter', { amount, message: msg });
          PL.ui.toast('¡Contraoferta enviada al comprador!');
          m.close();
          renderOffers();
        });
      }
    });

    renderOffers();
  }

  return {
    title: 'Gestión de Ofertas | ProLíder Backoffice',
    layout: 'admin',
    guard: 'advisor',
    render,
    mount,
  };
})();

