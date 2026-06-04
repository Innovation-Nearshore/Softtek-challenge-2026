import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { initiativesService } from '../services/api';
import './InitiativeForm.css';

const INITIAL_FORM = {
  nombre: '',
  responsable: '',
  estado: '',
  fecha_limite: '',
  prioridad: '',
  descripcion: '',
};

const ESTADOS = ['Pendiente', 'En curso', 'Completado'];
const PRIORIDADES = ['Alta', 'Media', 'Baja'];

function getTodayStr() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Validate a single field.
 * @param {string} name  - field name
 * @param {string} value - field value
 * @param {string} originalDate - the date originally loaded from the DB (for edit mode)
 */
function validateField(name, value, originalDate = '') {
  const today = getTodayStr();

  switch (name) {
    case 'nombre':
      if (!value.trim()) return 'El nombre es obligatorio.';
      if (value.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres.';
      return '';

    case 'responsable':
      if (!value.trim()) return 'El responsable es obligatorio.';
      if (value.trim().length < 2) return 'El responsable debe tener al menos 2 caracteres.';
      return '';

    case 'estado':
      if (!value) return 'El estado es obligatorio.';
      if (!ESTADOS.includes(value)) return 'Selecciona un estado válido.';
      return '';

    case 'fecha_limite':
      if (!value) return 'La fecha límite es obligatoria.';
      // Allow the originally-saved date even if it is in the past (edit mode).
      // Only block if the user has changed to a different past date.
      if (value !== originalDate && value < today) {
        return 'La fecha límite no puede ser anterior a hoy.';
      }
      return '';

    case 'prioridad':
      if (!value) return 'La prioridad es obligatoria.';
      if (!PRIORIDADES.includes(value)) return 'Selecciona una prioridad válida.';
      return '';

    case 'descripcion':
      if (!value.trim()) return 'La descripción es obligatoria.';
      if (value.trim().length < 10) return 'La descripción debe tener al menos 10 caracteres.';
      return '';

    default:
      return '';
  }
}

function validateAll(formData, originalDate = '') {
  const errors = {};
  Object.keys(INITIAL_FORM).forEach((key) => {
    const err = validateField(key, formData[key], originalDate);
    if (err) errors[key] = err;
  });
  return errors;
}

function InitiativeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Keep a ref to the original saved date so date validation is lenient in edit mode
  const originalDateRef = useRef('');

  const loadInitiative = useCallback(async () => {
    if (!isEditing) return;
    try {
      setFetchLoading(true);
      setFetchError('');
      const res = await initiativesService.getById(id);
      const data = res.data;
      const fechaLimite = data.fecha_limite ? data.fecha_limite.split('T')[0] : '';
      originalDateRef.current = fechaLimite;
      setFormData({
        nombre: data.nombre || '',
        responsable: data.responsable || '',
        estado: data.estado || '',
        fecha_limite: fechaLimite,
        prioridad: data.prioridad || '',
        descripcion: data.descripcion || '',
      });
    } catch {
      setFetchError('No se pudo cargar la iniciativa. Por favor, intenta de nuevo.');
    } finally {
      setFetchLoading(false);
    }
  }, [id, isEditing]);

  useEffect(() => {
    loadInitiative();
  }, [loadInitiative]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSubmitError('');
    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, originalDateRef.current),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value, originalDateRef.current),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const allTouched = Object.keys(INITIAL_FORM).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    );
    setTouched(allTouched);

    const allErrors = validateAll(formData, originalDateRef.current);
    setErrors(allErrors);

    if (Object.values(allErrors).some(Boolean)) return;

    try {
      setLoading(true);
      const payload = {
        nombre: formData.nombre.trim(),
        responsable: formData.responsable.trim(),
        estado: formData.estado,
        fecha_limite: formData.fecha_limite,
        prioridad: formData.prioridad,
        descripcion: formData.descripcion.trim(),
      };

      if (isEditing) {
        await initiativesService.update(id, payload);
        setSuccessMsg('Cambios guardados correctamente.');
      } else {
        await initiativesService.create(payload);
        setSuccessMsg('Iniciativa registrada correctamente.');
      }
      setTimeout(() => navigate('/'), 1800);
    } catch (err) {
      if (err?.response?.data?.errors) {
        const backendErrors = err.response.data.errors;
        setErrors((prev) => ({ ...prev, ...backendErrors }));
        setSubmitError('Por favor, corrige los errores indicados e intenta de nuevo.');
      } else {
        setSubmitError(
          err?.friendlyMessage ||
          'Ocurrió un error al guardar la iniciativa. Por favor, intenta de nuevo.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldClass = (fieldName) => {
    if (!touched[fieldName]) return 'form-control';
    if (errors[fieldName]) return 'form-control form-control--error';
    return 'form-control form-control--valid';
  };

  // ── Loading / Error states while fetching an existing initiative ─────────
  if (fetchLoading) {
    return (
      <div className="form-page">
        <div className="form-loading">
          <div className="spinner spinner--dark"></div>
          <span>Cargando iniciativa...</span>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="form-page">
        <div className="alert alert--error form-alert" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <span>{fetchError}</span>
            <button className="form-retry-btn" onClick={loadInitiative}>
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main form render ──────────────────────────────────────────────────────
  return (
    <div className="form-page">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-header__title">
          {isEditing ? 'Editar Iniciativa' : 'Nueva Iniciativa'}
        </h1>
        <p className="page-header__subtitle">
          {isEditing
            ? 'Actualiza los datos de la iniciativa registrada'
            : 'Completa el formulario para registrar una nueva iniciativa'}
        </p>
      </div>

      {/* Success Message */}
      {successMsg && (
        <div className="alert alert--success form-alert" role="status" aria-live="polite">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Submit Error */}
      {submitError && (
        <div className="alert alert--error form-alert" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{submitError}</span>
        </div>
      )}

      <div className="card form-card">
        <p className="form-required-note">
          Los campos marcados con <span className="required-star">*</span> son obligatorios.
        </p>

        <form onSubmit={handleSubmit} noValidate className="initiative-form">
          {/* Row 1: Nombre + Responsable */}
          <div className="form-row">
            {/* Nombre */}
            <div className="form-group">
              <label htmlFor="nombre" className="form-label">
                Nombre de la Iniciativa <span className="required-star">*</span>
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                className={getFieldClass('nombre')}
                value={formData.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ej. Implementación de sistema ERP"
                aria-required="true"
                aria-describedby={errors.nombre && touched.nombre ? 'nombre-error' : undefined}
                aria-invalid={!!(errors.nombre && touched.nombre)}
                disabled={loading}
                maxLength={255}
              />
              {touched.nombre && errors.nombre && (
                <span id="nombre-error" className="field-error" role="alert">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errors.nombre}
                </span>
              )}
              {touched.nombre && !errors.nombre && formData.nombre && (
                <span className="field-valid">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Correcto
                </span>
              )}
            </div>

            {/* Responsable */}
            <div className="form-group">
              <label htmlFor="responsable" className="form-label">
                Responsable <span className="required-star">*</span>
              </label>
              <input
                id="responsable"
                name="responsable"
                type="text"
                className={getFieldClass('responsable')}
                value={formData.responsable}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Ej. Juan Pérez"
                aria-required="true"
                aria-describedby={errors.responsable && touched.responsable ? 'responsable-error' : undefined}
                aria-invalid={!!(errors.responsable && touched.responsable)}
                disabled={loading}
                maxLength={100}
              />
              {touched.responsable && errors.responsable && (
                <span id="responsable-error" className="field-error" role="alert">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errors.responsable}
                </span>
              )}
              {touched.responsable && !errors.responsable && formData.responsable && (
                <span className="field-valid">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Correcto
                </span>
              )}
            </div>
          </div>

          {/* Row 2: Estado + Prioridad + Fecha Límite */}
          <div className="form-row form-row--three">
            {/* Estado */}
            <div className="form-group">
              <label htmlFor="estado" className="form-label">
                Estado <span className="required-star">*</span>
              </label>
              <select
                id="estado"
                name="estado"
                className={getFieldClass('estado')}
                value={formData.estado}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-required="true"
                aria-describedby={errors.estado && touched.estado ? 'estado-error' : undefined}
                aria-invalid={!!(errors.estado && touched.estado)}
                disabled={loading}
              >
                <option value="">Seleccionar estado...</option>
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              {touched.estado && errors.estado && (
                <span id="estado-error" className="field-error" role="alert">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errors.estado}
                </span>
              )}
              {touched.estado && !errors.estado && formData.estado && (
                <span className="field-valid">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Correcto
                </span>
              )}
            </div>

            {/* Prioridad */}
            <div className="form-group">
              <label htmlFor="prioridad" className="form-label">
                Prioridad <span className="required-star">*</span>
              </label>
              <select
                id="prioridad"
                name="prioridad"
                className={getFieldClass('prioridad')}
                value={formData.prioridad}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-required="true"
                aria-describedby={errors.prioridad && touched.prioridad ? 'prioridad-error' : undefined}
                aria-invalid={!!(errors.prioridad && touched.prioridad)}
                disabled={loading}
              >
                <option value="">Seleccionar prioridad...</option>
                {PRIORIDADES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {touched.prioridad && errors.prioridad && (
                <span id="prioridad-error" className="field-error" role="alert">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errors.prioridad}
                </span>
              )}
              {touched.prioridad && !errors.prioridad && formData.prioridad && (
                <span className="field-valid">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Correcto
                </span>
              )}
            </div>

            {/* Fecha Límite */}
            <div className="form-group">
              <label htmlFor="fecha_limite" className="form-label">
                Fecha Límite <span className="required-star">*</span>
              </label>
              <input
                id="fecha_limite"
                name="fecha_limite"
                type="date"
                className={getFieldClass('fecha_limite')}
                value={formData.fecha_limite}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-required="true"
                aria-describedby={errors.fecha_limite && touched.fecha_limite ? 'fecha_limite-error' : undefined}
                aria-invalid={!!(errors.fecha_limite && touched.fecha_limite)}
                disabled={loading}
              />
              {touched.fecha_limite && errors.fecha_limite && (
                <span id="fecha_limite-error" className="field-error" role="alert">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errors.fecha_limite}
                </span>
              )}
              {touched.fecha_limite && !errors.fecha_limite && formData.fecha_limite && (
                <span className="field-valid">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Correcto
                </span>
              )}
            </div>
          </div>

          {/* Row 3: Descripción */}
          <div className="form-group">
            <label htmlFor="descripcion" className="form-label">
              Descripción <span className="required-star">*</span>
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              className={`${getFieldClass('descripcion')} form-textarea`}
              value={formData.descripcion}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Describe el objetivo, alcance y detalles relevantes de la iniciativa..."
              rows={4}
              aria-required="true"
              aria-describedby={errors.descripcion && touched.descripcion ? 'descripcion-error' : undefined}
              aria-invalid={!!(errors.descripcion && touched.descripcion)}
              disabled={loading}
              maxLength={2000}
            />
            <div className="form-group__footer">
              {touched.descripcion && errors.descripcion ? (
                <span id="descripcion-error" className="field-error" role="alert">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {errors.descripcion}
                </span>
              ) : touched.descripcion && !errors.descripcion && formData.descripcion ? (
                <span className="field-valid">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Correcto
                </span>
              ) : (
                <span />
              )}
              <span className="char-count">{formData.descripcion.length}/2000</span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <Link to="/" className="btn btn--secondary" tabIndex={loading ? -1 : 0}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Cancelar
            </Link>
            <button
              type="submit"
              className="btn btn--primary btn--lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  {isEditing ? 'Guardando cambios...' : 'Registrando...'}
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14a2 2 0 01-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  {isEditing ? 'Guardar Cambios' : 'Registrar Iniciativa'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InitiativeForm;
