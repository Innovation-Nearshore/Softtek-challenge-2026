import { useEffect, useState, useCallback } from 'react'
import { useInitiatives } from '../context/InitiativesContext'
import StatsCards from '../components/StatsCards'
import InitiativesTable from '../components/InitiativesTable'
import PriorityPieChart from '../components/PriorityPieChart'
import PriorityFilter from '../components/PriorityFilter'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  const {
    filteredInitiatives,
    stats,
    priorityStats,
    loading,
    error,
    filter,
    priorityFilter,
    fetchInitiatives,
    fetchStats,
    fetchPriorityStats,
    removeInitiative,
    setFilter,
    setPriorityFilter,
  } = useInitiatives()

  const [confirmDelete, setConfirmDelete] = useState(null) // { id, name }
  const [deleteError, setDeleteError] = useState(null)

  const load = useCallback(async () => {
    await Promise.all([fetchInitiatives(), fetchStats(), fetchPriorityStats()])
  }, [fetchInitiatives, fetchStats, fetchPriorityStats])

  useEffect(() => {
    load()
  }, [load])

  function handleDeleteRequest(id, name) {
    setConfirmDelete({ id, name })
    setDeleteError(null)
  }

  async function handleDeleteConfirm() {
    if (!confirmDelete) return
    const result = await removeInitiative(confirmDelete.id)
    if (result.success) {
      setConfirmDelete(null)
    } else {
      setDeleteError(result.error)
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard de Iniciativas</h1>
        <button className={styles.btnRefresh} onClick={load} title="Actualizar datos">
          🔄 Actualizar
        </button>
      </div>

      {error && (
        <div className={styles.errorBanner} role="alert">
          ⚠ {error}
        </div>
      )}

      <StatsCards stats={stats} onFilter={setFilter} activeFilter={filter} />

      <div className={styles.chartsRow}>
        <PriorityPieChart
          distribution={priorityStats?.distribution ?? []}
          total={priorityStats?.total ?? 0}
        />
      </div>

      <div className={styles.tableHeader}>
        <h2 className={styles.tableTitle}>
          {filter === 'all' && priorityFilter === 'all'
            ? 'Todas las iniciativas'
            : [filter !== 'all' && filter, priorityFilter !== 'all' && priorityFilter]
                .filter(Boolean)
                .join(' · ')}
          <span className={styles.count}>{filteredInitiatives.length}</span>
        </h2>
        <div className={styles.tableFilters}>
          <PriorityFilter activePriority={priorityFilter} onFilter={setPriorityFilter} />
          {(filter !== 'all' || priorityFilter !== 'all') && (
            <button
              className={styles.btnClear}
              onClick={() => { setFilter('all'); setPriorityFilter('all') }}
            >
              ✕ Quitar filtros
            </button>
          )}
        </div>
      </div>

      <InitiativesTable
        initiatives={filteredInitiatives}
        onDelete={handleDeleteRequest}
        loading={loading}
      />

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className={styles.modal}>
            <h3 id="modal-title" className={styles.modalTitle}>Confirmar eliminación</h3>
            <p className={styles.modalBody}>
              ¿Estás seguro de que deseas eliminar la iniciativa{' '}
              <strong>&ldquo;{confirmDelete.name}&rdquo;</strong>? Esta acción no se puede deshacer.
            </p>
            {deleteError && (
              <p className={styles.modalError}>⚠ {deleteError}</p>
            )}
            <div className={styles.modalActions}>
              <button
                className={styles.btnModalCancel}
                onClick={() => setConfirmDelete(null)}
              >
                Cancelar
              </button>
              <button
                className={styles.btnModalDelete}
                onClick={handleDeleteConfirm}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
