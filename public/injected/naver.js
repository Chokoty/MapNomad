(function() {
    // 토스트 알림 함수
    function showToast(message, duration = 4000) {
        const existingToast = document.getElementById('naver-export-toast');
        if (existingToast) existingToast.remove();
        
        const toast = document.createElement('div');
        toast.id = 'naver-export-toast';
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
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(-100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(-100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    let allBookmarksData = null;
    let allFoldersData = null;
    let lastCapturedData = null;

    // 디버깅을 위해 window에 노출
    window.allBookmarksData = null;
    window.allFoldersData = null;
    window.lastCapturedData = null;

    // XHR 가로채기
    const XHR = XMLHttpRequest.prototype;
    const open = XHR.open;
    const send = XHR.send;

    XHR.open = function(method, url) {
        this._url = url;
        return open.apply(this, arguments);
    };

    XHR.send = function(postData) {
        this.addEventListener('load', function() {
            if (this._url && this._url.includes('/api/bookmark')) {
                try {
                    const responseData = JSON.parse(this.responseText);
                    console.log('[NaverExport] 📦 북마크 데이터 수신:', responseData);

                    if (responseData.my) {
                        // 폴더 데이터 저장
                        if (responseData.my.folderSync && responseData.my.folderSync.folders) {
                            allFoldersData = window.allFoldersData = responseData.my.folderSync.folders;
                            console.log(`[NaverExport] 📁 ${allFoldersData.length}개 폴더 저장됨`);
                        }

                        // 북마크 데이터 저장
                        if (responseData.my.bookmarkSync && responseData.my.bookmarkSync.bookmarks) {
                            allBookmarksData = window.allBookmarksData = responseData.my.bookmarkSync.bookmarks;
                            console.log(`[NaverExport] 📍 ${allBookmarksData.length}개 장소 저장됨`);
                        }
                    }
                } catch (e) {
                    console.error('[NaverExport] 파싱 에러:', e);
                }
            }
        });
        return send.apply(this, arguments);
    };

    // 폴더 클릭 감지
    function setupFolderClickListeners() {
        document.addEventListener('click', function(e) {
            // 모든 클릭을 감지하고 폴더 관련 클릭인지 확인
            setTimeout(() => {
                // h1 태그에서 현재 폴더명 추출
                const folderNameEl = document.querySelector('h1[class*="_text"]');
                
                if (folderNameEl && allFoldersData && allBookmarksData) {
                    const folderName = folderNameEl.textContent.trim();
                    
                    // 유효한 폴더명인지 확인
                    if (!folderName) return;
                    
                    // 폴더 목록에 있는 폴더인지 확인
                    const folder = allFoldersData.find(f => f.name === folderName);
                    
                    if (folder) {
                        // 이미 같은 폴더가 캡처되어 있으면 스킵
                        if (window.lastCapturedData && window.lastCapturedData.folderName === folderName) {
                            return;
                        }
                        
                        console.log('[NaverExport] 폴더 변경 감지:', folderName);
                        
                        // 해당 폴더의 북마크만 필터링
                        const filteredBookmarks = allBookmarksData.filter(item => {
                            return item.folderMappings && item.folderMappings.some(
                                mapping => mapping.folderId === folder.folderId
                            );
                        });
                        
                        if (filteredBookmarks.length > 0) {
                            lastCapturedData = window.lastCapturedData = {
                                folderName: folderName,
                                bookmarks: filteredBookmarks
                            };
                            console.log(`[NaverExport] ✅ ${filteredBookmarks.length}개 장소 캡처됨 (${folderName})`);
                            showToast(`✅ ${filteredBookmarks.length}개 장소 로드 완료!\n"CSV로 내보내기" 버튼을 클릭하세요.`, 3000);
                        }
                    }
                }
            }, 800);
        }, true);
        
        console.log('[NaverExport] 폴더 클릭 감시 시작 (모든 클릭 감지)');
    }

    // 폴더 선택 모달 표시
    function showFolderSelectionModal() {
        if (!allFoldersData || allFoldersData.length === 0) {
            showToast('❌ 폴더 데이터가 없습니다. 페이지를 새로고침 해주세요.');
            return;
        }

        // 기존 모달 제거
        const existingModal = document.getElementById('naver-folder-modal');
        if (existingModal) existingModal.remove();

        // 모달 오버레이
        const modal = document.createElement('div');
        modal.id = 'naver-folder-modal';
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
            .folder-item {
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
            .folder-item:hover {
                border-color: #03C75A;
                background: #f0fdf4;
            }
            .folder-item.selected {
                border-color: #03C75A;
                background: #dcfce7;
            }
            .folder-checkbox {
                width: 20px;
                height: 20px;
                cursor: pointer;
            }
            .folder-info {
                flex: 1;
            }
            .folder-name {
                font-weight: 600;
                font-size: 15px;
                color: #333;
            }
            .folder-count {
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
            const count = allBookmarksData.filter(item => {
                return item.folderMappings && item.folderMappings.some(
                    mapping => mapping.folderId === folder.folderId
                );
            }).length;
            folderBookmarkCounts[folder.folderId] = count;
        });

        // 선택된 폴더 ID 저장
        const selectedFolders = new Set();

        // 폴더 아이템 생성
        allFoldersData.forEach(folder => {
            const count = folderBookmarkCounts[folder.folderId];
            
            const folderItem = document.createElement('div');
            folderItem.className = 'folder-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'folder-checkbox';
            checkbox.id = `folder-${folder.folderId}`;
            
            const folderInfo = document.createElement('div');
            folderInfo.className = 'folder-info';
            
            const folderName = document.createElement('div');
            folderName.className = 'folder-name';
            folderName.textContent = folder.name;
            
            const folderCount = document.createElement('div');
            folderCount.className = 'folder-count';
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
                    selectedFolders.add(folder.folderId);
                    folderItem.classList.add('selected');
                } else {
                    selectedFolders.delete(folder.folderId);
                    folderItem.classList.remove('selected');
                }
            };
            
            checkbox.onchange = () => {
                if (checkbox.checked) {
                    selectedFolders.add(folder.folderId);
                    folderItem.classList.add('selected');
                } else {
                    selectedFolders.delete(folder.folderId);
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
            background: #03C75A;
            color: white;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        `;
        exportBtn.onmouseover = () => {
            exportBtn.style.background = '#02B350';
        };
        exportBtn.onmouseout = () => {
            exportBtn.style.background = '#03C75A';
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
        const selectedFolders = allFoldersData.filter(f => folderIds.includes(f.folderId));
        
        if (selectedFolders.length === 0) {
            showToast('❌ 선택된 폴더가 없습니다!');
            return;
        }

        // 각 폴더별로 CSV 생성
        selectedFolders.forEach(folder => {
            const filteredBookmarks = allBookmarksData.filter(item => {
                return item.folderMappings && item.folderMappings.some(
                    mapping => mapping.folderId === folder.folderId
                );
            });

            if (filteredBookmarks.length > 0) {
                const data = {
                    folderName: folder.name,
                    bookmarks: filteredBookmarks
                };
                convertToCSV(data, folder.name);
            }
        });

        const totalCount = selectedFolders.reduce((sum, folder) => {
            return sum + allBookmarksData.filter(item => {
                return item.folderMappings && item.folderMappings.some(
                    mapping => mapping.folderId === folder.folderId
                );
            }).length;
        }, 0);

        showToast(`✅ ${selectedFolders.length}개 폴더, 총 ${totalCount}개 장소 내보내기 완료!`, 4000);
    }

    // CSV 변환 및 다운로드
    function convertToCSV(data, folderName) {
        if (!data || !data.bookmarks || data.bookmarks.length === 0) {
            showToast('❌ 내보낼 데이터가 없습니다!');
            return;
        }

        const bookmarks = data.bookmarks;
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += 'Name,Address,Latitude,Longitude,Description,URL\n';

        let count = 0;
        bookmarks.forEach(item => {
            const bookmark = item.bookmark;
            if (!bookmark) return;

            const name = (bookmark.name || '').replace(/"/g, '""');
            const address = (bookmark.address || '').replace(/"/g, '""');
            const lat = bookmark.py || '';  // 위도
            const lon = bookmark.px || '';  // 경도
            const url = `https://map.naver.com/p/search/${encodeURIComponent(bookmark.name)}`;

            csvContent += `"${name}","${address}",${lat},${lon},"","${url}"\n`;
            count++;
        });

        if (count > 0) {
            const safeFolderName = folderName.replace(/[^a-zA-Z0-9가-힣]/g, '_');
            const timestamp = new Date().getTime();
            const filename = `naver_favorites_${safeFolderName}.csv`;

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log(`[NaverExport] ✅ ${count}개의 장소가 "${filename}"로 저장되었습니다!`);

            // Content Script로 메시지 전달
            window.postMessage({
                type: 'NAVER_EXPORT_SAVE',
                data: {
                    naver_lastExportData: bookmarks.map(item => item.bookmark),
                    naver_lastExportFolderName: folderName,
                    naver_lastExportTime: timestamp
                }
            }, '*');
        }
    }

    // 내보내기 버튼 추가
    function addExportButton() {
        const existingBtn = document.getElementById('naver-export-btn');
        if (existingBtn) existingBtn.remove();

        const button = document.createElement('button');
        button.id = 'naver-export-btn';
        button.textContent = '📥 CSV로 내보내기';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 100px;
            background: #03C75A;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(3, 199, 90, 0.3);
            transition: all 0.3s;
        `;

        button.onmouseover = () => {
            button.style.background = '#02B350';
            button.style.transform = 'translateY(-2px)';
            button.style.boxShadow = '0 6px 16px rgba(3, 199, 90, 0.4)';
        };

        button.onmouseout = () => {
            button.style.background = '#03C75A';
            button.style.transform = 'translateY(0)';
            button.style.boxShadow = '0 4px 12px rgba(3, 199, 90, 0.3)';
        };

        button.onclick = () => {
            // 폴더 선택 모달 표시
            showFolderSelectionModal();
        };

        document.body.appendChild(button);
        console.log('[NaverExport] ✅ 내보내기 버튼이 추가되었습니다 (우측 하단)');
    }

    // 페이지 로드 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupFolderClickListeners();
            setTimeout(addExportButton, 1000);
        });
    } else {
        setupFolderClickListeners();
        setTimeout(addExportButton, 1000);
    }

    console.log('[NaverExport] 🚀 네이버 지도 익스포터 로드 완료');
})();
