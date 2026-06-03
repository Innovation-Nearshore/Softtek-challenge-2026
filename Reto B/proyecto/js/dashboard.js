/**
 * dashboard.js
 * Lógica específica del Dashboard (index.html)
 * Depende de: app.js (debe cargarse antes)
 */

/* ─────────────────────────────────────────
   Estado local del dashboard
───────────────────────────────────────── */
const DashboardState = {
  metricas: [],
  categorias: [],
  periodos: [],
  chartEvolucion: null,
  chartCategoria: null,
  tipoChartEvolucion: 'line',
  anotaciones: JSON.parse(localStorage.getItem('dashboard_anotaciones') || '[]'),
  presets: JSON.parse(localStorage.getItem('dashboard_presets') || '[]'),
};

/* ─────────────────────────────────────────
   Inicialización
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  renderKPIs();
  renderCharts();
  renderTablaResumen();
  renderAnotaciones();
  bindEvents();
});

async function loadData() {
  try {
    const [metricas, categorias, periodos] = await Promise.all([
      window.AppUtils.fetchMetricas(),
      window.AppUtils.fetchCategorias(),
      window.AppUtils.fetchPeriodos(),
    ]);
    DashboardState.metricas   = metricas   || [];
    DashboardState.categorias = categorias || [];
    DashboardState.periodos   = periodos   || [];
  } catch (e) {
    console.error('Error cargando datos del dashboard:', e);
    DashboardState.metricas   = [];
    DashboardState.categorias = [];
    DashboardState.periodos   = [];
    showToast('Error al cargar datos. Verifica la conexión con el servidor.', 'error');
  }
}

/* ─────────────────────────────────────────
   Filtrado
───────────────────────────────────────── */
function getFilteredMetricas() {
  const anio      = document.getElementById('filtroAnio')?.value || '';
  const periodoId = document.getElementById('filtroPeriodo')?.value || '';
  const catId     = document.getElementById('filtroCategoria')?.value || '';
  const trim      = document.getElementById('filtroTrimestre')?.value || '';

  return DashboardState.metricas.filter(m => {
    const periodo = DashboardState.periodos.find(p => p.id == m.periodo_id);
    if (anio      && periodo && String(periodo.anio)      !== anio)      return false;
    if (periodoId && String(m.periodo_id)                 !== periodoId) return false;
    if (catId     && String(m.categoria_id)               !== catId)     return false;
    if (trim      && periodo && String(periodo.trimestre) !== trim)      return false;
    return true;
  });
}

/* ─────────────────────────────────────────
   KPIs
───────────────────────────────────────── */
function renderKPIs() {
  const data = getFilteredMetricas();

  const total = data.reduce((s, m) => s + (Number(m.valor_actual) || 0), 0);
  setKPI('kpiTotal', fmtNum(total), null);

  const avg = data.length ? total / data.length : 0;
  setKPI('kpiPromedio', fmtNum(avg, 1), null);

  const conObjetivo = data.filter(m => m.valor_objetivo > 0);
  const cumpl = conObjetivo.length
    ? conObjetivo.filter(m => Number(m.valor_actual) >= Number(m.valor_objetivo)).length / conObjetivo.length * 100
    : 0;
  setKPI('kpiCumplimiento', fmtPct(cumpl), cumpl >= 80 ? 'positive' : cumpl >= 60 ? 'neutral' : 'negative');

  setKPI('kpiRegistros', String(data.length), null);
}

function setKPI(valueId, value, badge) {
  const el = document.getElementById(valueId);
  if (el) el.textContent = value;
  const badgeId = valueId.replace('kpi', 'kpiBadge');
  const badgeEl = document.getElementById(badgeId);
  if (badgeEl && badge) {
    badgeEl.innerHTML = `<span class="badge badge-${badge}">${badge === 'positive' ? '▲' : badge === 'negative' ? '▼' : '●'} ${badge === 'positive' ? 'Cumple' : badge === 'negative' ? 'Bajo objetivo' : 'Regular'}</span>`;
  }
}

function fmtNum(n, dec = 0) {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return new Intl.NumberFormat('es-CO', { maximumFractionDigits: dec, minimumFractionDigits: dec }).format(n);
}

function fmtPct(n) {
  if (n === null || isNaN(n)) return '—';
  return n.toFixed(1) + '%';
}

/* ─────────────────────────────────────────
   Gráficas
───────────────────────────────────────── */
function renderCharts() {
  renderChartEvolucion();
  renderChartCategoria();
}

