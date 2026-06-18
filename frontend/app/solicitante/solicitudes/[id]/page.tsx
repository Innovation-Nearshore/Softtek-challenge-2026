'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SolicitanteDetalleView from '@/components/solicitante/SolicitanteDetalleView';

export default function SolicitanteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [checked, setChecked] = useState(false);
  const [solicitudId, setSolicitudId] = useState<number | null>(null);

  useEffect(() => {
    // Verificar si el email está almacenado en sessionStorage
    const storedEmail = sessionStorage.getItem('solicitante_email');
    if (!storedEmail) {
      router.push('/solicitante');
      return;
    }
    setEmail(storedEmail);
    
    // Resolver el params Promise
    params.then((p) => {
      setSolicitudId(parseInt(p.id, 10));
      setChecked(true);
    });
  }, [router, params]);

  if (!checked || solicitudId === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Verificando sesión...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <SolicitanteDetalleView id={solicitudId} email={email} />
      </div>
    </div>
  );
}
