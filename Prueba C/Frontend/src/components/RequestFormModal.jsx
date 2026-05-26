/**
 * RequestFormModal.jsx
 * Module 2 — Popup form for creating a new solicitud.
 * Fields aligned with the real reto_c.solicitudes schema.
 *
 * Required payload sent to the API:
 *   tipo_solicitud_id   (integer FK → tipos_solicitud.id)
 *   urgencia            ('Alta' | 'Media' | 'Baja')
 *   descripcion         (string, min 10)
 *   solicitante         (string, min 3)
 *   email_solicitante   (valid email)
 *   area_solicitante_id (integer FK → areas.id)
 */

import { useState, useEffect, useCallback } from 'react'
import { URGENCY_LEVELS } from '../constants'

// ─── Initial state ─────────────────────────────────────────────────────────────
const INITIAL_FORM = {
  tipo_solicitud_id:   '',
  urgencia:            '',
  descripcion:         '',
  solicitante:         '',
  email_solicitante:   '',
  area_solicitante_id: '',
}

const INITIAL_ERRORS = {
  tipo_solicitud_id:   '',
  urgencia:            '',
  descripcion:         '',
  solicitante:         '',
  email_solicitante:   '',
  area_solicitante_id: '',
}

// ─── Validation ────────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(fields) {
  const errors = { ...INITIAL_ERRORS }
  let valid = true

  if (!fields.tipo_solicitud_id) {
    errors.tipo_solicitud_id = 'Seleccione un tipo de solicitud.'
    valid = false
  }

  if (!fields.urgencia) {
    errors.urgencia = 'Seleccione el nivel de urgencia.'
    valid = false
  }

  if (!fields.solicitante.trim()) {
    errors.solicitante = 'El nombre del solicitante es obligatorio.'
    valid = false
  } else if (fields.solicitante.trim().length < 3) {
    errors.solicitante = 'El nombre debe tener al menos 3 caracteres.'
    valid = false
  } else if (fields.solicitante.trim().length > 100) {
    errors.solicitante = 'El nombre no puede superar los 100 caracteres.'
    valid = false
  }

  if (!fields.email_solicitante.trim()) {
    errors.email_solicitante = 'El correo electrónico es obligatorio.'
    valid = false
  } else if (!EMAIL_RE.test(fields.email_solicitante.trim())) {
    errors.email_solicitante = 'Ingrese un correo electrónico válido.'
    valid = false
  }

  if (!fields.area_solicitante_id) {
    errors.area_solicitante_id = 'Seleccione el área correspondiente.'
    valid = false
  }

  if (!fields.descripcion.trim()) {
    errors.descripcion = 'La descripción es obligatoria.'
    valid = false
  } else if (fields.descripcion.trim().length < 10) {
    errors.descripcion = 'La descripción debe tener al menos 10 caracteres.'
    valid = false
  } else if (fields.descripcion.trim().length > 1000) {
    errors.descripcion = 'La descripción no puede superar los 1 000 caracteres.'
    valid = false
  }

  return { errors, valid }
}

// ─── Style helpers ─────────────────────────────────────────────────────────────
const BASE_INPUT =
  'w-full rounded-lg border px-3 py-2 text-sm text-gray-800 placeholder-gray-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'

const fieldClass = (hasError) =>
  `${BASE_INPUT} ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`

// ─── Sub-components ────────────────────────────────────────────────────────────
function FieldError({ message }) {
  if (!message) return null
  return (
    <p className="mt-1 text-xs text-red-600 flex items-center gap-1" role="alert">
      <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd" />
      </svg>
      {message}
    </p>
  )
}

