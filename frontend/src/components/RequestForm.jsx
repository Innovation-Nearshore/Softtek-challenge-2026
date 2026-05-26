import { useState, useEffect } from 'react';
import { createRequest, fetchAreas, fetchTiposSolicitud } from '../services/requestsService';

const INITIAL_FORM = {
  tipo_solicitud_id: '',
  titulo: '',
  descripcion: '',
  urgencia: 'Media',
  solicitante: '',
  email_solicitante: '',
  area_solicitante_id: '',
};

export default function RequestForm({ onSuccess }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [areas, setAreas] = useState([]);
  const [areasLoading, setAreasLoading] = useState(true);
  const [tipos, setTipos] = useState([]);
  const [tiposLoading, setTiposLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAreas()
      .then(setAreas)
      .catch(() => setAreas([]))
      .finally(() => setAreasLoading(false));

    fetchTiposSolicitud()
      .then(setTipos)
      .catch(() => setTipos([]))
      .finally(() => setTiposLoading(false));
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await createRequest({
        ...form,
        tipo_solicitud_id: Number(form.tipo_solicitud_id),
        area_solicitante_id: Number(form.area_solicitante_id),
      });
      setForm(INITIAL_FORM);
      setStatus({ type: 'success', message: 'Solicitud creada exitosamente.' });
      onSuccess();
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow p-6 space-y-4 max-w-lg w-full"
    >
      <h2 className="text-xl font-semibold text-gray-800">Nueva Solicitud</h2>

      {status && (
        <p
          className={`text-sm rounded p-2 ${
            status.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {status.message}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Tipo de Solicitud
          </label>
          {tiposLoading ? (
            <p className="text-sm text-gray-400">Cargando tipos...</p>
          ) : (
            <select
              name="tipo_solicitud_id"
              value={form.tipo_solicitud_id}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Selecciona un tipo</option>
              {tipos.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Urgencia</label>
          <select
            name="urgencia"
            value={form.urgencia}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Título</label>
        <input
          type="text"
          name="titulo"
          value={form.titulo}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Título breve de la solicitud"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          required
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Describe la solicitud con detalle..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Solicitante</label>
          <input
            type="text"
            name="solicitante"
            value={form.solicitante}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Nombre completo"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email_solicitante"
            value={form.email_solicitante}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="correo@empresa.com"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Área</label>
        {areasLoading ? (
          <p className="text-sm text-gray-400">Cargando áreas...</p>
        ) : (
          <select
            name="area_solicitante_id"
            value={form.area_solicitante_id}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Selecciona un área</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.nombre}
              </option>
            ))}
          </select>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Enviando...' : 'Crear Solicitud'}
      </button>
    </form>
  );
}