// inject.js를 실제 페이지 컨텍스트에 삽입
const script = document.createElement('script');
script.src = chrome.runtime.getURL('inject.js');
script.onload = function() {
    this.remove(); // 로드 후 태그 제거
};
(document.head || document.documentElement).appendChild(script);

console.log("[KakaoExport] 확장프로그램 로드됨. 즐겨찾기 폴더를 클릭하세요.");

// inject.js로부터 메시지 수신 (Storage 저장용)
window.addEventListener('message', (event) => {
    // 같은 origin에서만 받기
    if (event.source !== window) return;
    
    if (event.data.type === 'KAKAO_EXPORT_SAVE') {
        const { data } = event.data;
        
        // Chrome Storage에 저장
        chrome.storage.local.set(data, () => {
            console.log('[KakaoExport] 데이터가 저장되었습니다:', data);
        });
    }
});