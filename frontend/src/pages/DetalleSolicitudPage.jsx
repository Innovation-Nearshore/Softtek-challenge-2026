import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import solicitudesApi from '../api/solicitudesApi';
import { StatusBadge, UrgencyBadge } from '../components/Badge';
import { ErrorMessage } from '../components/ErrorMessage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import './DetalleSolicitudPage.css';

export const DetalleSolicitudPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [solicitud, setSolicitud] = useState(null);
  const [historia, setHistoria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSolicitudDetails();
  }, [id]);

  const loadSolicitudDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const [solicitudData, historiaData] = await Promise.all([
        solicitudesApi.getSolicitudById(id),
        solicitudesApi.getHistory(id),
      ]);
      setSolicitud(solicitudData.data);
      setHistoria(historiaData.data || []);
    } catch (err) {
      setError('Error cargando detalles: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!solicitud) {
    return (
      <div className="detalle-container">
        <ErrorMessage message={error || 'Solicitud no encontrada'} />
        <button onClick={() => navigate('/')} className="btn-back">
          ← Volver a Bandeja
        </button>
      </div>
    );
  }

  return (
    <div className="detalle-container">
      <button onClick={() => navigate('/')} className="btn-back">
        ← Volver a Bandeja
      </button>

      {error && <ErrorMessage message={error} onClose={() => setError('')} />}

      {/* Solicitud Details Card */}
      <div className="detalle-card">
        <div className="detalle-header">
          <div>
          <h1>{solicitud.titulo}</h1>
            <p className="ticket-info">Ticket: {solicitud.numeroTicket}</p>
          </div>
          <StatusBadge status={solicitud.estado} />
        </div>

        <div className="detalle-content">
          <div className="detalle-section">
            <h3>Información General</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Tipo de Solicitud</label>
                <p>{solicitud.tipoSolicitudNombre || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Urgencia</label>
                <p>
                  <UrgencyBadge urgencia={solicitud.urgencia} />
                </p>
              </div>
              <div className="info-item">
                <label>Estado Actual</label>
                <p>
                  <StatusBadge status={solicitud.estado} />
                </p>
              </div>
              <div className="info-item">
                <label>Fecha de Creación</label>
                <p>{formatDate(solicitud.fechaCreacion)}</p>
              </div>
            </div>
          </div>

          <div className="detalle-section">
            <h3>Descripción</h3>
            <p className="description-text">{solicitud.descripcion}</p>
          </div>

          <div className="detalle-section">
            <h3>Información del Solicitante</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Solicitante</label>
                <p>{solicitud.solicitante}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>
                  <a href={`mailto:${solicitud.emailSolicitante}`}>
                    {solicitud.emailSolicitante}
                  </a>
                </p>
              </div>
              <div className="info-item">
                <label>Área Solicitante</label>
                <p>{solicitud.areaSolicitanteNombre || 'N/A'}</p>
              </div>
            </div>
          </div>

          {(solicitud.areaAsignadaNombre || solicitud.asignadoA) && (
            <div className="detalle-section">
              <h3>Asignación</h3>
              <div className="info-grid">
                {solicitud.areaAsignadaNombre && (
                  <div className="info-item">
                    <label>Área Asignada</label>
                    <p>{solicitud.areaAsignadaNombre}</p>
                  </div>
                )}
                <div className="info-item">
                  <label>Responsable</label>
                  <p>{solicitud.asignadoA || '-'}</p>
                </div>
              </div>
            </div>
          )}

          {solicitud.solucion && (
            <div className="detalle-section">
              <h3>Solución</h3>
              <p className="solution-text">{solicitud.solucion}</p>
            </div>
          )}

          {(solicitud.fechaResolucion || solicitud.fechaVencimiento) && (
            <div className="detalle-section">
              <h3>Fechas Importantes</h3>
              <div className="info-grid">
                {solicitud.fechaVencimiento && (
                  <div className="info-item">
                    <label>Fecha de Vencimiento</label>
                    <p>{formatDate(solicitud.fechaVencimiento)}</p>
                  </div>
                )}
                {solicitud.fechaResolucion && (
                  <div className="info-item">
                    <label>Fecha de Resolución</label>
                    <p>{formatDate(solicitud.fechaResolucion)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {solicitud.calificacion && (
            <div className="detalle-section">
              <h3>Calificación</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Puntuación</label>
                  <p className="rating">
                    {'⭐'.repeat(solicitud.calificacion)}
                    {' '}({solicitud.calificacion}/5)
                  </p>
                </div>
                {solicitud.comentarioCalificacion && (
                  <div className="info-item">
                    <label>Comentario</label>
                    <p>{solicitud.comentarioCalificacion}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Audit History */}
      <div className="historia-card">
        <h2>Historial de Cambios</h2>

        {historia.length === 0 ? (
          <p className="no-history">No hay cambios registrados aún.</p>
        ) : (
          <div className="timeline">
            {historia.map((evento, index) => (
              <div key={evento.id} className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-header">
                  <span className="timeline-time">
                      {formatDate(evento.fechaCambio)}
                    </span>
                    <span className="timeline-user">{evento.usuario}</span>
                  </div>
                  <div className="timeline-body">
                    {evento.estadoAnterior ? (
                      <>
                        <StatusBadge status={evento.estadoAnterior} />
                        <span className="arrow">→</span>
                        <StatusBadge status={evento.estadoNuevo} />
                      </>
                    ) : (
                      <>
                        <span className="status-created">Creada</span>
                        <span className="arrow">→</span>
                        <StatusBadge status={evento.estadoNuevo} />
                      </>
                    )}
                  </div>
                  {evento.comentario && (
                    <p className="timeline-comment">"{evento.comentario}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
