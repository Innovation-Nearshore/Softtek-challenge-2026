'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSolicitudById } from '@/services/api';
import type { Solicitud } from '@/types';
import Button from '@/components/ui/Button';
import Badge, { urgenciaBadgeVariant, estadoBadgeVariant } from '@/components/ui/Badge';

interface SolicitanteDetalleViewProps {
  id: number;
  email: string;
}

export default function SolicitanteDetalleView({ id, email }: SolicitanteDetalleViewProps) {
  const router = useRouter();
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getSolicitudById(id);
        
        // Validar que la solicitud pertenece al solicitante autenticado
        if (data.email_solicitante !== email) {
          setError('No tienes acceso a esta solicitud.');
          setSolicitud(null);
          return;
        }
        
        setSolicitud(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al obtener la solicitud');
        setSolicitud(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, email]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-gray-600">Cargando solicitud...</div>
      </div>
    );
  }

  if (error || !solicitud) {
    return (
      <div className="space-y-4">
        <Button onClick={() => router.back()} variant="ghost">
          ← Volver
        </Button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-semibold">Error</p>
          <p>{error || 'Solicitud no encontrada'}</p>
        </div>
      </div>
    );
  }

  const estadoProgress = {
    'Recibida': 0,
    'En revisión': 50,
    'Resuelta': 100,
  } as const;

  const progress = estadoProgress[solicitud.estado as keyof typeof estadoProgress] || 0;

  return (
    <div className="space-y-6">
      <Button onClick={() => router.back()} variant="ghost">
        ← Volver a Mis Solicitudes
      </Button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600">Número de Ticket</p>
              <h1 className="text-3xl font-bold text-gray-900">{solicitud.numero_ticket}</h1>
            </div>
            <div className="text-right">
              <Badge variant={urgenciaBadgeVariant(solicitud.urgencia)}>
                Urgencia: {solicitud.urgencia}
              </Badge>
              <Badge variant={estadoBadgeVariant(solicitud.estado)} className="ml-2">
                {solicitud.estado}
              </Badge>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mt-4">{solicitud.titulo}</h2>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progreso</span>
            <span className="text-sm text-gray-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Descripción */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{solicitud.descripcion}</p>
          </section>

          {/* Información General */}
          <section className="grid grid-cols-2 gap-6">
            <DetailField label="Tipo de Solicitud" value={solicitud.tipo_solicitud} />
            <DetailField label="Área Solicitante" value={solicitud.area_solicitante} />
            <DetailField
              label="Fecha de Creación"
              value={new Date(solicitud.fecha_creacion).toLocaleDateString('es-AR')}
            />
            {solicitud.fecha_vencimiento && (
              <DetailField
                label="Fecha de Vencimiento"
                value={new Date(solicitud.fecha_vencimiento).toLocaleDateString('es-AR')}
              />
            )}
          </section>

          {/* Asignación */}
          {solicitud.area_asignada_id && (
            <section className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Asignación</h3>
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Área Asignada" value={solicitud.area_asignada_id?.toString() || 'N/A'} />
                <DetailField label="Asignado a" value={solicitud.asignado_a || 'Pendiente'} />
              </div>
            </section>
          )}

          {/* Resolución (mostrar solo si está resuelto) */}
          {solicitud.estado === 'Resuelta' && (
            <section className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Resolución</h3>
              {solicitud.fecha_resolucion && (
                <DetailField
                  label="Fecha de Resolución"
                  value={new Date(solicitud.fecha_resolucion).toLocaleDateString('es-AR')}
                />
              )}
              {solicitud.solucion && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Solución
                  </label>
                  <p className="text-gray-700 whitespace-pre-wrap">{solicitud.solucion}</p>
                </div>
              )}
              {solicitud.calificacion && (
                <DetailField
                  label="Tu Calificación"
                  value={`${solicitud.calificacion}/5 ⭐`}
                />
              )}
            </section>
          )}

          {/* Timeline de Estados */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estados</h3>
            <div className="space-y-4">
              {['Recibida', 'En revisión', 'Resuelta'].map((estado, idx) => (
                <div key={estado} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        solicitud.estado === estado ||
                        (solicitud.estado === 'Resuelta' && estado === 'Recibida') ||
                        (solicitud.estado === 'Resuelta' && estado === 'En revisión')
                          ? 'bg-green-600'
                          : 'bg-gray-300'
                      }`}
                    >
                      ✓
                    </div>
                    {idx < 2 && (
                      <div className={`w-1 h-8 ${solicitud.estado === 'Resuelta' || (solicitud.estado === 'En revisión' && idx === 0) ? 'bg-green-600' : 'bg-gray-300'}`} />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="font-medium text-gray-900">{estado}</p>
                    <p className="text-sm text-gray-600">
                      {solicitud.estado === estado ? 'Estado actual' : 'Completado'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <p className="text-gray-900">{value}</p>
    </div>
  );
}
