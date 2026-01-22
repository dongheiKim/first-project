import React from 'react';
import { Message, MessageType } from '../hooks/useMessage';

export interface ToastProps {
  message: Message | null;
  onClose?: () => void;
}

const getMessageStyles = (type: MessageType): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    background: '#fff',
    borderRadius: '6px',
    padding: '8px 16px',
    margin: '8px 0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    maxWidth: 400,
    whiteSpace: 'pre-line',
    fontWeight: 500,
  };

  const typeStyles: Record<MessageType, Partial<React.CSSProperties>> = {
    success: { color: 'green', border: '1px solid green' },
    error: { color: 'red', border: '1px solid red' },
    info: { color: '#333', border: '1px solid #aaa' },
    warning: { color: '#856404', border: '1px solid #ffc107', background: '#fff3cd' },
  };

  return { ...baseStyles, ...typeStyles[type] };
};

/**
 * 토스트 메시지 컴포넌트
 */
export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      className={`toast-message toast-${message.type}`}
      role="alert"
      aria-live="assertive"
      tabIndex={0}
      style={getMessageStyles(message.type)}
      onClick={onClose}
    >
      {message.text}
    </div>
  );
};
