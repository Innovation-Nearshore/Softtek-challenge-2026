import { useState, useEffect } from 'react';
import { getTipos, getAreas, createSolicitud } from '../api';

const URGENCIA_OPTIONS = ['Alta', 'Media', 'Baja'];

const initialForm = {
  tipo_solicitud_id: '',
  urgencia: 'Baja',
  titulo: '',
  descripcion: '',
  solicitante: '',
  email_solicitante: '',
  area_solicitante_id: '',
};

function validate(form) {
  const errors = {};
  if (!form.tipo_solicitud_id) errors.tipo_solicitud_id = 'Requerido';
  if (!form.urgencia) errors.urgencia = 'Requerido';
  if (!form.titulo.trim()) errors.titulo = 'Requerido';
  if (!form.descripcion.trim()) errors.descripcion = 'Requerido';
  if (!form.solicitante.trim()) errors.solicitante = 'Requerido';
  if (!form.email_solicitante.trim()) {
    errors.email_solicitante = 'Requerido';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email_solicitante)) {
    errors.email_solicitante = 'Formato de email inválido';
  }
  if (!form.area_solicitante_id) errors.area_solicitante_id = 'Requerido';
  return errors;
}

export default function RequestForm() {
  const [tipos, setTipos] = useState([]);
  const [areas, setAreas] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    getTipos().then((r) => setTipos(r.data)).catch(() => {});
    getAreas().then((r) => setAreas(r.data)).catch(() => {});
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setApiError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    setApiError(null);
    try {
      const res = await createSolicitud({
        tipo_solicitud_id: Number(form.tipo_solicitud_id),
        urgencia: form.urgencia,
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        solicitante: form.solicitante.trim(),
        email_solicitante: form.email_solicitante.trim(),
        area_solicitante_id: Number(form.area_solicitante_id),
      });
      setTicket(res.data.numero_ticket || res.data.ticket || res.data.id);
      setForm(initialForm);
      setErrors({});
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Error al enviar la solicitud';
      setApiError(msg);
      // map field-level errors from backend if present
      const fieldErrs = err?.response?.data?.fields;
      if (fieldErrs) setErrors(fieldErrs);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setTicket(null);
    setForm(initialForm);
    setErrors({});
    setApiError(null);
  }

  if (ticket) {
    return (
      <div className="page-container">
        <div className="ticket-success">
          <div className="ticket-icon">✓</div>
          <h2>Solicitud enviada exitosamente</h2>
          <p>Tu número de ticket es:</p>
          <div className="ticket-number">{ticket}</div>
          <p className="ticket-hint">
            Guarda este número para dar seguimiento a tu solicitud.
          </p>
          <button className="btn btn-primary" onClick={handleReset}>
            Nueva solicitud
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="form-card">
        <h1 className="page-title">Nueva Solicitud</h1>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            {/* Tipo de solicitud */}
            <div className="form-group">
              <label htmlFor="tipo_solicitud_id">
                Tipo de solicitud <span className="required">*</span>
              </label>
              <select
                id="tipo_solicitud_id"
                name="tipo_solicitud_id"
                value={form.tipo_solicitud_id}
                onChange={handleChange}
                className={errors.tipo_solicitud_id ? 'input-error' : ''}
              >
                <option value="">-- Selecciona --</option>
                {tipos.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
              {errors.tipo_solicitud_id && (
                <span className="field-error">{errors.tipo_solicitud_id}</span>
              )}
            </div>

            {/* Urgencia */}
            <div className="form-group">
              <label htmlFor="urgencia">
                Urgencia <span className="required">*</span>
              </label>
              <select
                id="urgencia"
                name="urgencia"
                value={form.urgencia}
                onChange={handleChange}
                className={errors.urgencia ? 'input-error' : ''}
              >
                {URGENCIA_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              {errors.urgencia && (
                <span className="field-error">{errors.urgencia}</span>
              )}
            </div>

            {/* Título */}
            <div className="form-group form-group-full">
              <label htmlFor="titulo">
                Título <span className="required">*</span>
              </label>
              <input
                id="titulo"
                type="text"
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                placeholder="Título de la solicitud"
                className={errors.titulo ? 'input-error' : ''}
              />
              {errors.titulo && (
                <span className="field-error">{errors.titulo}</span>
              )}
            </div>

            {/* Descripción */}
            <div className="form-group form-group-full">
              <label htmlFor="descripcion">
                Descripción <span className="required">*</span>
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows={4}
                placeholder="Describe detalladamente tu solicitud"
                className={errors.descripcion ? 'input-error' : ''}
              />
              {errors.descripcion && (
                <span className="field-error">{errors.descripcion}</span>
              )}
            </div>

            {/* Solicitante */}
            <div className="form-group">
              <label htmlFor="solicitante">
                Solicitante <span className="required">*</span>
              </label>
              <input
                id="solicitante"
                type="text"
                name="solicitante"
                value={form.solicitante}
                onChange={handleChange}
                placeholder="Nombre completo"
                className={errors.solicitante ? 'input-error' : ''}
              />
              {errors.solicitante && (
                <span className="field-error">{errors.solicitante}</span>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email_solicitante">
                Email <span className="required">*</span>
              </label>
              <input
                id="email_solicitante"
                type="email"
                name="email_solicitante"
                value={form.email_solicitante}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                className={errors.email_solicitante ? 'input-error' : ''}
              />
              {errors.email_solicitante && (
                <span className="field-error">{errors.email_solicitante}</span>
              )}
            </div>

            {/* Área solicitante */}
            <div className="form-group">
              <label htmlFor="area_solicitante_id">
                Área solicitante <span className="required">*</span>
              </label>
              <select
                id="area_solicitante_id"
                name="area_solicitante_id"
                value={form.area_solicitante_id}
                onChange={handleChange}
                className={errors.area_solicitante_id ? 'input-error' : ''}
              >
                <option value="">-- Selecciona --</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </select>
              {errors.area_solicitante_id && (
                <span className="field-error">{errors.area_solicitante_id}</span>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Enviando…' : 'Enviar solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
