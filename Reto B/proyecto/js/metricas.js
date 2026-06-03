/**
 * metricas.js
 * Lógica de listado, filtrado, paginación y CRUD de metricas_mensuales
 * Depende de: app.js
 */

/* ─────────────────────────────────────────
   Estado
───────────────────────────────────────── */
const MetricasState = {
  all: [],
  filtered: [],
  categorias: [],
  periodos: [],
  currentPage: 1,
  pageSize: 15,
  sortCol: null,
  sortDir: 'asc',
  selectedId: null,
};

/* ─────────────────────────────────────────
   Inicialización
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  await loadAll();
  applyFilters();
  bindEvents();
});

async function loadAll() {
  try {
    const [m, c, p] = await Promise.all([
      window.AppUtils.fetchMetricas(),
      window.AppUtils.fetchCategorias(),
      window.AppUtils.fetchPeriodos(),
    ]);
    MetricasState.all        = Array.isArray(m) ? m : [];
    MetricasState.categorias = Array.isArray(c) ? c : [];
    MetricasState.periodos   = Array.isArray(p) ? p : [];
  } catch (err) {
    console.error('Error al cargar métricas:', err);
    MetricasState.all        = [];
    MetricasState.categorias = [];
    MetricasState.periodos   = [];
    showToastLocal('Error al cargar datos. Verifica el servidor.', 'error');
  }
  populateFilterSelects();
}

/* ─────────────────────────────────────────
   Poblar selects de filtros
───────────────────────────────────────── */
function populateFilterSelects() {
  const anios = [...new Set(MetricasState.periodos.map(p => p.anio))].sort();
  setSelectOptions('filtroAnio', [{ v: '', l: 'Todos' }, ...anios.map(a => ({ v: a, l: a }))]);

  setSelectOptions('filtroPeriodo', [
    { v: '', l: 'Todos' },
    ...MetricasState.periodos.map(p => ({ v: p.id, l: `${p.nombre_mes} ${p.anio}` })),
  ]);

  setSelectOptions('filtroCategoria', [
    { v: '', l: 'Todas' },
    ...MetricasState.categorias.map(c => ({ v: c.id, l: c.nombre })),
  ]);

  setSelectOptions('filtroTrimestre', [
    { v: '', l: 'Todos' },
    { v: 1, l: 'Q1 – Ene/Mar' },
    { v: 2, l: 'Q2 – Abr/Jun' },
    { v: 3, l: 'Q3 – Jul/Sep' },
    { v: 4, l: 'Q4 – Oct/Dic' },
  ]);
}

function setSelectOptions(id, opts) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = opts.map(o => `<option value="${o.v}">${escHtml(String(o.l))}</option>`).join('');
}

/* ─────────────────────────────────────────
   Filtrado + ordenamiento
───────────────────────────────────────── */
function applyFilters() {
  const anio  = document.getElementById('filtroAnio')?.value || '';
  const perId = document.getElementById('filtroPeriodo')?.value || '';
  const catId = document.getElementById('filtroCategoria')?.value || '';
  const trim  = document.getElementById('filtroTrimestre')?.value || '';
  const busq  = (document.getElementById('filtroBusqueda')?.value || '').toLowerCase();

  MetricasState.filtered = MetricasState.all.filter(m => {
    const periodo = MetricasState.periodos.find(p => p.id == m.periodo_id);
    if (anio  && periodo && String(periodo.anio)      !== anio)  return false;
    if (perId && String(m.periodo_id)                 !== perId) return false;
    if (catId && String(m.categoria_id)               !== catId) return false;
    if (trim  && periodo && String(periodo.trimestre) !== trim)  return false;
    if (busq  && !m.nombre_metrica.toLowerCase().includes(busq)) return false;
    return true;
  });

  if (MetricasState.sortCol) sortData();

  MetricasState.currentPage = 1;
  renderTabla();
  renderStats();
  renderPagination();
}

function sortData() {
  const col = MetricasState.sortCol;
  const dir = MetricasState.sortDir === 'asc' ? 1 : -1;

  MetricasState.filtered.sort((a, b) => {
    let va, vb;
    if (col === 'periodo') {
      const pa = MetricasState.periodos.find(p => p.id == a.periodo_id);
      const pb = MetricasState.periodos.find(p => p.id == b.periodo_id);
      va = pa ? pa.mes + pa.anio * 100 : 0;
      vb = pb ? pb.mes + pb.anio * 100 : 0;
    } else if (col === 'categoria') {
      const ca = MetricasState.categorias.find(c => c.id == a.categoria_id);
      const cb = MetricasState.categorias.find(c => c.id == b.categoria_id);
      va = ca?.nombre || '';
      vb = cb?.nombre || '';
    } else {
      va = a[col] ?? '';
      vb = b[col] ?? '';
    }
    if (typeof va === 'string') return va.localeCompare(vb) * dir;
    return (va - vb) * dir;
  });
}

