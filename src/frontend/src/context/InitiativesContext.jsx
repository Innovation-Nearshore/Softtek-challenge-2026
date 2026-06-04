import { createContext, useContext, useReducer, useCallback } from 'react'
import {
  getInitiatives,
  getStats,
  getPriorityStats,
  createInitiative,
  updateInitiative,
  deleteInitiative,
} from '../services/initiativesService'

// ── State shape ──────────────────────────────────────────────────────────────
const initialState = {
  initiatives: [],
  stats: { total: 0, pending: 0, in_progress: 0, completed: 0 },
  priorityStats: { total: 0, distribution: [] },
  loading: false,
  error: null,
  filter: 'all',         // 'all' | 'Pendiente' | 'En curso' | 'Completado'
  priorityFilter: 'all', // 'all' | 'Alta' | 'Media' | 'Baja'
}

// ── Reducer ───────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null }
    case 'SET_INITIATIVES':
      return { ...state, loading: false, initiatives: action.payload }
    case 'SET_STATS':
      return { ...state, stats: action.payload }
    case 'SET_PRIORITY_STATS':
      return { ...state, priorityStats: action.payload }
    case 'ADD_INITIATIVE':
      return { ...state, loading: false, initiatives: [action.payload, ...state.initiatives] }
    case 'UPDATE_INITIATIVE':
      return {
        ...state,
        loading: false,
        initiatives: state.initiatives.map((i) =>
          i.id === action.payload.id ? action.payload : i
        ),
      }
    case 'DELETE_INITIATIVE':
      return {
        ...state,
        loading: false,
        initiatives: state.initiatives.filter((i) => i.id !== action.payload),
      }
    case 'SET_FILTER':
      return { ...state, filter: action.payload }
    case 'SET_PRIORITY_FILTER':
      return { ...state, priorityFilter: action.payload }
    case 'ERROR':
      return { ...state, loading: false, error: action.payload }
    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
const InitiativesContext = createContext(null)

export function InitiativesProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const fetchInitiatives = useCallback(async (params = {}) => {
    dispatch({ type: 'LOADING' })
    try {
      const data = await getInitiatives(params)
      dispatch({ type: 'SET_INITIATIVES', payload: data.data ?? data })
    } catch (err) {
      dispatch({ type: 'ERROR', payload: err.message })
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const data = await getStats()
      dispatch({ type: 'SET_STATS', payload: data.data ?? data })
    } catch {
      // non-blocking
    }
  }, [])

  const fetchPriorityStats = useCallback(async () => {
    try {
      const data = await getPriorityStats()
      dispatch({ type: 'SET_PRIORITY_STATS', payload: data.data ?? data })
    } catch {
      // non-blocking
    }
  }, [])

  const addInitiative = useCallback(async (formData) => {
    dispatch({ type: 'LOADING' })
    try {
      const data = await createInitiative(formData)
      dispatch({ type: 'ADD_INITIATIVE', payload: data.data ?? data })
      await Promise.all([fetchStats(), fetchPriorityStats()])
      return { success: true }
    } catch (err) {
      dispatch({ type: 'ERROR', payload: err.message })
      return { success: false, error: err.message }
    }
  }, [fetchStats, fetchPriorityStats])

  const editInitiative = useCallback(async (id, formData) => {
    dispatch({ type: 'LOADING' })
    try {
      const data = await updateInitiative(id, formData)
      dispatch({ type: 'UPDATE_INITIATIVE', payload: data.data ?? data })
      await Promise.all([fetchStats(), fetchPriorityStats()])
      return { success: true }
    } catch (err) {
      dispatch({ type: 'ERROR', payload: err.message })
      return { success: false, error: err.message }
    }
  }, [fetchStats, fetchPriorityStats])

  const removeInitiative = useCallback(async (id) => {
    dispatch({ type: 'LOADING' })
    try {
      await deleteInitiative(id)
      dispatch({ type: 'DELETE_INITIATIVE', payload: id })
      await Promise.all([fetchStats(), fetchPriorityStats()])
      return { success: true }
    } catch (err) {
      dispatch({ type: 'ERROR', payload: err.message })
      return { success: false, error: err.message }
    }
  }, [fetchStats, fetchPriorityStats])

  const setFilter = useCallback((filter) => {
    dispatch({ type: 'SET_FILTER', payload: filter })
  }, [])

  const setPriorityFilter = useCallback((priority) => {
    dispatch({ type: 'SET_PRIORITY_FILTER', payload: priority })
  }, [])

  const filteredInitiatives = state.initiatives.filter((i) => {
    const statusMatch = state.filter === 'all' || i.status === state.filter
    const priorityMatch = state.priorityFilter === 'all' || i.priority === state.priorityFilter
    return statusMatch && priorityMatch
  })

  return (
    <InitiativesContext.Provider
      value={{
        ...state,
        filteredInitiatives,
        fetchInitiatives,
        fetchStats,
        fetchPriorityStats,
        addInitiative,
        editInitiative,
        removeInitiative,
        setFilter,
        setPriorityFilter,
      }}
    >
      {children}
    </InitiativesContext.Provider>
  )
}

export function useInitiatives() {
  const ctx = useContext(InitiativesContext)
  if (!ctx) throw new Error('useInitiatives must be used within InitiativesProvider')
  return ctx
}
