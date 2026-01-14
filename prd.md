# 🗺️ KakaoMap Favorites Exporter (카카오맵 즐겨찾기 추출기)

> **카카오맵(KakaoMap)의 즐겨찾기 데이터를 추출하여 구글 지도(Google Maps) 등으로 이관을 돕는 Chrome 확장프로그램입니다.**

카카오맵은 공식적으로 즐겨찾기 데이터 내보내기(Export) 기능을 제공하지 않습니다. 이 도구는 사용자가 자신의 즐겨찾기 그룹을 클릭할 때 발생하는 네트워크 트래픽을 감지하여, 데이터를 **구글 '내 지도(My Maps)'와 호환되는 CSV 형식**으로 자동 변환해 줍니다.

## ✨ 주요 기능 (Features)

* **자동 감지:** 별도의 버튼 클릭 없이, 카카오맵 웹사이트에서 즐겨찾기 폴더를 클릭하면 자동으로 동작합니다.
* **좌표 자동 변환:** 카카오맵 내부 좌표계(Katech/TM 등)를 **WGS84(위도, 경도)**로 자동 변환하여 해외 지도 서비스와 호환됩니다.
* **CSV 내보내기:** 장소명, 주소, 메모, URL, 위경도 정보를 포함한 CSV 파일을 생성합니다.
* **UTF-8 BOM 지원:** 엑셀(Excel)에서 열어도 한글이 깨지지 않도록 인코딩 처리되었습니다.

## 🛠 설치 방법 (Installation)

이 프로젝트는 Chrome Web Store에 등록되지 않은 개인용 개발 도구이므로, **개발자 모드**를 통해 설치해야 합니다.

1.  이 저장소를 클론(Clone)하거나 ZIP으로 다운로드하여 압축을 풉니다.
2.  Chrome 브라우저 주소창에 `chrome://extensions`를 입력하여 이동합니다.
3.  우측 상단의 **'개발자 모드(Developer mode)'** 스위치를 켭니다.
4.  좌측 상단의 **'압축해제된 확장 프로그램을 로드합니다(Load unpacked)'** 버튼을 클릭합니다.
5.  다운로드받은 프로젝트 폴더(manifest.json이 있는 폴더)를 선택합니다.

## 🚀 사용 방법 (Usage)

### 1. 데이터 추출하기
1.  PC Chrome 브라우저에서 [카카오맵](https://map.kakao.com)에 접속하고 로그인합니다.
2.  **새로고침(F5)**을 한 번 수행합니다 (확장프로그램 스크립트 로드).
3.  좌측 메뉴의 **'즐겨찾기'** 탭에서 추출하고 싶은 **그룹 이름**을 클릭합니다.
4.  클릭과 동시에 브라우저가 `kakao_favorites_export_{timestamp}.csv` 파일을 자동으로 다운로드합니다.

### 2. 구글 지도로 옮기기
1.  [Google 내 지도(My Maps)](https://www.google.com/maps/d/)에 접속합니다.
2.  **'새 지도 만들기'**를 클릭합니다.
3.  레이어 메뉴에서 **'가져오기(Import)'**를 클릭하고, 방금 다운로드한 CSV 파일을 업로드합니다.
4.  **장소 위치 설정:** `Latitude`, `Longitude` 열을 선택합니다.
5.  **마커 제목 설정:** `Name` 열을 선택합니다.
6.  완료! 이제 구글 지도 앱에서도 해당 장소들을 볼 수 있습니다.

## 🧩 기술적 원리 (Technical Details)

이 확장프로그램은 **Manifest V3**를 기반으로 하며, `Script Injection` 기법을 사용합니다.

* **Network Interception:** `XMLHttpRequest`의 프로토타입을 후킹(Hooking)하여 `/favorite/list.json` 요청을 가로챕니다.
* **Main World Execution:** 좌표 변환을 위해 카카오맵 페이지 내에 로드된 `kakao.maps.Coords` 객체에 접근해야 합니다. 이를 위해 `content_script`가 아닌 실제 페이지 컨텍스트(`Main World`)에 `inject.js`를 주입하여 실행합니다.

```javascript
// 핵심 좌표 변환 로직 예시
const coords = new window.kakao.maps.Coords(item.x, item.y);
const latLng = coords.toLatLng(); // WGS84 변환
⚠️ 주의사항 (Disclaimer)
이 도구는 개인적인 백업 및 이관 목적으로 개발되었습니다.

카카오맵의 웹 사이트 구조나 API가 변경될 경우 작동하지 않을 수 있습니다.

추출된 데이터의 상업적 이용이나 무단 배포는 카카오의 서비스 이용 약관에 위배될 수 있으므로, 개인적인 용도로만 사용하시기 바랍니다.

📜 License
MIT License


---

### 💡 추가 제안 (Next Step)

GitHub에 올리실 때, **불필요한 파일이 올라가지 않도록 `.gitignore` 파일도 함께 생성**하는 것이 좋습니다.

**"`.gitignore` 파일 내용도 필요하시면 바로 작성해 드릴까요? (맥OS 시스템 파일이나 IDE 설정 파일 제외용)"**