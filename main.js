// 1. 서비스 워커 등록
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log("PWA 서비스 워커 준비 완료"))
    .catch(err => console.log("등록 실패:", err));
}

// 2. 일기 저장 기능
function saveEntry() {
  const content = document.getElementById('content').value;
  if (!content.trim()) return alert("내용을 입력해주세요.");

  const entries = JSON.parse(localStorage.getItem('my_diary_v1') || '[]');
  const newEntry = {
    id: Date.now(),
    date: new Date().toLocaleString('ko-KR'),
    content: content
  };

  entries.unshift(newEntry);
  localStorage.setItem('my_diary_v1', JSON.stringify(entries));
  document.getElementById('content').value = '';
  renderEntries();
}

// 3. 일기 목록 출력
function renderEntries() {
  const entries = JSON.parse(localStorage.getItem('my_diary_v1') || '[]');
  const list = document.getElementById('diary-list');
  list.innerHTML = entries.map(e => {
    const dateEl = document.createElement('small');
    dateEl.textContent = e.date;
    const contentEl = document.createElement('div');
    contentEl.textContent = e.content;
    contentEl.style.whiteSpace = 'pre-wrap';
    return `
    <div class="entry">
      ${dateEl.outerHTML}
      ${contentEl.outerHTML}
    </div>
  `;
  }).join('');
}

// 실행 시 목록 로드
renderEntries();
