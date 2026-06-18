'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSolicitudesBySolicitante } from '@/services/api';
import type { Solicitud } from '@/types';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Badge, { urgenciaBadgeVariant, estadoBadgeVariant } from '@/components/ui/Badge';

interface SolicitanteListClientProps {
  email: string;
}

export default function SolicitanteListClient({ email }: SolicitanteListClientProps) {
  const router = useRouter();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getSolicitudesBySolicitante(email);
        setSolicitudes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al obtener solicitudes');
        setSolicitudes([]);
      } finally {
        setLoading(false);
      }
    };

    if (email) {
      fetchData();
    }
  }, [email]);

  const handleLogout = () => {
    sessionStorage.removeItem('solicitante_email');
    router.push('/solicitante');
  };

  const handleViewDetail = (id: number) => {
    router.push(`/solicitante/solicitudes/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-gray-600">Cargando solicitudes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
        <p className="font-semibold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  const columns = [
    {
      key: 'numero_ticket',
      header: 'Ticket',
      render: (row: Solicitud) => <span className="font-mono text-sm">{row.numero_ticket}</span>,
    },
    {
      key: 'titulo',
      header: 'Título',
      render: (row: Solicitud) => <span className="font-medium">{row.titulo}</span>,
    },
    {
      key: 'urgencia',
      header: 'Urgencia',
      render: (row: Solicitud) => <Badge variant={urgenciaBadgeVariant(row.urgencia)}>{row.urgencia}</Badge>,
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (row: Solicitud) => (
        <Badge variant={estadoBadgeVariant(row.estado)}>
          {row.estado}
        </Badge>
      ),
    },
    {
      key: 'fecha_creacion',
      header: 'Creada',
      render: (row: Solicitud) => new Date(row.fecha_creacion).toLocaleDateString('es-AR'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis Solicitudes</h2>
          <p className="text-gray-600 text-sm mt-1">{email}</p>
        </div>
        <Button onClick={handleLogout} variant="ghost">
          Cerrar Sesión
        </Button>
      </div>

      {solicitudes.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center border border-gray-200">
          <p className="text-gray-600 mb-4">No tienes solicitudes registradas.</p>
          <Button onClick={() => router.push('/solicitudes/nueva')} className="mx-auto">
            Crear Nueva Solicitud
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <Table
            data={solicitudes}
            columns={columns}
            keyExtractor={(row) => row.id}
          />
          <div className="p-4 text-sm text-gray-600">
            Haz clic en una fila para ver los detalles de la solicitud.
          </div>
        </div>
      )}
    </div>
  );
}
