import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './InitiativeForm.module.css'

const STATUSES = ['Pendiente', 'En curso', 'Completado']
const PRIORITIES = ['Alta', 'Media', 'Baja']

const EMPTY_FORM = {
  name: '',
  responsible: '',
  status: 'Pendiente',
  deadline: '',
  priority: 'Media',
  description: '',
}

export default function InitiativeForm({ initialData, onSubmit, title }) {
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState(null)

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name ?? '',
        responsible: initialData.responsible ?? '',
        status: initialData.status ?? 'Pendiente',
        deadline: initialData.deadline
          ? initialData.deadline.substring(0, 10)
          : '',
        priority: initialData.priority ?? 'Media',
        description: initialData.description ?? '',
      })
    }
  }, [initialData])

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'El nombre es obligatorio.'
    if (form.name.trim().length > 200) errs.name = 'Máximo 200 caracteres.'
    if (!form.responsible.trim()) errs.responsible = 'El responsable es obligatorio.'
    if (form.responsible.trim().length > 100) errs.responsible = 'Máximo 100 caracteres.'
    if (!STATUSES.includes(form.status)) errs.status = 'Estado inválido.'
    if (!PRIORITIES.includes(form.priority)) errs.priority = 'Prioridad inválida.'
    if (form.description.length > 1000) errs.description = 'Máximo 1000 caracteres.'
    return errs
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setServerError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    setSubmitting(true)
    setServerError(null)

    const payload = {
      ...form,
      deadline: form.deadline || null,
    }

    const result = await onSubmit(payload)
    setSubmitting(false)

    if (result?.success) {
      navigate('/')
    } else {
      setServerError(result?.error ?? 'Error al guardar la iniciativa.')
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>{title}</h2>

      {serverError && (
        <div className={styles.serverError} role="alert">
          ⚠ {serverError}
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {/* Nombre */}
        <div className={styles.field}>
          <label htmlFor="name">Nombre <span aria-hidden="true">*</span></label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            maxLength={200}
            placeholder="Nombre de la iniciativa"
            className={errors.name ? styles.inputError : ''}
            aria-describedby={errors.name ? 'name-err' : undefined}
          />
          {errors.name && <span id="name-err" className={styles.error}>{errors.name}</span>}
        </div>

        {/* Responsable */}
        <div className={styles.field}>
          <label htmlFor="responsible">Responsable <span aria-hidden="true">*</span></label>
          <input
            id="responsible"
            name="responsible"
            type="text"
            value={form.responsible}
            onChange={handleChange}
            maxLength={100}
            placeholder="Nombre del responsable"
            className={errors.responsible ? styles.inputError : ''}
            aria-describedby={errors.responsible ? 'responsible-err' : undefined}
          />
          {errors.responsible && <span id="responsible-err" className={styles.error}>{errors.responsible}</span>}
        </div>

        {/* Estado + Prioridad */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="status">Estado <span aria-hidden="true">*</span></label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className={errors.status ? styles.inputError : ''}
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.status && <span className={styles.error}>{errors.status}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="priority">Prioridad <span aria-hidden="true">*</span></label>
            <select
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className={errors.priority ? styles.inputError : ''}
            >
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            {errors.priority && <span className={styles.error}>{errors.priority}</span>}
          </div>
        </div>

        {/* Fecha límite */}
        <div className={styles.field}>
          <label htmlFor="deadline">Fecha límite</label>
          <input
            id="deadline"
            name="deadline"
            type="date"
            value={form.deadline}
            onChange={handleChange}
            className={errors.deadline ? styles.inputError : ''}
          />
          {errors.deadline && <span className={styles.error}>{errors.deadline}</span>}
        </div>

        {/* Descripción */}
        <div className={styles.field}>
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            maxLength={1000}
            placeholder="Descripción opcional de la iniciativa…"
            className={errors.description ? styles.inputError : ''}
          />
          <span className={styles.charCount}>{form.description.length}/1000</span>
          {errors.description && <span className={styles.error}>{errors.description}</span>}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnCancel}
            onClick={() => navigate('/')}
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.btnSubmit}
            disabled={submitting}
          >
            {submitting ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}
