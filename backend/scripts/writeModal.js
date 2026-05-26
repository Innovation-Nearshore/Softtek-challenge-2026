const fs = require('fs');
const path = require('path');

const content = `import React, { useEffect, useCallback, useState } from 'react';
import type { Request, Urgency, RequestStatus, StatusHistoryEntry } from '../types/request';
import { requestService } from '../services/requestService';
import StatusHistoryTimeline from './StatusHistoryTimeline';

interface RequestDetailModalProps {
  request: Request | null;
  isOpen: boolean;
  onClose: () => void;
}

const URGENCY_BADGE: Record<Urgency, string> = {
  Alta: 'bg-red-100 text-red-700 border border-red-200',
  Media: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  Baja: 'bg-green-100 text-green-700 border border-green-200',
};

const STATUS_BADGE: Record<RequestStatus, string> = {
  Recibida: 'bg-blue-100 text-blue-700 border border-blue-200',
  'En revisión': 'bg-orange-100 text-orange-700 border border-orange-200',
  Resuelta: 'bg-gray-100 text-gray-600 border border-gray-200',
};

const URGENCY_DOT: Record<Urgency, string> = {
  Alta: 'bg-red-500',
  Media: 'bg-yellow-500',
  Baja: 'bg-green-500',
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const RequestDetailModal: React.FC<RequestDetailModalProps> = ({ request, isOpen, onClose }) => {
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Fetch history whenever the request id or updated_at changes
  useEffect(() => {
    if (!isOpen || !request) return;
    let cancelled = false;
    setHistoryLoading(true);
    setHistoryError(null);
    requestService
      .getHistory(request.id)
      .then((data) => {
        if (!cancelled) setHistory(data);
      })
      .catch(() => {
        if (!cancelled) setHistoryError('No se pudo cargar el historial de cambios.');
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => { cancelled = true; };
  }, [isOpen, request?.id, request?.updated_at]);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !request) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleOverlayClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal panel */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-bold text-gray-900">Detalle de Solicitud</h2>
              <p className="text-xs text-gray-400 font-mono">ID #{request.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="ml-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex-1 space-y-5">
          {/* Status + Urgency badges row */}
          <div className="flex flex-wrap gap-2">
            <span className={\`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border \${URGENCY_BADGE[request.urgency]}\`}>
              <span className={\`w-2 h-2 rounded-full \${URGENCY_DOT[request.urgency]}\`} />
              Urgencia: {request.urgency}
            </span>
            <span className={\`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border \${STATUS_BADGE[request.status]}\`}>
              Estado: {request.status}
            </span>
          </div>

          {/* Grid of fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tipo de Solicitud</p>
              <p className="text-sm font-medium text-gray-800">{request.type}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Área</p>
              <p className="text-sm font-medium text-gray-800">{request.area}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Solicitante</p>
              <p className="text-sm font-medium text-gray-800">{request.requester}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Estado Actual</p>
              <span className={\`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border \${STATUS_BADGE[request.status]}\`}>
                {request.status}
              </span>
            </div>
          </div>

          {/* Descripción — full width */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Descripción</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{request.description}</p>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Fecha de Creación</p>
              <p className="text-sm text-gray-700">{formatDate(request.created_at)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Última Actualización</p>
              <p className="text-sm text-gray-700">{formatDate(request.updated_at)}</p>
            </div>
          </div>

          {/* History Timeline */}
          <div className="border-t border-gray-100 pt-5">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Historial de Cambios de Estado
            </h3>
            <StatusHistoryTimeline history={history} loading={historyLoading} error={historyError} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end sticky bottom-0 bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailModal;
`;

const outPath = path.join(__dirname, '../../frontend/src/components/RequestDetailModal.tsx');
fs.writeFileSync(outPath, content, 'utf8');
console.log('Written:', outPath);
