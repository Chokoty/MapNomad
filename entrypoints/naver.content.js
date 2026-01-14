export default defineContentScript({
  matches: ['*://map.naver.com/*'],
  runAt: 'document_end',
  main() {
    // Inject the Naver Map script into page context
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('injected/naver.js');
    (document.head || document.documentElement).appendChild(script);
  },
});
