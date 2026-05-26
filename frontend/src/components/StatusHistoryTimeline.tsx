import React from 'react';
import type { StatusHistoryEntry, RequestStatus } from '../types/request';

interface StatusHistoryTimelineProps {
  history: StatusHistoryEntry[];
  loading: boolean;
  error: string | null;
}

const STATUS_COLORS: Record<RequestStatus, string> = {
  Recibida: 'bg-blue-100 text-blue-800 border-blue-300',
  'En revisión': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Resuelta: 'bg-green-100 text-green-800 border-green-300',
};

const STATUS_DOT: Record<RequestStatus, string> = {
  Recibida: 'bg-blue-500',
  'En revisión': 'bg-yellow-500',
  Resuelta: 'bg-green-500',
};

function StatusBadge({ status }: { status: RequestStatus | null }) {
  if (!status) return <span className="text-gray-400 italic text-xs">Estado inicial</span>;
  const colorClass = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-800 border-gray-300';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
      {status}
    </span>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const StatusHistoryTimeline: React.FC<StatusHistoryTimelineProps> = ({ history, loading, error }) => {
  if (loading) {
    return (
      <div className="space-y-3 py-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-start gap-3 animate-pulse">
            <div className="w-3 h-3 mt-1 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400 text-sm">
        <svg className="mx-auto mb-2 w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Sin historial de cambios de estado
      </div>
    );
  }

  return (
    <ol className="relative border-l-2 border-gray-200 ml-2 space-y-4">
      {history.map((entry, index) => {
        const dotColor = index === 0 ? (STATUS_DOT[entry.new_status] ?? 'bg-gray-400') : 'bg-gray-300';
        return (
          <li key={entry.id} className="ml-5">
            <span className={`absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white ${dotColor}`} />
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={entry.previous_status} />
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <StatusBadge status={entry.new_status} />
              </div>
              <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                <span>{formatDate(entry.changed_at)}</span>
                {entry.changed_by && entry.changed_by !== 'system' && (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {entry.changed_by}
                  </span>
                )}
              </div>
              {entry.comment && (
                <p className="mt-1.5 text-xs text-gray-600 italic border-t border-gray-100 pt-1.5">
                  &ldquo;{entry.comment}&rdquo;
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

export default StatusHistoryTimeline;
