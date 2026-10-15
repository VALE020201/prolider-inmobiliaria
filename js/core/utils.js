/**
 * ProLider - Utilidades generales (formateo, DOM, seguridad, helpers).
 */
window.PL = window.PL || {};

PL.utils = (() => {
  /** Selectores cortos */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /** Escapa texto para insertarlo de forma segura en HTML (previene XSS). */
  const esc = (v) =>
    String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /** Texto multilínea -> párrafos HTML seguros */
  const nl2br = (v) => esc(v).replace(/\n/g, '<br>');

  const nf = new Intl.NumberFormat('es-VE', { maximumFractionDigits: 0 });
  const nf2 = new Intl.NumberFormat('es-VE', { maximumFractionDigits: 2 });

  /** Formatea montos: fmtMoney(130000, 'USD') -> "$ 130.000" */
  const fmtMoney = (n, currency = 'USD', opts = {}) => {
    const v = Number(n) || 0;
    const sym = (PL.catalogs?.currency(currency) || { symbol: '$' }).symbol;
    if (opts.compact && v >= 1000) {
      if (v >= 1e6) return `${sym} ${nf2.format(v / 1e6)}M`;
      return `${sym} ${nf.format(v / 1000)}K`;
    }
    return `${sym} ${opts.decimals ? nf2.format(v) : nf.format(v)}`;
  };
  const fmtNum = (n, dec = false) => (dec ? nf2 : nf).format(Number(n) || 0);
  const fmtArea = (n) => (Number(n) > 0 ? `${nf2.format(n)} m²` : '—');

  const fmtDate = (iso, opts = { day: '2-digit', month: 'short', year: 'numeric' }) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return isNaN(d) ? '—' : d.toLocaleDateString('es-VE', opts);
  };
  const fmtDateTime = (iso) => (iso ? new Date(iso).toLocaleString('es-VE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');

  /** "hace 5 min", "hace 2 días" */
  const timeAgo = (iso) => {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 45) return 'hace un momento';
    const units = [['año', 31536000], ['mes', 2592000], ['semana', 604800], ['día', 86400], ['hora', 3600], ['min', 60]];
    for (const [u, sec] of units) {
      const v = Math.floor(s / sec);
      if (v >= 1) return `hace ${v} ${u}${v > 1 && u !== 'min' ? (u === 'mes' ? 'es' : 's') : ''}`;
    }
    return 'hace un momento';
  };

  const debounce = (fn, ms = 250) => {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  };

  /** ID único corto */
  const uid = (prefix = '') => prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  /**
   * Hash no reversible (cyrb53) con sal. SOLO para el prototipo local.
   * En producción las contraseñas se validan en el servidor con bcrypt/argon2.
   */
  const hash = (str, seed = 7) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    const s = 'pl$alt::' + str;
    for (let i = 0; i < s.length; i++) {
      const ch = s.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  };

  /** Normaliza texto para búsquedas (minúsculas, sin acentos) */
  const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  /** Title Case respetando conectores en español */
  const SMALL = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'en', 'y', 'a', 'con', 'para', 'por', 'al', 'frente', 'e', 'o']);
  const titleCase = (s) =>
    String(s || '').toLowerCase().replace(/\s+/g, ' ').trim().split(' ')
      .map((w, i) => (i > 0 && SMALL.has(w) ? w : /^(c\.c|cc|ph|th|iii|ii|iv)$/.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
      .join(' ');

  /** Acceso a propiedades anidadas por ruta "location.sector" */
  const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  const setPath = (obj, path, val) => {
    const ks = path.split('.');
    let o = obj;
    ks.slice(0, -1).forEach((k) => { if (o[k] == null || typeof o[k] !== 'object') o[k] = {}; o = o[k]; });
    o[ks[ks.length - 1]] = val;
  };

  const clone = (o) => JSON.parse(JSON.stringify(o));
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  /** Teléfono venezolano -> formato internacional para wa.me */
  const waPhone = (p) => {
    let d = String(p || '').replace(/\D/g, '');
    if (!d) return '';
    if (d.startsWith('0')) d = '58' + d.slice(1);
    else if (!d.startsWith('58')) d = '58' + d;
    return d;
  };
  const fmtPhone = (p) => {
    const d = String(p || '').replace(/\D/g, '');
    return d.length === 11 ? `${d.slice(0, 4)}-${d.slice(4, 7)}.${d.slice(7, 9)}.${d.slice(9)}` : p || '';
  };
  const waLink = (phone, text = '') => `https://wa.me/${waPhone(phone)}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

  /** Query string <-> objeto */
  const toQuery = (obj) => {
    const q = new URLSearchParams();
    Object.entries(obj).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) return;
      q.set(k, Array.isArray(v) ? v.join(',') : v);
    });
    const s = q.toString();
    return s ? `?${s}` : '';
  };

  const initials = (name) => String(name || '?').split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  /** Saludo según hora */
  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
  };

  /** Convierte URLs de YouTube/Vimeo a URL de "embed" */
  const embedUrl = (url) => {
    if (!url) return '';
    const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    const vm = url.match(/vimeo\.com\/(\d+)/);
    if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
    return /^https:\/\//.test(url) ? url : '';
  };

  const fileSize = (b) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

  return {
    $, $$, esc, nl2br, fmtMoney, fmtNum, fmtArea, fmtDate, fmtDateTime, timeAgo, debounce, uid, hash, norm,
    titleCase, getPath, setPath, clone, clamp, waPhone, waLink, fmtPhone, toQuery, initials, greeting, embedUrl, fileSize,
  };
})();

