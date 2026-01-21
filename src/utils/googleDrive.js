/**
 * Google Drive API 연동 유틸리티
 * OAuth 2.0 인증 및 파일 업로드/다운로드 (보안 강화)
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const TOKEN_EXPIRY_MARGIN = 5 * 60 * 1000; // 5분 여유

let tokenClient;
let gapiInited = false;
let gisInited = false;
let scriptCache = {}; // 스크립트 로드 캐싱

/**
 * CLIENT_ID 유효성 검증
 */
function validateClientID() {
  if (!CLIENT_ID) {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.warn('VITE_GOOGLE_CLIENT_ID가 설정되지 않았습니다.');
    }
    throw new Error('Google Client ID not configured');
  }
  // 기본 형식 검증 (Google Client ID 패턴)
  if (!/^[\w-]+\.apps\.googleusercontent\.com$/.test(CLIENT_ID)) {
    throw new Error('Invalid Google Client ID format');
  }
}

/**
 * 외부 스크립트 안전 로드 (중복 방지)
 */
async function loadExternalScript(url, globalKey) {
  // 이미 로드됨
  if (scriptCache[url]) {
    return scriptCache[url];
  }
  
  // 이미 전역에 존재함
  if (globalKey && window[globalKey]) {
    scriptCache[url] = true;
    return true;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.referrerPolicy = 'no-referrer';
    script.onerror = () => {
      scriptCache[url] = null;
      reject(new Error(`Failed to load script: ${url}`));
    };
    script.onload = () => {
      scriptCache[url] = true;
      resolve(true);
    };
    document.head.appendChild(script);
  });
}

/**
 * Google API 라이브러리 초기화
 */
export async function initializeGoogleAPI() {
  if (gapiInited) return; // 이미 초기화됨
  
  validateClientID();

  try {
    await loadExternalScript('https://apis.google.com/js/api.js', 'gapi');
    
    return new Promise((resolve, reject) => {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            discoveryDocs: [DISCOVERY_DOC],
          });
          gapiInited = true;
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  } catch (error) {
    gapiInited = false;
    throw error;
  }
}

/**
 * Google Identity Services 초기화
 */
export async function initializeGIS() {
  if (gisInited) return; // 이미 초기화됨
  
  validateClientID();

  try {
    await loadExternalScript('https://accounts.google.com/gsi/client', 'google');
    
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // 나중에 설정
    });
    gisInited = true;
  } catch (error) {
    gisInited = false;
    throw error;
  }
}

/**
 * 토큰 유효성 확인
 */
function isTokenValid() {
  const token = window.gapi?.client?.getToken?.();
  if (!token) return false;
  
  // 토큰 만료 시간 체크
  const expiresAt = token.expires_at;
  if (!expiresAt) return true; // 만료 정보 없으면 유효하다고 가정
  
  return expiresAt > Date.now() + TOKEN_EXPIRY_MARGIN;
}

/**
 * Google 로그인 및 인증 (토큰 재사용)
 */
export function authenticateGoogle() {
  return new Promise((resolve, reject) => {
    if (!gapiInited || !gisInited) {
      reject(new Error('Google API not initialized'));
      return;
    }

    tokenClient.callback = async (response) => {
      if (response.error !== undefined) {
        reject(response);
        return;
      }
      resolve(response);
    };

    // 유효한 토큰이 있으면 재사용, 없으면 새로 요청
    if (!isTokenValid()) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
}

/**
 * 구글 드라이브에 파일 업로드 (파일 크기 검증)
 * @param {string} fileName - 파일 이름
 * @param {string} content - 파일 내용 (JSON)
 * @param {number} maxSize - 최대 파일 크기 (바이트, 기본값 10MB)
 */
export async function uploadToDrive(fileName, content, maxSize = 10 * 1024 * 1024) {
  try {
    // 파일 크기 검증
    const contentSize = new Blob([content]).size;
    if (contentSize > maxSize) {
      throw new Error(`File size exceeds limit: ${(contentSize / 1024 / 1024).toFixed(1)}MB > ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
    }

    // 기존 파일 검색
    const searchResponse = await window.gapi.client.drive.files.list({
      q: `name='${fileName.replace(/'/g, "\\'")}' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
      pageSize: 1,
    });

    const files = searchResponse.result.files;
    let fileId = null;

    if (files && files.length > 0) {
      fileId = files[0].id;
    }

    const metadata = {
      name: fileName,
      mimeType: 'application/json',
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([content], { type: 'application/json' }));

    const token = window.gapi.client.getToken();
    if (!token) {
      throw new Error('No access token available');
    }

    const method = fileId ? 'PATCH' : 'POST';
    const url = fileId
      ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

    const response = await fetch(url, {
      method: method,
      headers: new Headers({ Authorization: `Bearer ${token.access_token}` }),
      body: form,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.error('Upload error:', error);
    }
    throw error;
  }
}

/**
 * 구글 드라이브에서 파일 다운로드 (크기 검증)
 * @param {string} fileName - 파일 이름
 * @param {number} maxSize - 최대 파일 크기 (바이트, 기본값 10MB)
 */
export async function downloadFromDrive(fileName, maxSize = 10 * 1024 * 1024) {
  try {
    // 파일 검색
    const searchResponse = await window.gapi.client.drive.files.list({
      q: `name='${fileName.replace(/'/g, "\\'")}' and trashed=false`,
      fields: 'files(id, name, size)',
      spaces: 'drive',
      pageSize: 1,
    });

    const files = searchResponse.result.files;
    
    if (!files || files.length === 0) {
      throw new Error('File not found');
    }

    const file = files[0];

    // 파일 크기 검증
    if (file.size && file.size > maxSize) {
      throw new Error(`File size exceeds limit: ${(file.size / 1024 / 1024).toFixed(1)}MB > ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
    }

    // 파일 내용 다운로드
    const response = await window.gapi.client.drive.files.get({
      fileId: file.id,
      alt: 'media',
    });

    return response.body;
  } catch (error) {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.error('Download error:', error);
    }
    throw error;
  }
}

/**
 * Google 로그아웃 (토큰 정리)
 */
export function signOutGoogle() {
  try {
    const token = window.gapi?.client?.getToken?.();
    if (token !== null && token !== undefined) {
      window.google.accounts.oauth2.revoke(token.access_token, () => {
        if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.log('Token revoked successfully');
        }
      });
      window.gapi.client.setToken('');
    }
  } catch (error) {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.error('Sign out error:', error);
    }
  }
}

/**
 * 로그인 상태 확인
 */
export function isSignedIn() {
  return isTokenValid();
}
