/**
 * categorias.js
 * Lógica de listado y CRUD para categorias_metricas
 * Depende de: app.js
 */

/* ─────────────────────────────────────────
   Estado
───────────────────────────────────────── */
const CatState = {
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
  await loadCategorias();
  applyFilters();
  bindEvents();
});

async function loadCategorias() {
  try {
    const data = await window.AppUtils.fetchCategorias();
    CatState.all = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Error al cargar categorías:', err);
    CatState.all = [];
    showToastLocal('Error al cargar categorías. Verifica el servidor.', 'error');
  }
}

/* ─────────────────────────────────────────
   Filtrado y ordenamiento
───────────────────────────────────────── */
function applyFilters() {
  const busq = (document.getElementById('filtroBusqueda')?.value || '').toLowerCase();
  CatState.filtered = CatState.all.filter(c =>
    !busq || c.nombre.toLowerCase().includes(busq)
  );
  sortData();
  renderTabla();
}

function sortData() {
  const col = CatState.sortCol;
  const dir = CatState.sortDir === 'asc' ? 1 : -1;
  CatState.filtered.sort((a, b) => {
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
  const tbody = document.getElementById('tbodyCategorias');
  const total = document.getElementById('totalCategorias');
  if (total) total.textContent = `${CatState.filtered.length} registros`;
  if (!tbody) return;

  if (!CatState.filtered.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:48px;color:var(--text-secondary);">
          <div class="empty-state">
            <span class="empty-state-icon" aria-hidden="true">🏷️</span>
            <div class="empty-state-title">Sin categorías</div>
            <div class="empty-state-desc">Crea la primera categoría usando el botón "Nueva categoría".</div>
          </div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = CatState.filtered.map(c => `
    <tr data-id="${c.id}">
      <td>${c.id}</td>
      <td>
        <span class="category-dot" style="background:${escHtml(c.color_hex)}" aria-hidden="true"></span>
        <strong>${escHtml(c.nombre)}</strong>
      </td>
      <td>
        <div class="color-preview-cell">
          <span class="color-swatch" style="background:${escHtml(c.color_hex)};display:inline-block;width:24px;height:24px;border-radius:4px;vertical-align:middle;border:1px solid rgba(0,0,0,.15);"></span>
          <code style="margin-left:6px;font-size:0.8rem;">${escHtml(c.color_hex)}</code>
        </div>
      </td>
      <td>${c.descripcion ? escHtml(c.descripcion) : '<span class="text-secondary">—</span>'}</td>
      <td class="text-center">
        <div class="action-buttons">
          <button class="btn btn-sm btn-secondary" data-action="editar"   data-id="${c.id}" aria-label="Editar categoría ${escHtml(c.nombre)}">✏️</button>
          <button class="btn btn-sm btn-danger"    data-action="eliminar" data-id="${c.id}" aria-label="Eliminar categoría ${escHtml(c.nombre)}">🗑️</button>
        </div>
      </td>
    </tr>`).join('');

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
  CatState.editId = null;
  document.getElementById('modalCategoriaTitle').textContent = 'Nueva categoría';
  document.getElementById('catId').value = '';
  document.getElementById('catNombre').value = '';
  document.getElementById('catDescripcion').value = '';
  document.getElementById('catColor').value = '#091FFD';
  document.getElementById('catColorHex').value = '#091FFD';
  clearErrors();
  openModal('modalCategoria');
}

function openEditar(id) {
  const cat = CatState.all.find(c => c.id === id);
  if (!cat) return;
  CatState.editId = id;
  document.getElementById('modalCategoriaTitle').textContent = 'Editar categoría';
  document.getElementById('catId').value = cat.id;
  document.getElementById('catNombre').value = cat.nombre;
  document.getElementById('catDescripcion').value = cat.descripcion || '';
  document.getElementById('catColor').value = cat.color_hex || '#091FFD';
  document.getElementById('catColorHex').value = cat.color_hex || '#091FFD';
  clearErrors();
  openModal('modalCategoria');
}

function clearErrors() {
  ['errCatNombre', 'errCatColor'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.style.display = 'none'; }
  });
  document.getElementById('catNombre')?.classList.remove('is-invalid');
  document.getElementById('catColorHex')?.classList.remove('is-invalid');
}

async function guardarCategoria() {
  const nombre   = document.getElementById('catNombre')?.value.trim() || '';
  const desc     = document.getElementById('catDescripcion')?.value.trim() || '';
  const colorHex = document.getElementById('catColorHex')?.value.trim() || document.getElementById('catColor')?.value || '#091FFD';

  let valid = true;

  if (!nombre) {
    showError('errCatNombre', 'catNombre', 'El nombre es obligatorio.');
    valid = false;
  } else if (nombre.length > 100) {
    showError('errCatNombre', 'catNombre', 'El nombre no puede superar 100 caracteres.');
    valid = false;
  }

  if (!isValidHex(colorHex)) {
    showError('errCatColor', 'catColorHex', 'Introduce un color hexadecimal válido (Ej: #FF5733).');
    valid = false;
  }

  if (!valid) return;

  const payload = { nombre, descripcion: desc, color_hex: colorHex };

  try {
    if (CatState.editId) {
      const res = await fetch(`/api/categorias/${CatState.editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al actualizar');
      }
      const updated = await res.json();
      const idx = CatState.all.findIndex(c => c.id === CatState.editId);
      if (idx !== -1) CatState.all[idx] = updated;
      showToastLocal('Categoría actualizada correctamente.', 'success');
    } else {
      const res = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al crear');
      }
      const created = await res.json();
      CatState.all.push(created);
      showToastLocal('Categoría creada correctamente.', 'success');
    }
    closeModal('modalCategoria');
    applyFilters();
  } catch (err) {
    showToastLocal(`Error: ${err.message}`, 'error');
  }
}

/* ─────────────────────────────────────────
   Modal eliminar
───────────────────────────────────────── */
function openEliminar(id) {
  const cat = CatState.all.find(c => c.id === id);
  if (!cat) return;
  CatState.deleteId = id;
  const el = document.getElementById('eliminarNombreCat');
  if (el) el.textContent = cat.nombre;
  openModal('modalEliminarCat');
}

async function confirmarEliminar() {
  const id = CatState.deleteId;
  if (!id) return;

  try {
    const res = await fetch(`/api/categorias/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al eliminar');
    }
    CatState.all = CatState.all.filter(c => c.id !== id);
    closeModal('modalEliminarCat');
    applyFilters();
    showToastLocal('Categoría eliminada.', 'success');
  } catch (err) {
    showToastLocal(`Error: ${err.message}`, 'error');
  }
}

/* ─────────────────────────────────────────
   Eventos
───────────────────────────────────────── */
function bindEvents() {
  document.getElementById('btnNuevaCategoria')?.addEventListener('click', openCrear);

  document.getElementById('filtroBusqueda')?.addEventListener('input', applyFilters);
  document.getElementById('btnLimpiarFiltros')?.addEventListener('click', () => {
    const el = document.getElementById('filtroBusqueda');
    if (el) el.value = '';
    applyFilters();
  });

  document.querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (CatState.sortCol === col) {
        CatState.sortDir = CatState.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        CatState.sortCol = col;
        CatState.sortDir = 'asc';
      }
      document.querySelectorAll('th.sortable').forEach(t => t.setAttribute('aria-sort', 'none'));
      th.setAttribute('aria-sort', CatState.sortDir === 'asc' ? 'ascending' : 'descending');
      sortData();
      renderTabla();
    });
    th.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') th.click(); });
  });

  document.getElementById('btnGuardarCategoria')?.addEventListener('click', guardarCategoria);
  document.getElementById('btnConfirmarEliminarCat')?.addEventListener('click', confirmarEliminar);

  const colorPicker   = document.getElementById('catColor');
  const colorHexInput = document.getElementById('catColorHex');

  colorPicker?.addEventListener('input', () => {
    if (colorHexInput) colorHexInput.value = colorPicker.value;
  });
  colorHexInput?.addEventListener('input', () => {
    const val = colorHexInput.value.trim();
    if (isValidHex(val) && colorPicker) colorPicker.value = val;
  });
}

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function isValidHex(v) {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(v);
}

function showError(errId, inputId, msg) {
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
    el.querySelector('input:not([type=hidden]),textarea,button:not([data-modal-close])')?.focus();
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
