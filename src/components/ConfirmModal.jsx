import { useTranslation } from '../translations';
import '../style.css';

/**
 * 확인 모달 컴포넌트
 * 중요한 작업 전에 사용자 확인을 받는 팝업
 * @param {Boolean} isOpen - 모달 표시 여부
 * @param {String} message - 모달에 표시할 메시지
 * @param {Function} onConfirm - 확인 버튼 클릭 시 콜백
 * @param {Function} onCancel - 취소 버튼 클릭 시 콜백
 */
export function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  const t = useTranslation();
  if (!isOpen) return null; // 모달이 닫혀있으면 렌더링하지 않음

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{t.confirmTitle}</h3>
        <p>{message}</p>
        <div className="modal-buttons">
          <button className="btn-confirm" onClick={onConfirm}>
            {t.confirmButton}
          </button>
          <button className="btn-cancel" onClick={onCancel}>
            {t.cancelButton}
          </button>
        </div>
      </div>
    </div>
  );
}
