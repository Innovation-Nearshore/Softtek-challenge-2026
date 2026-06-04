import { useState } from 'react';
import { createInitiative } from '../services/initiativesService';

const EMPTY_FORM = {
  nombre: '',
  responsable: '',
  estado: 'Pendiente',
  fecha_limite: '',
  prioridad: 'Media',
  descripcion: '',
};

export default function InitiativeForm({ onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validateForm() {
    const missing = [];
    if (!form.nombre.trim()) missing.push('Nombre');
    if (!form.responsable.trim()) missing.push('Responsable');
    if (!form.estado) missing.push('Estado');
    if (!form.fecha_limite) missing.push('Fecha límite');
    if (!form.prioridad) missing.push('Prioridad');
    if (missing.length > 0) {
      window.alert(`Los siguientes campos son obligatorios: ${missing.join(', ')}`);
      return false;
    }
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      await createInitiative(form);
      setForm(EMPTY_FORM);
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la iniciativa.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '16px', maxWidth: '560px' }}>
      <h2>Registrar Iniciativa</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '8px' }}>
          <label>Nombre *<br />
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label>Responsable *<br />
            <input
              type="text"
              name="responsable"
              value={form.responsable}
              onChange={handleChange}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label>Estado *<br />
            <select name="estado" value={form.estado} onChange={handleChange}>
              <option value="">-- Seleccionar --</option>
              <option>Pendiente</option>
              <option>En curso</option>
              <option>Completado</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label>Fecha límite *<br />
            <input
              type="date"
              name="fecha_limite"
              value={form.fecha_limite}
              onChange={handleChange}
            />
          </label>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label>Prioridad *<br />
            <select name="prioridad" value={form.prioridad} onChange={handleChange}>
              <option value="">-- Seleccionar --</option>
              <option>Alta</option>
              <option>Media</option>
              <option>Baja</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: '8px' }}>
          <label>Descripción<br />
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={3}
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Crear Iniciativa'}
        </button>
      </form>
    </div>
  );
}
