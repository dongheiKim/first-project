import React, { useState, useCallback, memo } from 'react';
import { useTranslation } from '../locales';
import '../style.css';

/**
 * 개별 일기 항목 컴포넌트
 */
const DiaryEntryComponent = ({ entry, onUpdate, onDelete }) => {
  const t = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(entry.content);

  // 수정 내용 저장
  const handleSave = useCallback(() => {
    const trimmed = editContent.trim();
    if (!trimmed) {
      alert(t.contentRequired);
      return;
    }
    onUpdate(entry.id, { content: trimmed });
    setIsEditing(false);
  }, [editContent, entry.id, onUpdate, t.contentRequired]);

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
  }, [entry.id, onDelete, t.deleteConfirm]);

  // 편집 모드 활성화
  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  return (
    <div className="entry">
      <small className="entry-date">{entry.date}</small>
      
      {isEditing ? (
        <>
          <textarea
            className="edit-textarea"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            autoFocus
          />
          <div className="button-group">
            <button className="btn-save" onClick={handleSave}>
              {t.confirmButton}
            </button>
            <button className="btn-cancel" onClick={handleCancel}>
              {t.cancelButton}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="entry-content">{entry.content}</div>
          <div className="button-group">
            <button className="btn-edit" onClick={handleEdit}>
              {t.editButton}
            </button>
            <button className="btn-delete" onClick={handleDelete}>
              {t.deleteButton}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// props 비교 함수로 정확한 메모이제이션
const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.entry.id === nextProps.entry.id &&
    prevProps.entry.content === nextProps.entry.content &&
    prevProps.entry.date === nextProps.entry.date
  );
};

export const DiaryEntry = memo(DiaryEntryComponent, areEqual);
