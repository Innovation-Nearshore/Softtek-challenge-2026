import { useState, useEffect } from 'react'
import { createSolicitud, getTiposSolicitud, getAreas } from '../api'

const URGENCIAS = ['Alta', 'Media', 'Baja']

const initialForm = {
  tipo_solicitud_id: '',
  titulo: '',
  descripcion: '',
  urgencia: 'Media',
  solicitante: '',
  email_solicitante: '',
  area_solicitante_id: '',
}

export default function Formulario() {
  const [form, setForm] = useState(initialForm)
  const [tipos, setTipos] = useState([])
  const [areas, setAreas] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getTiposSolicitud()
      .then((res) => setTipos(res.data))
      .catch(() => setTipos([]))
    getAreas()
      .then((res) => setAreas(res.data))
      .catch(() => setAreas([]))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      const payload = {
        ...form,
        tipo_solicitud_id: Number(form.tipo_solicitud_id),
        area_solicitante_id: form.area_solicitante_id ? Number(form.area_solicitante_id) : null,
      }
      const res = await createSolicitud(payload)
      setMessage(`Solicitud creada con ticket: ${res.data.numero_ticket}`)
      setForm(initialForm)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Nueva Solicitud</h2>

      {message && <div style={styles.success}>{message}</div>}
      {error && <div style={styles.errorBox}>{error}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Tipo de Solicitud *</label>
          <select
            name="tipo_solicitud_id"
            value={form.tipo_solicitud_id}
            onChange={handleChange}
            required
            style={styles.input}
          >
            <option value="">-- Seleccionar tipo --</option>
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Título *</label>
          <input
            type="text"
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            required
            maxLength={200}
            style={styles.input}
            placeholder="Título de la solicitud"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Descripción *</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            required
            rows={4}
            style={{ ...styles.input, resize: 'vertical' }}
            placeholder="Descripción detallada..."
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Urgencia *</label>
          <select
            name="urgencia"
            value={form.urgencia}
            onChange={handleChange}
            required
            style={styles.input}
          >
            {URGENCIAS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Solicitante *</label>
          <input
            type="text"
            name="solicitante"
            value={form.solicitante}
            onChange={handleChange}
            required
            maxLength={150}
            style={styles.input}
            placeholder="Nombre completo"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Email *</label>
          <input
            type="email"
            name="email_solicitante"
            value={form.email_solicitante}
            onChange={handleChange}
            required
            maxLength={150}
            style={styles.input}
            placeholder="correo@empresa.com"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Área *</label>
          <select
            name="area_solicitante_id"
            value={form.area_solicitante_id}
            onChange={handleChange}
            required
            style={styles.input}
          >
            <option value="">-- Seleccionar área --</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Enviando...' : 'Crear Solicitud'}
        </button>
      </form>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '24px',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#1e293b',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.95rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  button: {
    marginTop: '8px',
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  success: {
    padding: '12px 16px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    border: '1px solid #86efac',
    borderRadius: '6px',
    marginBottom: '16px',
  },
  errorBox: {
    padding: '12px 16px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    marginBottom: '16px',
  },
}
