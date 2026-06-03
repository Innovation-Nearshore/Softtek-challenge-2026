/**
 * formulario.js
 * Lógica del formulario de ingreso / edición de metricas_mensuales
 * Depende de: app.js
 * Soporta: ?id=N para modo edición
 */

/* ─────────────────────────────────────────
   Estado
───────────────────────────────────────── */
const FormState = {
  modo: 'crear',      // 'crear' | 'editar'
  editId: null,
  categorias: [],
  periodos: [],
};

/* ─────────────────────────────────────────
   Inicialización
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  const params  = new URLSearchParams(window.location.search);
  const idParam = params.get('id');
  if (idParam) {
    FormState.modo   = 'editar';
    FormState.editId = parseInt(idParam, 10);
  }

  await loadReferenceData();
  populateSelects();
  setDefaultDate();

  if (FormState.modo === 'editar') {
    await loadMetricaForEdit();
  }

  bindEvents();
  updateCumplimientoPreview();
});

async function loadReferenceData() {
  try {
    const [cats, pers] = await Promise.all([
      window.AppUtils.fetchCategorias(),
      window.AppUtils.fetchPeriodos(),
    ]);
    FormState.categorias = Array.isArray(cats) ? cats : [];
    FormState.periodos   = Array.isArray(pers) ? pers : [];
  } catch (err) {
    console.error('Error al cargar datos de referencia:', err);
    FormState.categorias = [];
    FormState.periodos   = [];
    showToastLocal('Error al cargar categorías/períodos.', 'error');
  }
}

/* ─────────────────────────────────────────
   Poblar selects de referencia
───────────────────────────────────────── */
function populateSelects() {
  const selPer = document.getElementById('fPeriodo');
  if (selPer) {
    selPer.innerHTML = '<option value="">Selecciona un período…</option>' +
      FormState.periodos.map(p =>
        `<option value="${p.id}">${escHtml(p.nombre_mes)} ${p.anio}</option>`
      ).join('');
  }

  const selCat = document.getElementById('fCategoria');
  if (selCat) {
    selCat.innerHTML = '<option value="">Selecciona una categoría…</option>' +
      FormState.categorias.map(c =>
        `<option value="${c.id}">${escHtml(c.nombre)}</option>`
      ).join('');
  }
}

/* ─────────────────────────────────────────
   Fecha por defecto = hoy
───────────────────────────────────────── */
function setDefaultDate() {
  const el = document.getElementById('fFechaRegistro');
  if (el && !el.value) {
    el.value = new Date().toISOString().slice(0, 10);
  }
}

/* ─────────────────────────────────────────
   Cargar datos en modo edición
───────────────────────────────────────── */
async function loadMetricaForEdit() {
  try {
    const data = await window.AppUtils.apiFetch(`/api/metricas/${FormState.editId}`);
    if (!data || !data.id) throw new Error('Registro no encontrado');

    document.getElementById('pageTitle').textContent       = 'Editar Métrica';
    document.getElementById('pageSubtitle').textContent    = `Editando: ${data.nombre_metrica}`;
    document.getElementById('breadcrumbLabel').textContent = 'Editar métrica';
    document.getElementById('btnGuardarText').textContent  = '💾 Actualizar métrica';
    document.getElementById('metricaId').value = data.id;

    document.getElementById('fPeriodo').value       = data.periodo_id;
    document.getElementById('fCategoria').value     = data.categoria_id;
    document.getElementById('fNombreMetrica').value = data.nombre_metrica;
    document.getElementById('fValorActual').value   = data.valor_actual;
    document.getElementById('fValorObjetivo').value = data.valor_objetivo != null ? data.valor_objetivo : '';
    document.getElementById('fUnidad').value        = data.unidad || '';
    document.getElementById('fNotas').value         = data.notas || '';
    document.getElementById('fFechaRegistro').value = data.fecha_registro
      ? data.fecha_registro.split('T')[0]
      : '';

    updateNotasCount();
    updateCumplimientoPreview();
  } catch (err) {
    showToastLocal(`No se encontró la métrica con ID ${FormState.editId}.`, 'error');
    setTimeout(() => { window.location.href = 'metricas.html'; }, 2000);
  }
}

