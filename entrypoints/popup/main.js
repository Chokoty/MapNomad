// Popup script for Map Bookmark Exporter
document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadNaverBtn = document.getElementById('uploadNaverBtn');
    const openKakaoBtn = document.getElementById('openKakaoBtn');
    const dataCount = document.getElementById('dataCount');
    const lastExport = document.getElementById('lastExport');

    // Load saved data count
    chrome.storage.local.get(['favoritesCount', 'lastExportTime'], (result) => {
        if (result.favoritesCount) {
            dataCount.textContent = `${result.favoritesCount}개 장소`;
        }
        if (result.lastExportTime) {
            const date = new Date(result.lastExportTime);
            lastExport.textContent = date.toLocaleDateString('ko-KR');
        }
    });

    // Open Kakao Map
    openKakaoBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://map.kakao.com/favorite/list' });
    });

    // Upload to Google Maps
    uploadBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://www.google.com/maps/d/u/0/' });
    });

    // Upload to Naver Map
    uploadNaverBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://map.naver.com/p/my' });
    });
});
