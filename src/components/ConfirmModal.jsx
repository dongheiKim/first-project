import { useTranslation } from '../locales';
import '../style.css';

/**
 * 확인 모달 컴포넌트
 * @param {boolean} isOpen - 모달 표시 여부
 * @param {string} message - 표시할 메시지
 * @param {Function} onConfirm - 확인 버튼 클릭 시 호출
 * @param {Function} onCancel - 취소 버튼 클릭 시 호출
 */
export function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
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
}
