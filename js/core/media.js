/**
 * ProLider - Gestor de archivos multimedia
 * ---------------------------------------------------------------
 * Guarda fotos, planos y videos subidos por los asesores en IndexedDB
 * (soporta archivos grandes, a diferencia de localStorage). Cada archivo
 * se referencia en el inmueble con el formato "idb:<id>".
 *
 * Las imágenes se comprimen en el navegador (máx. 1920px, JPEG/WebP 82%)
 * antes de guardarse => cargas rápidas en el portal.
 *
 * En producción este módulo se reemplaza por subida a un bucket (S3, GCS,
 * Cloudinary...) manteniendo la misma interfaz: put(), url(), remove().
 */
window.PL = window.PL || {};

PL.media = (() => {
  const DB_NAME = 'prolider-media';
  const STORE = 'files';
  const cache = new Map(); // id -> objectURL
  const meta = new Map();  // id -> { name, type, size }
  let idb = null;

  /** Imagen de reemplazo elegante (SVG en línea) */
  const PLACEHOLDER =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#434f2e"/><stop offset="1" stop-color="#2f3624"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><g fill="none" stroke="#d4b25e" stroke-width="6" stroke-linejoin="round" opacity=".75"><path d="M140 170l60-50 60 50"/><path d="M155 160v45h90v-45"/></g><text x="200" y="245" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="#ebd9a0" opacity=".8">ProLíder</text></svg>`);

  const open = () =>
    new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) return reject(new Error('IndexedDB no disponible'));
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

  const tx = (mode) => idb.transaction(STORE, mode).objectStore(STORE);

  /** Carga todos los archivos en memoria como object URLs (resolución síncrona luego). */
  async function init() {
    try {
      idb = await open();
      await new Promise((resolve) => {
        const req = tx('readonly').getAll();
        req.onsuccess = () => {
          (req.result || []).forEach((r) => {
            cache.set(r.id, URL.createObjectURL(r.blob));
            meta.set(r.id, { name: r.name, type: r.type, size: r.size });
          });
          resolve();
        };
        req.onerror = () => resolve();
      });
    } catch (e) {
      console.warn('[media] IndexedDB no disponible, los archivos solo vivirán en esta sesión.', e);
    }
  }

  /** Guarda un Blob/File y devuelve su referencia "idb:<id>" */
  async function put(blob, name = 'archivo') {
    const id = PL.utils.uid('m_');
    const rec = { id, blob, name, type: blob.type, size: blob.size, at: Date.now() };
    cache.set(id, URL.createObjectURL(blob));
    meta.set(id, { name, type: blob.type, size: blob.size });
    if (idb) {
      await new Promise((resolve, reject) => {
        const r = tx('readwrite').put(rec);
        r.onsuccess = resolve;
        r.onerror = () => reject(r.error);
      });
    }
    return 'idb:' + id;
  }

  /** Resuelve una referencia a URL utilizable en <img>/<video>. */
  const url = (ref) => {
    if (!ref) return PLACEHOLDER;
    if (typeof ref === 'object') ref = ref.ref;
    if (String(ref).startsWith('idb:')) return cache.get(ref.slice(4)) || PLACEHOLDER;
    return ref;
  };

  const info = (ref) => (String(ref).startsWith('idb:') ? meta.get(ref.slice(4)) : null);

  async function remove(ref) {
    if (!ref || !String(ref).startsWith('idb:')) return;
    const id = ref.slice(4);
    if (cache.has(id)) URL.revokeObjectURL(cache.get(id));
    cache.delete(id);
    meta.delete(id);
    if (idb) tx('readwrite').delete(id);
  }

  /**
   * Comprime una imagen manteniendo proporción.
   * @returns {Promise<Blob>}
   */
  async function compressImage(file, maxSize = 1920, quality = 0.82) {
    if (!/^image\/(jpe?g|png|webp|heic|heif)$/i.test(file.type)) return file; // gif/svg intactos
    try {
      const bmp = await createImageBitmap(file);
      const scale = Math.min(1, maxSize / Math.max(bmp.width, bmp.height));
      const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(bmp, 0, 0, w, h);
      const out = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', quality));
      return out && out.size < file.size ? out : file;
    } catch {
      return file;
    }
  }

  /** Atributo onerror para <img> remotas caídas */
  const onErr = `onerror="this.onerror=null;this.src='${PLACEHOLDER}'"`;

  return { init, put, url, info, remove, compressImage, PLACEHOLDER, onErr };
})();

