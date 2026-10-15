/**
 * ProLider - Acceso al Backoffice de Asesores (Login)
 * ---------------------------------------------------------------
 * - Autenticación segura de asesores y gerencia
 * - Selector rápido de demostración para acceder como cualquier
 *   asesor real de ProLíder con un solo clic
 */
window.PL = window.PL || {};
PL.pages = PL.pages || {};

PL.pages.advisorLogin = (() => {
  const U = PL.utils;
  const I = PL.icon;

  function render(ctx) {
    const advs = PL.store.advisors.public().slice(0, 8);

    return `
      <div class="min-h-screen bg-militar-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div class="absolute inset-0 bg-pattern opacity-[0.06] pointer-events-none"></div>

        <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
          <div class="flex justify-center mb-4">
            ${PL.layout.logo(true, 'lg')}
          </div>
          <h2 class="font-display text-3xl font-bold tracking-tight text-beige-50">
            Portal de Asesores
          </h2>
          <p class="mt-2 text-xs sm:text-sm text-beige-300">
            Backoffice y CRM de gestión inmobiliaria ProLíder
          </p>
        </div>

        <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
          <div class="bg-white py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-oro-400/30 space-y-6">
            <!-- ACCESO RÁPIDO DE DEMOSTRACIÓN -->
            <div class="bg-beige-50 p-4 rounded-2xl border border-beige-200">
              <span class="text-[11px] font-bold text-militar-900 uppercase tracking-wider block mb-2 text-center">
                Acceso Inmediato de Demostración
              </span>
              <p class="text-[11px] text-militar-600 text-center mb-3">
                Haz clic en cualquier asesor para ingresar a su panel con sus inmuebles y ofertas asignadas:
              </p>
              <div class="grid grid-cols-2 gap-2 text-xs">
                ${advs.map((a) => `
                  <button type="button" data-login-advisor="${a.email}" class="btn btn-sm btn-outline bg-white hover:bg-oro-50 text-left py-2 px-2.5 truncate flex items-center gap-2">
                    ${a.photo ? `
                      <img src="${U.esc(PL.media.url(a.photo))}" class="w-6 h-6 rounded-full object-cover shrink-0" ${PL.media.onErr}>
                    ` : `
                      <span class="w-6 h-6 rounded-full bg-oro-500 text-militar-950 text-[10px] font-bold flex items-center justify-center shrink-0">
                        ${U.initials(a.name)}
                      </span>
                    `}
                    <span class="truncate font-medium text-militar-900">${U.esc(a.name)}</span>
                  </button>
                `).join('')}
              </div>
              <div class="mt-2 pt-2 border-t border-beige-200 text-center">
                <button type="button" data-login-advisor="admin@proliderve.com" class="text-xs text-oro-700 font-bold hover:underline">
                  👑 Ingresar como Gerencia General (Ver todos los inmuebles)
                </button>
              </div>
            </div>

            <!-- FORMULARIO DE ACCESO CON CREDENCIALES -->
            <form id="advisor-login-form" class="space-y-4">
              <div class="field">
                <label class="field-label text-xs">Correo corporativo</label>
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-militar-400">${I('mail', 'w-4 h-4')}</span>
                  <input type="email" name="email" required placeholder="asesor.prolider@gmail.com"
                         class="input input-sm pl-9 w-full text-xs sm:text-sm">
                </div>
              </div>

              <div class="field">
                <label class="field-label text-xs">Contraseña</label>
                <div class="relative">
                  <span class="absolute left-3 top-2.5 text-militar-400">${I('lock', 'w-4 h-4')}</span>
                  <input type="password" name="password" required placeholder="••••••••"
                         class="input input-sm pl-9 w-full text-xs sm:text-sm">
                </div>
                <span class="text-[11px] text-militar-500">Contraseña por defecto demo: <strong>prolider2026</strong></span>
              </div>

              <button type="submit" class="btn btn-primary w-full justify-center py-3 rounded-xl shadow-gold font-semibold text-sm">
                ${I('key', 'w-4 h-4')} Iniciar sesión en el Backoffice
              </button>
            </form>

            <div class="text-center pt-2 border-t border-beige-100">
              <a href="#/" class="text-xs text-militar-600 hover:text-oro-700 inline-flex items-center gap-1">
                ${I('arrowLeft', 'w-3.5 h-3.5')} Volver al portal público de clientes
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function mount(root) {
    // Ingreso rápido al hacer clic en los asesores demo
    root.querySelectorAll('[data-login-advisor]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const email = btn.dataset.loginAdvisor;
        const pass = email === 'admin@proliderve.com' ? 'admin2026' : 'prolider2026';
        const res = PL.auth.advisorLogin(email, pass);
        if (res.ok) {
          PL.ui.toast(`¡Bienvenido(a), ${res.user.name}!`);
          PL.router.go('/asesor');
        } else {
          PL.ui.toast(res.error, 'error');
        }
      });
    });

    // Envío del formulario
    const form = root.querySelector('#advisor-login-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const res = PL.auth.advisorLogin(fd.get('email'), fd.get('password'));
      if (res.ok) {
        PL.ui.toast(`¡Bienvenido(a), ${res.user.name}!`);
        PL.router.go('/asesor');
      } else {
        PL.ui.toast(res.error, 'error');
      }
    });
  }

  return {
    title: 'Portal de Asesores - Login | ProLíder Inmobiliaria',
    layout: 'blank',
    render,
    mount,
  };
})();

