'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function SolicitanteLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email.trim()) {
        setError('Por favor ingresa tu email.');
        setLoading(false);
        return;
      }

      // Almacenar el email en sessionStorage para recuperar posteriormente
      sessionStorage.setItem('solicitante_email', email);
      
      // Redirigir a la página de mis solicitudes
      router.push(`/solicitante/mis-solicitudes`);
    } catch (err) {
      setError('Error al procesar tu solicitud. Por favor intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-6">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Acceso Solicitante</h2>
        
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="tu.email@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={150}
            required
          />
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          loading={loading}
          className="w-full mt-6"
        >
          Acceder a Mis Solicitudes
        </Button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Ingresa tu email para ver tus solicitudes, estados y detalles.
        </p>
      </div>
    </form>
  );
}