/* ─────────────────────────────────────────
   Renderizado de tabla
───────────────────────────────────────── */
function renderTabla() {
  const tbody = document.getElementById('tbodyMetricas');
  if (!tbody) return;

  const start = (MetricasState.currentPage - 1) * MetricasState.pageSize;
  const page  = MetricasState.filtered.slice(start, start + MetricasState.pageSize);

  if (!page.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center;padding:48px;color:var(--text-secondary);">
          <div class="empty-state">
            <span class="empty-state-icon" aria-hidden="true">🔍</span>
            <div class="empty-state-title">Sin resultados</div>
            <div class="empty-state-desc">No se encontraron métricas con los filtros aplicados.</div>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = page.map(m => {
    const periodo  = MetricasState.periodos.find(p => p.id == m.periodo_id);
    const cat      = MetricasState.categorias.find(c => c.id == m.categoria_id);
    const cumpl    = m.valor_objetivo > 0 ? (Number(m.valor_actual) / Number(m.valor_objetivo)) * 100 : null;
    const bClass   = cumpl === null ? '' : cumpl >= 100 ? 'badge-positive' : cumpl >= 80 ? 'badge-neutral' : 'badge-negative';
    const badgeHtml = cumpl !== null
      ? `<span class="badge ${bClass}">${cumpl.toFixed(1)}%</span>`
      : '<span class="text-secondary">—</span>';

    const catDot = cat
      ? `<span class="category-dot" style="background:${cat.color_hex}" aria-hidden="true"></span> ${escHtml(cat.nombre)}`
      : escHtml(String(m.categoria_id));

    const fechaFmt = m.fecha_registro
      ? new Date(m.fecha_registro).toLocaleDateString('es-CO')
      : '—';

    return `
      <tr data-id="${m.id}">
        <td>${periodo ? escHtml(periodo.nombre_mes + ' ' + periodo.anio) : m.periodo_id}</td>
        <td>${catDot}</td>
        <td>${escHtml(m.nombre_metrica)}</td>
        <td class="text-right">${fmtNum(m.valor_actual)}</td>
        <td class="text-right">${m.valor_objetivo ? fmtNum(m.valor_objetivo) : '—'}</td>
        <td>${escHtml(m.unidad || '')}</td>
        <td>${badgeHtml}</td>
        <td>${fechaFmt}</td>
        <td title="${escHtml(m.notas || '')}">${m.notas ? '📝' : ''}</td>
        <td class="text-center">
          <div class="action-buttons">
            <button class="btn btn-sm btn-secondary" data-action="ver"     data-id="${m.id}" aria-label="Ver detalle">👁️</button>
            <a      class="btn btn-sm btn-secondary" href="formulario.html?id=${m.id}"       aria-label="Editar">✏️</a>
            <button class="btn btn-sm btn-danger"    data-action="eliminar" data-id="${m.id}" aria-label="Eliminar">🗑️</button>
          </div>
        </td>
      </tr>`;
  }).join('');

  tbody.querySelectorAll('[data-action="ver"]').forEach(btn => {
    btn.addEventListener('click', () => openDetalle(parseInt(btn.dataset.id, 10)));
  });
  tbody.querySelectorAll('[data-action="eliminar"]').forEach(btn => {
    btn.addEventListener('click', () => openEliminar(parseInt(btn.dataset.id, 10)));
  });
}

/* ─────────────────────────────────────────
   Stats bar
───────────────────────────────────────── */
function renderStats() {
  const bar = document.getElementById('statsBar');
  if (!bar) return;
  const data   = MetricasState.filtered;
  const total  = data.length;
  const suma   = data.reduce((s, m) => s + (Number(m.valor_actual) || 0), 0);
  const prom   = total ? suma / total : 0;
  const conObj = data.filter(m => m.valor_objetivo > 0);
  const cumpl  = conObj.length
    ? conObj.filter(m => Number(m.valor_actual) >= Number(m.valor_objetivo)).length / conObj.length * 100
    : 0;

  bar.innerHTML = `
    <div class="stat-item">
      <span class="stat-label">Registros filtrados</span>
      <span class="stat-value">${total}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Suma valores</span>
      <span class="stat-value">${fmtNum(suma)}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Promedio</span>
      <span class="stat-value">${fmtNum(prom, 1)}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Cumplimiento</span>
      <span class="stat-value">${cumpl.toFixed(1)}%</span>
    </div>`;

  const info = document.getElementById('paginationInfo');
  if (info) {
    const start = (MetricasState.currentPage - 1) * MetricasState.pageSize + 1;
    const end   = Math.min(MetricasState.currentPage * MetricasState.pageSize, total);
    info.textContent = total ? `Mostrando ${start}–${end} de ${total}` : 'Sin resultados';
  }
}

/* ─────────────────────────────────────────
   Paginación
───────────────────────────────────────── */
function renderPagination() {
  const bar   = document.getElementById('paginationBar');
  if (!bar) return;
  const total = MetricasState.filtered.length;
  const pages = Math.ceil(total / MetricasState.pageSize);
  const curr  = MetricasState.currentPage;

  if (pages <= 1) { bar.innerHTML = ''; return; }

  let html = `<button class="page-btn" data-page="${curr - 1}" ${curr === 1 ? 'disabled' : ''} aria-label="Anterior">‹</button>`;

  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - curr) <= 2) {
      html += `<button class="page-btn ${i === curr ? 'active' : ''}" data-page="${i}" aria-label="Página ${i}" ${i === curr ? 'aria-current="page"' : ''}>${i}</button>`;
    } else if (Math.abs(i - curr) === 3) {
      html += `<span class="page-ellipsis">…</span>`;
    }
  }

  html += `<button class="page-btn" data-page="${curr + 1}" ${curr === pages ? 'disabled' : ''} aria-label="Siguiente">›</button>`;
  bar.innerHTML = html;

  bar.querySelectorAll('.page-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      MetricasState.currentPage = parseInt(btn.dataset.page, 10);
      renderTabla();
      renderStats();
      renderPagination();
      document.getElementById('tablaMetricas')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ─────────────────────────────────────────
   Modal detalle
───────────────────────────────────────── */
function openDetalle(id) {
  const m = MetricasState.all.find(r => r.id === id);
  if (!m) return;
  MetricasState.selectedId = id;

  const periodo = MetricasState.periodos.find(p => p.id == m.periodo_id);
  const cat     = MetricasState.categorias.find(c => c.id == m.categoria_id);
  const cumpl   = m.valor_objetivo > 0 ? (Number(m.valor_actual) / Number(m.valor_objetivo)) * 100 : null;

  const body = document.getElementById('modalDetalleBody');
  if (body) {
    body.innerHTML = `
      <dl class="detail-list">
        <div class="detail-row"><dt>ID</dt><dd>${m.id}</dd></div>
        <div class="detail-row">
          <dt>Período</dt>
          <dd>${periodo ? periodo.nombre_mes + ' ' + periodo.anio : m.periodo_id}</dd>
        </div>
        <div class="detail-row">
          <dt>Categoría</dt>
          <dd>${cat ? `<span class="category-dot" style="background:${cat.color_hex}"></span> ${escHtml(cat.nombre)}` : m.categoria_id}</dd>
        </div>
        <div class="detail-row"><dt>Nombre métrica</dt><dd>${escHtml(m.nombre_metrica)}</dd></div>
        <div class="detail-row"><dt>Valor actual</dt><dd>${fmtNum(m.valor_actual)} ${escHtml(m.unidad || '')}</dd></div>
        <div class="detail-row"><dt>Valor objetivo</dt><dd>${m.valor_objetivo ? fmtNum(m.valor_objetivo) + ' ' + escHtml(m.unidad || '') : '—'}</dd></div>
        <div class="detail-row">
          <dt>Cumplimiento</dt>
          <dd>${cumpl !== null ? `<span class="badge ${cumpl >= 100 ? 'badge-positive' : cumpl >= 80 ? 'badge-neutral' : 'badge-negative'}">${cumpl.toFixed(1)}%</span>` : '—'}</dd>
        </div>
        <div class="detail-row">
          <dt>Fecha registro</dt>
          <dd>${m.fecha_registro ? new Date(m.fecha_registro + 'T00:00:00').toLocaleDateString('es-CO') : '—'}</dd>
        </div>
        <div class="detail-row"><dt>Notas</dt><dd>${m.notas ? escHtml(m.notas) : '<span class="text-secondary">Sin notas</span>'}</dd></div>
      </dl>`;
  }

  document.getElementById('btnEditarDesdeDetalle')?.setAttribute(
    'onclick', `window.location.href='formulario.html?id=${id}'`
  );
  openModal('modalDetalle');
}

/* ─────────────────────────────────────────
   Modal eliminar
───────────────────────────────────────── */
function openEliminar(id) {
  const m = MetricasState.all.find(r => r.id === id);
  if (!m) return;
  MetricasState.selectedId = id;
  const el = document.getElementById('eliminarNombreMetrica');
  if (el) el.textContent = m.nombre_metrica;
  openModal('modalEliminar');
}

async function confirmarEliminar() {
  const id = MetricasState.selectedId;
  if (!id) return;

  try {
    await fetch(`/api/metricas/${id}`, { method: 'DELETE' });
    MetricasState.all      = MetricasState.all.filter(m => m.id !== id);
    MetricasState.filtered = MetricasState.filtered.filter(m => m.id !== id);
    closeModal('modalEliminar');
    renderTabla();
    renderStats();
    renderPagination();
    showToastLocal('Métrica eliminada correctamente.', 'success');
  } catch (err) {
    showToastLocal('Error al eliminar la métrica.', 'error');
  }
}

/* ─────────────────────────────────────────
   Exportar CSV
───────────────────────────────────────── */
function exportarCSV() {
  const data = MetricasState.filtered;
  if (!data.length) { showToastLocal('No hay datos para exportar.', 'warning'); return; }

  const headers = ['ID', 'Periodo', 'Categoria', 'Metrica', 'Valor actual', 'Objetivo', 'Unidad', 'Cumplimiento %', 'Fecha registro', 'Notas'];
  const rows = data.map(m => {
    const periodo = MetricasState.periodos.find(p => p.id == m.periodo_id);
    const cat     = MetricasState.categorias.find(c => c.id == m.categoria_id);
    const cumpl   = m.valor_objetivo > 0 ? ((Number(m.valor_actual) / Number(m.valor_objetivo)) * 100).toFixed(1) : '';
    return [
      m.id,
      periodo ? `${periodo.nombre_mes} ${periodo.anio}` : m.periodo_id,
      cat?.nombre || m.categoria_id,
      m.nombre_metrica,
      m.valor_actual,
      m.valor_objetivo || '',
      m.unidad || '',
      cumpl,
      m.fecha_registro || '',
      m.notas || '',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
  });

  const csv  = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `metricas_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToastLocal('CSV generado correctamente.', 'success');
}

/* ─────────────────────────────────────────
   Eventos
───────────────────────────────────────── */
function bindEvents() {
  document.getElementById('btnAplicarFiltros')?.addEventListener('click', applyFilters);

  document.getElementById('btnLimpiarFiltros')?.addEventListener('click', () => {
    ['filtroAnio', 'filtroPeriodo', 'filtroCategoria', 'filtroTrimestre'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const busq = document.getElementById('filtroBusqueda');
    if (busq) busq.value = '';
    applyFilters();
  });

  document.getElementById('filtroBusqueda')?.addEventListener('input', () => {
    MetricasState.currentPage = 1;
    applyFilters();
  });

  document.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (MetricasState.sortCol === col) {
        MetricasState.sortDir = MetricasState.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        MetricasState.sortCol = col;
        MetricasState.sortDir = 'asc';
      }
      document.querySelectorAll('th.sortable').forEach(t => t.setAttribute('aria-sort', 'none'));
      th.setAttribute('aria-sort', MetricasState.sortDir === 'asc' ? 'ascending' : 'descending');
      sortData();
      MetricasState.currentPage = 1;
      renderTabla();
      renderPagination();
    });
    th.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') th.click(); });
  });

  document.getElementById('btnExportCSV')?.addEventListener('click', exportarCSV);
  document.getElementById('btnConfirmarEliminar')?.addEventListener('click', confirmarEliminar);
}

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function fmtNum(n, dec = 0) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: dec, minimumFractionDigits: dec,
  }).format(n);
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('open');
  el.setAttribute('aria-hidden', 'false');
  el.querySelector('[data-modal-close]')?.focus();
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('open');
  el.setAttribute('aria-hidden', 'true');
}

function showToastLocal(msg, type = 'info') {
  if (window.AppUtils?.showToast) { window.AppUtils.showToast(msg, type); return; }
  const c = document.querySelector('.toast-container');
  if (!c) return;
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}
