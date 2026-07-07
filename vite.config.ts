import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { VitePWA } from 'vite-plugin-pwa';
import { createLogger, type Plugin } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

// generateBundle で収集した「shiki 以外の 500 kB 超チャンク」を customLogger へ渡す共有状態
let _nonShikiLargeChunks: string[] = [];

/**
 * shiki 言語グラマー由来のチャンクの chunk size 警告を抑制するプラグイン。
 * generateBundle でモジュール ID を走査し、shiki 以外の大きなチャンクを記録する。
 * Vite 組み込みの集約警告は customLogger 側でインターセプトし再出力を制御する。
 */
const chunkSizeGuardPlugin = (): Plugin => ({
	name: 'chunk-size-guard',
	enforce: 'post',
	generateBundle(_opts, bundle) {
		_nonShikiLargeChunks = [];
		const LIMIT = 500 * 1024;
		for (const chunk of Object.values(bundle)) {
			if (chunk.type !== 'chunk') continue;
			const size = Buffer.byteLength(chunk.code, 'utf8');
			if (size <= LIMIT) continue;
			// rolldown: moduleIds?: string[], rollup: modules: Record<string, ...>
			const moduleIds: string[] =
				(chunk as unknown as { moduleIds?: string[] }).moduleIds ??
				Object.keys(
					(chunk as unknown as { modules?: Record<string, unknown> })
						.modules ?? {},
				);
			const isShiki = moduleIds.some(
				(id) =>
					id.includes('/node_modules/shiki/') ||
					id.includes('/node_modules/@shikijs/'),
			);
			if (!isShiki) {
				_nonShikiLargeChunks.push(
					`${chunk.fileName} (${(size / 1024).toFixed(0)} kB)`,
				);
			}
		}
	},
});

// Vite 組み込みの "Some chunks are larger than" 警告をインターセプト。
// shiki グラマー以外のチャンクが対象の場合のみカスタムメッセージで再警告する。
const _logger = createLogger();
const _origWarn = _logger.warn.bind(_logger);
_logger.warn = (msg, options) => {
	if (msg.includes('chunks are larger than')) {
		if (_nonShikiLargeChunks.length > 0) {
			_origWarn(
				'\n(!) Non-shiki chunks are larger than 500 kB after minification:\n' +
					_nonShikiLargeChunks.map((c) => `  - ${c}`).join('\n') +
					'\nConsider splitting with dynamic import() or manualChunks.\n',
				options,
			);
		}
		// shiki のみが大きい場合は警告なし
		return;
	}
	_origWarn(msg, options);
};

export default defineConfig({
	base: '/sh-memo/',
	customLogger: _logger,
	plugins: [
		react(),
		nodePolyfills(),
		chunkSizeGuardPlugin(),
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
	build: {
		rollupOptions: {
			onwarn: (warning, defaultHandler) => {
				// shiki 言語グラマーのチャンクは node_modules/shiki 由来のモジュールで構成される。
				// 1言語1チャンクに分割済みでこれ以上削減できないため、それらのみ警告を抑制する。
				// 独自コードの 500 kB 超過は通常通り警告する。
				if (
					warning.code === 'CHUNK_TOO_LARGE' &&
					warning.ids?.some(
						(id: string) =>
							id.includes('/node_modules/shiki/') ||
							id.includes('/node_modules/@shikijs/'),
					)
				) {
					return;
				}
				defaultHandler(warning);
			},
			output: {
				// MUI / React / Redux を index.js から分離してメインチャンクを削減する。
				// rolldown では manualChunks はオブジェクトではなく関数形式が必要。
				manualChunks: (id: string) => {
					if (
						id.includes('/react/') ||
						id.includes('/react-dom/') ||
						id.includes('/react-router/')
					) {
						return 'vendor-react';
					}
					if (id.includes('/@mui/icons-material/')) {
						return 'vendor-mui-icons';
					}
					if (id.includes('/@emotion/')) {
						return 'vendor-emotion';
					}
					if (
						id.includes('/@reduxjs/') ||
						id.includes('/redux-observable/') ||
						id.includes('/rxjs/')
					) {
						return 'vendor-redux';
					}
				},
			},
		},
	},
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
