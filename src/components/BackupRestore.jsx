import { useRef, useState, useEffect } from 'react';
import { useTranslation } from '../translations';
import {
  initializeGoogleAPI,
  initializeGIS,
  authenticateGoogle,
  uploadToDrive,
  downloadFromDrive,
  signOutGoogle,
  isSignedIn,
} from '../utils/googleDrive';
import { compressData, decompressData } from '../utils/compression';
import '../style.css';

/**
 * 백업 & 복원 컴포넌트
 * JSON 파일로 데이터 내보내기/가져오기 + 구글 드라이브 동기화
 * @param {Array} entries - 일기 데이터
 * @param {Function} onImport - 데이터 가져오기 콜백
 */
export function BackupRestore({ entries, onImport }) {
  const t = useTranslation();
  const fileInputRef = useRef(null);
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Google API 초기화
  useEffect(() => {
    const init = async () => {
      try {
        await initializeGoogleAPI();
        await initializeGIS();
        setIsGoogleSignedIn(isSignedIn());
      } catch (error) {
        console.error('Google API init error:', error);
      }
    };
    init();
  }, []);

  // 데이터 내보내기 (압축 적용)
  const handleExport = () => {
    if (entries.length === 0) {
      alert(t.noDataToExport);
      return;
    }

    // 데이터 압축
    const compressed = compressData(entries);
    const dataStr = JSON.stringify(compressed); // pretty print 제거로 공백 최소화
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `diary-backup-${timestamp}.json`;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
    
    // 크기 정보 표시
    const originalSize = JSON.stringify(entries).length;
    const compressedSize = dataStr.length;
    const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    
    alert(`${t.exportSuccess}\n원본: ${(originalSize / 1024).toFixed(1)} KB\n압축: ${(compressedSize / 1024).toFixed(1)} KB\n감소율: ${reduction}%`);
  };

  // 파일 선택 트리거
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // 데이터 가져오기 (압축 해제)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target?.result);
        
        // 압축된 데이터인지 확인 (키가 i, d, c 인지)
        let importedData;
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          if (parsedData[0].i !== undefined) {
            // 압축된 데이터
            importedData = decompressData(parsedData);
          } else if (parsedData[0].id !== undefined) {
            // 압축되지 않은 데이터
            importedData = parsedData;
          } else {
            throw new Error('Invalid format');
          }
        } else {
          throw new Error('Invalid format');
        }

        // 데이터 검증
        const isValid = importedData.every(
          (entry) => entry.id && entry.date && entry.content
        );

        if (!isValid) {
          throw new Error('Invalid entry format');
        }

        // 덮어쓰기 확인
        if (entries.length > 0) {
          if (!window.confirm(t.confirmImport)) {
            return;
          }
        }

        onImport(importedData);
        alert(t.importSuccess);
      } catch (error) {
        alert(t.importError);
        console.error('Import error:', error);
      }
    };

    reader.readAsText(file);
    // 파일 입력 초기화 (같은 파일 재선택 가능)
    e.target.value = '';
  };

  // 구글 로그인
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await authenticateGoogle();
      setIsGoogleSignedIn(true);
    } catch (error) {
      console.error('Sign in error:', error);
      alert(t.syncError);
    } finally {
      setIsLoading(false);
    }
  };

  // 구글 로그아웃
  const handleGoogleSignOut = () => {
    signOutGoogle();
    setIsGoogleSignedIn(false);
  };

  // 구글 드라이브에 업로드 (압축 적용)
  const handleUploadToDrive = async () => {
    if (!isGoogleSignedIn) {
      alert(t.notSignedIn);
      return;
    }

    if (entries.length === 0) {
      alert(t.noDataToExport);
      return;
    }

    try {
      setIsLoading(true);
      const compressed = compressData(entries);
      const dataStr = JSON.stringify(compressed);
      await uploadToDrive('diary-backup.json', dataStr);
      
      const reduction = ((1 - dataStr.length / JSON.stringify(entries).length) * 100).toFixed(1);
      alert(`${t.syncSuccess}\n크기 감소: ${reduction}%`);
    } catch (error) {
      console.error('Upload error:', error);
      alert(t.syncError);
    } finally {
      setIsLoading(false);
    }
  };

  // 구글 드라이브에서 다운로드 (압축 해제)
  const handleDownloadFromDrive = async () => {
    if (!isGoogleSignedIn) {
      alert(t.notSignedIn);
      return;
    }

    try {
      setIsLoading(true);
      const dataStr = await downloadFromDrive('diary-backup.json');
      const parsedData = JSON.parse(dataStr);

      // 압축된 데이터 해제
      let importedData;
      if (parsedData.length > 0 && parsedData[0].i !== undefined) {
        importedData = decompressData(parsedData);
      } else {
        importedData = parsedData;
      }

      if (!Array.isArray(importedData)) {
        throw new Error('Invalid format');
      }

      if (entries.length > 0) {
        if (!window.confirm(t.confirmImport)) {
          setIsLoading(false); // 로딩 상태 초기화
          return;
        }
      }

      onImport(importedData);
      alert(t.syncSuccess);
    } catch (error) {
      console.error('Download error:', error);
      alert(t.syncError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="backup-section">
      <h3>{t.backupTitle}</h3>
      <div className="backup-buttons">
        <button className="btn-export" onClick={handleExport} disabled={isLoading}>
          {t.exportData}
        </button>
        <button className="btn-import" onClick={handleImportClick} disabled={isLoading}>
          {t.importData}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* 구글 드라이브 섹션 */}
      <div className="google-drive-section">
        <h4>{t.googleDriveSync}</h4>
        {!isGoogleSignedIn ? (
          <button 
            className="btn-google-signin" 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? '⏳ 로딩...' : t.signInGoogle}
          </button>
        ) : (
          <div className="google-drive-actions">
            <button 
              className="btn-drive-upload" 
              onClick={handleUploadToDrive}
              disabled={isLoading}
            >
              {isLoading ? '⏳' : t.uploadToDrive}
            </button>
            <button 
              className="btn-drive-download" 
              onClick={handleDownloadFromDrive}
              disabled={isLoading}
            >
              {isLoading ? '⏳' : t.downloadFromDrive}
            </button>
            <button 
              className="btn-google-signout" 
              onClick={handleGoogleSignOut}
              disabled={isLoading}
            >
              {t.signOutGoogle}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
