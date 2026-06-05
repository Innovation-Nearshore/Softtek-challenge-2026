import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import Button from '../atoms/Button'
import Input from '../atoms/Input'
import Textarea from '../atoms/Textarea'
import Select from '../atoms/Select'
import FormField from '../molecules/FormField'
import Heading from '../atoms/Heading'

/**
 * Organism: InitiativeForm
 * Full initiative registration/edit form with validation.
 * Supports both create and edit modes via the `initialData` prop.
 */
const InitiativeForm = ({ initialData = null, onSubmit, onCancel, loading = false }) => {
  const isEditMode = !!initialData

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nombre: '',
      responsable: '',
      estado: 'Pendiente',
      fecha_limite: '',
      prioridad: 'Media',
      descripcion: '',
    },
  })

  useEffect(() => {
    if (initialData) {
      reset({
        nombre: initialData.nombre || '',
        responsable: initialData.responsable || '',
        estado: initialData.estado || 'Pendiente',
        fecha_limite: initialData.fecha_limite
          ? initialData.fecha_limite.substring(0, 10)
          : '',
        prioridad: initialData.prioridad || 'Media',
        descripcion: initialData.descripcion || '',
      })
    } else {
      reset({
        nombre: '',
        responsable: '',
        estado: 'Pendiente',
        fecha_limite: '',
        prioridad: 'Media',
        descripcion: '',
      })
    }
  }, [initialData, reset])

  const handleFormSubmit = (data) => {
    onSubmit(data)
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <Heading level={3}>
          {isEditMode ? 'Editar Iniciativa' : 'Nueva Iniciativa'}
        </Heading>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <div className="px-6 py-5 space-y-4">
          {/* Nombre */}
          <FormField id="nombre" label="Nombre de la iniciativa" required error={errors.nombre?.message}>
            <Input
              id="nombre"
              placeholder="Ej. Implementación de ERP"
              error={!!errors.nombre}
              {...register('nombre', {
                required: 'El nombre es obligatorio',
                minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                maxLength: { value: 255, message: 'Máximo 255 caracteres' },
              })}
            />
          </FormField>

          {/* Responsable */}
          <FormField id="responsable" label="Responsable" required error={errors.responsable?.message}>
            <Input
              id="responsable"
              placeholder="Ej. Ana García"
              error={!!errors.responsable}
              {...register('responsable', {
                required: 'El responsable es obligatorio',
                minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                maxLength: { value: 100, message: 'Máximo 100 caracteres' },
              })}
            />
          </FormField>

          {/* Estado + Prioridad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField id="estado" label="Estado" required error={errors.estado?.message}>
              <Select
                id="estado"
                error={!!errors.estado}
                {...register('estado', { required: 'El estado es obligatorio' })}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En curso">En curso</option>
                <option value="Completado">Completado</option>
              </Select>
            </FormField>

            <FormField id="prioridad" label="Prioridad" required error={errors.prioridad?.message}>
              <Select
                id="prioridad"
                error={!!errors.prioridad}
                {...register('prioridad', { required: 'La prioridad es obligatoria' })}
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </Select>
            </FormField>
          </div>

          {/* Fecha límite */}
          <FormField id="fecha_limite" label="Fecha límite" required error={errors.fecha_limite?.message}>
            <Input
              id="fecha_limite"
              type="date"
              error={!!errors.fecha_limite}
              {...register('fecha_limite', {
                required: 'La fecha límite es obligatoria',
              })}
            />
          </FormField>

          {/* Descripción */}
          <FormField id="descripcion" label="Descripción" error={errors.descripcion?.message}>
            <Textarea
              id="descripcion"
              placeholder="Describe el objetivo y alcance de la iniciativa..."
              rows={4}
              error={!!errors.descripcion}
              {...register('descripcion', {
                maxLength: { value: 1000, message: 'Máximo 1000 caracteres' },
              })}
            />
          </FormField>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          {onCancel && (
            <Button variant="secondary" type="button" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" variant="primary" loading={loading}>
            {isEditMode ? 'Guardar cambios' : 'Crear iniciativa'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default InitiativeForm
