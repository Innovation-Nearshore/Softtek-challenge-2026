import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createIniciativa, updateIniciativa, getIniciativa } from '../services/api';
import { ESTADOS, PRIORIDADES } from '../utils/constants';
import './IniciativaForm.css';

const EMPTY_FORM = {
  nombre: '',
  responsable: '',
  estado: 'Pendiente',
  fecha_limite: '',
  prioridad: 'Media',
  descripcion: '',
};

export default function IniciativaForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      getIniciativa(id)
        .then(({ data }) => {
          const item = data.data || data;
          setForm({
            nombre: item.nombre || '',
            responsable: item.responsable || '',
            estado: item.estado || 'Pendiente',
            fecha_limite: item.fecha_limite ? item.fecha_limite.split('T')[0] : '',
            prioridad: item.prioridad || 'Media',
            descripcion: item.descripcion || '',
          });
        })
        .catch(() => setFetchError('No se pudo cargar la iniciativa.'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const validate = () => {
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio.';
    if (!form.responsable.trim()) errs.responsable = 'El responsable es obligatorio.';
    if (!form.fecha_limite) errs.fecha_limite = 'La fecha límite es obligatoria.';
    if (!ESTADOS.includes(form.estado)) errs.estado = 'Estado inválido.';
    if (!PRIORIDADES.includes(form.prioridad)) errs.prioridad = 'Prioridad inválida.';
    if (!form.descripcion.trim()) errs.descripcion = 'La descripción es obligatoria.';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await updateIniciativa(id, form);
      } else {
        await createIniciativa(form);
      }
      navigate('/');
    } catch (err) {
      const apiFieldErrors = err.response?.data?.fieldErrors;
      if (apiFieldErrors && Object.keys(apiFieldErrors).length > 0) {
        setErrors(apiFieldErrors);
      } else {
        const msg = err.response?.data?.message || err.response?.data?.error || 'Error al guardar la iniciativa.';
        setErrors({ submit: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchError) {
    return (
      <div className="form-page">
        <div className="form-card">
          <div className="form-error-banner">⚠️ {fetchError}</div>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            ← Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <h2 className="form-title">
          {isEdit ? '✏️ Editar Iniciativa' : '➕ Nueva Iniciativa'}
        </h2>
        <p className="form-subtitle">
          {isEdit
            ? 'Modifica los datos de la iniciativa y guarda los cambios.'
            : 'Completa el formulario para registrar una nueva iniciativa.'}
        </p>
        <hr className="form-divider" />

        {errors.submit && (
          <div className="form-error-banner">⚠️ {errors.submit}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Nombre */}
          <div className="form-group">
            <label htmlFor="nombre">
              Nombre <span className="required">*</span>
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              placeholder="Nombre de la iniciativa"
              value={form.nombre}
              onChange={handleChange}
              className={errors.nombre ? 'input-error' : ''}
            />
            {errors.nombre && <span className="field-error">⚠ {errors.nombre}</span>}
          </div>

          {/* Responsable */}
          <div className="form-group">
            <label htmlFor="responsable">
              Responsable <span className="required">*</span>
            </label>
            <input
              id="responsable"
              name="responsable"
              type="text"
              placeholder="Nombre del responsable"
              value={form.responsable}
              onChange={handleChange}
              className={errors.responsable ? 'input-error' : ''}
            />
            {errors.responsable && (
              <span className="field-error">⚠ {errors.responsable}</span>
            )}
          </div>

          {/* Estado & Prioridad row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="estado">
                Estado <span className="required">*</span>
              </label>
              <select
                id="estado"
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className={errors.estado ? 'input-error' : ''}
              >
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              {errors.estado && (
                <span className="field-error">⚠ {errors.estado}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="prioridad">
                Prioridad <span className="required">*</span>
              </label>
              <select
                id="prioridad"
                name="prioridad"
                value={form.prioridad}
                onChange={handleChange}
                className={errors.prioridad ? 'input-error' : ''}
              >
                {PRIORIDADES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {errors.prioridad && (
                <span className="field-error">⚠ {errors.prioridad}</span>
              )}
            </div>
          </div>

          {/* Fecha límite */}
          <div className="form-group">
            <label htmlFor="fecha_limite">
              Fecha Límite <span className="required">*</span>
            </label>
            <input
              id="fecha_limite"
              name="fecha_limite"
              type="date"
              value={form.fecha_limite}
              onChange={handleChange}
              className={errors.fecha_limite ? 'input-error' : ''}
            />
            {errors.fecha_limite && (
              <span className="field-error">⚠ {errors.fecha_limite}</span>
            )}
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label htmlFor="descripcion">
              Descripción <span className="required">*</span>
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              rows={4}
              placeholder="Describe brevemente la iniciativa"
              value={form.descripcion}
              onChange={handleChange}
              className={errors.descripcion ? 'input-error' : ''}
            />
            {errors.descripcion && (
              <span className="field-error">⚠ {errors.descripcion}</span>
            )}
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '⏳ Guardando…' : isEdit ? '💾 Actualizar' : '✅ Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
