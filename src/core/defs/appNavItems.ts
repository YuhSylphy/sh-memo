import type { ComponentType } from 'react';
import type { RouteObject } from 'react-router-dom';

export type AppNavItem = {
	/** メニュー表示ラベル */
	label: string;
	/** アイコン: MUI SvgIcon コンポーネント または Material Icons リガチャ文字列 */
	icon?: ComponentType | string;
	/** メニューに表示するか (default: true) */
	inMenu?: boolean;
	/** 子メニュー */
	children?: AppNavItem[];
	/** ルートパス (先頭 / 付き)。指定時はルートを登録する */
	to?: string;
	/** ページタイトル (RouteHandle.title) */
	title?: string;
	/** MainFrame 配下に置くか (default: true) */
	framed?: boolean;
	/** コードスプリット用の lazy ローダー */
	lazy?: NonNullable<RouteObject['lazy']>;
};

export const appNavItems: AppNavItem[] = [
	{
		label: '設定',
		to: '/config',
		title: 'Config',
		icon: 'settings',
		lazy: async () => ({
			Component: (await import('../../pages/config')).default,
		}),
	},
	{
		label: 'ドキュメント',
		to: '/docs/:documentId', // パラメータ化された1本のルート
		title: 'Document',
		inMenu: false, // メニューには表示しない
		lazy: async () => ({
			Component: (await import('../../pages/docs')).default,
		}),
	},

	{
		label: 'サンプル',
		icon: 'science',
		children: [
			{
				label: 'サンプルページ',
				to: '/sample',
				title: 'Sample',
				icon: 'insert_drive_file',
				lazy: async () => ({
					Component: (await import('../../pages/sample')).default,
				}),
			},
		],
	},
];

/** ルート (/) へのアクセス時にリダイレクトするパス */
export const rootRedirectTo = '/sample';
