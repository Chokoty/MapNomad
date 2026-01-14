// 팝업 로드 시 저장된 데이터 확인
document.addEventListener('DOMContentLoaded', async () => {
    await updateStatus();
    
    // 버튼 이벤트 리스너
    document.getElementById('uploadBtn').addEventListener('click', uploadToGoogleMaps);
    document.getElementById('uploadNaverBtn').addEventListener('click', uploadToNaverMap);
    document.getElementById('openKakaoBtn').addEventListener('click', openKakaoMap);
});

// 상태 업데이트
async function updateStatus() {
    try {
        const result = await chrome.storage.local.get(['lastExportData', 'lastExportTime']);
        
        const dataCount = document.getElementById('dataCount');
        const lastExport = document.getElementById('lastExport');
        const uploadBtn = document.getElementById('uploadBtn');
        const uploadNaverBtn = document.getElementById('uploadNaverBtn');
        
        if (result.lastExportData && result.lastExportData.length > 0) {
            dataCount.textContent = `${result.lastExportData.length}개 장소`;
            uploadBtn.disabled = false;
            uploadNaverBtn.disabled = false;
            
            if (result.lastExportTime) {
                const date = new Date(result.lastExportTime);
                const timeStr = date.toLocaleString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                lastExport.textContent = timeStr;
            }
        } else {
            dataCount.textContent = '0개 장소';
            lastExport.textContent = '없음';
            uploadBtn.disabled = true;
            uploadNaverBtn.disabled = true;
        }
    } catch (error) {
        console.error('상태 업데이트 실패:', error);
    }
}

// 구글 지도에 업로드
async function uploadToGoogleMaps() {
    try {
        const result = await chrome.storage.local.get(['lastExportData', 'lastExportFolderName']);
        
        if (!result.lastExportData || result.lastExportData.length === 0) {
            alert('❌ 먼저 카카오맵에서 데이터를 내보내주세요!');
            return;
        }
        
        const data = result.lastExportData;
        const folderName = result.lastExportFolderName || 'favorites';
        
        // CSV 생성
        const csv = generateCSV(data);
        
        // Blob 생성
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        
        // 파일 다운로드
        const url = URL.createObjectURL(blob);
        const safeFolderName = folderName.replace(/[^a-zA-Z0-9가-힣]/g, '_');
        const filename = `kakao_favorites_${safeFolderName}.csv`;
        
        await chrome.downloads.download({
            url: url,
            filename: filename,
            saveAs: false
        });
        
        // Google My Maps 열기
        setTimeout(() => {
            chrome.tabs.create({
                url: 'https://www.google.com/mymaps'
            });
            
            // 안내 메시지
            alert(`✅ CSV 파일이 다운로드되었습니다!\n\n다음 단계:\n1. 구글 지도에서 "새 지도 만들기" 클릭\n2. "가져오기" 클릭\n3. 다운로드된 "${filename}" 파일 선택`);
        }, 500);
        
    } catch (error) {
        console.error('업로드 실패:', error);
        alert('❌ 업로드 중 오류가 발생했습니다.');
    }
}

// 네이버 지도에 업로드
async function uploadToNaverMap() {
    try {
        const result = await chrome.storage.local.get(['lastExportData', 'lastExportFolderName']);
        
        if (!result.lastExportData || result.lastExportData.length === 0) {
            alert('❌ 먼저 카카오맵에서 데이터를 내보내주세요!');
            return;
        }
        
        const data = result.lastExportData;
        const folderName = result.lastExportFolderName || 'favorites';
        
        // 네이버 지도 저장 페이지 열기
        chrome.tabs.create({
            url: 'https://map.naver.com/p?c=15.00,0,0,0,dh'
        });
        
        // 데이터를 세션 스토리지에 저장 (네이버 지도 페이지에서 사용)
        chrome.storage.local.set({
            naverImportData: data,
            naverImportFolderName: folderName
        });
        
        alert(`📍 네이버 지도가 열립니다!\n\n${data.length}개의 장소를 추가하려면:\n1. 좌측 "저장" 탭 클릭\n2. "새 목록" 만들기\n3. 각 장소를 검색해서 추가해주세요\n\n⚠️ 네이버 지도는 CSV 직접 업로드를 지원하지 않아\n수동으로 추가해야 합니다.`);
        
    } catch (error) {
        console.error('네이버 지도 열기 실패:', error);
        alert('❌ 오류가 발생했습니다.');
    }
}

// CSV 생성 함수
function generateCSV(items) {
    let csvContent = "Name,Address,Latitude,Longitude,Description,URL\n";
    
    items.forEach(item => {
        const name = (item.display1 || item.name || "No Name").replace(/,/g, " ");
        const address = (item.display2 || item.address || "").replace(/,/g, " ");
        const memo = (item.memo || "").replace(/,/g, " ").replace(/\n/g, " ");
        const lat = item.lat || 0;
        const lng = item.lon || 0;
        const url = `https://map.kakao.com/?itemId=${item.poiId || item.id || item.key || ""}`;
        
        csvContent += `${name},${address},${lat},${lng},${memo},${url}\n`;
    });
    
    return csvContent;
}

// 카카오맵 열기
function openKakaoMap() {
    chrome.tabs.create({
        url: 'https://map.kakao.com'
    });
}
