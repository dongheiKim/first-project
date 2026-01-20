/**
 * Google Drive API 연동 유틸리티
 * OAuth 2.0 인증 및 파일 업로드/다운로드
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

let tokenClient;
let gapiInited = false;
let gisInited = false;

/**
 * Google API 라이브러리 초기화
 */
export async function initializeGoogleAPI() {
  if (!CLIENT_ID) {
    console.warn('VITE_GOOGLE_CLIENT_ID가 설정되지 않았습니다.');
    throw new Error('Google Client ID not configured');
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onerror = () => reject(new Error('Failed to load Google API'));
    script.onload = () => {
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
    };
    document.body.appendChild(script);
  });
}

/**
 * Google Identity Services 초기화
 */
export async function initializeGIS() {
  if (!CLIENT_ID) {
    throw new Error('Google Client ID not configured');
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    script.onload = () => {
      try {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: '', // 나중에 설정
        });
        gisInited = true;
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    document.body.appendChild(script);
  });
}

/**
 * Google 로그인 및 인증
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

    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
}

/**
 * 구글 드라이브에 파일 업로드
 * @param {string} fileName - 파일 이름
 * @param {string} content - 파일 내용 (JSON)
 */
export async function uploadToDrive(fileName, content) {
  try {
    // 기존 파일 검색
    const searchResponse = await window.gapi.client.drive.files.list({
      q: `name='${fileName}' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
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

    const method = fileId ? 'PATCH' : 'POST';
    const url = fileId
      ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

    const response = await fetch(url, {
      method: method,
      headers: new Headers({ Authorization: 'Bearer ' + window.gapi.client.getToken().access_token }),
      body: form,
    });

    return await response.json();
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

/**
 * 구글 드라이브에서 파일 다운로드
 * @param {string} fileName - 파일 이름
 */
export async function downloadFromDrive(fileName) {
  try {
    // 파일 검색
    const searchResponse = await window.gapi.client.drive.files.list({
      q: `name='${fileName}' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    const files = searchResponse.result.files;
    
    if (!files || files.length === 0) {
      throw new Error('File not found');
    }

    const fileId = files[0].id;

    // 파일 내용 다운로드
    const response = await window.gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media',
    });

    return response.body;
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
}

/**
 * Google 로그아웃
 */
export function signOutGoogle() {
  const token = window.gapi.client.getToken();
  if (token !== null) {
    window.google.accounts.oauth2.revoke(token.access_token);
    window.gapi.client.setToken('');
  }
}

/**
 * 로그인 상태 확인
 */
export function isSignedIn() {
  return window.gapi?.client?.getToken() !== null;
}
