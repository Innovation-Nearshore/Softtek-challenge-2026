import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import solicitudesApi from '../api/solicitudesApi';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AlertNotification } from '../components/AlertNotification';
import './NuevaSolicitudPage.css';

/* ── Field character limits ─────────────────────────────────────────────── */
const LIMITS = {
  titulo: 255,
  descripcion: 2000,
  solicitante: 100,
  email_solicitante: 255,
};

/* ── Per-field validation rules ─────────────────────────────────────────── */
function validateField(name, value) {
  const trimmed = typeof value === 'string' ? value.trim() : value;

  switch (name) {
    case 'tipo_solicitud_id':
      if (!value) return 'El tipo de solicitud es requerido.';
      break;

    case 'titulo':
      if (!trimmed) return 'El título es requerido.';
      if (trimmed.length < 5) return 'El título debe tener al menos 5 caracteres.';
      if (value.length > LIMITS.titulo)
        return `El título no puede superar ${LIMITS.titulo} caracteres (actual: ${value.length}).`;
      break;

    case 'descripcion':
      if (!trimmed) return 'La descripción es requerida.';
      if (trimmed.length < 10) return 'La descripción debe tener al menos 10 caracteres.';
      if (value.length > LIMITS.descripcion)
        return `La descripción no puede superar ${LIMITS.descripcion} caracteres (actual: ${value.length}).`;
      break;

    case 'solicitante':
      if (!trimmed) return 'El nombre del solicitante es requerido.';
      if (trimmed.length < 2) return 'El nombre debe tener al menos 2 caracteres.';
      if (value.length > LIMITS.solicitante)
        return `El nombre no puede superar ${LIMITS.solicitante} caracteres (actual: ${value.length}).`;
      break;

    case 'email_solicitante':
      if (!trimmed) return 'El email del solicitante es requerido.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
        return 'El email no tiene un formato válido (ej: usuario@dominio.com).';
      if (value.length > LIMITS.email_solicitante)
        return `El email no puede superar ${LIMITS.email_solicitante} caracteres.`;
      break;

    case 'area_solicitante_id':
      if (!value) return 'El área solicitante es requerida.';
      break;

    default:
      break;
  }
  return '';
}

/* ── Full-form validation → returns errors object ───────────────────────── */
function validateAll(formData) {
  const fields = [
    'tipo_solicitud_id',
    'titulo',
    'descripcion',
    'solicitante',
    'email_solicitante',
    'area_solicitante_id',
  ];
  const newErrors = {};
  fields.forEach((field) => {
    const msg = validateField(field, formData[field]);
    if (msg) newErrors[field] = msg;
  });
  return newErrors;
}

/* ── Field label map (for the summary banner) ───────────────────────────── */
const FIELD_LABELS = {
  tipo_solicitud_id: 'Tipo de Solicitud',
  titulo: 'Título',
  descripcion: 'Descripción',
  solicitante: 'Solicitante',
  email_solicitante: 'Email Solicitante',
  area_solicitante_id: 'Área Solicitante',
};

