export default defineContentScript({
  matches: ['*://map.kakao.com/*'],
  runAt: 'document_end',
  main() {
    // Inject the Kakao Map script into page context
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected/kakao.js');
    (document.head || document.documentElement).appendChild(script);
  },
});
