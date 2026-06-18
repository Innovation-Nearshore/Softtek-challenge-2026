'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SolicitanteListClient from '@/components/solicitante/SolicitanteListClient';

export default function MisSolicitudesPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Verificar si el email está almacenado en sessionStorage
    const storedEmail = sessionStorage.getItem('solicitante_email');
    if (!storedEmail) {
      router.push('/solicitante');
      return;
    }
    setEmail(storedEmail);
    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Verificando sesión...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <SolicitanteListClient email={email} />
      </div>
    </div>
  );
}
