import React, { useState } from 'react';
import type { CreateRequestDTO, Urgency } from '../types/request';
import { requestService } from '../services/requestService';

const REQUEST_TYPES = [
  'Soporte técnico',
  'Aprobación',
  'Requerimiento',
  'Consulta',
  'Incidente',
  'Mejora',
  'Otro',
];

const URGENCY_OPTIONS: { value: Urgency; label: string }[] = [
  { value: 'Alta', label: 'Alta' },
  { value: 'Media', label: 'Media' },
  { value: 'Baja', label: 'Baja' },
];

interface RequestFormProps {
  onSuccess?: () => void;
}

const INITIAL_FORM: CreateRequestDTO = {
  type: '',
  urgency: 'Media',
  description: '',
  requester: '',
  area: '',
};

const RequestForm: React.FC<RequestFormProps> = ({ onSuccess }) => {
  const [form, setForm] = useState<CreateRequestDTO>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateRequestDTO, string>>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateRequestDTO, string>> = {};
    if (!form.type.trim()) newErrors.type = 'El tipo de solicitud es requerido.';
    if (!form.urgency) newErrors.urgency = 'La urgencia es requerida.';
    if (!form.description.trim()) newErrors.description = 'La descripción es requerida.';
    if (!form.requester.trim()) newErrors.requester = 'El nombre del solicitante es requerido.';
    if (!form.area.trim()) newErrors.area = 'El área es requerida.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await requestService.create(form);
      setForm(INITIAL_FORM);
      setSuccessMessage('¡Solicitud creada exitosamente!');
      onSuccess?.();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Error inesperado al enviar la solicitud.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Nueva Solicitud</h2>

      {successMessage && (
        <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 font-medium">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Tipo de solicitud */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de solicitud <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            name="type"
            value={form.type}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.type ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
            }`}
          >
            <option value="">— Selecciona un tipo —</option>
            {REQUEST_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
        </div>

        {/* Urgencia */}
        <div>
          <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">
            Urgencia <span className="text-red-500">*</span>
          </label>
          <select
            id="urgency"
            name="urgency"
            value={form.urgency}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.urgency ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
            }`}
          >
            {URGENCY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.urgency && <p className="mt-1 text-xs text-red-600">{errors.urgency}</p>}
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe la solicitud con detalle..."
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              errors.description ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Solicitante */}
        <div>
          <label htmlFor="requester" className="block text-sm font-medium text-gray-700 mb-1">
            Solicitante <span className="text-red-500">*</span>
          </label>
          <input
            id="requester"
            type="text"
            name="requester"
            value={form.requester}
            onChange={handleChange}
            placeholder="Nombre completo del solicitante"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.requester ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
            }`}
          />
          {errors.requester && <p className="mt-1 text-xs text-red-600">{errors.requester}</p>}
        </div>

        {/* Área */}
        <div>
          <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
            Área <span className="text-red-500">*</span>
          </label>
          <input
            id="area"
            type="text"
            name="area"
            value={form.area}
            onChange={handleChange}
            placeholder="Área o departamento"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.area ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
            }`}
          />
          {errors.area && <p className="mt-1 text-xs text-red-600">{errors.area}</p>}
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg px-6 py-2.5 text-sm transition-colors duration-200"
          >
            {loading ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequestForm;
