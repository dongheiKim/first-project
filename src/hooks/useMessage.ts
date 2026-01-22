import { useState, useCallback } from 'react';

export type MessageType = 'success' | 'error' | 'info' | 'warning';

export interface Message {
  type: MessageType;
  text: string;
}

export interface UseMessageOptions {
  timeout?: number;
}

export interface UseMessageReturn {
  message: Message | null;
  showMessage: (type: MessageType, text: string) => void;
  clearMessage: () => void;
  showSuccess: (text: string) => void;
  showError: (text: string) => void;
  showInfo: (text: string) => void;
}

/**
 * 메시지/토스트 표시를 관리하는 커스텀 훅
 */
export function useMessage(options: UseMessageOptions = {}): UseMessageReturn {
  const { timeout = 4000 } = options;
  const [message, setMessage] = useState<Message | null>(null);

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);

  const showMessage = useCallback((type: MessageType, text: string) => {
    setMessage({ type, text });
    
    if (timeout > 0) {
      setTimeout(clearMessage, timeout);
    }
  }, [timeout, clearMessage]);

  const showSuccess = useCallback((text: string) => {
    showMessage('success', text);
  }, [showMessage]);

  const showError = useCallback((text: string) => {
    showMessage('error', text);
  }, [showMessage]);

  const showInfo = useCallback((text: string) => {
    showMessage('info', text);
  }, [showMessage]);

  return {
    message,
    showMessage,
    clearMessage,
    showSuccess,
    showError,
    showInfo,
  };
}
