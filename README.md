# Map Bookmark Exporter

카카오맵과 네이버 지도의 즐겨찾기를 CSV 파일로 내보내서 구글 지도에 추가할 수 있는 Chrome 확장 프로그램입니다.

## 🚀 Features

- ✅ 카카오맵 즐겨찾기 내보내기
- ✅ 네이버 지도 즐겨찾기 내보내기
- ✅ 폴더별 선택 내보내기
- ✅ 구글 지도 호환 CSV 형식
- ✅ 다중 폴더 동시 내보내기

## 📦 Installation

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Create zip for Chrome Web Store
npm run zip
```

### Load Extension

1. Chrome에서 `chrome://extensions` 열기
2. "개발자 모드" 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. `.output/chrome-mv3` 폴더 선택 (프로덕션) 또는 `.output/chrome-mv3-dev` (개발)

## 🎯 Usage

### 카카오맵

1. [카카오맵 즐겨찾기](https://map.kakao.com/favorite/list) 페이지 접속
2. 페이지 새로고침 (F5)
3. 우측 하단 "📥 CSV로 내보내기" 버튼 클릭
4. 내보낼 폴더 선택
5. "선택한 폴더 내보내기" 클릭

### 네이버 지도

1. [네이버 지도 저장](https://map.naver.com/p/my) 페이지 접속
2. 페이지 새로고침 (F5)
3. 우측 하단 "📥 CSV로 내보내기" 버튼 클릭
4. 내보낼 폴더 선택
5. "선택한 폴더 내보내기" 클릭

### 구글 지도에 추가

1. [Google My Maps](https://www.google.com/maps/d/u/0/) 접속
2. "새 지도 만들기" 클릭
3. "가져오기" 클릭
4. 다운로드한 CSV 파일 업로드

## 🛠️ Tech Stack

- **Framework**: [WXT](https://wxt.dev/) - Modern web extension framework
- **Build Tool**: Vite
- **Language**: JavaScript
- **Manifest**: Chrome Extension Manifest V3

## 📁 Project Structure

```
map-bookmark-share/
├── entrypoints/
│   ├── popup/
│   │   ├── index.html      # Popup UI
│   │   └── main.js          # Popup logic
│   ├── kakao.content.js     # Kakao Map content script
│   └── naver.content.js     # Naver Map content script
├── public/
│   ├── injected/
│   │   ├── kakao.js         # Kakao Map injected script
│   │   └── naver.js         # Naver Map injected script
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── wxt.config.js            # WXT configuration
└── package.json
```

## 🔧 Development

### Hot Reload

WXT provides automatic hot reload during development:
- UI changes (popup) reload instantly
- Content script changes reload the extension
- Press `Alt+R` to manually reload

### Build Commands

```bash
# Development mode (with HMR)
npm run dev

# Development for Firefox
npm run dev:firefox

# Production build
npm run build

# Production build for Firefox
npm run build:firefox

# Create distributable zip
npm run zip
```

## 📝 CSV Format

Generated CSV files are compatible with Google My Maps:

```csv
Name,Address,Latitude,Longitude,Description,URL
장소명,주소,위도,경도,메모,URL
```

## 🎨 Icon

빨간색 지도 핀 아이콘 (3 sizes: 16px, 48px, 128px)

## 📄 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
