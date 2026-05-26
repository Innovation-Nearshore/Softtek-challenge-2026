import React, { useState } from 'react';
import { createRequest } from '../services/api';

const TIPOS = [
  'Soporte Técnico',
  'Solicitud de Acceso',
  'Requerimiento de Software',
  'Incidente',
  'Consulta',
  'Mantenimiento',
];

const AREAS = [
  'TI',
  'Recursos Humanos',
  'Finanzas',
  'Operaciones',
  'Comercial',
  'Legal',
  'Gerencia',
];

const INITIAL_STATE = {
  tipo: '',
  urgencia: '',
  descripcion: '',
  solicitante: '',
  area: '',
};

export default function RequestForm({ onCreated }) {
  const [form, setForm] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const errs = {};
    if (!form.tipo) errs.tipo = 'Seleccione un tipo de solicitud';
    if (!form.urgencia) errs.urgencia = 'Seleccione la urgencia';
    if (!form.descripcion.trim()) errs.descripcion = 'La descripción es requerida';
    else if (form.descripcion.trim().length < 10)
      errs.descripcion = 'Mínimo 10 caracteres';
    if (!form.solicitante.trim()) errs.solicitante = 'El nombre del solicitante es requerido';
    if (!form.area) errs.area = 'Seleccione un área';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setServerError('');
    try {
      await createRequest(form);
      setSuccess(true);
      setForm(INITIAL_STATE);
      setErrors({});
      if (onCreated) onCreated();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setServerError(err.message || 'Error al crear la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📝 Nueva Solicitud</h2>

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-800 rounded-lg text-sm">
          ✅ Solicitud registrada exitosamente.
        </div>
      )}

      {serverError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-800 rounded-lg text-sm">
          ❌ {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Solicitud <span className="text-red-500">*</span>
            </label>
            <select name="tipo" value={form.tipo} onChange={handleChange} className={inputClass('tipo')}>
              <option value="">-- Seleccionar --</option>
              {TIPOS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.tipo && <p className="text-red-500 text-xs mt-1">{errors.tipo}</p>}
          </div>

          {/* Urgencia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Urgencia <span className="text-red-500">*</span>
            </label>
            <select name="urgencia" value={form.urgencia} onChange={handleChange} className={inputClass('urgencia')}>
              <option value="">-- Seleccionar --</option>
              <option value="Alta">🔴 Alta</option>
              <option value="Media">🟡 Media</option>
              <option value="Baja">🟢 Baja</option>
            </select>
            {errors.urgencia && <p className="text-red-500 text-xs mt-1">{errors.urgencia}</p>}
          </div>

          {/* Solicitante */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solicitante <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="solicitante"
              value={form.solicitante}
              onChange={handleChange}
              placeholder="Nombre completo"
              className={inputClass('solicitante')}
              maxLength={100}
            />
            {errors.solicitante && <p className="text-red-500 text-xs mt-1">{errors.solicitante}</p>}
          </div>

          {/* Área */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área <span className="text-red-500">*</span>
            </label>
            <select name="area" value={form.area} onChange={handleChange} className={inputClass('area')}>
              <option value="">-- Seleccionar --</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={3}
              placeholder="Describa detalladamente la solicitud..."
              className={inputClass('descripcion')}
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.descripcion
                ? <p className="text-red-500 text-xs">{errors.descripcion}</p>
                : <span />}
              <span className="text-xs text-gray-400">{form.descripcion.length}/1000</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '⏳ Guardando...' : '✅ Registrar Solicitud'}
          </button>
        </div>
      </form>
    </div>
  );
}
