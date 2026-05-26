/**
 * Shared constants for the Gestor de Solicitudes Internas application.
 */

/** Available request types */
export const REQUEST_TYPES = [
  { value: 'Soporte',       label: 'Soporte' },
  { value: 'Aprobación',    label: 'Aprobación' },
  { value: 'Requerimiento', label: 'Requerimiento' },
  { value: 'RRHH',          label: 'Recursos Humanos' },
  { value: 'TI',            label: 'Tecnología (TI)' },
  { value: 'Operaciones',   label: 'Operaciones' },
  { value: 'Finanzas',      label: 'Finanzas' },
]

/** Urgency levels */
export const URGENCY_LEVELS = [
  { value: 'Alta',  label: 'Alta' },
  { value: 'Media', label: 'Media' },
  { value: 'Baja',  label: 'Baja' },
]

/** Request status options and valid transitions */
export const REQUEST_STATUSES = [
  { value: 'Recibida',    label: 'Recibida' },
  { value: 'En revisión', label: 'En revisión' },
  { value: 'Resuelta',    label: 'Resuelta' },
]

/** Business areas */
export const AREAS = [
  { value: 'RRHH',        label: 'Recursos Humanos' },
  { value: 'TI',          label: 'Tecnología (TI)' },
  { value: 'Operaciones', label: 'Operaciones' },
  { value: 'Finanzas',    label: 'Finanzas' },
  { value: 'Legal',       label: 'Legal' },
  { value: 'Comercial',   label: 'Comercial' },
  { value: 'General',     label: 'General' },
]

/** CSS badge class map for urgency */
export const URGENCY_BADGE_CLASS = {
  'Alta':  'badge badge-alta',
  'Media': 'badge badge-media',
  'Baja':  'badge badge-baja',
}

/** CSS badge class map for status */
export const STATUS_BADGE_CLASS = {
  'Recibida':    'badge badge-recibida',
  'En revisión': 'badge badge-revision',
  'Resuelta':    'badge badge-resuelta',
}

/** Backend API base URL (proxied by Vite in dev) */
export const API_BASE_URL = '/api'
