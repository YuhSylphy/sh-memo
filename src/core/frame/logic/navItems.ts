export type NavItem = {
	label: string;
	to: string;
};

const staticNavItems: NavItem[] = [
	{ label: 'サンプルページ', to: '/sample' },
];

/**
 * ナビゲーションメニューのアイテムを返す。
 * 将来的には認証済みAPIのレスポンスをマージする処理を追加予定。
 */
export async function fetchNavItems(): Promise<NavItem[]> {
	// TODO: 認証付きAPIからアイテムを取得してstaticNavItemsとマージする
	return staticNavItems;
}
