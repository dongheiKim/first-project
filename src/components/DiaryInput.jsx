import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from '../locales';
import { processBatchImages, getBase64Size } from '../utils/imageUtils';

/**
 * 일기 입력 폼 컴포넌트 (이미지 첨부 고급 기능)
 */
export function DiaryInput({ onSave, shouldClear, onCleared, pendingContent }) {
  const t = useTranslation();
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (shouldClear && textareaRef.current) {
      textareaRef.current.value = '';
      setImages([]);
      onCleared();
    }
  }, [shouldClear, onCleared]);

  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      handleSave();
    }
  }, []);

  const handleSave = useCallback(() => {
    const content = textareaRef.current.value.trim();
    if (!content) {
      alert(t.contentRequired);
      return;
    }
    onSave({ content, images });
  }, [images, onSave, t.contentRequired]);

  // 이미지 파일 선택 (일괄 처리)
  const handleImageSelect = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // 최대 5개 제한
    if (images.length + files.length > 5) {
      alert(t.maxImagesReached || '최대 5개의 이미지만 첨부할 수 있습니다.');
      return;
    }

    setIsProcessing(true);

    try {
      const processed = await processBatchImages(files);
      setImages(prev => [...prev, ...processed]);
    } catch (error) {
      console.error('Batch processing error:', error);
      alert(t.imageProcessError || '이미지 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
    
    e.target.value = '';
  }, [images.length, t.maxImagesReached]);

  // 이미지 제거
  const handleRemoveImage = useCallback((id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, []);

  // 드래그 앤 드롭
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      
      const fakeEvent = { target: { files: dataTransfer.files, value: '' } };
      await handleImageSelect(fakeEvent);
    }
  }, [handleImageSelect]);

  return (
    <div 
      className="input-section"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <textarea
        ref={textareaRef}
        placeholder={t.inputPlaceholder}
        onKeyDown={handleKeyDown}
        defaultValue={pendingContent}
      />
      
      {/* 이미지 미리보기 */}
      {images.length > 0 && (
        <div className="image-preview-container">
          {images.map(img => (
            <div key={img.id} className="image-preview">
              <img src={img.thumbnail || img.data} alt={img.name} />
              <button 
                className="btn-remove-image" 
                onClick={() => handleRemoveImage(img.id)}
                title={t.removeImage || '이미지 제거'}
              >
                ✕
              </button>
              <div className="image-info">
                <small>{img.size} KB</small>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 처리 중 표시 */}
      {isProcessing && (
        <div className="processing-overlay">
          <p>🖼️ 이미지 처리 중...</p>
        </div>
      )}
      
      <div className="input-actions">
        <button className="btn-save" onClick={handleSave} disabled={isProcessing}>
          {t.saveButton}
        </button>
        <button 
          className="btn-add-image" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing || images.length >= 5}
          title={t.addImage || '이미지 추가'}
        >
          📷 {images.length}/5
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />
      </div>
      
      {/* 드래그 앤 드롭 안내 */}
      <p className="drag-drop-hint">
        💡 {t.dragDropHint || '이미지를 드래그해서 추가할 수 있습니다'}
      </p>
    </div>
  );
}