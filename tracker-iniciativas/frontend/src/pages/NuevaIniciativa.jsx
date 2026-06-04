import { useNavigate } from 'react-router-dom';
import IniciativaForm from '../components/IniciativaForm';

/**
 * Página "Nueva Iniciativa".
 * Renderiza el formulario de creación y redirige al Dashboard tras el éxito.
 */
export default function NuevaIniciativa() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Redirige al dashboard después de crear la iniciativa
    navigate('/', { replace: true });
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva Iniciativa</h1>
        <p className="mt-1 text-sm text-gray-500">
          Completa los campos para registrar una nueva iniciativa en el sistema.
        </p>
      </div>

      {/* Form card */}
      <IniciativaForm onSuccess={handleSuccess} />
    </div>
  );
}