function renderChartEvolucion() {
  const ctx = document.getElementById('chartEvolucion');
  if (!ctx) return;

  const data       = getFilteredMetricas();
  const categorias = DashboardState.categorias;
  const periodos   = DashboardState.periodos.slice().sort((a, b) => a.anio * 100 + a.mes - (b.anio * 100 + b.mes)).slice(0, 12);

  const colors = ['#091FFD', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
  const datasets = categorias.map((cat, i) => {
    const vals = periodos.map(p =>
      data.filter(m => m.categoria_id == cat.id && m.periodo_id == p.id)
          .reduce((s, m) => s + (Number(m.valor_actual) || 0), 0)
    );
    return {
      label: cat.nombre,
      data: vals,
      borderColor: cat.color_hex || colors[i % colors.length],
      backgroundColor: (cat.color_hex || colors[i % colors.length]) + '33',
      tension: 0.4,
      fill: DashboardState.tipoChartEvolucion === 'bar',
      pointRadius: 4,
      pointHoverRadius: 6,
    };
  });

  const labels = periodos.map(p => p.nombre_mes || `P${p.id}`);

  if (DashboardState.chartEvolucion) {
    DashboardState.chartEvolucion.data.labels = labels;
    DashboardState.chartEvolucion.data.datasets = datasets;
    DashboardState.chartEvolucion.config.type = DashboardState.tipoChartEvolucion;
    DashboardState.chartEvolucion.update();
    return;
  }

  DashboardState.chartEvolucion = new Chart(ctx, {
    type: DashboardState.tipoChartEvolucion,
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', labels: { boxWidth: 12, font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${fmtNum(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: {
          beginAtZero: true,
          ticks: { callback: v => fmtNum(v), font: { size: 11 } },
        },
      },
    },
  });
}

function renderChartCategoria() {
  const ctx = document.getElementById('chartCategoria');
  if (!ctx) return;

  const data       = getFilteredMetricas();
  const categorias = DashboardState.categorias;
  const colors     = ['#091FFD', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

  const labels   = categorias.map(c => c.nombre);
  const values   = categorias.map(c =>
    data.filter(m => m.categoria_id == c.id)
        .reduce((s, m) => s + (Number(m.valor_actual) || 0), 0)
  );
  const bgColors = categorias.map((c, i) => c.color_hex || colors[i % colors.length]);

  if (DashboardState.chartCategoria) {
    DashboardState.chartCategoria.data.labels = labels;
    DashboardState.chartCategoria.data.datasets[0].data = values;
    DashboardState.chartCategoria.update();
    return;
  }

  DashboardState.chartCategoria = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Total por categoría',
        data: values,
        backgroundColor: bgColors.map(c => c + 'bb'),
        borderColor: bgColors,
        borderWidth: 2,
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${fmtNum(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 11 } } },
        y: {
          beginAtZero: true,
          ticks: { callback: v => fmtNum(v), font: { size: 11 } },
        },
      },
    },
  });
}

/* ─────────────────────────────────────────
   Tabla resumen
───────────────────────────────────────── */
function renderTablaResumen() {
  const tbody = document.getElementById('tbodyResumen');
  if (!tbody) return;

  const data = getFilteredMetricas().slice(0, 10);

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-secondary);">Sin datos para los filtros seleccionados.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(m => {
    const periodo  = DashboardState.periodos.find(p => p.id == m.periodo_id);
    const cat      = DashboardState.categorias.find(c => c.id == m.categoria_id);
    const cumpl    = m.valor_objetivo > 0 ? (Number(m.valor_actual) / Number(m.valor_objetivo)) * 100 : null;
    const badgeClass = cumpl === null ? '' : cumpl >= 100 ? 'badge-positive' : cumpl >= 80 ? 'badge-neutral' : 'badge-negative';
    const badgeText  = cumpl === null ? '—' : `<span class="badge ${badgeClass}">${fmtPct(cumpl)}</span>`;
    return `
      <tr>
        <td>${periodo ? periodo.nombre_mes + ' ' + periodo.anio : m.periodo_id}</td>
        <td>
          ${cat ? `<span class="category-dot" style="background:${cat.color_hex}"></span> ${escHtml(cat.nombre)}` : m.categoria_id}
        </td>
        <td>${escHtml(m.nombre_metrica)}</td>
        <td class="text-right">${fmtNum(m.valor_actual)}</td>
        <td class="text-right">${m.valor_objetivo ? fmtNum(m.valor_objetivo) : '—'}</td>
        <td>${escHtml(m.unidad || '')}</td>
        <td>${badgeText}</td>
      </tr>`;
  }).join('');
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ─────────────────────────────────────────
   Anotaciones (almacenadas en localStorage)
