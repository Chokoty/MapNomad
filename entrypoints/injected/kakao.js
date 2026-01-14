(function() {
    // 토스트 알림 함수
    function showToast(message, duration = 4000) {
        // 기존 토스트 제거
        const existingToast = document.getElementById('kakao-export-toast');
        if (existingToast) existingToast.remove();
        
        // 토스트 생성
        const toast = document.createElement('div');
        toast.id = 'kakao-export-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 400px;
            line-height: 1.5;
            animation: slideIn 0.3s ease-out;
        `;
        
        // 애니메이션 추가
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(-100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // 자동 제거
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // Kakao Maps SDK를 비동기로 로드 (document.write 경고 방지)
    function loadKakaoMapsSDK(callback) {
        // 이미 로드되어 있으면 바로 콜백 실행
        if (window.kakao && window.kakao.maps) {
            callback();
            return;
        }

        // 스크립트 동적 로드
        const script = document.createElement('script');
        script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?autoload=false';
        script.async = true;
        script.onload = function() {
            if (window.kakao && window.kakao.maps) {
                window.kakao.maps.load(callback);
            } else {
                console.error('[KakaoExport] Kakao Maps SDK 로드 실패');
            }
        };
        script.onerror = function() {
            console.error('[KakaoExport] Kakao Maps SDK 스크립트 로드 실패');
        };
        document.head.appendChild(script);
    }

    // SDK 로드 시작
    loadKakaoMapsSDK(function() {
        console.log('[KakaoExport] Kakao Maps SDK 로드 완료');
    });

    // 즐겨찾기 폴더 클릭 감지를 위한 변수
    let lastCapturedData = null;
    let allFoldersData = null;

    // 방법 1: XHR 가로채기 (초기 로드 시)
    const XHR = XMLHttpRequest.prototype;
    const open = XHR.open;
    const send = XHR.send;

    // URL 확인을 위해 open 재정의
    XHR.open = function(method, url) {
        this._url = url;
        return open.apply(this, arguments);
    };

    // 응답 데이터를 받기 위해 send 재정의
    XHR.send = function(postData) {
        this.addEventListener('load', function() {
            // 타겟 URL: favorite/list.json 확인 (절대경로 또는 상대경로 모두 처리)
            if (this._url && this._url.includes('favorite/list.json')) {
                try {
                    // URL에서 폴더 ID 개수 확인
                    const urlParams = new URLSearchParams(this._url.split('?')[1]);
                    const folderIds = urlParams.getAll('folderIds[]');
                    
                    const responseData = JSON.parse(this.responseText);
                    
                    // 데이터 구조 파악
                    let items = [];
                    if (responseData.result && Array.isArray(responseData.result)) {
                        items = responseData.result;
                    } else if (Array.isArray(responseData)) {
                        items = responseData;
                    }

                    if (items.length > 0) {
                        // 다중 폴더 요청 (초기 로드): 모든 데이터 저장
                        if (folderIds.length > 1) {
                            window.allFavoritesData = items;
                            console.log(`[KakaoExport] 📦 전체 ${items.length}개의 장소 데이터 저장됨`);
                            
                            // 폴더 목록도 가져오기
                            fetchFolderList();
                        } 
                        // 단일 폴더 요청: 해당 폴더 데이터만 저장
                        else if (folderIds.length === 1) {
                            lastCapturedData = items;
                            console.log(`[KakaoExport] ✅ ${items.length}개의 장소 데이터 캡처됨 (내보내기 버튼을 클릭하세요)`);
                        }
                    }

                } catch (e) {
                    console.error("[KakaoExport] 파싱 에러:", e);
                }
            }
        });
        return send.apply(this, arguments);
    };

    // 방법 2: 폴더 클릭 이벤트 감지
    function setupFolderClickListeners() {
        // 폴더 링크에 클릭 리스너 추가
        document.addEventListener('click', function(e) {
            const target = e.target;
            
            // 폴더 링크 클릭 감지
            if (target.classList.contains('link_txt') || 
                target.classList.contains('link_favorite') ||
                (target.tagName === 'A' && target.closest('[class*="favorite"]'))) {
                
                const folderName = target.textContent.trim();
                
                // 폴더명이 유효한 경우에만 처리
                if (folderName && folderName !== '즐겨찾기' && folderName.length > 0) {
                    console.log('[KakaoExport] 폴더 클릭 감지:', folderName);
                    
                    // 잠시 후 화면에 표시된 데이터 확인
                    setTimeout(() => {
                        // 전체 데이터가 있으면 사용
                        if (window.allFavoritesData && window.allFavoritesData.length > 0) {
                            // 현재 화면에 표시된 장소 요소들
                            const placeItems = document.querySelectorAll('.FavoriteDetailItem');
                            console.log('[KakaoExport] 화면 장소 수:', placeItems.length);
                            
                            // 장소 이름 추출 (a.link_txt에서)
                            const visiblePlaces = Array.from(placeItems).map(item => {
                                const nameEl = item.querySelector('a.link_txt');
                                return nameEl ? nameEl.textContent.trim() : '';
                            }).filter(name => name.length > 0);
                            
                            console.log('[KakaoExport] 화면 장소 이름:', visiblePlaces.slice(0, 3));
                            
                            // 전체 데이터에서 화면에 표시된 장소만 필터링 (정확한 매칭)
                            const filteredData = window.allFavoritesData.filter(item => {
                                const itemName = item.display1 || item.name || '';
                                return visiblePlaces.includes(itemName);
                            });
                            
                            if (filteredData.length > 0) {
                                lastCapturedData = filteredData;
                                console.log(`[KakaoExport] ✅ ${filteredData.length}개의 장소 데이터 캡처됨 (${folderName})`);
                            } else {
                                console.warn('[KakaoExport] ⚠️ 필터링된 데이터 없음');
                            }
                        }
                    }, 800);
                }
            }
        }, true);
        
        console.log('[KakaoExport] 폴더 클릭 감시 시작');
    }
    
    // 페이지 로드 후 폴더 클릭 리스너 설정
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupFolderClickListeners);
    } else {
        setupFolderClickListeners();
    }

    // 폴더 목록 가져오기
    function fetchFolderList() {
        // 카카오맵 폴더 목록 API 호출
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://map.kakao.com/folder/list.json?sort=CREATE_AT', true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response.result && Array.isArray(response.result)) {
                        // API 응답 구조: {folderId, title, favoriteCount, ...}
                        allFoldersData = window.allFoldersData = response.result.map(folder => ({
                            id: folder.folderId,
                            name: folder.title,
                            count: folder.favoriteCount
                        }));
                        console.log(`[KakaoExport] 📁 ${allFoldersData.length}개 폴더 로드됨:`, allFoldersData);
                    }
                } catch (e) {
                    console.error('[KakaoExport] 폴더 목록 파싱 에러:', e);
                }
            }
        };
        xhr.send();
    }

    // 폴더 선택 모달 표시
    function showFolderSelectionModal() {
        if (!allFoldersData || allFoldersData.length === 0) {
            showToast('❌ 폴더 데이터가 없습니다. 페이지를 새로고침 해주세요.');
            return;
        }

        if (!window.allFavoritesData || window.allFavoritesData.length === 0) {
            showToast('❌ 즐겨찾기 데이터가 없습니다. 페이지를 새로고침 해주세요.');
            return;
        }

        // 기존 모달 제거
        const existingModal = document.getElementById('kakao-folder-modal');
        if (existingModal) existingModal.remove();

        // 모달 오버레이
        const modal = document.createElement('div');
        modal.id = 'kakao-folder-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.2s ease-out;
        `;

        // 모달 컨텐츠
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 24px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease-out;
        `;

        // 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .kakao-folder-item {
                padding: 12px 16px;
                margin: 8px 0;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .kakao-folder-item:hover {
                border-color: #FEE500;
                background: #fffbea;
            }
            .kakao-folder-item.selected {
                border-color: #FEE500;
                background: #fff9d6;
            }
            .kakao-folder-checkbox {
                width: 20px;
                height: 20px;
                cursor: pointer;
            }
            .kakao-folder-info {
                flex: 1;
            }
            .kakao-folder-name {
                font-weight: 600;
                font-size: 15px;
                color: #333;
            }
            .kakao-folder-count {
                font-size: 13px;
                color: #666;
                margin-top: 4px;
            }
        `;
        document.head.appendChild(style);

        // 헤더
        const header = document.createElement('h2');
        header.textContent = '📁 내보낼 폴더 선택';
        header.style.cssText = `
            margin: 0 0 20px 0;
            font-size: 20px;
            color: #333;
        `;

        // 폴더 리스트 컨테이너
        const folderList = document.createElement('div');
        folderList.style.cssText = 'margin: 20px 0;';

        // 각 폴더의 북마크 개수 계산
        const folderBookmarkCounts = {};
        allFoldersData.forEach(folder => {
            // API에서 이미 favoriteCount를 제공하므로 그대로 사용
            folderBookmarkCounts[folder.id] = folder.count || 0;
        });

        // 선택된 폴더 ID 저장
        const selectedFolders = new Set();

        // 폴더 아이템 생성
        allFoldersData.forEach(folder => {
            const count = folderBookmarkCounts[folder.id];
            
            const folderItem = document.createElement('div');
            folderItem.className = 'kakao-folder-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'kakao-folder-checkbox';
            checkbox.id = `kakao-folder-${folder.id}`;
            
            const folderInfo = document.createElement('div');
            folderInfo.className = 'kakao-folder-info';
            
            const folderName = document.createElement('div');
            folderName.className = 'kakao-folder-name';
            folderName.textContent = folder.name;
            
            const folderCount = document.createElement('div');
            folderCount.className = 'kakao-folder-count';
            folderCount.textContent = `${count}개의 장소`;
            
            folderInfo.appendChild(folderName);
            folderInfo.appendChild(folderCount);
            
            folderItem.appendChild(checkbox);
            folderItem.appendChild(folderInfo);
            
            // 클릭 이벤트
            folderItem.onclick = (e) => {
                if (e.target === checkbox) return; // 체크박스 직접 클릭은 무시
                checkbox.checked = !checkbox.checked;
                
                if (checkbox.checked) {
                    selectedFolders.add(folder.id);
                    folderItem.classList.add('selected');
                } else {
                    selectedFolders.delete(folder.id);
                    folderItem.classList.remove('selected');
                }
            };
            
            checkbox.onchange = () => {
                if (checkbox.checked) {
                    selectedFolders.add(folder.id);
                    folderItem.classList.add('selected');
                } else {
                    selectedFolders.delete(folder.id);
                    folderItem.classList.remove('selected');
                }
            };
            
            folderList.appendChild(folderItem);
        });

        // 버튼 컨테이너
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 12px;
            margin-top: 24px;
        `;

        // 취소 버튼
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '취소';
        cancelBtn.style.cssText = `
            flex: 1;
            padding: 12px;
            border: 2px solid #e0e0e0;
            background: white;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        `;
        cancelBtn.onmouseover = () => {
            cancelBtn.style.background = '#f5f5f5';
        };
        cancelBtn.onmouseout = () => {
            cancelBtn.style.background = 'white';
        };
        cancelBtn.onclick = () => {
            modal.remove();
        };

        // 내보내기 버튼
        const exportBtn = document.createElement('button');
        exportBtn.textContent = '선택한 폴더 내보내기';
        exportBtn.style.cssText = `
            flex: 2;
            padding: 12px;
            border: none;
            background: #FEE500;
            color: #000;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        `;
        exportBtn.onmouseover = () => {
            exportBtn.style.background = '#FFD700';
        };
        exportBtn.onmouseout = () => {
            exportBtn.style.background = '#FEE500';
        };
        exportBtn.onclick = () => {
            if (selectedFolders.size === 0) {
                showToast('❌ 최소 1개 이상의 폴더를 선택해주세요!');
                return;
            }
            exportSelectedFolders(Array.from(selectedFolders));
            modal.remove();
        };

        buttonContainer.appendChild(cancelBtn);
        buttonContainer.appendChild(exportBtn);

        modalContent.appendChild(header);
        modalContent.appendChild(folderList);
        modalContent.appendChild(buttonContainer);
        modal.appendChild(modalContent);

        // 모달 외부 클릭시 닫기
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };

        document.body.appendChild(modal);
    }

    // 선택된 폴더들 내보내기
    function exportSelectedFolders(folderIds) {
        const selectedFolders = allFoldersData.filter(f => folderIds.includes(f.id));
        
        if (selectedFolders.length === 0) {
            showToast('❌ 선택된 폴더가 없습니다!');
            return;
        }

        // 각 폴더별로 CSV 생성
        selectedFolders.forEach(folder => {
            const filteredBookmarks = window.allFavoritesData.filter(item => {
                // folderId가 배열인 경우와 단일 값인 경우 모두 처리
                if (Array.isArray(item.folderId)) {
                    return item.folderId.includes(folder.id);
                } else {
                    return item.folderId === folder.id;
                }
            });

            if (filteredBookmarks.length > 0) {
                convertToCSV(filteredBookmarks, folder.name);
            }
        });

        const totalCount = selectedFolders.reduce((sum, folder) => {
            return sum + window.allFavoritesData.filter(item => {
                if (Array.isArray(item.folderId)) {
                    return item.folderId.includes(folder.id);
                } else {
                    return item.folderId === folder.id;
                }
            }).length;
        }, 0);

        showToast(`✅ ${selectedFolders.length}개 폴더, 총 ${totalCount}개 장소 내보내기 완료!`, 4000);
    }

    // 방법 3: 수동 내보내기 버튼 추가
    function addExportButton() {
        // 이미 버튼이 있으면 제거
        const existingBtn = document.getElementById('kakao-export-btn');
        if (existingBtn) existingBtn.remove();

        // 즐겨찾기 영역 찾기
        const favoriteContainer = document.querySelector('.favorite_list') || 
                                 document.querySelector('[class*="favorite"]') ||
                                 document.querySelector('.list_favorite');
        
        if (!favoriteContainer) {
            console.log('[KakaoExport] 즐겨찾기 컨테이너를 찾을 수 없습니다');
            return;
        }

        // 내보내기 버튼 생성
        const exportBtn = document.createElement('button');
        exportBtn.id = 'kakao-export-btn';
        exportBtn.textContent = '📥 CSV로 내보내기';
        exportBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 100px;
            z-index: 10000;
            padding: 12px 24px;
            background: #FEE500;
            color: #000;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-size: 14px;
        `;

        exportBtn.onclick = function() {
            // 폴더 선택 모달 표시
            showFolderSelectionModal();
        };

        document.body.appendChild(exportBtn);
        console.log('[KakaoExport] ✅ 내보내기 버튼이 추가되었습니다 (우측 하단)');
    }

    // 페이지 로드 후 버튼 추가
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addExportButton);
    } else {
        setTimeout(addExportButton, 1000);
    }


    // CSV 변환 및 다운로드 함수
    function convertToCSV(items, folderName = 'favorites') {
        // 구글 내 지도(My Maps) 호환 헤더
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // BOM 추가
        csvContent += "Name,Address,Latitude,Longitude,Description,URL\n";

        let count = 0;

        items.forEach(item => {
            // 스크린샷 기반 필드 매핑
            // display1: 장소명, display2: 주소, memo: 메모
            // x, y: 카카오 좌표
            
            const name = (item.display1 || item.name || "No Name").replace(/,/g, " ");
            const address = (item.display2 || item.address || "").replace(/,/g, " ");
            const memo = (item.memo || "").replace(/,/g, " ").replace(/\n/g, " ");
            const url = `https://map.kakao.com/?itemId=${item.poiId || item.id || item.key || ""}`; // 바로가기 링크

            // 좌표 처리: API에 이미 위경도가 있으면 사용, 없으면 변환
            let lat = item.lat || 0;
            let lng = item.lon || 0;
            
            // 위경도가 없고 x, y 좌표가 있으면 변환 시도
            if ((!lat || !lng) && item.x && item.y && window.kakao && window.kakao.maps && window.kakao.maps.Coords) {
                try {
                    // 카카오 내부 좌표계 객체 생성
                    const coords = new window.kakao.maps.Coords(item.x, item.y);
                    // 위경도로 변환
                    const latLng = coords.toLatLng(); 
                    lat = latLng.getLat();
                    lng = latLng.getLng();
                } catch (err) {
                    console.warn("[KakaoExport] 좌표 변환 실패:", item.display1, err);
                }
            }

            // CSV 행 추가
            csvContent += `${name},${address},${lat},${lng},${memo},${url}\n`;
            count++;
        });

        if (count > 0) {
            // 파일명에 폴더명 포함 (특수문자 제거)
            const safeFolderName = folderName.replace(/[^a-zA-Z0-9가-힣]/g, '_');
            const timestamp = new Date().getTime();
            const filename = `kakao_favorites_${safeFolderName}.csv`;
            
            // 다운로드 트리거
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            
            console.log(`[KakaoExport] ✅ ${count}개의 장소가 "${filename}"로 저장되었습니다!`);
            
            
            // Content Script로 메시지 전달 (Chrome Storage 저장용)
            window.postMessage({
                type: 'KAKAO_EXPORT_SAVE',
                data: {
                    lastExportData: items,
                    lastExportFolderName: folderName,
                    lastExportTime: timestamp
                }
            }, '*');
            
            console.log('[KakaoExport] 데이터 저장 요청 전송');
        }
    }
})();