/* ─────────────────────────────────────────
   Vista previa de cumplimiento (tiempo real)
───────────────────────────────────────── */
function updateCumplimientoPreview() {
  const va      = parseFloat(document.getElementById('fValorActual')?.value || '');
  const vo      = parseFloat(document.getElementById('fValorObjetivo')?.value || '');
  const preview = document.getElementById('cumplimientoPreview');
  if (!preview) return;

  if (isNaN(va) || isNaN(vo) || vo <= 0) {
    preview.innerHTML = '';
    return;
  }

  const pct  = (va / vo) * 100;
  const cls  = pct >= 100 ? 'badge-positive' : pct >= 80 ? 'badge-neutral' : 'badge-negative';
  const icon = pct >= 100 ? '✅' : pct >= 80 ? '⚠️' : '❌';
  const msg  = pct >= 100 ? 'Objetivo alcanzado' : pct >= 80 ? 'Cerca del objetivo' : 'Bajo objetivo';

  preview.innerHTML = `
    <div class="cumplimiento-card">
      <span class="cumplimiento-icon">${icon}</span>
      <div class="cumplimiento-info">
        <span class="cumplimiento-label">Cumplimiento estimado</span>
        <span class="badge ${cls} cumplimiento-pct">${pct.toFixed(1)}%</span>
      </div>
      <span class="cumplimiento-msg">${msg}</span>
    </div>`;
}

/* ─────────────────────────────────────────
   Contador de caracteres en Notas
───────────────────────────────────────── */
function updateNotasCount() {
  const ta  = document.getElementById('fNotas');
  const cnt = document.getElementById('notasCount');
  if (ta && cnt) cnt.textContent = `${ta.value.length} / 1000`;
}

/* ─────────────────────────────────────────
   Validación
───────────────────────────────────────── */
function validateForm() {
  let valid = true;
  clearAllErrors();

  const periodo = document.getElementById('fPeriodo')?.value || '';
  if (!periodo) {
    setFieldError('errPeriodo', 'fPeriodo', 'Selecciona un período.');
    valid = false;
  }

  const categoria = document.getElementById('fCategoria')?.value || '';
  if (!categoria) {
    setFieldError('errCategoria', 'fCategoria', 'Selecciona una categoría.');
    valid = false;
  }

  const nombre = document.getElementById('fNombreMetrica')?.value.trim() || '';
  if (!nombre) {
    setFieldError('errNombreMetrica', 'fNombreMetrica', 'El nombre de la métrica es obligatorio.');
    valid = false;
  } else if (nombre.length > 150) {
    setFieldError('errNombreMetrica', 'fNombreMetrica', 'El nombre no puede superar 150 caracteres.');
    valid = false;
  }

  const vaRaw = document.getElementById('fValorActual')?.value;
  const va    = parseFloat(vaRaw);
  if (vaRaw === '' || vaRaw == null || isNaN(va)) {
    setFieldError('errValorActual', 'fValorActual', 'El valor actual es obligatorio y debe ser numérico.');
    valid = false;
  } else if (va < 0) {
    setFieldError('errValorActual', 'fValorActual', 'El valor actual no puede ser negativo.');
    valid = false;
  }

  const voRaw = document.getElementById('fValorObjetivo')?.value;
  if (voRaw !== '' && voRaw != null) {
    const vo = parseFloat(voRaw);
    if (isNaN(vo)) {
      setFieldError('errValorObjetivo', 'fValorObjetivo', 'El valor objetivo debe ser numérico.');
      valid = false;
    } else if (vo < 0) {
      setFieldError('errValorObjetivo', 'fValorObjetivo', 'El valor objetivo no puede ser negativo.');
      valid = false;
    }
  }

  const unidad = document.getElementById('fUnidad')?.value || '';
  if (unidad.length > 50) {
    setFieldError('errUnidad', 'fUnidad', 'La unidad no puede superar 50 caracteres.');
    valid = false;
  }

  return valid;
}

function clearAllErrors() {
  ['errPeriodo', 'errCategoria', 'errNombreMetrica', 'errValorActual', 'errValorObjetivo', 'errUnidad'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.style.display = 'none'; }
  });
  ['fPeriodo', 'fCategoria', 'fNombreMetrica', 'fValorActual', 'fValorObjetivo', 'fUnidad'].forEach(id => {
    document.getElementById(id)?.classList.remove('is-invalid');
  });
}

function setFieldError(errId, inputId, msg) {
  const errEl = document.getElementById(errId);
  if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
  const inputEl = document.getElementById(inputId);
  inputEl?.classList.add('is-invalid');
  inputEl?.focus();
}

