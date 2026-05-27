import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
	base: '/sh-memo/',
	plugins: [react(), nodePolyfills()],
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
