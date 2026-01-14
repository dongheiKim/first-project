/**
 * 다국어 번역 시스템
 * 지원 언어: 한국어, 영어, 일본어, 중국어, 스페인어, 프랑스어, 독일어, 러시아어, 포르투갈어
 */

const translations = {
  ko: {
    appTitle: '📝 2026 Diary',
    inputPlaceholder: '오늘 어떤 일이 있었나요? (Ctrl + Enter로 저장)',
    saveButton: '기록하기',
    contentRequired: '내용을 입력해주세요.',
    confirmTitle: '💾 저장 확인',
    confirmMessage: '이 내용을 일기에 저장하시겠습니까?',
    confirmButton: '저장하기',
    cancelButton: '취소',
    editButton: '✏️ 수정',
    deleteButton: '🗑️ 삭제',
    deleteConfirm: '정말 삭제하시겠습니까?',
    emptyMessage: '아직 작성된 일기가 없습니다.',
    filterAll: '전체',
    filterToday: '오늘',
  },
  en: {
    appTitle: '📝 2026 Diary',
    inputPlaceholder: 'What happened today? (Ctrl + Enter to save)',
    saveButton: 'Save',
    contentRequired: 'Please enter some content.',
    confirmTitle: '💾 Confirm Save',
    confirmMessage: 'Do you want to save this content to your diary?',
    confirmButton: 'Save',
    cancelButton: 'Cancel',
    editButton: '✏️ Edit',
    deleteButton: '🗑️ Delete',
    deleteConfirm: 'Are you sure you want to delete?',
    emptyMessage: 'No diary entries yet.',
    filterAll: 'All',
    filterToday: 'Today',
  },
  ja: {
    appTitle: '📝 2026 日記',
    inputPlaceholder: '今日は何があった？ (Ctrl + Enterで保存)',
    saveButton: '記録する',
    contentRequired: 'コンテンツを入力してください。',
    confirmTitle: '💾 保存確認',
    confirmMessage: 'このコンテンツを日記に保存しますか？',
    confirmButton: '保存する',
    cancelButton: 'キャンセル',
    editButton: '✏️ 編集',
    deleteButton: '🗑️ 削除',
    deleteConfirm: '削除してもよろしいですか？',
    emptyMessage: 'まだ日記がありません。',
    filterAll: 'すべて',
    filterToday: '今日',
  },
  zh: {
    appTitle: '📝 2026 日记',
    inputPlaceholder: '今天发生了什么? (Ctrl + Enter 保存)',
    saveButton: '记录',
    contentRequired: '请输入一些内容。',
    confirmTitle: '💾 保存确认',
    confirmMessage: '您想将此内容保存到您的日记中吗？',
    confirmButton: '保存',
    cancelButton: '取消',
    editButton: '✏️ 编辑',
    deleteButton: '🗑️ 删除',
    deleteConfirm: '您确定要删除吗？',
    emptyMessage: '还没有日记条目。',
    filterAll: '全部',
    filterToday: '今天',
  },
  es: {
    appTitle: '📝 2026 Diario',
    inputPlaceholder: '¿Qué sucedió hoy? (Ctrl + Enter para guardar)',
    saveButton: 'Guardar',
    contentRequired: 'Por favor, ingrese algún contenido.',
    confirmTitle: '💾 Confirmar Guardado',
    confirmMessage: '¿Desea guardar este contenido en su diario?',
    confirmButton: 'Guardar',
    cancelButton: 'Cancelar',
    editButton: '✏️ Editar',
    deleteButton: '🗑️ Eliminar',
    deleteConfirm: '¿Está seguro de que desea eliminar?',
    emptyMessage: 'Aún no hay entradas de diario.',
    filterAll: 'Todo',
    filterToday: 'Hoy',
  },
  fr: {
    appTitle: '📝 2026 Journal',
    inputPlaceholder: 'Que s\'est-il passé aujourd\'hui? (Ctrl + Entrée pour enregistrer)',
    saveButton: 'Enregistrer',
    contentRequired: 'Veuillez entrer du contenu.',
    confirmTitle: '💾 Confirmer l\'enregistrement',
    confirmMessage: 'Souhaitez-vous enregistrer ce contenu dans votre journal?',
    confirmButton: 'Enregistrer',
    cancelButton: 'Annuler',
    editButton: '✏️ Éditer',
    deleteButton: '🗑️ Supprimer',
    deleteConfirm: 'Êtes-vous sûr de vouloir supprimer?',
    emptyMessage: 'Aucune entrée de journal pour le moment.',
    filterAll: 'Tous',
    filterToday: 'Aujourd\'hui',
  },
  de: {
    appTitle: '📝 2026 Tagebuch',
    inputPlaceholder: 'Was ist heute passiert? (Ctrl + Enter zum Speichern)',
    saveButton: 'Speichern',
    contentRequired: 'Bitte geben Sie einen Inhalt ein.',
    confirmTitle: '💾 Speichern bestätigen',
    confirmMessage: 'Möchten Sie diesen Inhalt in Ihr Tagebuch speichern?',
    confirmButton: 'Speichern',
    cancelButton: 'Abbrechen',
    editButton: '✏️ Bearbeiten',
    deleteButton: '🗑️ Löschen',
    deleteConfirm: 'Sind Sie sicher, dass Sie löschen möchten?',
    emptyMessage: 'Noch keine Tagebucheinträge.',
    filterAll: 'Alle',
    filterToday: 'Heute',
  },
  ru: {
    appTitle: '📝 2026 Дневник',
    inputPlaceholder: 'Что произошло сегодня? (Ctrl + Enter для сохранения)',
    saveButton: 'Сохранить',
    contentRequired: 'Пожалуйста, введите содержание.',
    confirmTitle: '💾 Подтвердить сохранение',
    confirmMessage: 'Вы хотите сохранить это содержание в свой дневник?',
    confirmButton: 'Сохранить',
    cancelButton: 'Отмена',
    editButton: '✏️ Редактировать',
    deleteButton: '🗑️ Удалить',
    deleteConfirm: 'Вы уверены, что хотите удалить?',
    emptyMessage: 'Пока нет записей в дневнике.',
    filterAll: 'Все',
    filterToday: 'Сегодня',
  },
  pt: {
    appTitle: '📝 2026 Diário',
    inputPlaceholder: 'O que aconteceu hoje? (Ctrl + Enter para salvar)',
    saveButton: 'Salvar',
    contentRequired: 'Por favor, digite algum conteúdo.',
    confirmTitle: '💾 Confirmar Salvamento',
    confirmMessage: 'Você quer salvar este conteúdo em seu diário?',
    confirmButton: 'Salvar',
    cancelButton: 'Cancelar',
    editButton: '✏️ Editar',
    deleteButton: '🗑️ Deletar',
    deleteConfirm: 'Tem certeza que deseja deletar?',
    emptyMessage: 'Nenhuma entrada de diário ainda.',
    filterAll: 'Todos',
    filterToday: 'Hoje',
  },
};

/**
 * 현재 언어 코드 가져오기 (브라우저 설정 또는 localStorage 기반)
 */
const getLanguage = () => {
  // localStorage에서 먼저 확인
  const savedLang = localStorage.getItem('app_language');
  if (savedLang && translations[savedLang]) {
    return savedLang;
  }
  
  // 브라우저 언어 가져오기
  const browserLang = navigator.language.split('-')[0];
  
  // 지원되는 언어 반환, 기본값은 영어
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
 * @param {string} lang - 언어 코드 ('ko', 'en', 'ja', 'zh', 'es', 'fr', 'de', 'ru', 'pt')
 */
export function setLanguage(lang) {
  if (translations[lang]) {
    localStorage.setItem('app_language', lang);
    window.location.reload();
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
