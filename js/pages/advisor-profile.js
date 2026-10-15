/**
 * ProLider - Perfil del Asesor (Configuración y Datos de Contacto)
 * ---------------------------------------------------------------
 * - Actualización de foto de perfil
 * - Teléfono WhatsApp, Instagram, Bio profesional y zona
 */
window.PL = window.PL || {};
PL.pages = PL.pages || {};

PL.pages.advisorProfile = (() => {
  const U = PL.utils;
  const I = PL.icon;

  function render(ctx) {
    const a = PL.auth.currentAdvisor();

    return `
      <div class="max-w-3xl space-y-8">
        <!-- CABECERA -->
        <div class="pb-4 border-b border-beige-200">
          <span class="text-xs font-bold uppercase tracking-[0.2em] text-oro-700">Configuración</span>
          <h1 class="font-display text-3xl font-bold text-militar-950">Mi Perfil Profesional</h1>
          <p class="text-xs text-militar-600 mt-0.5">Estos datos se muestran en tu ficha pública y en cada uno de tus inmuebles asignados</p>
        </div>

        <form id="advisor-profile-form" class="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-beige-200 shadow-sm">
          <!-- FOTO DE PERFIL -->
          <div class="flex items-center gap-6 pb-6 border-b border-beige-200">
            <div class="relative w-24 h-24 rounded-full overflow-hidden bg-militar-900 ring-4 ring-oro-400/50 shadow-lg shrink-0">
              <img src="${U.esc(PL.media.url(a.photo))}" id="profile-photo-preview" class="w-full h-full object-cover" ${PL.media.onErr}>
            </div>
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-militar-700 block mb-1">Foto de Perfil</span>
              <p class="text-xs text-militar-500 mb-3">Recomendado: imagen cuadrada de alta calidad con fondo sobrio.</p>
              <input type="file" id="profile-photo-input" accept="image/*" class="sr-only">
              <button type="button" class="btn btn-sm btn-outline text-xs" id="btn-change-photo">
                ${I('upload', 'w-3.5 h-3.5')} Cambiar fotografía
              </button>
            </div>
          </div>

          <!-- DATOS PERSONALES -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="field">
              <label class="field-label text-xs">Nombre y Apellido *</label>
              <input type="text" name="name" value="${U.esc(a.name)}" required class="input input-sm text-xs font-semibold">
            </div>

            <div class="field">
              <label class="field-label text-xs">Cargo / Título Profesional</label>
              <input type="text" name="title" value="${U.esc(a.title || 'Asesor Inmobiliario Certificado')}" class="input input-sm text-xs">
            </div>
          </div>

          <!-- CONTACTO -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="field">
              <label class="field-label text-xs">Teléfono WhatsApp *</label>
              <input type="tel" name="phone" value="${U.esc(a.phone || '')}" placeholder="0414-1234567" class="input input-sm text-xs">
            </div>

            <div class="field">
              <label class="field-label text-xs">Usuario de Instagram</label>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-militar-400 text-xs">@</span>
                <input type="text" name="instagram" value="${U.esc(a.instagram || '')}" placeholder="usuario_prolider" class="input input-sm pl-7 text-xs">
              </div>
            </div>

            <div class="field">
              <label class="field-label text-xs">Zona de Cobertura</label>
              <input type="text" name="zone" value="${U.esc(a.zone || 'Carabobo')}" placeholder="Valencia, San Diego..." class="input input-sm text-xs">
            </div>
          </div>

          <!-- BIOGRAFÍA -->
          <div class="field">
            <label class="field-label text-xs">Reseña Profesional / Biografía</label>
            <textarea name="bio" rows="4" class="input input-sm text-xs leading-relaxed"
                      placeholder="Escribe una breve presentación de tu trayectoria y compromiso con los clientes...">${U.esc(a.bio || '')}</textarea>
          </div>

          <div class="flex justify-end pt-4 border-t border-beige-200">
            <button type="submit" class="btn btn-primary shadow-gold text-xs sm:text-sm font-semibold px-6 py-2.5">
              ${I('save', 'w-4 h-4')} Guardar cambios de perfil
            </button>
          </div>
        </form>
      </div>
    `;
  }

  function mount(root) {
    const a = PL.auth.currentAdvisor();
    let newPhotoRef = a.photo;

    const photoInput = root.querySelector('#profile-photo-input');
    const photoPreview = root.querySelector('#profile-photo-preview');
    const changeBtn = root.querySelector('#btn-change-photo');

    changeBtn?.addEventListener('click', () => photoInput.click());
    photoInput?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const compressed = await PL.media.compressImage(file, 800);
      newPhotoRef = await PL.media.put(compressed, file.name);
      photoPreview.src = PL.media.url(newPhotoRef);
      PL.ui.toast('Foto de perfil lista para guardar');
    });

    const form = root.querySelector('#advisor-profile-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      PL.store.advisors.update(a.id, {
        name: fd.get('name').trim(),
        title: fd.get('title').trim(),
        phone: fd.get('phone').trim(),
        instagram: fd.get('instagram').trim().replace('@', ''),
        zone: fd.get('zone').trim(),
        bio: fd.get('bio').trim(),
        photo: newPhotoRef,
      });
      PL.ui.toast('¡Perfil profesional actualizado exitosamente!');
    });
  }

  return {
    title: 'Mi Perfil | ProLíder Backoffice',
    layout: 'admin',
    guard: 'advisor',
    render,
    mount,
  };
})();

