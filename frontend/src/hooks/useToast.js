import { useState, useCallback } from 'react'

/**
 * Hook: useToast
 * Manages toast notification state.
 * Single responsibility: notification lifecycle management.
 */
const useToast = () => {
  const [toast, setToast] = useState({ message: '', type: 'info' })

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type })
  }, [])

  const hideToast = useCallback(() => {
    setToast({ message: '', type: 'info' })
  }, [])

  const showSuccess = useCallback(
    (message) => showToast(message, 'success'),
    [showToast]
  )

  const showError = useCallback(
    (message) => showToast(message, 'error'),
    [showToast]
  )

  return {
    toast,
    showToast,
    hideToast,
    showSuccess,
    showError,
  }
}

export default useToast
