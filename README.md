보내주신 구체적인 기술 스택과 기능을 반영하여, 프로젝트 명칭인 **MapNomad**의 철학을 유지하면서도 실제 사용법과 구조가 명확히 드러나도록 `README.md`를 재구성했습니다.

단순한 'Exporter'라는 이름보다 **'자유로운 데이터 이동성'**을 강조하는 톤으로 업데이트했습니다.

---

# 📍 MapNomad (맵노마드)

> **Breaking Boundaries Between Maps.** > 국내 지도 서비스(카카오, 네이버)의 데이터를 추출하여 구글 지도 등 전 세계 어디서든 사용할 수 있게 만드는 크롬 확장 프로그램입니다.

## 1. 프로젝트 비전 (Vision)

특정 지도 서비스의 폐쇄적인 생태계에서 당신의 소중한 '장소 데이터'를 해방시킵니다. **MapNomad**는 플랫폼에 종속되지 않는 독립적인 데이터 주권을 지향하며, 사용자가 어디로 이동하든 자신의 지도를 지속적으로 관리할 수 있는 환경을 제공합니다.

---

## 2. 🚀 주요 기능 (Features)

* **플랫폼 통합 내보내기**: 카카오맵 및 네이버 지도의 즐겨찾기 데이터를 범용적인 CSV 형식으로 추출합니다.
* **유연한 데이터 선택**: 전체 데이터뿐만 아니라 폴더별 선택 내보내기를 지원합니다.
* **구글 지도 즉시 호환**: 추출된 CSV는 'Google 내 지도(My Maps)'의 표준 포맷과 완벽히 호환되어 즉시 업로드 가능합니다.
* **다중 폴더 병합**: 여러 폴더에 흩어진 장소를 한 번에 모아서 관리할 수 있습니다.

---

## 3. 🛠️ 기술 스택 (Tech Stack)

* **Framework**: [WXT](https://wxt.dev/) (Modern Web Extension Framework)
* **Build Tool**: Vite
* **Manifest**: Chrome Extension Manifest V3
* **Language**: JavaScript

---

## 4. 📦 설치 및 개발 (Installation)

### 개발자 모드 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (Hot Reload 지원)
npm run dev

# 프로덕션 빌드 및 압축
npm run build
npm run zip

```

### 확장 프로그램 로드

1. 크롬 브라우저에서 `chrome://extensions` 접속
2. 우측 상단 **"개발자 모드"** 활성화
3. **"압축해제된 확장 프로그램을 로드합니다"** 클릭
4. 프로젝트 경로의 `.output/chrome-mv3` (프로덕션) 또는 `.output/chrome-mv3-dev` (개발) 폴더 선택

---

## 🎯 사용 방법 (Usage)

### 1단계: 국내 지도에서 데이터 추출

1. **카카오맵** [즐겨찾기](https://map.kakao.com/favorite/list) 또는 **네이버 지도** [저장](https://map.naver.com/p/my) 페이지 접속
2. 페이지 새로고침(F5) 후 우측 하단에 나타나는 **"📥 CSV로 내보내기"** 버튼 클릭
3. 원하는 폴더를 선택하고 내보내기 실행

### 2단계: 구글 지도에 적용

1. [Google 내 지도](https://www.google.com/maps/d/) 접속 후 **"새 지도 만들기"**
2. 레이어에서 **"가져오기"** 클릭
3. MapNomad가 생성한 CSV 파일 업로드

---

## 📁 프로젝트 구조 (Project Structure)

```
map-nomad/
├── entrypoints/
│   ├── popup/               # 확장 프로그램 팝업 UI 및 로직
│   ├── kakao.content.js     # 카카오맵 데이터 주입 스크립트
│   └── naver.content.js     # 네이버 지도 데이터 주입 스크립트
├── public/
│   ├── injected/            # 실제 페이지에 실행될 인젝션 스크립트
│   └── icon-*.png           # MapNomad 공식 핀 아이콘
├── wxt.config.js            # WXT 설정 파일
└── package.json

```

---

## 📝 데이터 포맷 (Data Format)

MapNomad는 아래와 같은 표준화된 인터페이스를 통해 데이터의 상호 운용성을 보장합니다.

| Name | Address | Latitude | Longitude | Description | URL |
| --- | --- | --- | --- | --- | --- |
| 장소명 | 주소 | 위도 | 경도 | 메모 | 원본 링크 |

---

## 📄 라이선스 (License)

본 프로젝트는 **ISC** 라이선스를 따릅니다.

---

### 💡 향후 개발 방향

현재 구현된 CSV 형식은 구글 지도에 최적화되어 있으나, 향후 `GeoJSON` 지원을 추가한다면 단순한 '백업' 도구를 넘어 전문적인 GIS(지리정보시스템) 데이터 마이그레이션 도구로 확장이 가능합니다.

