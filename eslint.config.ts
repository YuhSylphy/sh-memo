import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default defineConfig([
	globalIgnores(['coverage', 'dist', 'storybook-static']),
	{
		files: ['**/*.{ts,tsx}'],
		extends: [
			js.configs.recommended,
			tseslint.configs.recommended,
			react.configs.flat.recommended,
			react.configs.flat['jsx-runtime'],
			reactHooks.configs.flat.recommended,
			reactRefresh.configs.vite,
			{
				rules: {
					semi: ['error', 'always'],
					'react/react-in-jsx-scope': 'off',
				},
			},
		],
		languageOptions: {
			globals: globals.browser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
	},
	{
		files: [
			'**/*.stories.{ts,tsx}',
			'**/*.test.{ts,tsx}',
			'src/test/**/*.ts',
		],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},
]);
