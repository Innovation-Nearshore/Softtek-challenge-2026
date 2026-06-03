/**
 * periodos.js
 * Lógica de listado y CRUD para la tabla periodos
 * Depende de: app.js
 */

/* ─────────────────────────────────────────
   Constantes
───────────────────────────────────────── */
const NOMBRES_MES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

/* ─────────────────────────────────────────
   Estado
───────────────────────────────────────── */
const PerState = {
  all: [],
  filtered: [],
  sortCol: 'id',
  sortDir: 'asc',
  editId: null,
  deleteId: null,
};

/* ─────────────────────────────────────────
   Inicialización
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  await loadPeriodos();
  populateAnioFilter();
  applyFilters();
  bindEvents();
});

async function loadPeriodos() {
  try {
    const data = await window.AppUtils.fetchPeriodos();
    PerState.all = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error al cargar períodos:', err);
    PerState.all = [];
    showToastLocal('Error al cargar períodos. Verifica el servidor.', 'error');
  }
}

/* ─────────────────────────────────────────
   Poblar filtro de año
───────────────────────────────────────── */
function populateAnioFilter() {
  const anios = [...new Set(PerState.all.map(p => p.anio))].sort();
  const sel = document.getElementById('filtroAnio');
  if (!sel) return;
  sel.innerHTML = `<option value="">Todos</option>` +
    anios.map(a => `<option value="${a}">${a}</option>`).join('');
}

/* ─────────────────────────────────────────
   Filtrado y ordenamiento
───────────────────────────────────────── */
function applyFilters() {
  const anio = document.getElementById('filtroAnio')?.value || '';
  const trim = document.getElementById('filtroTrimestre')?.value || '';

  PerState.filtered = PerState.all.filter(p => {
    if (anio && String(p.anio)      !== anio) return false;
    if (trim && String(p.trimestre) !== trim) return false;
    return true;
  });

  sortData();
  renderTabla();
}

function sortData() {
  const col = PerState.sortCol;
  const dir = PerState.sortDir === 'asc' ? 1 : -1;
  PerState.filtered.sort((a, b) => {
    const va = a[col] ?? '';
    const vb = b[col] ?? '';
    if (typeof va === 'string') return va.localeCompare(vb) * dir;
    return (va - vb) * dir;
  });
}

