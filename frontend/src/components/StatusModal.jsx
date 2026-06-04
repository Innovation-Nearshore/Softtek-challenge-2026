import { useState } from 'react';
import { initiativesService } from '../services/api';
import './StatusModal.css';

const VALID_STATUSES = ['Pendiente', 'En curso', 'Completado'];

function StatusModal({ initiative, onClose, onUpdated }) {
  const [selectedStatus, setSelectedStatus] = useState(initiative?.estado || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStatus) {
      setError('Debes seleccionar un estado.');
      return;
    }
    if (!VALID_STATUSES.includes(selectedStatus)) {
      setError('El estado seleccionado no es válido.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await initiativesService.updateStatus(initiative.id, selectedStatus);
      // Backend returns { message, initiative }
      onUpdated(res.data.initiative || res.data);
    } catch (err) {
      setError(
        err?.response?.data?.errors?.estado ||
        err?.friendlyMessage ||
        'No se pudo actualizar el estado. Por favor, intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-modal-title"
      onClick={handleOverlayClick}
    >
      <div className="modal">
        <div className="modal__header">
          <h2 id="status-modal-title" className="modal__title">
            Actualizar Estado
          </h2>
          <button
            className="modal__close-btn"
            onClick={onClose}
            aria-label="Cerrar modal"
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal__body">
            <p className="status-modal__initiative-name">
              <span>Iniciativa:</span> <strong>{initiative?.nombre}</strong>
            </p>

            <div className="status-modal__options" role="radiogroup" aria-label="Seleccionar estado">
              {VALID_STATUSES.map((status) => (
                <label
                  key={status}
                  className={`status-option ${selectedStatus === status ? 'status-option--selected' : ''} status-option--${status.toLowerCase().replace(' ', '-')}`}
                >
                  <input
                    type="radio"
                    name="estado"
                    value={status}
                    checked={selectedStatus === status}
                    onChange={() => {
                      setSelectedStatus(status);
                      setError('');
                    }}
                    className="sr-only"
                  />
                  <span className="status-option__dot"></span>
                  <span className="status-option__label">{status}</span>
                  {selectedStatus === status && (
                    <svg className="status-option__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </label>
              ))}
            </div>

            {error && (
              <div className="alert alert--error" role="alert">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="modal__footer">
            <button
              type="button"
              className="btn btn--secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading || !selectedStatus}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Guardando...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Guardar Estado
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StatusModal;
