import React, { useState, useCallback, memo } from 'react';
import { useTranslation } from '../locales';
import { useSwipe } from '../hooks/useSwipe';
import { triggerHaptic } from '../utils/mobileUtils';

/**
 * 개별 일기 항목 컴포넌트
 */
const DiaryEntryComponent = ({ entry, onUpdate, onDelete }) => {
  const t = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(entry.content);
  const [isSwiping, setIsSwiping] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // 에러 메시지 표시
  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg("") , 5000);
  };

  // 수정 내용 저장
  const handleSave = useCallback(() => {
    const trimmed = editContent.trim();
    if (!trimmed) {
      showError(t.contentRequired);
      return;
    }
    triggerHaptic('success');
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
      triggerHaptic('heavy');
      onDelete(entry.id);
    }
  }, [entry.id, onDelete, t.deleteConfirm]);

  // 편집 모드 활성화
  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);

  // 스와이프 제스처 (모바일 삭제)
  const swipeHandlers = useSwipe(
    () => {
      triggerHaptic('medium');
      setIsSwiping('left');
      setTimeout(() => {
        if (window.confirm(t.deleteConfirm)) {
          triggerHaptic('heavy');
          onDelete(entry.id);
        }
        setIsSwiping(null);
      }, 200);
    },
    null,
    100
  );

  return (
    <div 
      className={`entry ${isSwiping ? `swiping-${isSwiping}` : ''}`}
      {...swipeHandlers}
      role="article"
      aria-label={`Diary entry from ${entry.date}`}
      tabIndex={0}
    >
      <small className="entry-date">{entry.date}</small>
      {errorMsg && (
        <div className="error-message" role="alert" aria-live="assertive" tabIndex={0} style={{color: 'red'}}>
          {errorMsg}
        </div>
      )}
      {isEditing ? (
        <>
          <textarea
            className="edit-textarea"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            autoFocus
            aria-label="Edit diary entry"
            tabIndex={0}
          />
          <div className="button-group">
            <button className="btn-save" onClick={handleSave} aria-label="Save changes" tabIndex={0}>
              {t.confirmButton}
            </button>
            <button className="btn-cancel" onClick={handleCancel} aria-label="Cancel editing" tabIndex={0}>
              {t.cancelButton}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="entry-content">{entry.content}</div>
          {entry.images && entry.images.length > 0 && (
            <div className="entry-images">
              {entry.images.map((img, idx) => (
                <img src={img} alt={`Diary image ${idx + 1} for ${entry.date}`} key={idx} tabIndex={0} />
              ))}
            </div>
          )}
          <div className="button-group">
            <button className="btn-edit" onClick={handleEdit} aria-label={`Edit entry from ${entry.date}`} tabIndex={0}>
              {t.editButton}
            </button>
            <button className="btn-delete" onClick={handleDelete} aria-label={`Delete entry from ${entry.date}`} tabIndex={0}>
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
