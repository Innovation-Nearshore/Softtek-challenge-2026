import { useEffect, useState } from 'react';
import './AlertNotification.css';

/**
 * AlertNotification
 *
 * Props:
 *  - type:        'error' | 'warning' | 'success' | 'info'  (default: 'error')
 *  - title:       Optional bold heading line
 *  - messages:    string | string[]  — one or more messages to display
 *  - onClose:     () => void  — called when the user dismisses or the auto-timer fires
 *  - autoDismiss: number (ms) | false  — auto-close delay; default false (manual only)
 */
export const AlertNotification = ({
  type = 'error',
  title,
  messages,
  onClose,
  autoDismiss = false,
}) => {
  const [visible, setVisible] = useState(true);

  /* Auto-dismiss timer */
  useEffect(() => {
    if (!autoDismiss) return;
    const timer = setTimeout(() => handleClose(), autoDismiss);
    return () => clearTimeout(timer);
  }, [autoDismiss]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  /* Normalise messages to array */
  const msgList = Array.isArray(messages)
    ? messages
    : messages
    ? [messages]
    : [];

  /* Icon per type */
  const icons = {
    error: '❌',
    warning: '⚠️',
    success: '✅',
    info: 'ℹ️',
  };

  return (
    <div className={`alert-notification alert-notification--${type}`} role="alert" aria-live="assertive">
      <span className="alert-notification__icon">{icons[type]}</span>

      <div className="alert-notification__body">
        {title && <strong className="alert-notification__title">{title}</strong>}

        {msgList.length === 1 ? (
          <span className="alert-notification__text">{msgList[0]}</span>
        ) : msgList.length > 1 ? (
          <ul className="alert-notification__list">
            {msgList.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        ) : null}
      </div>

      {onClose && (
        <button
          className="alert-notification__close"
          onClick={handleClose}
          aria-label="Cerrar notificación"
          type="button"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default AlertNotification;
