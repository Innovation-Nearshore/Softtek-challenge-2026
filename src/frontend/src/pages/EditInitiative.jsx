import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useInitiatives } from '../context/InitiativesContext'
import { getInitiativeById } from '../services/initiativesService'
import InitiativeForm from '../components/InitiativeForm'
import styles from './EditInitiative.module.css'

export default function EditInitiative() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { editInitiative } = useInitiatives()

  const [initiative, setInitiative] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoadingData(true)
    setLoadError(null)

    getInitiativeById(id)
      .then((res) => {
        if (!cancelled) {
          setInitiative(res.data ?? res)
          setLoadingData(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err.message)
          setLoadingData(false)
        }
      })

    return () => { cancelled = true }
  }, [id])

  if (loadingData) {
    return (
      <div className={styles.center}>
        <span className={styles.spinner} aria-label="Cargando…" />
        <p>Cargando iniciativa…</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className={styles.center}>
        <p className={styles.error}>⚠ {loadError}</p>
        <button className={styles.btnBack} onClick={() => navigate('/')}>
          ← Volver al Dashboard
        </button>
      </div>
    )
  }

  const handleSubmit = (formData) => editInitiative(id, formData)

  return (
    <InitiativeForm
      title="Editar Iniciativa"
      initialData={initiative}
      onSubmit={handleSubmit}
    />
  )
}