/* ─────────────────────────────────────────
   Renderizado
───────────────────────────────────────── */
function renderTabla() {
  const tbody = document.getElementById('tbodyPeriodos');
  const total = document.getElementById('totalPeriodos');
  if (total) total.textContent = `${PerState.filtered.length} registros`;
  if (!tbody) return;

  if (!PerState.filtered.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center;padding:48px;color:var(--text-secondary);">
          <div class="empty-state">
            <span class="empty-state-icon" aria-hidden="true">📅</span>
            <div class="empty-state-title">Sin períodos</div>
            <div class="empty-state-desc">No se encontraron períodos con los filtros aplicados.</div>
          </div>
        </td>
      </tr>`;
    return;
  }

  const trimLabels = { 1: 'Q1', 2: 'Q2', 3: 'Q3', 4: 'Q4' };

  tbody.innerHTML = PerState.filtered.map(p => {
    const fmtDate = d => d ? new Date(d).toLocaleDateString('es-CO') : '—';
    return `
      <tr data-id="${p.id}">
        <td>${p.id}</td>
        <td>${p.anio}</td>
        <td>${p.mes}</td>
        <td>${escHtml(p.nombre_mes || NOMBRES_MES[p.mes] || '')}</td>
        <td><span class="badge badge-neutral">${trimLabels[p.trimestre] || p.trimestre}</span></td>
        <td>${fmtDate(p.fecha_inicio)}</td>
        <td>${fmtDate(p.fecha_fin)}</td>
        <td class="text-center">
          <div class="action-buttons">
            <button class="btn btn-sm btn-secondary" data-action="editar"   data-id="${p.id}" aria-label="Editar período ${escHtml(p.nombre_mes)} ${p.anio}">✏️</button>
            <button class="btn btn-sm btn-danger"    data-action="eliminar" data-id="${p.id}" aria-label="Eliminar período ${escHtml(p.nombre_mes)} ${p.anio}">🗑️</button>
          </div>
        </td>
      </tr>`;
  }).join('');

  tbody.querySelectorAll('[data-action="editar"]').forEach(btn => {
    btn.addEventListener('click', () => openEditar(parseInt(btn.dataset.id, 10)));
  });
  tbody.querySelectorAll('[data-action="eliminar"]').forEach(btn => {
    btn.addEventListener('click', () => openEliminar(parseInt(btn.dataset.id, 10)));
  });
}

/* ─────────────────────────────────────────
   Modal crear / editar
───────────────────────────────────────── */
function openCrear() {
  PerState.editId = null;
  document.getElementById('modalPeriodoTitle').textContent = 'Nuevo período';
  document.getElementById('perId').value          = '';
  document.getElementById('perAnio').value        = new Date().getFullYear();
  document.getElementById('perMes').value         = '';
  document.getElementById('perFechaInicio').value = '';
  document.getElementById('perFechaFin').value    = '';
  clearErrors();
  openModal('modalPeriodo');
}

function openEditar(id) {
  const p = PerState.all.find(x => x.id === id);
  if (!p) return;
  PerState.editId = id;
  document.getElementById('modalPeriodoTitle').textContent = 'Editar período';
  document.getElementById('perId').value          = p.id;
  document.getElementById('perAnio').value        = p.anio;
  document.getElementById('perMes').value         = p.mes;
  document.getElementById('perFechaInicio').value = p.fecha_inicio ? p.fecha_inicio.split('T')[0] : '';
  document.getElementById('perFechaFin').value    = p.fecha_fin    ? p.fecha_fin.split('T')[0]    : '';
  clearErrors();
  openModal('modalPeriodo');
}

function clearErrors() {
  ['errPerAnio', 'errPerMes', 'errPerFechaInicio', 'errPerFechaFin'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.style.display = 'none'; }
  });
  ['perAnio', 'perMes', 'perFechaInicio', 'perFechaFin'].forEach(id => {
    document.getElementById(id)?.classList.remove('is-invalid');
  });
}

async function guardarPeriodo() {
  const anio = parseInt(document.getElementById('perAnio')?.value || '0', 10);
  const mes  = parseInt(document.getElementById('perMes')?.value  || '0', 10);
  const fi   = document.getElementById('perFechaInicio')?.value || '';
  const ff   = document.getElementById('perFechaFin')?.value    || '';

  let valid = true;

  if (!anio || anio < 2000 || anio > 2100) {
    showFieldError('errPerAnio', 'perAnio', 'Introduce un año válido entre 2000 y 2100.');
    valid = false;
  }
  if (!mes || mes < 1 || mes > 12) {
    showFieldError('errPerMes', 'perMes', 'Selecciona un mes.');
    valid = false;
  }
  if (!fi) {
    showFieldError('errPerFechaInicio', 'perFechaInicio', 'La fecha de inicio es obligatoria.');
    valid = false;
  }
  if (!ff) {
    showFieldError('errPerFechaFin', 'perFechaFin', 'La fecha de fin es obligatoria.');
    valid = false;
  }
  if (fi && ff && ff < fi) {
    showFieldError('errPerFechaFin', 'perFechaFin', 'La fecha fin no puede ser anterior a la fecha inicio.');
    valid = false;
  }
  if (!valid) return;

  // Verificar unicidad anio+mes localmente (excluir el registro en edición)
  const duplicado = PerState.all.find(p =>
    p.anio === anio && p.mes === mes && p.id !== PerState.editId
  );
  if (duplicado) {
    showFieldError('errPerMes', 'perMes', `Ya existe el período ${NOMBRES_MES[mes]} ${anio}.`);
    return;
  }

  const payload = {
    anio,
    mes,
    nombre_mes:  NOMBRES_MES[mes],
    trimestre:   Math.ceil(mes / 3),
    fecha_inicio: fi || null,
    fecha_fin:    ff || null,
  };

  try {
    if (PerState.editId) {
      const res = await fetch(`/api/periodos/${PerState.editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al actualizar');
      }
      const updated = await res.json();
      const idx = PerState.all.findIndex(p => p.id === PerState.editId);
      if (idx !== -1) PerState.all[idx] = updated;
      showToastLocal('Período actualizado correctamente.', 'success');
    } else {
      const res = await fetch('/api/periodos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al crear');
      }
      const created = await res.json();
      PerState.all.push(created);
      showToastLocal('Período creado correctamente.', 'success');
    }
    closeModal('modalPeriodo');
    populateAnioFilter();
    applyFilters();
  } catch (err) {
    showToastLocal(`Error: ${err.message}`, 'error');
  }
}

