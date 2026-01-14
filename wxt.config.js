import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/auto-icons'],
  manifest: {
    name: 'Map Bookmark Exporter (Kakao & Naver)',
    version: '2.0',
    description: '카카오맵과 네이버 지도 즐겨찾기를 CSV로 내보내고 구글 지도에 추가합니다.',
    permissions: ['scripting', 'storage', 'downloads'],
    host_permissions: [
      '*://map.kakao.com/*',
      '*://map.naver.com/*'
    ],
    web_accessible_resources: [
      {
        resources: ['injected/*.js'],
        matches: ['<all_urls>']
      }
    ]
  },
});
