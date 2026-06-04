/**
 * useIniciativas.js
 * Custom hook that manages iniciativas state, loading, errors, and filters.
 * All data fetching goes through the service layer (Express BFF only).
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getIniciativas,
  createIniciativa,
  getByFilters,
} from '../services/iniciativasService';

/**
 * @returns {{
 *   iniciativas: Array,
 *   loading: boolean,
 *   error: string|null,
 *   filtroEstado: string,
 *   filtroPrioridad: string,
 *   setFiltroEstado: Function,
 *   setFiltroPrioridad: Function,
 *   clearFilters: Function,
 *   create: Function,
 *   refresh: Function,
 * }}
 */
const useIniciativas = () => {
  const [iniciativas, setIniciativas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');

  /**
   * Fetch iniciativas applying current active filters
   */
  const fetchIniciativas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (filtroEstado || filtroPrioridad) {
        data = await getByFilters(filtroEstado, filtroPrioridad);
      } else {
        data = await getIniciativas();
      }
      setIniciativas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Error al cargar las iniciativas');
      setIniciativas([]);
    } finally {
      setLoading(false);
    }
  }, [filtroEstado, filtroPrioridad]);

  // Re-fetch whenever filters change
  useEffect(() => {
    fetchIniciativas();
  }, [fetchIniciativas]);

  /**
   * Create a new iniciativa and refresh the list
   * @param {Object} data
   * @returns {Promise<Object>} Created record
   */
  const create = useCallback(async (data) => {
    const created = await createIniciativa(data);
    await fetchIniciativas();
    return created;
  }, [fetchIniciativas]);

  /**
   * Reset all active filters and reload all iniciativas
   */
  const clearFilters = useCallback(() => {
    setFiltroEstado('');
    setFiltroPrioridad('');
  }, []);

  return {
    iniciativas,
    loading,
    error,
    filtroEstado,
    filtroPrioridad,
    setFiltroEstado,
    setFiltroPrioridad,
    clearFilters,
    create,
    refresh: fetchIniciativas,
  };
};

export default useIniciativas;
