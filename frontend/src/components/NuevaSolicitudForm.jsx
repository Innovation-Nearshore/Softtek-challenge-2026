import { useState, useEffect } from 'react';
import { getAreas, getTiposSolicitud, createSolicitud } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const URGENCIA_OPTIONS = ['Alta', 'Media', 'Baja'];

const INITIAL_FORM = {
  tipo_solicitud_id: '',
  titulo: '',
  urgencia: '',
  descripcion: '',
  solicitante: '',
  email_solicitante: '',
  area_solicitante_id: '',
  area_asignada_id: '',
};

export default function NuevaSolicitudForm({ onSuccess, onError, onCancel }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [areas, setAreas] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [lookupsLoading, setLookupsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load lookups on mount
  useEffect(() => {
    const loadLookups = async () => {
      setLookupsLoading(true);
      const [areasResult, tiposResult] = await Promise.all([
        getAreas(),
        getTiposSolicitud(),
      ]);

      if (areasResult.error) {
        onError(`Error al cargar áreas: ${areasResult.error}`);
      } else {
        setAreas(areasResult.data?.data ?? areasResult.data ?? []);
      }

      if (tiposResult.error) {
        onError(`Error al cargar tipos de solicitud: ${tiposResult.error}`);
      } else {
        setTipos(tiposResult.data?.data ?? tiposResult.data ?? []);
      }

      setLookupsLoading(false);
    };

    loadLookups();
  }, [onError]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.tipo_solicitud_id) newErrors.tipo_solicitud_id = 'Campo obligatorio';
    if (!form.titulo.trim()) newErrors.titulo = 'Campo obligatorio';
    if (!form.urgencia) newErrors.urgencia = 'Campo obligatorio';
    if (!form.descripcion.trim()) newErrors.descripcion = 'Campo obligatorio';
    if (!form.solicitante.trim()) newErrors.solicitante = 'Campo obligatorio';
    if (!form.email_solicitante.trim()) newErrors.email_solicitante = 'Campo obligatorio';
    if (!form.area_solicitante_id) newErrors.area_solicitante_id = 'Campo obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    const payload = {
      tipo_solicitud_id: Number(form.tipo_solicitud_id),
      titulo: form.titulo.trim(),
      urgencia: form.urgencia,
      descripcion: form.descripcion.trim(),
      solicitante: form.solicitante.trim(),
      email_solicitante: form.email_solicitante.trim(),
      area_solicitante_id: Number(form.area_solicitante_id),
      area_asignada_id: form.area_asignada_id ? Number(form.area_asignada_id) : null,
    };

    const { error } = await createSolicitud(payload);
    setSubmitting(false);

    if (error) {
      onError(`Error al guardar: ${error}`);
      return;
    }

    onSuccess();
  };

  if (lookupsLoading) {
    return <LoadingSpinner text="Cargando formulario..." />;
  }

  const fieldClass = (field) =>
    `border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white w-full ${
      errors[field] ? 'border-red-400' : 'border-gray-300'
    }`;

  const labelClass = 'text-xs font-semibold text-gray-600 uppercase tracking-wide';

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Tipo de solicitud */}
        <div className="flex flex-col gap-1">
          <label className={labelClass}>
            Tipo de solicitud <span className="text-red-500">*</span>
          </label>
          <select
            value={form.tipo_solicitud_id}
            onChange={(e) => handleChange('tipo_solicitud_id', e.target.value)}
            className={fieldClass('tipo_solicitud_id')}
          >
            <option value="">Seleccionar...</option>
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
          {errors.tipo_solicitud_id && (
            <span className="text-xs text-red-600">{errors.tipo_solicitud_id}</span>
          )}
        </div>

        {/* Urgencia */}
        <div className="flex flex-col gap-1">
          <label className={labelClass}>
            Urgencia <span className="text-red-500">*</span>
          </label>
          <select
            value={form.urgencia}
            onChange={(e) => handleChange('urgencia', e.target.value)}
            className={fieldClass('urgencia')}
          >
            <option value="">Seleccionar...</option>
            {URGENCIA_OPTIONS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          {errors.urgencia && (
            <span className="text-xs text-red-600">{errors.urgencia}</span>
          )}
        </div>

        {/* Título – full width */}
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className={labelClass}>
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.titulo}
            onChange={(e) => handleChange('titulo', e.target.value)}
            placeholder="Título breve de la solicitud"
            className={fieldClass('titulo')}
          />
          {errors.titulo && (
            <span className="text-xs text-red-600">{errors.titulo}</span>
          )}
        </div>

        {/* Solicitante */}
        <div className="flex flex-col gap-1">
          <label className={labelClass}>
            Solicitante <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.solicitante}
            onChange={(e) => handleChange('solicitante', e.target.value)}
            placeholder="Nombre completo"
            className={fieldClass('solicitante')}
          />
          {errors.solicitante && (
            <span className="text-xs text-red-600">{errors.solicitante}</span>
          )}
        </div>

        {/* Email solicitante */}
        <div className="flex flex-col gap-1">
          <label className={labelClass}>
            Email solicitante <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={form.email_solicitante}
            onChange={(e) => handleChange('email_solicitante', e.target.value)}
            placeholder="correo@empresa.com"
            className={fieldClass('email_solicitante')}
          />
          {errors.email_solicitante && (
            <span className="text-xs text-red-600">{errors.email_solicitante}</span>
          )}
        </div>

        {/* Área Solicitante */}
        <div className="flex flex-col gap-1">
          <label className={labelClass}>
            Área solicitante <span className="text-red-500">*</span>
          </label>
          <select
            value={form.area_solicitante_id}
            onChange={(e) => handleChange('area_solicitante_id', e.target.value)}
            className={fieldClass('area_solicitante_id')}
          >
            <option value="">Seleccionar...</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
          {errors.area_solicitante_id && (
            <span className="text-xs text-red-600">{errors.area_solicitante_id}</span>
          )}
        </div>

        {/* Área Asignada (opcional) */}
        <div className="flex flex-col gap-1">
          <label className={labelClass}>
            Área asignada{' '}
            <span className="text-gray-400 font-normal normal-case">(opcional)</span>
          </label>
          <select
            value={form.area_asignada_id}
            onChange={(e) => handleChange('area_asignada_id', e.target.value)}
            className={fieldClass('area_asignada_id')}
          >
            <option value="">Sin asignar</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Descripción – full width */}
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className={labelClass}>
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.descripcion}
            onChange={(e) => handleChange('descripcion', e.target.value)}
            placeholder="Detalle completo de la solicitud..."
            rows={4}
            className={`${fieldClass('descripcion')} resize-none`}
          />
          {errors.descripcion && (
            <span className="text-xs text-red-600">{errors.descripcion}</span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {submitting ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
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
            </>
          ) : (
            'Guardar'
          )}
        </button>
      </div>
    </form>
  );
}
