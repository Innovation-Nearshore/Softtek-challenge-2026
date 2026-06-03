import { useState, useEffect, useCallback } from 'react'
import { getCategorias, createCategoria, updateCategoria, deleteCategoria } from '../api/categorias'

/**
 * Custom hook for categorias state management.
 * SRP: encapsulates all category data-fetching, loading, and error/success state.
 * Pages only consume results and call actions without knowing HTTP details.
 */
export function useCategorias() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchAll = useCallback(() => {
    setLoading(true)
    setError('')
    getCategorias()
      .then(setCategorias)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const save = useCallback(
    async (id, data) => {
      setError('')
      if (id) {
        await updateCategoria(id, data)
        setSuccess('Categoría actualizada.')
      } else {
        await createCategoria(data)
        setSuccess('Categoría creada.')
      }
      fetchAll()
    },
    [fetchAll]
  )

  const remove = useCallback(
    async (id) => {
      setError('')
      await deleteCategoria(id)
      setSuccess('Categoría eliminada.')
      fetchAll()
    },
    [fetchAll]
  )

  const clearMessages = useCallback(() => {
    setError('')
    setSuccess('')
  }, [])

  return {
    categorias,
    loading,
    error,
    success,
    setError,
    setSuccess,
    clearMessages,
    refresh: fetchAll,
    save,
    remove,
  }
}