/* ─────────────────────────────────────────
   Modal eliminar
───────────────────────────────────────── */
function openEliminar(id) {
  const p = PerState.all.find(x => x.id === id);
  if (!p) return;
  PerState.deleteId = id;
  const el = document.getElementById('eliminarNombrePer');
  if (el) el.textContent = `${p.nombre_mes || NOMBRES_MES[p.mes]} ${p.anio}`;
  openModal('modalEliminarPer');
}

async function confirmarEliminar() {
  const id = PerState.deleteId;
  if (!id) return;

  try {
    const res = await fetch(`/api/periodos/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al eliminar');
    }
    PerState.all = PerState.all.filter(p => p.id !== id);
    closeModal('modalEliminarPer');
    populateAnioFilter();
    applyFilters();
    showToastLocal('Período eliminado.', 'success');
  } catch (err) {
    showToastLocal(`Error: ${err.message}`, 'error');
  }
}

/* ─────────────────────────────────────────
   Autocompletado de fechas al elegir mes
───────────────────────────────────────── */
function autoFillDates() {
  const anio = parseInt(document.getElementById('perAnio')?.value || '0', 10);
  const mes  = parseInt(document.getElementById('perMes')?.value  || '0', 10);
  if (!anio || !mes) return;

  const mm      = String(mes).padStart(2, '0');
  const lastDay = new Date(anio, mes, 0).getDate();
  const fiEl    = document.getElementById('perFechaInicio');
  const ffEl    = document.getElementById('perFechaFin');
  if (fiEl && !fiEl.value) fiEl.value = `${anio}-${mm}-01`;
  if (ffEl && !ffEl.value) ffEl.value = `${anio}-${mm}-${lastDay}`;
}

/* ─────────────────────────────────────────
   Eventos
───────────────────────────────────────── */
function bindEvents() {
  document.getElementById('btnNuevoPeriodo')?.addEventListener('click', openCrear);

  document.getElementById('filtroAnio')?.addEventListener('change', applyFilters);
  document.getElementById('filtroTrimestre')?.addEventListener('change', applyFilters);
  document.getElementById('btnLimpiarFiltros')?.addEventListener('click', () => {
    const a = document.getElementById('filtroAnio');
    const t = document.getElementById('filtroTrimestre');
    if (a) a.value = '';
    if (t) t.value = '';
    applyFilters();
  });

  document.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (PerState.sortCol === col) {
        PerState.sortDir = PerState.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        PerState.sortCol = col;
        PerState.sortDir = 'asc';
      }
      document.querySelectorAll('th.sortable').forEach(t => t.setAttribute('aria-sort', 'none'));
      th.setAttribute('aria-sort', PerState.sortDir === 'asc' ? 'ascending' : 'descending');
      sortData();
      renderTabla();
    });
    th.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') th.click(); });
  });

  document.getElementById('btnGuardarPeriodo')?.addEventListener('click', guardarPeriodo);
  document.getElementById('btnConfirmarEliminarPer')?.addEventListener('click', confirmarEliminar);

  document.getElementById('perMes')?.addEventListener('change', autoFillDates);
  document.getElementById('perAnio')?.addEventListener('change', autoFillDates);
}

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function showFieldError(errId, inputId, msg) {
  const errEl = document.getElementById(errId);
  if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
  document.getElementById(inputId)?.classList.add('is-invalid');
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
  setTimeout(() => {
    el.querySelector('input:not([type=hidden]),select,button:not([data-modal-close])')?.focus();
  }, 50);
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