/* ═══════════════════════════════════════════════════════════════════════════
   Component
═══════════════════════════════════════════════════════════════════════════ */
export const NuevaSolicitudPage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  /* Catalog data */
  const [areas, setAreas] = useState([]);
  const [tipos, setTipos] = useState([]);

  /* Global API error / success */
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');

  /* Per-field validation errors */
  const [errors, setErrors] = useState({});

  /* Whether the user has attempted to submit (enables real-time feedback) */
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    tipo_solicitud_id: '',
    urgencia: 'Media',
    titulo: '',
    descripcion: '',
    solicitante: '',
    email_solicitante: '',
    area_solicitante_id: '',
  });

  /* ── Load catalogs ──────────────────────────────────────────────────── */
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [areasData, tiposData] = await Promise.all([
          solicitudesApi.getAreas(),
          solicitudesApi.getTiposSolicitud(),
        ]);
        setAreas(areasData.data || []);
        setTipos(tiposData.data || []);
      } catch (err) {
        setApiError('Error cargando catálogos: ' + (err.message || 'Intente nuevamente.'));
      } finally {
        setLoadingData(false);
      }
    };
    loadCatalogs();
  }, []);

  /* ── Handle field change ────────────────────────────────────────────── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    /* Re-validate this field in real-time once the user has tried to submit */
    if (submitted) {
      const msg = validateField(name, value);
      setErrors((prev) => {
        const next = { ...prev };
        if (msg) next[name] = msg;
        else delete next[name];
        return next;
      });
    }
  };

  /* ── Submit ─────────────────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess('');
    setSubmitted(true);

    const newErrors = validateAll(formData);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      /* Scroll to top of form so the user sees the summary banner */
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    try {
      const response = await solicitudesApi.createSolicitud({
        tipoSolicitudId: parseInt(formData.tipo_solicitud_id),
        urgencia: formData.urgencia,
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        solicitante: formData.solicitante.trim(),
        emailSolicitante: formData.email_solicitante.trim(),
        areaSolicitanteId: parseInt(formData.area_solicitante_id),
      });

      setSuccess(
        `✅ Solicitud creada exitosamente. Número de ticket: ${response.data?.numeroTicket}`
      );

      /* Reset form */
      setFormData({
        tipo_solicitud_id: '',
        urgencia: 'Media',
        titulo: '',
        descripcion: '',
        solicitante: '',
        email_solicitante: '',
        area_solicitante_id: '',
      });
      setErrors({});
      setSubmitted(false);

      setTimeout(() => navigate('/'), 2500);
    } catch (err) {
      setApiError(err.message || 'Error al crear la solicitud. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Helpers ────────────────────────────────────────────────────────── */
  const errorCount = Object.keys(errors).length;
  const charLeft = (field) => LIMITS[field] - (formData[field]?.length || 0);

  /* ── Render ─────────────────────────────────────────────────────────── */
  if (loadingData) return <LoadingSpinner />;

  return (
    <div className="nueva-solicitud-container">
      <div className="form-card">
        <h1>Nueva Solicitud</h1>

        {/* ── API error banner ─────────────────────────────────────────── */}
        {apiError && (
          <AlertNotification
            type="error"
            title="Error al procesar la solicitud"
            messages={apiError}
            onClose={() => setApiError('')}
          />
        )}

        {/* ── Success banner ───────────────────────────────────────────── */}
        {success && (
          <AlertNotification
            type="success"
            messages={success}
            autoDismiss={2500}
            onClose={() => setSuccess('')}
          />
        )}

        {/* ── Validation summary banner (shown after failed submit) ─────── */}
        {submitted && errorCount > 0 && (
          <AlertNotification
            type="warning"
            title={`Por favor corregí ${errorCount} error${errorCount > 1 ? 'es' : ''} antes de continuar:`}
            messages={Object.entries(errors).map(
              ([field, msg]) => `${FIELD_LABELS[field]}: ${msg}`
            )}
            onClose={() => setErrors({})}
          />
        )}

        <form onSubmit={handleSubmit} className="solicitud-form" noValidate>
          {/* Tipo de solicitud */}
          <div className={`form-group ${errors.tipo_solicitud_id ? 'has-error' : ''}`}>
            <label htmlFor="tipo_solicitud_id">Tipo de Solicitud *</label>
            <select
              id="tipo_solicitud_id"
              name="tipo_solicitud_id"
              value={formData.tipo_solicitud_id}
              onChange={handleChange}
              aria-describedby={errors.tipo_solicitud_id ? 'err-tipo' : undefined}
            >
              <option value="">-- Seleccionar --</option>
              {tipos.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
            {errors.tipo_solicitud_id && (
              <span id="err-tipo" className="field-error-msg" role="alert">
                ⚠ {errors.tipo_solicitud_id}
              </span>
            )}
          </div>

          {/* Título */}
          <div className={`form-group ${errors.titulo ? 'has-error' : ''}`}>
            <label htmlFor="titulo">Título *</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Resumen breve de la solicitud"
              maxLength={LIMITS.titulo}
              aria-describedby={errors.titulo ? 'err-titulo' : undefined}
            />
            <div className="field-meta">
              {errors.titulo && (
                <span id="err-titulo" className="field-error-msg" role="alert">
                  ⚠ {errors.titulo}
                </span>
              )}
              <span className={`char-counter ${charLeft('titulo') < 20 ? 'char-counter--warn' : ''}`}>
                {formData.titulo.length}/{LIMITS.titulo}
              </span>
            </div>
          </div>

          {/* Descripción */}
          <div className={`form-group ${errors.descripcion ? 'has-error' : ''}`}>
            <label htmlFor="descripcion">Descripción *</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Detalle completo de la solicitud (mínimo 10 caracteres)"
              rows="5"
              maxLength={LIMITS.descripcion}
              aria-describedby={errors.descripcion ? 'err-desc' : undefined}
            />
            <div className="field-meta">
              {errors.descripcion && (
                <span id="err-desc" className="field-error-msg" role="alert">
                  ⚠ {errors.descripcion}
                </span>
              )}
              <span className={`char-counter ${charLeft('descripcion') < 50 ? 'char-counter--warn' : ''}`}>
                {formData.descripcion.length}/{LIMITS.descripcion}
              </span>
            </div>
          </div>

          {/* Urgencia */}
          <div className="form-group">
            <label htmlFor="urgencia">Urgencia *</label>
            <select
              id="urgencia"
              name="urgencia"
              value={formData.urgencia}
              onChange={handleChange}
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
            </select>
          </div>

          {/* Solicitante */}
          <div className={`form-group ${errors.solicitante ? 'has-error' : ''}`}>
            <label htmlFor="solicitante">Solicitante *</label>
            <input
              type="text"
              id="solicitante"
              name="solicitante"
              value={formData.solicitante}
              onChange={handleChange}
              placeholder="Nombre completo"
              maxLength={LIMITS.solicitante}
              aria-describedby={errors.solicitante ? 'err-sol' : undefined}
            />
            <div className="field-meta">
              {errors.solicitante && (
                <span id="err-sol" className="field-error-msg" role="alert">
                  ⚠ {errors.solicitante}
                </span>
              )}
              <span className={`char-counter ${charLeft('solicitante') < 10 ? 'char-counter--warn' : ''}`}>
                {formData.solicitante.length}/{LIMITS.solicitante}
              </span>
            </div>
          </div>

          {/* Email solicitante */}
          <div className={`form-group ${errors.email_solicitante ? 'has-error' : ''}`}>
            <label htmlFor="email_solicitante">Email Solicitante *</label>
            <input
              type="email"
              id="email_solicitante"
              name="email_solicitante"
              value={formData.email_solicitante}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              maxLength={LIMITS.email_solicitante}
              aria-describedby={errors.email_solicitante ? 'err-email' : undefined}
            />
            {errors.email_solicitante && (
              <span id="err-email" className="field-error-msg" role="alert">
                ⚠ {errors.email_solicitante}
              </span>
            )}
          </div>

          {/* Área solicitante */}
          <div className={`form-group ${errors.area_solicitante_id ? 'has-error' : ''}`}>
            <label htmlFor="area_solicitante_id">Área Solicitante *</label>
            <select
              id="area_solicitante_id"
              name="area_solicitante_id"
              value={formData.area_solicitante_id}
              onChange={handleChange}
              aria-describedby={errors.area_solicitante_id ? 'err-area' : undefined}
            >
              <option value="">-- Seleccionar --</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.nombre}
                </option>
              ))}
            </select>
            {errors.area_solicitante_id && (
              <span id="err-area" className="field-error-msg" role="alert">
                ⚠ {errors.area_solicitante_id}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Enviando...' : 'Crear Solicitud'}
            </button>
            <button type="button" onClick={() => navigate('/')} className="btn-cancel">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
