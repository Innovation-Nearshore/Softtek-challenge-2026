/**
 * IniciativaForm.jsx
 * Controlled form for creating a new iniciativa.
 * Validates all fields, shows inline errors, and submits via the service layer.
 */

import { useState } from 'react';
import { createIniciativa } from '../services/iniciativasService';
import { ESTADOS, PRIORIDADES } from '../utils/formatters';

const INITIAL_FORM = {
  nombre: '',
  responsable: '',
  estado: '',
  fecha_limite: '',
  prioridad: '',
  descripcion: '',
};

/**
 * @param {{ onSuccess?: Function }} props
 */
const IniciativaForm = ({ onSuccess }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ─── Validation ────────────────────────────────────────────────────────────
  const validate = (values) => {
    const errs = {};
    if (!values.nombre.trim()) errs.nombre = 'El nombre es obligatorio';
    if (!values.responsable.trim()) errs.responsable = 'El responsable es obligatorio';
    if (!values.estado) errs.estado = 'Selecciona un estado';
    if (!values.fecha_limite) errs.fecha_limite = 'La fecha límite es obligatoria';
    if (!values.prioridad) errs.prioridad = 'Selecciona una prioridad';
    if (!values.descripcion.trim()) errs.descripcion = 'La descripción es obligatoria';
    return errs;
  };

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear individual field error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      await createIniciativa(form);
      setSubmitSuccess(true);
      setForm(INITIAL_FORM);
      setErrors({});
      if (onSuccess) onSuccess();
    } catch (err) {
      setSubmitError(err.message || 'Error al crear la iniciativa');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Field helpers ──────────────────────────────────────────────────────────
  const inputClass = (field) =>
    `w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 ${
      errors[field]
        ? 'border-red-400 focus:ring-red-300 bg-red-50'
        : 'border-gray-300 focus:ring-indigo-300 bg-white'
    }`;

  const labelClass = 'block mb-1 text-sm font-medium text-gray-700';
  const errorClass = 'mt-1 text-xs text-red-600';

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-lg border border-gray-100">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">Nueva Iniciativa</h2>

      {/* Global success banner */}
      {submitSuccess && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-300 px-4 py-3 text-green-800 text-sm">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Iniciativa creada exitosamente.
        </div>
      )}

      {/* Global error banner */}
      {submitError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-300 px-4 py-3 text-red-800 text-sm">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Nombre */}
        <div>
          <label htmlFor="nombre" className={labelClass}>
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Nombre de la iniciativa"
            className={inputClass('nombre')}
          />
          {errors.nombre && <p className={errorClass}>{errors.nombre}</p>}
        </div>

        {/* Responsable */}
        <div>
          <label htmlFor="responsable" className={labelClass}>
            Responsable <span className="text-red-500">*</span>
          </label>
          <input
            id="responsable"
            name="responsable"
            type="text"
            value={form.responsable}
            onChange={handleChange}
            placeholder="Nombre del responsable"
            className={inputClass('responsable')}
          />
          {errors.responsable && <p className={errorClass}>{errors.responsable}</p>}
        </div>

        {/* Estado + Prioridad in a row */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Estado */}
          <div>
            <label htmlFor="estado" className={labelClass}>
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              id="estado"
              name="estado"
              value={form.estado}
              onChange={handleChange}
              className={inputClass('estado')}
            >
              <option value="">Seleccionar estado</option>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
            {errors.estado && <p className={errorClass}>{errors.estado}</p>}
          </div>

          {/* Prioridad */}
          <div>
            <label htmlFor="prioridad" className={labelClass}>
              Prioridad <span className="text-red-500">*</span>
            </label>
            <select
              id="prioridad"
              name="prioridad"
              value={form.prioridad}
              onChange={handleChange}
              className={inputClass('prioridad')}
            >
              <option value="">Seleccionar prioridad</option>
              {PRIORIDADES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {errors.prioridad && <p className={errorClass}>{errors.prioridad}</p>}
          </div>
        </div>

        {/* Fecha límite */}
        <div>
          <label htmlFor="fecha_limite" className={labelClass}>
            Fecha límite <span className="text-red-500">*</span>
          </label>
          <input
            id="fecha_limite"
            name="fecha_limite"
            type="date"
            value={form.fecha_limite}
            onChange={handleChange}
            className={inputClass('fecha_limite')}
          />
          {errors.fecha_limite && <p className={errorClass}>{errors.fecha_limite}</p>}
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="descripcion" className={labelClass}>
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            rows={4}
            placeholder="Describe brevemente la iniciativa..."
            className={inputClass('descripcion')}
          />
          {errors.descripcion && <p className={errorClass}>{errors.descripcion}</p>}
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setForm(INITIAL_FORM);
              setErrors({});
              setSubmitError(null);
              setSubmitSuccess(false);
            }}
            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Limpiar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {submitting ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Guardando...
              </>
            ) : (
              'Crear Iniciativa'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IniciativaForm;
