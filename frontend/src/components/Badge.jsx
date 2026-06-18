import './Badge.css';

export const StatusBadge = ({ status }) => {
  const getStatusClass = (status) => {
    const map = {
      'Recibida': 'status-recibida',
      'En revisión': 'status-en-revision',
      'Resuelta': 'status-resuelta',
      'Rechazada': 'status-rechazada',
      'Cancelada': 'status-cancelada',
    };
    return map[status] || 'status-default';
  };

  return (
    <span className={`badge status-badge ${getStatusClass(status)}`}>
      {status}
    </span>
  );
};

export const UrgencyBadge = ({ urgencia }) => {
  const getUrgencyClass = (urgencia) => {
    const map = {
      'Alta': 'urgency-alta',
      'Media': 'urgency-media',
      'Baja': 'urgency-baja',
    };
    return map[urgencia] || 'urgency-default';
  };

  return (
    <span className={`badge urgency-badge ${getUrgencyClass(urgencia)}`}>
      {urgencia}
    </span>
  );
};
