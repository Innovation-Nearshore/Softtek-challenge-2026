/**
 * carga.js
 * Lógica de carga masiva de métricas mediante CSV
 * Depende de: app.js
 */

/* ─────────────────────────────────────────
   Columnas esperadas en el CSV
───────────────────────────────────────── */
const COLUMNAS_REQUERIDAS = ['periodo_id', 'categoria_id', 'nombre_metrica', 'valor_actual'];
const COLUMNAS_OPCIONALES = ['valor_objetivo', 'unidad', 'notas', 'fecha_registro'];
const TODAS_COLUMNAS      = [...COLUMNAS_REQUERIDAS, ...COLUMNAS_OPCIONALES];

/* ─────────────────────────────────────────
   Estado
───────────────────────────────────────── */
const CargaState = {
  file: null,
  rawText: '',
  parsedRows: [],
  validRows: [],
  errorRows: [],
  headers: [],
  categorias: [],
  periodos: [],
};

/* ─────────────────────────────────────────
   Inicialización
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  await loadReferenceData();
  bindEvents();
});

async function loadReferenceData() {
  try {
    const [cats, pers] = await Promise.all([
      window.AppUtils.fetchCategorias(),
      window.AppUtils.fetchPeriodos(),
    ]);
    CargaState.categorias = Array.isArray(cats) ? cats : [];
    CargaState.periodos   = Array.isArray(pers) ? pers : [];
  } catch (err) {
    console.error('Error al cargar datos de referencia:', err);
    CargaState.categorias = [];
    CargaState.periodos   = [];
    showToastLocal('Error al cargar catálogos. Verifica el servidor.', 'error');
  }
}

/* ─────────────────────────────────────────
   Eventos
───────────────────────────────────────── */
function bindEvents() {
  const zone      = document.getElementById('uploadZone');
  const input     = document.getElementById('csvInput');
  const removeBtn = document.getElementById('btnRemoveFile');

  zone?.addEventListener('click', () => input?.click());
  zone?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') input?.click(); });

  zone?.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone?.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone?.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  });

  input?.addEventListener('change', () => {
    const file = input.files?.[0];
    if (file) handleFile(file);
  });

  removeBtn?.addEventListener('click', resetCarga);

  document.getElementById('btnPrevisualizar')?.addEventListener('click', previsualizarCSV);
  document.getElementById('btnImportar')?.addEventListener('click', importarDatos);
  document.getElementById('btnDescargarPlantilla')?.addEventListener('click', descargarPlantilla);
  document.getElementById('btnNuevaCarga')?.addEventListener('click', resetCarga);
}

/* ─────────────────────────────────────────
   Manejo de archivo
───────────────────────────────────────── */
function handleFile(file) {
  if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
    showToastLocal('Solo se aceptan archivos CSV (.csv)', 'error');
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToastLocal('El archivo no puede superar 5 MB.', 'error');
    return;
  }

  CargaState.file = file;

  document.getElementById('fileInfo').style.display      = 'block';
  document.getElementById('importOptions').style.display = 'block';
  document.getElementById('uploadActions').style.display = 'flex';
  document.getElementById('fileName').textContent = file.name;
  document.getElementById('fileSize').textContent = formatBytes(file.size);

  document.getElementById('cardPreview').style.display   = 'none';
  document.getElementById('cardResultado').style.display = 'none';
  document.getElementById('btnImportar').disabled = true;

  const reader = new FileReader();
  reader.onload = e => { CargaState.rawText = e.target.result; };
  reader.readAsText(file, 'UTF-8');
}

function formatBytes(bytes) {
  if (bytes < 1024)        return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

/* ─────────────────────────────────────────
   Parser CSV
───────────────────────────────────────── */
function parseCSV(text, separador, tieneEncabezado) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
    .filter(l => l.trim() !== '');

  if (!lines.length) return { headers: [], rows: [] };

  const parseLine = line => {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === separador && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    result.push(cur.trim());
    return result;
  };

  let headers, dataLines;

  if (tieneEncabezado) {
    headers   = parseLine(lines[0]).map(h => h.toLowerCase().trim());
    dataLines = lines.slice(1);
  } else {
    headers   = TODAS_COLUMNAS.slice();
    dataLines = lines;
  }

  const rows = dataLines.map((line, idx) => {
    const vals = parseLine(line);
    const obj  = { _rowNum: idx + (tieneEncabezado ? 2 : 1) };
    headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
    return obj;
  });

  return { headers, rows };
}

