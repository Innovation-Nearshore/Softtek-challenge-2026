import './Message.css';

export const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="message message-error" role="alert">
      <div className="message-content">
        <span className="message-icon">❌</span>
        <span className="message-text">{message}</span>
      </div>
      {onClose && (
        <button className="message-close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>
      )}
    </div>
  );
};
