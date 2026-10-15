/**
 * ProLider - Router SPA basado en hash (#/ruta?param=valor)
 * ---------------------------------------------------------------
 * Funciona incluso abriendo index.html directamente (file://), sin servidor.
 * Cada página es un objeto: { title, layout, guard, render(ctx), mount(root, ctx) }
 * `mount` puede devolver una función de limpieza que se ejecuta al salir.
 */
window.PL = window.PL || {};

PL.router = (() => {
  const routes = [];
  let cleanup = null;
  let lastPath = null;

  /** Registra una ruta. `page` es el nombre dentro de PL.pages (resolución diferida). */
  function add(pattern, page) {
    const keys = [];
    const re = new RegExp('^' + pattern.replace(/\//g, '\\/').replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '\\/?$');
    routes.push({ re, keys, page });
  }

  function parse() {
    const h = decodeURI(location.hash.slice(1)) || '/';
    const [path, qs = ''] = h.split('?');
    return { path: path || '/', query: Object.fromEntries(new URLSearchParams(qs)) };
  }

  const go = (to) => { if (location.hash === '#' + to) resolve(); else location.hash = to; };

  /** Actualiza la URL sin volver a renderizar (filtros del catálogo). */
  const replaceQuery = (path, qs) => history.replaceState(null, '', '#' + path + qs);

  function resolve() {
    const { path, query } = parse();
    let match = null;
    for (const r of routes) {
      const m = path.match(r.re);
      if (m) { match = { r, params: Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])) }; break; }
    }
    const page = match ? PL.pages[match.r.page] : PL.pages.notFound;
    const ctx = { path, query, params: match?.params || {} };

    // Guardias de acceso
    if (page.guard === 'advisor' && !PL.auth.currentAdvisor()) return go(`/asesor/login?next=${encodeURIComponent(path)}`);
    if (page.guard === 'client' && !PL.auth.currentClient()) return go(`/ingresar?next=${encodeURIComponent(path + PL.utils.toQuery(query))}`);

    if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
    cleanup = PL.app.render(page, ctx) || null;
    if (lastPath !== path) window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    lastPath = path;
  }

  window.addEventListener('hashchange', resolve);
  return { add, go, resolve, parse, replaceQuery };
})();

