/**
 * 다국어 번역 시스템 (모듈화)
 * 지원 언어: 한국어, 영어, 일본어, 중국어, 스페인어, 프랑스어, 독일어, 러시아어, 포르투갈어
 */

import { ko } from './ko';
import { en } from './en';
import { ja } from './ja';
import { zh } from './zh';
import { es } from './es';
import { fr } from './fr';
import { de } from './de';
import { ru } from './ru';
import { pt } from './pt';

const translations = {
  ko,
  en,
  ja,
  zh,
  es,
  fr,
  de,
  ru,
  pt,
};

/**
 * 현재 언어 코드 가져오기 (브라우저 설정 또는 localStorage 기반)
 */
const getLanguage = () => {
  const savedLang = localStorage.getItem('app_language');
  if (savedLang && translations[savedLang]) {
    return savedLang;
  }
  
  const browserLang = navigator.language.split('-')[0];
  return translations[browserLang] ? browserLang : 'en';
};

/**
 * 번역 함수 가져오는 훅
 * @returns {Object} 현재 언어에 맞는 번역 객체
 */
export function useTranslation() {
  const language = getLanguage();
  return translations[language];
}

/**
 * 애플리케이션 언어 설정
 * @param {string} lang - 언어 코드
 */
export function setLanguage(lang) {
  if (translations[lang]) {
    localStorage.setItem('app_language', lang);
    window.dispatchEvent(new Event('languagechange'));
  }
}

/**
 * 지원되는 모든 언어 코드 가져오기
 */
export function getSupportedLanguages() {
  return Object.keys(translations);
}

/**
 * 현재 선택된 언어 코드 가져오기
 */
export function getCurrentLanguage() {
  return getLanguage();
}
