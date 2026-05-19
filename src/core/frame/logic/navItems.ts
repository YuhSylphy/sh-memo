import type { ComponentType } from 'react';

export type NavItem = {
	label: string;
	/** ページ遷移先。子要素がある場合は省略可。 */
	to?: string;
	/** MUI SvgIcon コンポーネント、または Material Icons のリガチャ文字列 */
	icon?: ComponentType | string;
	children?: NavItem[];
};

const staticNavItems: NavItem[] = [
	{
		label: 'サンプル',
		icon: 'science',
		children: [
			{ label: 'サンプルページ', to: '/sample', icon: 'insert_drive_file' },
		],
	},
];

/**
 * ナビゲーションメニューのアイテムを返す。
 * 将来的には認証済みAPIのレスポンスをマージする処理を追加予定。
 */
export async function fetchNavItems(): Promise<NavItem[]> {
	// TODO: 認証付きAPIからアイテムを取得してstaticNavItemsとマージする
	return staticNavItems;
}
