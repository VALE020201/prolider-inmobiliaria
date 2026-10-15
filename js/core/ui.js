/**
 * ProLider - Componentes de interfaz reutilizables
 *  - toast()       notificaciones flotantes
 *  - modal()       ventanas modales accesibles (Esc / clic fuera)
 *  - confirm()     confirmación basada en Promise
 *  - lightbox()    visor de galería a pantalla completa (teclado + swipe)
 *  - PL.validate   validación de formularios en tiempo real
 */
window.PL = window.PL || {};

PL.ui = (() => {
  const U = PL.utils;

  /* ---------------- Toasts ---------------- */
  function toast(message, type = 'success', ms = 3200) {
    let root = U.$('#toast-root');
    const icons = { success: 'checkCircle', error: 'xCircle', info: 'info', warn: 'alert' };
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.setAttribute('role', 'status');
    el.innerHTML = `${PL.icon(icons[type] || 'info', 'w-5 h-5 shrink-0')}<span>${U.esc(message)}</span>`;
    root.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, ms);
  }

  /* ---------------- Modal ---------------- */
  function modal({ title = '', body = '', footer = '', size = 'md', onClose } = {}) {
    const root = U.$('#modal-root');
    const wrap = document.createElement('div');
    const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `
      <div class="modal-panel ${widths[size] || widths.md}" role="dialog" aria-modal="true" aria-label="${U.esc(title)}">
        ${title ? `<header class="flex items-center justify-between gap-4 px-6 pt-5 pb-3 border-b border-beige-200">
          <h3 class="font-display text-2xl text-militar-900">${title}</h3>
          <button class="icon-btn" data-close aria-label="Cerrar">${PL.icon('x')}</button></header>` : ''}
        <div class="modal-body px-6 py-5">${body}</div>
        ${footer ? `<footer class="px-6 py-4 bg-beige-50 border-t border-beige-200 flex flex-wrap justify-end gap-3">${footer}</footer>` : ''}
      </div>`;
    root.appendChild(wrap);
    document.body.classList.add('overflow-hidden');
    requestAnimationFrame(() => wrap.classList.add('show'));
    const close = () => {
      wrap.classList.remove('show');
      document.removeEventListener('keydown', onKey);
      setTimeout(() => { wrap.remove(); if (!root.children.length) document.body.classList.remove('overflow-hidden'); }, 200);
      onClose && onClose();
    };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    wrap.addEventListener('mousedown', (e) => { if (e.target === wrap) close(); });
    wrap.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
    setTimeout(() => wrap.querySelector('input:not([type=hidden]),textarea,select')?.focus(), 80);
    return { el: wrap, close };
  }

  /** Confirmación: await PL.ui.confirm({...}) -> true/false */
  function confirm({ title = '¿Estás seguro?', message = '', confirmText = 'Confirmar', cancelText = 'Cancelar', danger = false } = {}) {
    return new Promise((resolve) => {
      let done = false;
      const m = modal({
        title, size: 'sm',
        body: `<p class="text-militar-700 leading-relaxed">${message}</p>`,
        footer: `<button class="btn btn-ghost" data-close>${cancelText}</button>
                 <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-ok>${confirmText}</button>`,
        onClose: () => { if (!done) resolve(false); },
      });
      m.el.querySelector('[data-ok]').addEventListener('click', () => { done = true; resolve(true); m.close(); });
    });
  }

  /* ---------------- Lightbox ---------------- */
  function lightbox(images, start = 0, caption = '') {
    let i = start;
    const el = document.createElement('div');
    el.className = 'lightbox';
    el.innerHTML = `
      <div class="absolute top-0 inset-x-0 flex items-center justify-between p-4 text-beige-100 z-10">
        <span class="text-sm tracking-widest" data-count></span>
        <span class="hidden md:block font-display text-xl truncate px-6">${U.esc(caption)}</span>
        <button class="icon-btn icon-btn-dark" data-x aria-label="Cerrar">${PL.icon('x', 'w-6 h-6')}</button>
      </div>
      <button class="lb-nav left-2 md:left-6" data-prev aria-label="Anterior">${PL.icon('chevronLeft', 'w-7 h-7')}</button>
      <img class="lb-img" alt="" data-img>
      <button class="lb-nav right-2 md:right-6" data-next aria-label="Siguiente">${PL.icon('chevronRight', 'w-7 h-7')}</button>
      <div class="absolute bottom-0 inset-x-0 p-3 flex gap-2 overflow-x-auto justify-start md:justify-center no-scrollbar" data-thumbs>
        ${images.map((src, k) => `<button data-k="${k}" class="lb-thumb"><img src="${src}" alt="" loading="lazy" ${PL.media.onErr}></button>`).join('')}
      </div>`;
    document.body.appendChild(el);
    document.body.classList.add('overflow-hidden');
    const img = el.querySelector('[data-img]');
    const show = (k) => {
      i = (k + images.length) % images.length;
      img.classList.remove('in');
      img.onload = () => img.classList.add('in');
      img.onerror = () => { img.src = PL.media.PLACEHOLDER; };
      img.src = images[i];
      el.querySelector('[data-count]').textContent = `${i + 1} / ${images.length}`;
      el.querySelectorAll('.lb-thumb').forEach((t, k2) => t.classList.toggle('active', k2 === i));
      el.querySelector(`.lb-thumb[data-k="${i}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    };
    const close = () => { el.remove(); document.body.classList.remove('overflow-hidden'); document.removeEventListener('keydown', key); };
    const key = (e) => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') show(i + 1); if (e.key === 'ArrowLeft') show(i - 1); };
    document.addEventListener('keydown', key);
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-x]') || e.target === el) close();
      else if (e.target.closest('[data-prev]')) show(i - 1);
      else if (e.target.closest('[data-next]')) show(i + 1);
      else if (e.target.closest('[data-k]')) show(+e.target.closest('[data-k]').dataset.k);
    });
    // Gestos táctiles
    let x0 = null;
    el.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    show(i);
  }

  /** Spinner inline para botones */
  const spinner = (cls = 'w-4 h-4') => `<span class="spinner ${cls}"></span>`;

  /** Estado vacío reutilizable */
  const empty = (icon, title, text = '', action = '') => `
    <div class="text-center py-16 px-6">
      <div class="mx-auto w-16 h-16 rounded-full bg-beige-100 text-oro-600 flex items-center justify-center mb-4">${PL.icon(icon, 'w-8 h-8')}</div>
      <h3 class="font-display text-2xl text-militar-900 mb-1">${title}</h3>
      <p class="text-militar-600 max-w-md mx-auto">${text}</p>
      ${action ? `<div class="mt-6">${action}</div>` : ''}
    </div>`;

  return { toast, modal, confirm, lightbox, spinner, empty };
})();

/* ===================================================================== */
/* Validación en tiempo real                                             */
/* ===================================================================== */
PL.validate = (() => {
  const U = PL.utils;
  const MSG = {
    required: 'Este campo es obligatorio',
    email: 'Ingresa un correo válido',
    phone: 'Ingresa un teléfono válido (ej. 0414-1234567)',
    minLength: (n) => `Mínimo ${n} caracteres`,
    maxLength: (n) => `Máximo ${n} caracteres`,
    min: (n) => `El valor mínimo es ${U.fmtNum(n)}`,
    max: (n) => `El valor máximo es ${U.fmtNum(n)}`,
    match: 'Los valores no coinciden',
    url: 'Ingresa una URL válida (https://...)',
  };

  /** Valida un valor contra un conjunto de reglas. Devuelve mensaje o null. */
  function check(value, r, form) {
    const v = typeof value === 'string' ? value.trim() : value;
    const emptyV = v === '' || v === null || v === undefined || v === false;
    if (r.required && emptyV) return r.messages?.required || MSG.required;
    if (emptyV) return null;
    if (r.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return MSG.email;
    if (r.phone && !/^\+?\d{10,13}$/.test(String(v).replace(/[\s\-.()]/g, ''))) return MSG.phone;
    if (r.url && !/^https:\/\/[^\s]+\.[^\s]+/.test(v)) return MSG.url;
    if (r.minLength && String(v).length < r.minLength) return MSG.minLength(r.minLength);
    if (r.maxLength && String(v).length > r.maxLength) return MSG.maxLength(r.maxLength);
    if (r.min !== undefined && +v < r.min) return MSG.min(r.min);
    if (r.max !== undefined && +v > r.max) return MSG.max(r.max);
    if (r.pattern && !r.pattern.test(v)) return r.messages?.pattern || 'Formato inválido';
    if (r.match && form && v !== form.elements[r.match]?.value) return MSG.match;
    if (r.custom) return r.custom(v, form) || null;
    return null;
  }

  /** Muestra/oculta el mensaje de error de un campo */
  function paint(el, msg) {
    const field = el.closest('.field') || el.parentElement;
    let box = field.querySelector('.field-msg');
    if (!box) { box = document.createElement('p'); box.className = 'field-msg'; field.appendChild(box); }
    el.classList.toggle('is-invalid', !!msg);
    el.classList.toggle('is-valid', !msg && String(el.value || '').trim() !== '');
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    box.textContent = msg || '';
    box.classList.toggle('show', !!msg);
  }

  /**
   * Conecta reglas a un <form>. Valida al escribir (tras el primer blur) y al salir.
   * @returns {{ validate: () => boolean, values: () => object }}
   */
  function bind(form, rules) {
    const touched = new Set();
    const fieldOf = (name) => form.elements[name];
    const run = (name) => {
      const el = fieldOf(name);
      if (!el || el.disabled || el.closest('[hidden]')) return true;
      const val = el.type === 'checkbox' ? el.checked : el.value;
      const msg = check(val, rules[name], form);
      paint(el, msg);
      return !msg;
    };
    Object.keys(rules).forEach((name) => {
      const el = fieldOf(name);
      if (!el) return;
      el.addEventListener('blur', () => { touched.add(name); run(name); });
      el.addEventListener('input', () => { if (touched.has(name) || el.classList.contains('is-invalid')) run(name); });
      el.addEventListener('change', () => { touched.add(name); run(name); });
    });
    return {
      validate() {
        let first = null;
        Object.keys(rules).forEach((n) => { touched.add(n); if (!run(n) && !first) first = fieldOf(n); });
        if (first) { first.focus({ preventScroll: true }); first.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        return !first;
      },
      field: run,
      values: () => Object.fromEntries(new FormData(form).entries()),
    };
  }

  return { bind, check, paint };
})();

