import { useState, useEffect, useCallback, useRef } from 'react';
import { getSolicitudes, updateEstado, getHistorial } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Popup from '../components/Popup';
import Modal from '../components/Modal';
import NuevaSolicitudForm from '../components/NuevaSolicitudForm';

const LIMIT = 50;

// Static list of assignable team members (resolutor team)
const TEAM_MEMBERS = [
  'Ana Rodríguez',
  'Pedro Silva',
  'Sofía Vargas',
  'Carmen Díaz',
  'Elena Mora',
  'Carlos Méndez',
  'Laura Gómez',
  'Diego Flores',
];

const VALID_TRANSITIONS = {
  Recibida: ['En revisión'],
  'En revisión': ['Resuelta'],
  Resuelta: [],
};

const sinDato = (val) =>
  val === null || val === undefined || val === '' ? 'Sin Dato' : val;

const formatDate = (val) => {
  if (!val) return 'Sin Dato';
  try {
    return new Date(val).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return val;
  }
};

const ESTADO_BADGE = {
  Recibida: 'bg-blue-100 text-blue-700',
  'En revisión': 'bg-yellow-100 text-yellow-700',
  Resuelta: 'bg-green-100 text-green-700',
  Rechazada: 'bg-red-100 text-red-700',
  Cancelada: 'bg-gray-100 text-gray-600',
};

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ message: '', type: 'success' });

  // Responsable filter
  const [responsableFilter, setResponsableFilter] = useState('');
  const filterDebounceRef = useRef(null);

  // Historial modal state
  const [historialOpen, setHistorialOpen] = useState(false);
  const [historialData, setHistorialData] = useState([]);
  const [historialLoading, setHistorialLoading] = useState(false);
  const [historialTitle, setHistorialTitle] = useState('');

  // Nueva solicitud form state
  const [formOpen, setFormOpen] = useState(false);

  // Estado change loading per row
  const [updatingId, setUpdatingId] = useState(null);

  // Responsable assignment modal (shown when transitioning to "En revisión")
  const [assignModal, setAssignModal] = useState({
    open: false,
    solicitud: null,
    targetEstado: null,
  });
  const [selectedResponsable, setSelectedResponsable] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const showPopup = (message, type = 'success') => setPopup({ message, type });

  const fetchSolicitudes = useCallback(async (p = 1, filter = null) => {
    setLoading(true);
    const { data, error } = await getSolicitudes(p, LIMIT, filter);
    setLoading(false);
    if (error) {
      showPopup(`Error al cargar solicitudes: ${error}`, 'error');
      return;
    }
    setSolicitudes(data.data);
    setTotal(data.total);
    setPage(p);
  }, []);

  useEffect(() => {
    fetchSolicitudes(1, responsableFilter || null);
  }, [fetchSolicitudes]);

  // ── Responsable filter with debounce ──────────────────────────────────────
  const handleResponsableFilterChange = (e) => {
    const val = e.target.value;
    setResponsableFilter(val);
    if (filterDebounceRef.current) clearTimeout(filterDebounceRef.current);
    filterDebounceRef.current = setTimeout(() => {
      fetchSolicitudes(1, val.trim() || null);
    }, 400);
  };

  const clearFilter = () => {
    setResponsableFilter('');
    fetchSolicitudes(1, null);
  };

  // ── Estado change ──────────────────────────────────────────────────────────
  const handleEstadoChange = (solicitud, newEstado) => {
    if (!newEstado || newEstado === solicitud.estado) return;

    const allowed = VALID_TRANSITIONS[solicitud.estado] ?? [];
    if (!allowed.includes(newEstado)) {
      showPopup(`Transición inválida: "${solicitud.estado}" → "${newEstado}"`, 'error');
      return;
    }

    // Transitioning to "En revisión" requires assigning a responsable
    if (newEstado === 'En revisión') {
      setSelectedResponsable('');
      setAssignModal({ open: true, solicitud, targetEstado: newEstado });
      return;
    }

    // Other transitions (e.g. Resuelta) proceed directly
    confirmEstadoChange(solicitud, newEstado, null);
  };

  const confirmEstadoChange = async (solicitud, newEstado, responsable) => {
    setUpdatingId(solicitud.id);
    const { error } = await updateEstado(solicitud.id, newEstado, responsable);
    setUpdatingId(null);

    if (error) {
      showPopup(`Error al actualizar estado: ${error}`, 'error');
      return;
    }

    showPopup('Estado actualizado correctamente', 'success');
    setSolicitudes((prev) =>
      prev.map((s) =>
        s.id === solicitud.id
          ? { ...s, estado: newEstado, asignado_a: responsable ?? s.asignado_a }
          : s
      )
    );
  };

  // ── Responsable assignment confirm ────────────────────────────────────────
  const handleConfirmAssign = async () => {
    if (!selectedResponsable.trim()) return;
    const { solicitud, targetEstado } = assignModal;
    setAssignLoading(true);
    setAssignModal((m) => ({ ...m, open: false }));
    await confirmEstadoChange(solicitud, targetEstado, selectedResponsable.trim());
    setAssignLoading(false);
  };

  const handleCancelAssign = () => {
    setAssignModal({ open: false, solicitud: null, targetEstado: null });
    setSelectedResponsable('');
  };

  // ── Historial ──────────────────────────────────────────────────────────────
  const handleVerHistorial = async (solicitud) => {
    setHistorialTitle(`Historial — ${sinDato(solicitud.numero_ticket)}`);
    setHistorialOpen(true);
    setHistorialLoading(true);
    setHistorialData([]);

    const { data, error } = await getHistorial(solicitud.id);
    setHistorialLoading(false);

    if (error) {
      showPopup(`Error al cargar historial: ${error}`, 'error');
      setHistorialOpen(false);
      return;
    }

    setHistorialData(Array.isArray(data) ? data : (data?.data ?? []));
  };

  // ── Nueva Solicitud ────────────────────────────────────────────────────────
  const handleSolicitudCreated = () => {
    setFormOpen(false);
    showPopup('Solicitud creada correctamente', 'success');
    fetchSolicitudes(1, responsableFilter || null);
  };

  return (
    <div>
      {/* ── Popup notification ── */}
      <Popup
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup({ message: '', type: 'success' })}
      />

      {/* ── Header row ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="text-xl font-semibold text-gray-800">Solicitudes</h1>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Responsable filter */}
          <div className="flex items-center gap-1">
            <label className="text-xs text-gray-500 whitespace-nowrap font-medium">
              Filtrar por responsable:
            </label>
            <div className="relative">
              <input
                type="text"
                value={responsableFilter}
                onChange={handleResponsableFilterChange}
                placeholder="Nombre del responsable..."
                className="border border-gray-300 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-400 w-48"
              />
              {responsableFilter && (
                <button
                  onClick={clearFilter}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm leading-none"
                  title="Limpiar filtro"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Nueva solicitud button */}
          <button
            onClick={() => setFormOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Nueva Solicitud
          </button>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && <LoadingSpinner text="Cargando solicitudes..." />}

      {/* ── Table ── */}
      {!loading && (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    'Ticket',
                    'Tipo',
                    'Título',
                    'Urgencia',
                    'Descripción',
                    'Solicitante',
                    'Email',
                    'Área Solicitante',
                    'Área Asignada',
                    'Responsable',
                    'Estado',
                    'Fecha Creación',
                    'Historial',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {solicitudes.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="text-center py-12 text-gray-400">
                      No hay solicitudes{responsableFilter ? ` para el responsable "${responsableFilter}"` : ' registradas'}.
                    </td>
                  </tr>
                ) : (
                  solicitudes.map((s) => {
                    const nextStates = VALID_TRANSITIONS[s.estado] ?? [];
                    const isUpdating = updatingId === s.id;
                    const badgeClass =
                      ESTADO_BADGE[s.estado] ?? 'bg-gray-100 text-gray-600';
                    return (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        {/* Ticket */}
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">
                          {sinDato(s.numero_ticket)}
                        </td>

                        {/* Tipo */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {sinDato(s.tipo_solicitud_nombre)}
                        </td>

                        {/* Título */}
                        <td
                          className="px-4 py-3 max-w-[160px] truncate"
                          title={s.titulo ?? ''}
                        >
                          {sinDato(s.titulo)}
                        </td>

                        {/* Urgencia */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              s.urgencia === 'Alta'
                                ? 'bg-red-100 text-red-700'
                                : s.urgencia === 'Media'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {sinDato(s.urgencia)}
                          </span>
                        </td>

                        {/* Descripción */}
                        <td
                          className="px-4 py-3 max-w-xs truncate"
                          title={s.descripcion ?? ''}
                        >
                          {sinDato(s.descripcion)}
                        </td>

                        {/* Solicitante */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {sinDato(s.solicitante)}
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                          {sinDato(s.email_solicitante)}
                        </td>

                        {/* Área Solicitante */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {sinDato(s.area_solicitante_nombre)}
                        </td>

                        {/* Área Asignada */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {sinDato(s.area_asignada_nombre)}
                        </td>

                        {/* Responsable */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {s.asignado_a ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                              <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 1114 0H3z" />
                              </svg>
                              {s.asignado_a}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Sin Dato</span>
                          )}
                        </td>

                        {/* Estado */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isUpdating || assignLoading && assignModal.solicitud?.id === s.id ? (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                              <svg
                                className="animate-spin h-3 w-3"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8H4z"
                                />
                              </svg>
                              Guardando...
                            </span>
                          ) : nextStates.length > 0 ? (
                            <select
                              value={s.estado}
                              onChange={(e) => handleEstadoChange(s, e.target.value)}
                              className="border border-gray-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                            >
                              <option value={s.estado}>{s.estado}</option>
                              {nextStates.map((ns) => (
                                <option key={ns} value={ns}>
                                  {ns}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}
                            >
                              {sinDato(s.estado)}
                            </span>
                          )}
                        </td>

                        {/* Fecha Creación */}
                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                          {formatDate(s.fecha_creacion)}
                        </td>

                        {/* Historial button */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => handleVerHistorial(s)}
                            className="text-xs text-red-600 hover:text-red-800 underline underline-offset-2 font-medium transition-colors"
                          >
                            Ver historial
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>
              Página {page} de {totalPages} —{' '}
              {total} registro{total !== 1 ? 's' : ''}
              {responsableFilter ? ` (filtrado por "${responsableFilter}")` : ''}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => fetchSolicitudes(page - 1, responsableFilter || null)}
                className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Anterior
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => fetchSolicitudes(page + 1, responsableFilter || null)}
                className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente →
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Assign Responsable Modal ── */}
      <Modal
        isOpen={assignModal.open}
        onClose={handleCancelAssign}
        title="Asignar Responsable"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Para pasar la solicitud a{' '}
            <span className="font-semibold text-yellow-700">"En revisión"</span>, debes
            asignar un responsable del equipo resolutor.
          </p>

          {assignModal.solicitud && (
            <div className="bg-gray-50 rounded-lg px-4 py-3 text-xs text-gray-600 space-y-1">
              <div>
                <span className="font-medium">Ticket:</span>{' '}
                {sinDato(assignModal.solicitud.numero_ticket)}
              </div>
              <div>
                <span className="font-medium">Título:</span>{' '}
                {sinDato(assignModal.solicitud.titulo)}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Responsable <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedResponsable}
              onChange={(e) => setSelectedResponsable(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="">— Seleccionar responsable —</option>
              {TEAM_MEMBERS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            {!selectedResponsable && (
              <p className="text-xs text-gray-400 mt-1">
                Debes seleccionar un responsable para continuar.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleCancelAssign}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmAssign}
              disabled={!selectedResponsable.trim()}
              className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              Confirmar asignación
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Historial Modal ── */}
      <Modal
        isOpen={historialOpen}
        onClose={() => setHistorialOpen(false)}
        title={historialTitle}
        wide
      >
        {historialLoading ? (
          <LoadingSpinner text="Cargando historial..." />
        ) : historialData.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-6">
            No hay registros de historial para esta solicitud.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[
                    'Estado Anterior',
                    'Estado Nuevo',
                    'Usuario',
                    'Comentario',
                    'Fecha Cambio',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historialData.map((h, i) => (
                  <tr key={h.id ?? i} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{sinDato(h.estado_anterior)}</td>
                    <td className="px-4 py-2">{sinDato(h.estado_nuevo)}</td>
                    <td className="px-4 py-2">{sinDato(h.usuario)}</td>
                    <td className="px-4 py-2 max-w-xs truncate" title={h.comentario ?? ''}>
                      {sinDato(h.comentario)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs">
                      {formatDate(h.fecha_cambio)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* ── Nueva Solicitud Modal ── */}
      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title="Nueva Solicitud"
        wide
      >
        <NuevaSolicitudForm
          onSuccess={handleSolicitudCreated}
          onError={(msg) => showPopup(msg, 'error')}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>
    </div>
  );
}
