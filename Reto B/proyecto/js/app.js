/* ============================================================
   APP.JS — Utilidades comunes compartidas por todas las páginas
   Web App de Métricas — reto_b
   ============================================================ */

'use strict';

/* ============================================================
   CONFIGURACIÓN DE API
   ============================================================ */
const API_BASE = 'http://localhost:3000/api';

const API = {
  metricas:    `${API_BASE}/metricas`,
  periodos:    `${API_BASE}/periodos`,
  categorias:  `${API_BASE}/categorias`,
  upload:      `${API_BASE}/upload`,
  presets:     `${API_BASE}/presets`,
  anotaciones: `${API_BASE}/anotaciones`,
};

/* ============================================================
   GESTIÓN DE TEMA
   ============================================================ */
const ThemeManager = (() => {
  const STORAGE_KEY = 'metricas_theme';
  const DEFAULT     = 'light';

  function getTheme() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT;
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.themeTarget === theme);
    });
  }

  function init() {
    setTheme(getTheme());
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-theme-target]');
      if (btn) setTheme(btn.dataset.themeTarget);
    });
  }

  return { init, setTheme, getTheme };
})();

/* ============================================================
   NAVEGACIÓN — marcar ítem activo y toggle móvil
   ============================================================ */
function initNavigation() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === currentPage) {
      item.classList.add('active');
    }
  });

  const menuBtn = document.getElementById('btnMenuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
      const isOpen = sidebar.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      if (overlay) overlay.classList.toggle('visible', isOpen);
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar?.classList.remove('open');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
      overlay.classList.remove('visible');
    });
  }

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 900) {
        sidebar?.classList.remove('open');
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
        overlay?.classList.remove('visible');
      }
    });
  });
}

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */
const Toast = (() => {
  let container = null;

  function getContainer() {
    if (!container) {
      container = document.querySelector('.toast-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
      }
    }
    return container;
  }

  const ICONS = {
    success: '✅',
    danger:  '❌',
    warning: '⚠️',
    info:    'ℹ️',
  };

  function show(message, type = 'info', duration = 4000) {
    const c     = getContainer();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.innerHTML = `
      <span class="toast-icon">${ICONS[type] || ICONS.info}</span>
      <span class="toast-msg">${message}</span>
      <button class="toast-close" aria-label="Cerrar notificación">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => dismiss(toast));
    c.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => dismiss(toast), duration);
    }
    return toast;
  }

  function dismiss(toast) {
    toast.classList.add('hiding');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }

  return {
    success: (msg, d) => show(msg, 'success', d),
    error:   (msg, d) => show(msg, 'danger',  d),
    warning: (msg, d) => show(msg, 'warning', d),
    info:    (msg, d) => show(msg, 'info',    d),
  };
})();

/* ============================================================
   MODAL
   ============================================================ */
const Modal = (() => {
  function open(overlayEl) {
    overlayEl.classList.add('open');
    overlayEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const focusable = overlayEl.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
  }

  function close(overlayEl) {
    overlayEl.classList.remove('open');
    overlayEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function init() {
    document.addEventListener('click', e => {
      if (e.target.classList.contains('modal-overlay')) {
        close(e.target);
      }
      if (e.target.closest('[data-modal-close]')) {
        const overlay = e.target.closest('.modal-overlay');
        if (overlay) close(overlay);
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(close);
      }
    });

    document.addEventListener('click', e => {
      const trigger = e.target.closest('[data-modal-target]');
      if (trigger) {
        const target = document.querySelector(trigger.dataset.modalTarget);
        if (target) open(target);
      }
    });
  }

  return { open, close, init };
})();

/* ============================================================
   TABS
   ============================================================ */
function initTabs(containerEl) {
  const el = containerEl || document;
  el.querySelectorAll('.tabs').forEach(tabsEl => {
    tabsEl.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        tabsEl.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        el.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = el.querySelector(`[data-tab-panel="${target}"]`);
        if (panel) panel.classList.add('active');
      });
    });
  });
}

/* ============================================================
   UTILIDADES DE FETCH / API
   ============================================================ */
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `Error ${res.status}`);
  }
  return await res.json();
}

async function fetchCategorias() {
  try {
    const data = await apiFetch(API.categorias);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error al obtener categorías:', err.message);
    return [];
  }
}

async function fetchPeriodos() {
  try {
    const data = await apiFetch(API.periodos);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error al obtener períodos:', err.message);
    return [];
  }
}

async function fetchMetricas(filtros = {}) {
  try {
    const params = new URLSearchParams(filtros).toString();
    const url    = params ? `${API.metricas}?${params}` : API.metricas;
    const data   = await apiFetch(url);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error al obtener métricas:', err.message);
    return [];
  }
}

/* ============================================================
   UTILIDADES DE FORMATO
   ============================================================ */
function formatNumber(n, decimals = 0) {
  if (n == null) return '—';
  return Number(n).toLocaleString('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatCurrency(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0,
  }).format(n);
}

function formatPercent(n, decimals = 1) {
  if (n == null) return '—';
  return Number(n).toFixed(decimals) + '%';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' });
}

function calcVariacion(actual, objetivo) {
  if (!objetivo || objetivo === 0) return null;
  return ((actual - objetivo) / objetivo) * 100;
}

function badgeClass(variacion) {
  if (variacion == null) return 'neutral';
  if (variacion >= 0)    return 'positive';
  return 'negative';
}

function badgeIcon(variacion) {
  if (variacion == null) return '—';
  if (variacion >= 0)    return '▲';
  return '▼';
}

/* ============================================================
   CÁLCULOS KPI
   ============================================================ */
function calcKPIs(metricas) {
  if (!metricas || metricas.length === 0) {
    return { total: 0, promedio: 0, variacion: null, cumplimiento: null };
  }
  const valores   = metricas.map(m => Number(m.valor_actual));
  const objetivos = metricas.filter(m => m.valor_objetivo).map(m => Number(m.valor_objetivo));
  const total     = valores.reduce((a, b) => a + b, 0);
  const promedio  = total / valores.length;

  let cumplimiento = null;
  if (objetivos.length > 0) {
    const totalObj    = objetivos.reduce((a, b) => a + b, 0);
    const totalActual = metricas
      .filter(m => m.valor_objetivo)
      .reduce((a, m) => a + Number(m.valor_actual), 0);
    cumplimiento = (totalActual / totalObj) * 100;
  }

  const variacion = cumplimiento != null ? cumplimiento - 100 : null;

  return { total, promedio, variacion, cumplimiento };
}

/* ============================================================
   TABLA DE DATOS — renderización genérica
   ============================================================ */
function renderTableEmpty(tbody, colCount, message = 'Sin datos disponibles') {
  tbody.innerHTML = `<tr><td colspan="${colCount}" style="text-align:center;padding:32px;color:var(--text-secondary);">${message}</td></tr>`;
}

/* ============================================================
   PAGINACIÓN
   ============================================================ */
function Pagination(options) {
  const { container, totalItems, pageSize = 10, onPageChange } = options;
  let currentPage = 1;
  const totalPages = () => Math.ceil(totalItems() / pageSize);

  function render() {
    const tp = totalPages();
    const cp = currentPage;
    const start = (cp - 1) * pageSize + 1;
    const end   = Math.min(cp * pageSize, totalItems());

    container.innerHTML = `
      <span class="pagination-info">
        Mostrando ${start}–${end} de ${totalItems()} registros
      </span>
      <div class="pagination-controls">
        <button class="page-btn" data-page="prev" ${cp <= 1 ? 'disabled' : ''} aria-label="Página anterior">&#8249;</button>
        ${Array.from({ length: tp }, (_, i) => i + 1)
          .filter(p => p === 1 || p === tp || Math.abs(p - cp) <= 1)
          .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push('<span style="padding:0 4px;color:var(--text-secondary)">…</span>');
            acc.push(`<button class="page-btn ${p === cp ? 'active' : ''}" data-page="${p}">${p}</button>`);
            return acc;
          }, []).join('')}
        <button class="page-btn" data-page="next" ${cp >= tp ? 'disabled' : ''} aria-label="Página siguiente">&#8250;</button>
      </div>
    `;

    container.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = btn.dataset.page;
        if (p === 'prev' && currentPage > 1) currentPage--;
        else if (p === 'next' && currentPage < totalPages()) currentPage++;
        else if (!isNaN(p)) currentPage = parseInt(p);
        render();
        if (onPageChange) onPageChange(currentPage, pageSize);
      });
    });
  }

  return {
    render,
    getCurrentPage: () => currentPage,
    reset: () => { currentPage = 1; render(); },
  };
}

/* ============================================================
   POPULADO DE SELECTS CON DATOS REALES
   ============================================================ */
async function populateSelects() {
  const [categorias, periodos] = await Promise.all([fetchCategorias(), fetchPeriodos()]);

  // Categorías
  document.querySelectorAll('[data-select="categoria"]').forEach(sel => {
    const current = sel.value;
    sel.innerHTML = '<option value="">Todas las categorías</option>' +
      categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    if (current) sel.value = current;
  });

  // Años únicos de periodos
  const anios = [...new Set(periodos.map(p => p.anio))].sort((a, b) => b - a);
  document.querySelectorAll('[data-select="anio"]').forEach(sel => {
    const current = sel.value;
    sel.innerHTML = '<option value="">Todos los años</option>' +
      anios.map(a => `<option value="${a}">${a}</option>`).join('');
    if (current) sel.value = current;
  });

  // Periodos (mes/año)
  document.querySelectorAll('[data-select="periodo"]').forEach(sel => {
    const current = sel.value;
    sel.innerHTML = '<option value="">Todos los períodos</option>' +
      periodos.map(p => `<option value="${p.id}">${p.nombre_mes} ${p.anio}</option>`).join('');
    if (current) sel.value = current;
  });

  // Trimestres
  document.querySelectorAll('[data-select="trimestre"]').forEach(sel => {
    sel.innerHTML = '<option value="">Todos los trimestres</option>' +
      ['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => `<option value="${i + 1}">${q}</option>`).join('');
  });

  return { categorias, periodos };
}

/* ============================================================
   DRAG & DROP / UPLOAD CSV
   ============================================================ */
function initUploadZone(zoneEl, fileInputEl, onFileSelected) {
  if (!zoneEl || !fileInputEl) return;

  zoneEl.addEventListener('click', () => fileInputEl.click());

  zoneEl.addEventListener('dragover', e => {
    e.preventDefault();
    zoneEl.classList.add('drag-over');
  });

  zoneEl.addEventListener('dragleave', () => zoneEl.classList.remove('drag-over'));

  zoneEl.addEventListener('drop', e => {
    e.preventDefault();
    zoneEl.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  fileInputEl.addEventListener('change', () => {
    if (fileInputEl.files[0]) handleFile(fileInputEl.files[0]);
  });

  function handleFile(file) {
    if (!file.name.endsWith('.csv')) {
      Toast.error('Solo se aceptan archivos CSV.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Toast.error('El archivo supera el límite de 5 MB.');
      return;
    }
    if (onFileSelected) onFileSelected(file);
  }
}

/* ============================================================
   PARSEO CSV
   ============================================================ */
function parseCSV(text) {
  const lines  = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    return headers.reduce((obj, h, i) => { obj[h] = vals[i] ?? ''; return obj; }, {});
  });
}

/* ============================================================
   VALIDACIÓN DE FORMULARIOS
   ============================================================ */
const Validator = {
  required(val) { return val != null && String(val).trim() !== ''; },
  number(val)   { return !isNaN(Number(val)) && String(val).trim() !== ''; },
  positive(val) { return Validator.number(val) && Number(val) >= 0; },
  maxLength(val, max) { return String(val).length <= max; },

  setError(inputEl, message) {
    inputEl.classList.add('error');
    inputEl.classList.remove('success');
    let errEl = inputEl.parentElement.querySelector('.field-error');
    if (!errEl) {
      errEl = document.createElement('span');
      errEl.className = 'field-error';
      inputEl.after(errEl);
    }
    errEl.textContent = '⚠ ' + message;
  },

  setSuccess(inputEl) {
    inputEl.classList.remove('error');
    inputEl.classList.add('success');
    const errEl = inputEl.parentElement.querySelector('.field-error');
    if (errEl) errEl.textContent = '';
  },

  clearAll(formEl) {
    formEl.querySelectorAll('.form-control').forEach(el => {
      el.classList.remove('error', 'success');
    });
    formEl.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  },
};

/* ============================================================
   VALIDAR MÉTRICAS FORM
   ============================================================ */
function validateMetricaForm(formEl) {
  let valid = true;
  Validator.clearAll(formEl);

  const fields = {
    periodo_id:     { label: 'Período',         rules: ['required'] },
    categoria_id:   { label: 'Categoría',        rules: ['required'] },
    nombre_metrica: { label: 'Nombre métrica',   rules: ['required', 'maxLength:150'] },
    valor_actual:   { label: 'Valor actual',     rules: ['required', 'number', 'positive'] },
    valor_objetivo: { label: 'Valor objetivo',   rules: ['positive'] },
    unidad:         { label: 'Unidad',           rules: [] },
  };

  Object.entries(fields).forEach(([name, cfg]) => {
    const el = formEl.querySelector(`[name="${name}"]`);
    if (!el) return;
    const val = el.value;

    for (const rule of cfg.rules) {
      const [r, arg] = rule.split(':');
      let ok = true;
      let msg = '';

      if (r === 'required')  { ok = Validator.required(val);           msg = `${cfg.label} es obligatorio.`; }
      if (r === 'number')    { ok = Validator.number(val);             msg = `${cfg.label} debe ser un número.`; }
      if (r === 'positive')  { ok = !val || Validator.positive(val);   msg = `${cfg.label} debe ser mayor o igual a 0.`; }
      if (r === 'maxLength') { ok = Validator.maxLength(val, +arg);    msg = `${cfg.label} no puede superar ${arg} caracteres.`; }

      if (!ok) {
        Validator.setError(el, msg);
        valid = false;
        break;
      }
    }
    if (valid || !formEl.querySelector(`[name="${name}"].error`)) {
      if (val) Validator.setSuccess(el);
    }
  });

  return valid;
}

/* ============================================================
   CHART.JS — helpers de configuración
   ============================================================ */
function getChartColors(n) {
  const palette = [
    '#091FFD', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#0ea5e9', '#f97316', '#ec4899', '#14b8a6', '#84cc16',
  ];
  return Array.from({ length: n }, (_, i) => palette[i % palette.length]);
}

function chartDefaults() {
  const dark = document.documentElement.dataset.theme === 'dark';
  const hc   = document.documentElement.dataset.theme === 'high-contrast';
  return {
    gridColor:  dark || hc ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    textColor:  dark ? '#94a3b8' : hc ? '#ffffff' : '#6b7280',
    fontFamily: getComputedStyle(document.documentElement).getPropertyValue('--font-family').trim(),
  };
}

function commonChartOptions(extraOptions = {}) {
  const { gridColor, textColor, fontFamily } = chartDefaults();
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: textColor, font: { family: fontFamily, size: 12 }, padding: 16, boxWidth: 12 },
      },
      tooltip: {
        backgroundColor: 'rgba(26,31,54,0.95)',
        titleColor: '#ffffff',
        bodyColor: '#c8d0e7',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid:  { color: gridColor },
        ticks: { color: textColor, font: { family: fontFamily, size: 11 } },
      },
      y: {
        grid:  { color: gridColor },
        ticks: { color: textColor, font: { family: fontFamily, size: 11 } },
        beginAtZero: true,
      },
    },
    ...extraOptions,
  };
}

/* ============================================================
   INICIALIZACIÓN GLOBAL
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  initNavigation();
  Modal.init();
  initTabs();
  populateSelects();
});

/* ============================================================
   EXPOSICIÓN GLOBAL (window.AppUtils)
   ============================================================ */
window.AppUtils = {
  // Fetch / API
  apiFetch,
  fetchCategorias,
  fetchPeriodos,
  fetchMetricas,

  // API endpoints
  API,

  // Toasts
  showToast: (msg, type = 'info') => {
    const map = { success: 'success', error: 'error', danger: 'error', warning: 'warning', info: 'info' };
    const method = map[type] || 'info';
    return Toast[method](msg);
  },

  // Modal
  openModal:  (idOrEl) => {
    const el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    if (el) Modal.open(el);
  },
  closeModal: (idOrEl) => {
    const el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    if (el) Modal.close(el);
  },

  // Tema
  ThemeManager,

  // Formato
  formatNumber,
  formatCurrency,
  formatPercent,
  formatDate,
  calcVariacion,
  badgeClass,
  badgeIcon,

  // KPI
  calcKPIs,

  // Tabla
  renderTableEmpty,

  // Chart
  getChartColors,
  chartDefaults,
  commonChartOptions,

  // Validación
  Validator,
  validateMetricaForm,
};
