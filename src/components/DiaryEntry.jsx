import React, { useState, useCallback } from 'react';
import { useTranslation } from '../locales';
import { ImageModal } from './ImageModal';
import '../style.css';

/**
 * 개별 일기 항목 컴포넌트 (이미지 확대 기능)
 */
function DiaryEntryComponent({ entry, onUpdate, onDelete }) {
  const t = useTranslation();
  const [isEditing, setIsEditing] = useState(false); // 편집 모드 상태
  const [editContent, setEditContent] = useState(entry.content); // 편집 중인 내용
  const [selectedImage, setSelectedImage] = useState(null); // 선택된 이미지 상태

  // 수정 내용 저장
  const handleSave = useCallback(() => {
    if (!editContent.trim()) {
      alert(t.contentRequired);
      return;
    }
    onUpdate(entry.id, editContent);
    setIsEditing(false);
  }, [editContent, entry.id, onUpdate, t]);

  // 수정 취소 (원본 내용으로 복원)
  const handleCancel = useCallback(() => {
    setEditContent(entry.content);
    setIsEditing(false);
  }, [entry.content]);

  // 일기 삭제 (확인 후 실행)
  const handleDelete = useCallback(() => {
    if (window.confirm(t.deleteConfirm)) {
      onDelete(entry.id);
    }
  }, [entry.id, onDelete, t]);

  return (
    <div className="entry">
      <small>{entry.date}</small>
      
      {isEditing ? (
        <>
          <textarea
            className="edit-textarea"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            autoFocus
          />
          <div className="button-group">
            <button className="btn-save" onClick={handleSave}>{t.confirmButton}</button>
            <button className="btn-cancel" onClick={handleCancel}>{t.cancelButton}</button>
          </div>
        </>
      ) : (
        <>
          <div style={{ whiteSpace: 'pre-wrap' }}>{entry.content}</div>
          
          {/* 이미지 갤러리 */}
          {entry.images && entry.images.length > 0 && (
            <div className="entry-images">
              {entry.images.map(img => (
                <div key={img.id} className="entry-image-wrapper">
                  <img 
                    src={img.thumbnail || img.data}
                    alt={img.name}
                    className="entry-image"
                    loading="lazy"
                    onClick={() => setSelectedImage(img.data)}
                  />
                  <div className="image-badge">{img.size} KB</div>
                </div>
              ))}
            </div>
          )}
          
          <div className="button-group">
            <button className="btn-edit" onClick={() => setIsEditing(true)}>{t.editButton}</button>
            <button className="btn-delete" onClick={handleDelete}>{t.deleteButton}</button>
          </div>
        </>
      )}
      
      {/* 이미지 확대 모달 */}
      <ImageModal 
        imageUrl={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </div>
  );
}

// React.memo로 감싸기
export const DiaryEntry = React.memo(DiaryEntryComponent);
