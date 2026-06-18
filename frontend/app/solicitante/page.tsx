import SolicitanteLoginForm from '@/components/solicitante/SolicitanteLoginForm';

export const metadata = {
  title: 'Acceso Solicitante - Gestión de Solicitudes',
  description: 'Accede a tu cuenta de solicitante para ver tus solicitudes.',
};

export default function SolicitantePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <SolicitanteLoginForm />
    </div>
  );
}
