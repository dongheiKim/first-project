import { useEffect } from 'react';

/**
 * 이미지 확대 모달
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
