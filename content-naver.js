// inject-naver.js를 네이버 지도 페이지에 주입
console.log('[NaverExport Content] 스크립트 주입 시작...');

function injectScript() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject-naver.js');
    script.onload = function() {
        console.log('[NaverExport Content] inject-naver.js 로드 완료');
        this.remove();
    };
    script.onerror = function() {
        console.error('[NaverExport Content] inject-naver.js 로드 실패!');
    };
    (document.head || document.documentElement).appendChild(script);
}

// 메인 페이지에 주입
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectScript);
} else {
    injectScript();
}

// iframe 감지 및 주입
function injectIntoIframes() {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
        try {
            // 같은 origin의 iframe만 접근 가능
            if (iframe.contentDocument) {
                const iframeScript = iframe.contentDocument.createElement('script');
                iframeScript.src = chrome.runtime.getURL('inject-naver.js');
                iframeScript.onload = function() {
                    console.log('[NaverExport Content] iframe에 inject-naver.js 로드 완료');
                    this.remove();
                };
                (iframe.contentDocument.head || iframe.contentDocument.documentElement).appendChild(iframeScript);
            }
        } catch (e) {
            // Cross-origin iframe은 무시
            console.log('[NaverExport Content] iframe 접근 불가 (cross-origin)');
        }
    });
}

// iframe 로드 감지
const observer = new MutationObserver(() => {
    injectIntoIframes();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// 초기 iframe 주입
setTimeout(injectIntoIframes, 1000);

console.log('[NaverExport Content] 확장프로그램 로드됨');

// inject-naver.js로부터 메시지 수신 (Storage 저장용)
window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    
    if (event.data.type === 'NAVER_EXPORT_SAVE') {
        const { data } = event.data;
        
        // Chrome Storage에 저장
        chrome.storage.local.set(data, () => {
            console.log('[NaverExport Content] 데이터가 저장되었습니다:', data);
        });
    }
});
