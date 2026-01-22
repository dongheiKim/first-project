import { memo, type FC } from 'react';
import { useTranslation } from '../locales';

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 확인 모달 컴포넌트
 */
const ConfirmModalComponent: FC<ConfirmModalProps> = ({ isOpen, message, onConfirm, onCancel }) => {
  const t = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{t.confirmTitle}</h3>
        <p>{message}</p>
        <div className="modal-buttons">
          <button className="btn-confirm" onClick={onConfirm}>
            {t.confirmButton}
          </button>
          <button className="btn-confirm" style={{ background: '#94a3b8' }} onClick={onCancel}>
            {t.cancelButton}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ConfirmModal = memo(ConfirmModalComponent);
