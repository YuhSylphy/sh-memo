import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
	base: '/sh-memo/',
	plugins: [
		react(),
		nodePolyfills(),
		VitePWA({
			registerType: 'autoUpdate',
			// ビルド成果物を precache（デフォルト: dist/**）
			includeAssets: [
				'favicon.ico',
				'apple-touch-icon.png',
				'robots.txt',
			],
			manifest: {
				name: 'sh-memo',
				short_name: 'sh-memo',
				description: 'Private document viewer',
				theme_color: '#6f4a2f',
				background_color: '#f4efe8',
				display: 'standalone',
				start_url: '/sh-memo/',
				scope: '/sh-memo/',
				icons: [
					{
						src: 'pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
					},
				],
			},
			workbox: {
				// navigateFallback で SPA の 404 を index.html にフォールバック
				navigateFallback: '/sh-memo/index.html',
				navigateFallbackDenylist: [/^\/sh-memo\/404\.html$/],
				// GitHub Content API レスポンスを NetworkFirst でキャッシュ
				runtimeCaching: [
					{
						urlPattern:
							/^https:\/\/api\.github\.com\/repos\/YuhSylphy\/private-docs\//,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'github-api-cache',
							networkTimeoutSeconds: 10,
							expiration: {
								maxEntries: 200,
								maxAgeSeconds: 7 * 24 * 60 * 60, // 7日
							},
							cacheableResponse: {
								statuses: [0, 200],
							},
						},
					},
				],
			},
		}),
	],
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: './src/test/setup.ts',
		css: true,
		reporters: ['default', 'html'],
		outputFile: './reports/test/index.html',
		coverage: {
			provider: 'v8',
			reporter: ['html'],
			reportsDirectory: './reports/coverage',
		},
	},
});
