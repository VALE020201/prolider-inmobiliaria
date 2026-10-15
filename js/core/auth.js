/**
 * ProLider - Autenticación
 * ---------------------------------------------------------------
 * Dos sesiones independientes:
 *  - advisor: asesores y gerencia (panel /asesor)
 *  - client : clientes registrados del portal (ofertas, favoritos)
 *
 * Incluye bloqueo temporal tras 5 intentos fallidos y expiración de sesión.
 * NOTA: en producción la verificación ocurre en el servidor (JWT/cookies
 * httpOnly). Esta implementación local emula ese contrato.
 */
window.PL = window.PL || {};

PL.auth = (() => {
  const U = PL.utils;
  const S_ADV = 'prolider.session.advisor';
  const S_CLI = 'prolider.session.client';
  const ATTEMPTS = 'prolider.auth.attempts';
  const ADV_TTL = 12 * 3600e3; // 12 horas

  const read = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
  const write = (k, v) => (v ? localStorage.setItem(k, JSON.stringify(v)) : localStorage.removeItem(k));

  /* ---------- Protección contra fuerza bruta ---------- */
  function lockInfo(email) {
    const all = read(ATTEMPTS) || {};
    const r = all[U.norm(email)] || { n: 0, until: 0 };
    return { ...r, locked: r.until > Date.now(), seconds: Math.ceil((r.until - Date.now()) / 1000) };
  }
  function registerFail(email) {
    const all = read(ATTEMPTS) || {};
    const k = U.norm(email);
    const r = all[k] || { n: 0, until: 0 };
    r.n += 1;
    if (r.n >= 5) { r.until = Date.now() + 60e3; r.n = 0; }
    all[k] = r;
    write(ATTEMPTS, all);
  }
  function clearFails(email) {
    const all = read(ATTEMPTS) || {};
    delete all[U.norm(email)];
    write(ATTEMPTS, all);
  }

  /* ---------- Asesores ---------- */
  function advisorLogin(email, password, remember = true) {
    const lock = lockInfo(email);
    if (lock.locked) return { ok: false, error: `Demasiados intentos. Intenta de nuevo en ${lock.seconds}s.` };
    const a = PL.store.advisors.byEmail(email);
    if (!a || a.passwordHash !== U.hash(password) || a.active === false) {
      registerFail(email);
      return { ok: false, error: 'Correo o contraseña incorrectos.' };
    }
    clearFails(email);
    write(S_ADV, { id: a.id, at: Date.now(), ttl: remember ? ADV_TTL * 14 : ADV_TTL });
    return { ok: true, user: a };
  }
  function currentAdvisor() {
    const s = read(S_ADV);
    if (!s) return null;
    if (Date.now() - s.at > s.ttl) { write(S_ADV, null); return null; }
    return PL.store.advisors.get(s.id) || null;
  }
  const isAdmin = () => currentAdvisor()?.role === 'admin';
  const advisorLogout = () => write(S_ADV, null);

  /* ---------- Clientes ---------- */
  function clientLogin(email, password) {
    const lock = lockInfo(email);
    if (lock.locked) return { ok: false, error: `Demasiados intentos. Intenta de nuevo en ${lock.seconds}s.` };
    const c = PL.store.clients.byEmail(email);
    if (!c || c.passwordHash !== U.hash(password)) { registerFail(email); return { ok: false, error: 'Correo o contraseña incorrectos.' }; }
    clearFails(email);
    write(S_CLI, { id: c.id, at: Date.now() });
    return { ok: true, user: c };
  }
  function clientRegister({ name, email, phone, password }) {
    if (PL.store.clients.byEmail(email)) return { ok: false, error: 'Ya existe una cuenta con este correo.' };
    const c = PL.store.clients.create({ name: name.trim(), email: email.trim().toLowerCase(), phone, passwordHash: U.hash(password) });
    write(S_CLI, { id: c.id, at: Date.now() });
    PL.store.notifications.push(c.id, `¡Bienvenido(a) a ProLíder, ${c.name.split(' ')[0]}! Ya puedes enviar ofertas formales.`, '#/propiedades');
    return { ok: true, user: c };
  }
  const currentClient = () => { const s = read(S_CLI); return s ? PL.store.clients.get(s.id) : null; };
  const clientLogout = () => write(S_CLI, null);

  /** Medidor de fortaleza de contraseña (0-4) */
  function passwordStrength(pw = '') {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) s++;
    return { score: s, label: ['Muy débil', 'Débil', 'Aceptable', 'Buena', 'Excelente'][s] };
  }

  /**
   * Garantiza un cliente autenticado. Si no lo hay abre el modal de
   * acceso/registro y ejecuta `cb` al completar.
   */
  function requireClient(cb, reason = 'Para continuar inicia sesión o crea tu cuenta gratuita.') {
    const c = currentClient();
    if (c) return cb(c);
    PL.pages.account.openAuthModal(reason, cb);
  }

  return {
    advisorLogin, currentAdvisor, advisorLogout, isAdmin,
    clientLogin, clientRegister, currentClient, clientLogout, requireClient, passwordStrength,
  };
})();