/* ─────────────────────────────────────────
   Validación de filas
───────────────────────────────────────── */
function validateRow(row, rowNum) {
  const errors     = [];
  const periodoIds = CargaState.periodos.map(p => String(p.id));
  const catIds     = CargaState.categorias.map(c => String(c.id));

  const pId = row['periodo_id'];
  if (!pId) {
    errors.push(`Fila ${rowNum}: periodo_id es obligatorio.`);
  } else if (!periodoIds.includes(String(pId))) {
    errors.push(`Fila ${rowNum}: periodo_id "${pId}" no existe en el catálogo.`);
  }

  const cId = row['categoria_id'];
  if (!cId) {
    errors.push(`Fila ${rowNum}: categoria_id es obligatorio.`);
  } else if (!catIds.includes(String(cId))) {
    errors.push(`Fila ${rowNum}: categoria_id "${cId}" no existe en el catálogo.`);
  }

  const nombre = row['nombre_metrica'];
  if (!nombre || !nombre.trim()) {
    errors.push(`Fila ${rowNum}: nombre_metrica es obligatorio.`);
  } else if (nombre.length > 150) {
    errors.push(`Fila ${rowNum}: nombre_metrica supera 150 caracteres.`);
  }

  const va = row['valor_actual'];
  if (va === '' || va === undefined || va === null) {
    errors.push(`Fila ${rowNum}: valor_actual es obligatorio.`);
  } else if (isNaN(parseFloat(va))) {
    errors.push(`Fila ${rowNum}: valor_actual "${va}" no es numérico.`);
  } else if (parseFloat(va) < 0) {
    errors.push(`Fila ${rowNum}: valor_actual no puede ser negativo.`);
  }

  const vo = row['valor_objetivo'];
  if (vo !== '' && vo !== undefined && vo !== null) {
    if (isNaN(parseFloat(vo))) {
      errors.push(`Fila ${rowNum}: valor_objetivo "${vo}" no es numérico.`);
    } else if (parseFloat(vo) < 0) {
      errors.push(`Fila ${rowNum}: valor_objetivo no puede ser negativo.`);
    }
  }

  const fecha = row['fecha_registro'];
  if (fecha && fecha.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(fecha.trim())) {
    errors.push(`Fila ${rowNum}: fecha_registro "${fecha}" debe tener formato YYYY-MM-DD.`);
  }

  return errors;
}

/* ─────────────────────────────────────────
   Previsualización
───────────────────────────────────────── */
function previsualizarCSV() {
  if (!CargaState.rawText) {
    showToastLocal('Primero selecciona un archivo CSV.', 'warning');
    return;
  }

  const sep     = document.getElementById('csvSeparador')?.value || ',';
  const hasHead = document.getElementById('csvTieneEncabezado')?.checked ?? true;

  const { headers, rows } = parseCSV(CargaState.rawText, sep, hasHead);

  if (!rows.length) {
    showToastLocal('El archivo no contiene datos válidos.', 'warning');
    return;
  }

  CargaState.headers    = headers;
  CargaState.parsedRows = rows;

  const allErrors = [];
  const validRows = [];
  const errorRows = [];

  rows.forEach(row => {
    const errs = validateRow(row, row._rowNum);
    if (errs.length) {
      allErrors.push(...errs);
      errorRows.push({ ...row, _errors: errs });
    } else {
      validRows.push(row);
    }
  });

  CargaState.validRows = validRows;
  CargaState.errorRows = errorRows;

  const card = document.getElementById('cardPreview');
  card.style.display = 'block';
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const stats = document.getElementById('previewStats');
  if (stats) {
    stats.innerHTML = `
      <span class="badge badge-positive">${validRows.length} válidas</span>
      ${errorRows.length ? `<span class="badge badge-negative">${errorRows.length} con errores</span>` : ''}
      — Total: ${rows.length} filas`;
  }

  const errDiv  = document.getElementById('validationErrors');
  const errList = document.getElementById('errorList');
  if (allErrors.length) {
    errDiv.style.display = 'block';
    errList.innerHTML = allErrors.slice(0, 20).map(e => `<li>${escHtml(e)}</li>`).join('');
    if (allErrors.length > 20) {
      errList.innerHTML += `<li>… y ${allErrors.length - 20} errores más.</li>`;
    }
  } else {
    errDiv.style.display = 'none';
  }

  renderPreviewTable(headers, rows.slice(0, 20), errorRows);

  const btnImportar = document.getElementById('btnImportar');
  if (btnImportar) {
    btnImportar.disabled = validRows.length === 0;
    btnImportar.textContent = validRows.length
      ? `📤 Importar ${validRows.length} registro${validRows.length > 1 ? 's' : ''}`
      : '📤 Importar datos';
  }
}

