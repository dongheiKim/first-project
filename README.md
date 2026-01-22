# 📝 2026 Diary PWA

![React](https://img.shields.io/badge/React-18.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)
![License](https://img.shields.io/badge/License-MIT-green)

React + TypeScript 기반 PWA 다이어리 앱

## ✨ 주요 기능

- 🌍 **9개 언어** 지원 (한/영/일/중/스/프/독/러/포)
- 📱 **PWA** - 오프라인 사용, 홈 화면 설치
- ☁️ **구글 드라이브** 백업/복원
- 🌙 **다크모드** 자동 감지
- 🖼️ **이미지 첨부** (최대 5개, 드래그&드롭)
- 📊 **통계 대시보드**
- 🗜️ **데이터 압축** (~40%)

## 🛠️ 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 18, TypeScript, React Router |
| Build | Vite, PWA Plugin |
| Test | Vitest (69 tests) |
| 상태관리 | Context API + useReducer |

## 📦 설치 및 실행

```bash
npm install
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드
npm run test     # 테스트 실행
```

## 📁 프로젝트 구조

```
src/
├── components/   # UI 컴포넌트 (10개)
├── pages/        # 라우팅 페이지 (4개)
├── hooks/        # 커스텀 훅
├── utils/        # 유틸리티 함수
├── locales/      # 다국어 번역
├── context/      # 전역 상태
└── styles/       # CSS 모듈
```

## ⚡ 성능 최적화

- **코드 스플리팅** - React.lazy 페이지 분할
- **메모이제이션** - memo, useCallback, useMemo
- **번들 크기** - Gzip ~66KB
- **PWA 캐싱** - Service Worker
