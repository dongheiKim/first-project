import { useEffect } from 'react';
import '../style.css';

/**
 * 이미지 확대 모달
 * @param {string} imageUrl - 표시할 이미지 URL
 * @param {Function} onClose - 모달 닫기 콜백
 */
export function ImageModal({ imageUrl, onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!imageUrl) return null;

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="확대 이미지" />
        <button className="btn-close-modal" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}