function renderPreviewTable(headers, rows, errorRows) {
  const thead = document.getElementById('theadPreview');
  const tbody = document.getElementById('tbodyPreview');
  if (!thead || !tbody) return;

  const displayCols = headers.filter(h => h !== '_rownum' && !h.startsWith('_'));

  thead.innerHTML = `<tr>
    <th>#</th>
    ${displayCols.map(h => `<th>${escHtml(h)}</th>`).join('')}
    <th>Estado</th>
  </tr>`;

  const errorRowNums = new Set(errorRows.map(r => r._rowNum));

  tbody.innerHTML = rows.map(row => {
    const isError    = errorRowNums.has(row._rowNum);
    const statusBadge = isError
      ? '<span class="badge badge-negative">❌ Error</span>'
      : '<span class="badge badge-positive">✅ OK</span>';
    const rowClass = isError ? 'row-error' : '';

    return `<tr class="${rowClass}">
      <td>${row._rowNum}</td>
      ${displayCols.map(h => `<td>${escHtml(String(row[h] ?? ''))}</td>`).join('')}
      <td>${statusBadge}</td>
    </tr>`;
  }).join('');
}

/* ─────────────────────────────────────────
   Importación (llama al backend real)
───────────────────────────────────────── */
async function importarDatos() {
  const validRows = CargaState.validRows;
  if (!validRows.length) {
    showToastLocal('No hay filas válidas para importar.', 'warning');
    return;
  }

  const btnImportar = document.getElementById('btnImportar');
  if (btnImportar) { btnImportar.disabled = true; btnImportar.textContent = 'Importando…'; }

  const sobreescribir = document.getElementById('csvSobreescribir')?.checked ?? false;

  const payload = validRows.map(row => ({
    periodo_id:    parseInt(row['periodo_id'], 10),
    categoria_id:  parseInt(row['categoria_id'], 10),
    nombre_metrica: (row['nombre_metrica'] || '').trim(),
    valor_actual:  parseFloat(row['valor_actual']),
    valor_objetivo: row['valor_objetivo'] ? parseFloat(row['valor_objetivo']) : null,
    unidad:        row['unidad'] || null,
    notas:         row['notas'] || null,
    fecha_registro: row['fecha_registro'] || null,
  }));

  let importados = 0;
  let fallidos   = 0;

  try {
    const res = await fetch('/api/metricas/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registros: payload, sobreescribir }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Error HTTP ${res.status}`);
    }

    const result = await res.json().catch(() => ({}));
    importados = result.importados ?? payload.length;
    fallidos   = result.fallidos   ?? 0;
  } catch (err) {
    showToastLocal(`Error en la importación: ${err.message}`, 'error');
    if (btnImportar) {
      btnImportar.disabled = false;
      btnImportar.textContent = `📤 Importar ${validRows.length} registro${validRows.length > 1 ? 's' : ''}`;
    }
    return;
  }

  mostrarResultado(importados, fallidos, CargaState.errorRows.length);
}

function mostrarResultado(importados, fallidos, erroresPrevios) {
  const card = document.getElementById('cardResultado');
  const body = document.getElementById('resultadoBody');
  if (!card || !body) return;

  card.style.display = 'block';
  card.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const totalErrs = fallidos + erroresPrevios;

  body.innerHTML = `
    <div class="resultado-grid">
      <div class="resultado-item resultado-success">
        <span class="resultado-num">${importados}</span>
        <span class="resultado-label">Registros importados</span>
      </div>
      ${totalErrs ? `
      <div class="resultado-item resultado-error">
        <span class="resultado-num">${totalErrs}</span>
        <span class="resultado-label">Registros con errores</span>
      </div>` : ''}
    </div>
    <p class="mt-16 text-secondary">
      La importación finalizó ${totalErrs ? 'con algunos errores.' : 'correctamente.'}
      ${importados ? 'Puedes ver los datos importados en el listado de Métricas.' : ''}
    </p>`;

  showToastLocal(
    importados ? `${importados} registros importados correctamente.` : 'No se importaron registros.',
    importados ? 'success' : 'warning'
  );
}

/* ─────────────────────────────────────────
   Descargar plantilla
───────────────────────────────────────── */
function descargarPlantilla() {
  const headers = TODAS_COLUMNAS.join(',');
  const example = [
    '1', '1', 'Ventas enero 2024', '85000', '100000', 'COP', 'Sin observaciones', '2024-01-31',
  ].map(v => `"${v}"`).join(',');

  const csv  = headers + '\r\n' + example;
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'plantilla_metricas.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToastLocal('Plantilla descargada.', 'success');
}

/* ─────────────────────────────────────────
   Reset / nueva carga
───────────────────────────────────────── */
function resetCarga() {
  CargaState.file       = null;
  CargaState.rawText    = '';
  CargaState.parsedRows = [];
  CargaState.validRows  = [];
  CargaState.errorRows  = [];
  CargaState.headers    = [];

  const input = document.getElementById('csvInput');
  if (input) input.value = '';

  document.getElementById('fileInfo').style.display      = 'none';
  document.getElementById('importOptions').style.display = 'none';
  document.getElementById('uploadActions').style.display = 'none';
  document.getElementById('cardPreview').style.display   = 'none';
  document.getElementById('cardResultado').style.display = 'none';

  const btnImportar = document.getElementById('btnImportar');
  if (btnImportar) { btnImportar.disabled = true; btnImportar.textContent = '📤 Importar datos'; }
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