function FieldLabel({ htmlFor, children, required }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
      {children}
      {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
    </label>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
/**
 * @param {Object}   props
 * @param {boolean}  props.isOpen
 * @param {Function} props.onClose
 * @param {Function} props.onSubmit       - async (payload) => boolean
 * @param {boolean}  [props.submitting]
 * @param {string}   [props.submitError]
 * @param {Array}    props.areas          - [{ id, nombre }] from reto_c.areas
 * @param {Array}    props.tipos          - [{ id, nombre }] from reto_c.tipos_solicitud
 */
export default function RequestFormModal({
  isOpen,
  onClose,
  onSubmit,
  submitting = false,
  submitError = '',
  areas = [],
  tipos = [],
}) {
  const [form,    setForm]    = useState(INITIAL_FORM)
  const [errors,  setErrors]  = useState(INITIAL_ERRORS)
  const [touched, setTouched] = useState({})

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(INITIAL_FORM)
      setErrors(INITIAL_ERRORS)
      setTouched({})
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape' && !submitting) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose, submitting])

  // Lock background scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    const next = { ...form, [name]: value }
    setForm(next)
    if (touched[name]) {
      const { errors: newErrs } = validate(next)
      setErrors((prev) => ({ ...prev, [name]: newErrs[name] }))
    }
  }, [form, touched])

  const handleBlur = useCallback((e) => {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    const { errors: newErrs } = validate(form)
    setErrors((prev) => ({ ...prev, [name]: newErrs[name] }))
  }, [form])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({
      tipo_solicitud_id: true,
      urgencia:          true,
      descripcion:       true,
      solicitante:       true,
      email_solicitante: true,
      area_solicitante_id: true,
    })
    const { errors: newErrs, valid } = validate(form)
    setErrors(newErrs)
    if (!valid) return

    const payload = {
      tipo_solicitud_id:   Number(form.tipo_solicitud_id),
      urgencia:            form.urgencia,
      descripcion:         form.descripcion.trim(),
      solicitante:         form.solicitante.trim(),
      email_solicitante:   form.email_solicitante.trim().toLowerCase(),
      area_solicitante_id: Number(form.area_solicitante_id),
    }

    const success = await onSubmit(payload)
    if (success) onClose()
  }

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget && !submitting) onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 id="modal-title" className="text-base font-semibold text-gray-900">
                Nueva Solicitud
              </h2>
              <p className="text-xs text-gray-500">Complete todos los campos requeridos</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100
              transition-colors disabled:opacity-50"
            aria-label="Cerrar formulario"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable body ──────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} noValidate className="px-6 py-5 space-y-5">

            {/* Server-side error */}
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            )}

            {/* ── Row 1: Tipo + Urgencia ───────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Tipo de solicitud */}
              <div>
                <FieldLabel htmlFor="tipo_solicitud_id" required>Tipo de solicitud</FieldLabel>
                <select
                  id="tipo_solicitud_id"
                  name="tipo_solicitud_id"
                  value={form.tipo_solicitud_id}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={submitting}
                  className={fieldClass(!!errors.tipo_solicitud_id)}
                >
                  <option value="">Seleccione un tipo…</option>
                  {tipos.map((t) => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
                <FieldError message={errors.tipo_solicitud_id} />
              </div>

              {/* Urgencia */}
              <div>
                <FieldLabel htmlFor="urgencia" required>Urgencia</FieldLabel>
                <select
                  id="urgencia"
                  name="urgencia"
                  value={form.urgencia}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={submitting}
                  className={fieldClass(!!errors.urgencia)}
                >
                  <option value="">Seleccione urgencia…</option>
                  {URGENCY_LEVELS.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
                <FieldError message={errors.urgencia} />
              </div>
            </div>

            {/* ── Row 2: Solicitante + Email ───────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Solicitante */}
              <div>
                <FieldLabel htmlFor="solicitante" required>Solicitante</FieldLabel>
                <input
                  id="solicitante"
                  type="text"
                  name="solicitante"
                  value={form.solicitante}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={submitting}
                  placeholder="Nombre completo"
                  maxLength={100}
                  autoComplete="name"
                  className={fieldClass(!!errors.solicitante)}
                />
                <FieldError message={errors.solicitante} />
              </div>

              {/* Email del solicitante */}
              <div>
                <FieldLabel htmlFor="email_solicitante" required>Correo electrónico</FieldLabel>
                <input
                  id="email_solicitante"
                  type="email"
                  name="email_solicitante"
                  value={form.email_solicitante}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={submitting}
                  placeholder="correo@empresa.com"
                  maxLength={255}
                  autoComplete="email"
                  className={fieldClass(!!errors.email_solicitante)}
                />
                <FieldError message={errors.email_solicitante} />
              </div>
            </div>

            {/* ── Row 3: Área ─────────────────────────────────────────────── */}
            <div>
              <FieldLabel htmlFor="area_solicitante_id" required>Área</FieldLabel>
              <select
                id="area_solicitante_id"
                name="area_solicitante_id"
                value={form.area_solicitante_id}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={submitting}
                className={fieldClass(!!errors.area_solicitante_id)}
              >
                <option value="">Seleccione un área…</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre}</option>
                ))}
              </select>
              <FieldError message={errors.area_solicitante_id} />
            </div>

            {/* ── Descripción ─────────────────────────────────────────────── */}
            <div>
              <FieldLabel htmlFor="descripcion" required>Descripción</FieldLabel>
              <textarea
                id="descripcion"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={submitting}
                placeholder="Describa en detalle la solicitud (mínimo 10 caracteres)…"
                rows={4}
                maxLength={1000}
                className={`${fieldClass(!!errors.descripcion)} resize-none`}
              />
              <div className="flex items-start justify-between mt-1">
                <FieldError message={errors.descripcion} />
                <span className="text-xs text-gray-400 ml-auto shrink-0">
                  {form.descripcion.length}/1 000
                </span>
              </div>
            </div>

            {/* ── Required note ─────────────────────────────────────────────── */}
            <p className="text-xs text-gray-400">
              <span className="text-red-500">*</span> Campos obligatorios
            </p>

            {/* ── Actions ─────────────────────────────────────────────────── */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300
                  bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50
                  focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2
                  text-sm font-medium text-white hover:bg-blue-700 focus:outline-none
                  focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Guardando…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Guardar solicitud
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
