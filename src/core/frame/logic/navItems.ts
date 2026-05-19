import type { ComponentType } from 'react';
import { appNavItems, type AppNavItem } from '../../defs/appNavItems';

export type NavItem = {
	label: string;
	to?: string;
	icon?: ComponentType | string;
	children?: NavItem[];
};

function toMenuTree(items: AppNavItem[]): NavItem[] {
	const result: NavItem[] = [];
	for (const item of items) {
		if (item.inMenu === false) continue;
		const children = item.children ? toMenuTree(item.children) : undefined;
		if (item.to ?? (children && children.length > 0)) {
			result.push({
				label: item.label,
				to: item.to,
				icon: item.icon,
				children,
			});
		}
	}
	return result;
}

/**
 * ナビゲーションメニューのアイテムを返す。
 * 将来的には認証済みAPIのレスポンスをマージする処理を追加予定。
 */
export async function fetchNavItems(): Promise<NavItem[]> {
	// TODO: 認証付きAPIからアイテムを取得してstaticNavItemsとマージする
	return toMenuTree(appNavItems);
}