───────────────────────────────────────── */
function renderAnotaciones() {
  const list = document.getElementById('annotationList');
  if (!list) return;

  const items = DashboardState.anotaciones;
  if (!items.length) {
    list.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-icon" aria-hidden="true">📝</span>
        <div class="empty-state-title">Sin anotaciones</div>
        <div class="empty-state-desc">Agrega notas o comentarios sobre las métricas visualizadas.</div>
      </div>`;
    return;
  }

  list.innerHTML = items.map((a, idx) => `
    <div class="annotation-item" data-idx="${idx}">
      <div class="annotation-content">${escHtml(a.texto)}</div>
      <div class="annotation-meta">
        <span>${a.fecha}</span>
        <button class="btn btn-sm btn-secondary annotation-delete" data-idx="${idx}" aria-label="Eliminar anotación">🗑️</button>
      </div>
    </div>`).join('');

  list.querySelectorAll('.annotation-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.idx, 10);
      DashboardState.anotaciones.splice(i, 1);
      localStorage.setItem('dashboard_anotaciones', JSON.stringify(DashboardState.anotaciones));
      renderAnotaciones();
    });
  });
}

/* ─────────────────────────────────────────
   Eventos
───────────────────────────────────────── */
function bindEvents() {
  document.getElementById('btnAplicarFiltros')?.addEventListener('click', () => {
    renderKPIs();
    renderChartEvolucion();
    renderChartCategoria();
    renderTablaResumen();
  });

  document.getElementById('btnLimpiarFiltros')?.addEventListener('click', () => {
    ['filtroAnio', 'filtroPeriodo', 'filtroCategoria', 'filtroTrimestre'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    renderKPIs();
    renderChartEvolucion();
    renderChartCategoria();
    renderTablaResumen();
  });

  document.getElementById('btnChartLine')?.addEventListener('click', () => {
    DashboardState.tipoChartEvolucion = 'line';
    document.getElementById('btnChartLine')?.setAttribute('aria-pressed', 'true');
    document.getElementById('btnChartBar')?.setAttribute('aria-pressed', 'false');
    if (DashboardState.chartEvolucion) {
      DashboardState.chartEvolucion.config.type = 'line';
      DashboardState.chartEvolucion.update();
    }
  });

  document.getElementById('btnChartBar')?.addEventListener('click', () => {
    DashboardState.tipoChartEvolucion = 'bar';
    document.getElementById('btnChartBar')?.setAttribute('aria-pressed', 'true');
    document.getElementById('btnChartLine')?.setAttribute('aria-pressed', 'false');
    if (DashboardState.chartEvolucion) {
      DashboardState.chartEvolucion.config.type = 'bar';
      DashboardState.chartEvolucion.update();
    }
  });

  document.getElementById('btnGuardarPreset')?.addEventListener('click', () => {
    const nombre = document.getElementById('presetNombre')?.value.trim();
    if (!nombre) {
      showToast('El nombre del preset es obligatorio.', 'warning');
      return;
    }
    const preset = {
      id: Date.now(),
      nombre,
      descripcion: document.getElementById('presetDescripcion')?.value.trim() || '',
      filtros: {
        anio:      document.getElementById('filtroAnio')?.value || '',
        periodo:   document.getElementById('filtroPeriodo')?.value || '',
        categoria: document.getElementById('filtroCategoria')?.value || '',
        trimestre: document.getElementById('filtroTrimestre')?.value || '',
      },
      fecha: new Date().toLocaleDateString('es-CO'),
    };
    DashboardState.presets.push(preset);
    localStorage.setItem('dashboard_presets', JSON.stringify(DashboardState.presets));
    document.getElementById('presetNombre').value = '';
    document.getElementById('presetDescripcion').value = '';
    closeModal('modalPreset');
    showToast(`Preset "${nombre}" guardado correctamente.`, 'success');
  });

  document.getElementById('btnGuardarAnotacion')?.addEventListener('click', () => {
    const texto = document.getElementById('anotacionTexto')?.value.trim();
    if (!texto) {
      showToast('La anotación no puede estar vacía.', 'warning');
      return;
    }
    DashboardState.anotaciones.unshift({
      texto,
      fecha: new Date().toLocaleDateString('es-CO'),
    });
    localStorage.setItem('dashboard_anotaciones', JSON.stringify(DashboardState.anotaciones));
    document.getElementById('anotacionTexto').value = '';
    closeModal('modalAnotacion');
    renderAnotaciones();
    showToast('Anotación guardada.', 'success');
  });

  document.getElementById('btnExportPDF')?.addEventListener('click', () => {
    window.print();
  });
}

/* ─────────────────────────────────────────
   Helpers locales
───────────────────────────────────────── */
function showToast(msg, type = 'info') {
  if (window.AppUtils?.showToast) {
    window.AppUtils.showToast(msg, type);
    return;
  }
  const c = document.querySelector('.toast-container');
  if (!c) return;
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

function closeModal(id) {
  const el = typeof id === 'string' ? document.getElementById(id) : id;
  if (!el) return;
  el.classList.remove('open');
  el.setAttribute('aria-hidden', 'true');
}