/* ─────────────────────────────────────────
   Envío del formulario
───────────────────────────────────────── */
async function submitForm() {
  if (!validateForm()) return;

  const btn = document.getElementById('btnGuardar');
  const txtEl = document.getElementById('btnGuardarText');
  if (btn) btn.disabled = true;
  if (txtEl) txtEl.textContent = 'Guardando…';

  const payload = {
    periodo_id:    parseInt(document.getElementById('fPeriodo').value, 10),
    categoria_id:  parseInt(document.getElementById('fCategoria').value, 10),
    nombre_metrica: document.getElementById('fNombreMetrica').value.trim(),
    valor_actual:  parseFloat(document.getElementById('fValorActual').value),
    valor_objetivo: document.getElementById('fValorObjetivo').value !== ''
      ? parseFloat(document.getElementById('fValorObjetivo').value)
      : null,
    unidad:        document.getElementById('fUnidad').value.trim() || null,
    notas:         document.getElementById('fNotas').value.trim() || null,
    fecha_registro: document.getElementById('fFechaRegistro').value || null,
  };

  try {
    if (FormState.modo === 'editar') {
      const res = await fetch(`/api/metricas/${FormState.editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al actualizar');
      }
      showToastLocal('Métrica actualizada correctamente.', 'success');
    } else {
      const res = await fetch('/api/metricas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error al guardar');
      }
      showToastLocal('Métrica guardada correctamente.', 'success');
    }
    setTimeout(() => { window.location.href = 'metricas.html'; }, 1200);
  } catch (err) {
    showToastLocal(`Error: ${err.message}`, 'error');
    if (btn) btn.disabled = false;
    if (txtEl) txtEl.textContent = FormState.modo === 'editar' ? '💾 Actualizar métrica' : '💾 Guardar métrica';
  }
}

/* ─────────────────────────────────────────
   Limpiar formulario
───────────────────────────────────────── */
function limpiarFormulario() {
  if (FormState.modo === 'editar') return;
  document.getElementById('fPeriodo').value       = '';
  document.getElementById('fCategoria').value     = '';
  document.getElementById('fNombreMetrica').value = '';
  document.getElementById('fValorActual').value   = '';
  document.getElementById('fValorObjetivo').value = '';
  document.getElementById('fUnidad').value        = '';
  document.getElementById('fNotas').value         = '';
  setDefaultDate();
  clearAllErrors();
  updateCumplimientoPreview();
  updateNotasCount();
  document.getElementById('fPeriodo')?.focus();
}

/* ─────────────────────────────────────────
   Eventos
───────────────────────────────────────── */
function bindEvents() {
  document.getElementById('formMetrica')?.addEventListener('submit', e => {
    e.preventDefault();
    submitForm();
  });

  document.getElementById('btnGuardar')?.addEventListener('click', e => {
    if (e.target.type !== 'submit') {
      e.preventDefault();
      submitForm();
    }
  });

  document.getElementById('btnCancelar')?.addEventListener('click', () => {
    window.location.href = 'metricas.html';
  });

  document.getElementById('btnLimpiar')?.addEventListener('click', limpiarFormulario);

  ['fValorActual', 'fValorObjetivo'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateCumplimientoPreview);
  });

  document.getElementById('fNotas')?.addEventListener('input', updateNotasCount);

  const fieldsInline = [
    { fieldId: 'fPeriodo',       errId: 'errPeriodo',       check: v => v ? null : 'Selecciona un período.' },
    { fieldId: 'fCategoria',     errId: 'errCategoria',     check: v => v ? null : 'Selecciona una categoría.' },
    { fieldId: 'fNombreMetrica', errId: 'errNombreMetrica', check: v => !v.trim() ? 'El nombre es obligatorio.' : v.length > 150 ? 'Máximo 150 caracteres.' : null },
    { fieldId: 'fValorActual',   errId: 'errValorActual',   check: v => v === '' ? 'Campo obligatorio.' : isNaN(parseFloat(v)) ? 'Debe ser numérico.' : parseFloat(v) < 0 ? 'No puede ser negativo.' : null },
    { fieldId: 'fValorObjetivo', errId: 'errValorObjetivo', check: v => v !== '' && isNaN(parseFloat(v)) ? 'Debe ser numérico.' : v !== '' && parseFloat(v) < 0 ? 'No puede ser negativo.' : null },
  ];

  fieldsInline.forEach(({ fieldId, errId, check }) => {
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.addEventListener('blur', () => {
      const msg   = check(el.value);
      const errEl = document.getElementById(errId);
      if (msg) {
        if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
        el.classList.add('is-invalid');
      } else {
        if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
        el.classList.remove('is-invalid');
        el.classList.add('is-valid');
      }
    });
    el.addEventListener('input', () => {
      const errEl = document.getElementById(errId);
      if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
      el.classList.remove('is-invalid');
    });
  });

  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      submitForm();
    }
  });
}

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
