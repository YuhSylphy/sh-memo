import type { ComponentType } from 'react';
import { load as loadYaml } from 'js-yaml';
import { appNavItems, type AppNavItem } from '../../defs/appNavItems';
import { fetchRepositoryFileContent } from '../../../feature/github';
import {
	type DynamicMenuDef,
	isDynamicMenuDefTree,
} from './repositoryMenuSchema';

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
 * DynamicMenuDef を AppNavItem に再帰変換する。
 * title には祖先を含むパンくず形式の文字列を設定する。
 */
function toAppNavItemsFromDynamicDefs(
	items: DynamicMenuDef[],
	ancestorTitles: string[] = [],
): AppNavItem[] {
	return items.map((item) => {
		const nextAncestorTitles = [...ancestorTitles, item.title];
		return {
			label: item.title,
			title: nextAncestorTitles.join(' - '),
			to: `/docs/${item.id}`,
			icon: item.icon,
			children: item.children
				? toAppNavItemsFromDynamicDefs(
						item.children,
						nextAncestorTitles,
					)
				: undefined,
		};
	});
}

/**
 * 固定 appNavItems のうち /docs/:documentId ノードに動的メニューを追加した配列を返す。
 */
function mergeDynamicMenuItems(
	staticItems: AppNavItem[],
	dynamicItems: AppNavItem[],
): AppNavItem[] {
	if (dynamicItems.length === 0) {
		return staticItems;
	}

	return staticItems.map((item) => {
		if (item.to !== '/docs/:documentId') {
			return item;
		}

		return {
			...item,
			inMenu: true,
			children: [...(item.children ?? []), ...dynamicItems],
		};
	});
}

/**
 * リポジトリの menu.yaml を取得・パースし、DynamicMenuDef[] として返す。
 * 取得失敗・パース失敗・TypeGuard 検証失敗時は警告を出力して空配列を返す。
 */
export async function fetchDynamicMenuDefs(): Promise<DynamicMenuDef[]> {
	try {
		const menuYaml = await fetchRepositoryFileContent('sh-memo/menu.yaml');
		const menuObject = loadYaml(menuYaml);

		if (!isDynamicMenuDefTree(menuObject)) {
			console.warn(
				'[fetchDynamicMenuDefs] invalid menu schema:',
				menuObject,
			);
			return [];
		}

		return menuObject;
	} catch (error) {
		console.warn(
			'[fetchDynamicMenuDefs] failed to load dynamic menu. fallback to static menu only.',
			error,
		);
		return [];
	}
}

/**
 * ナビゲーションメニューのアイテムを返す。
 * 将来的には認証済みAPIのレスポンスをマージする処理を追加予定。
 */
export async function fetchNavItems(): Promise<NavItem[]> {
	const repositoryMenuItems = await fetchDynamicMenuDefs();
	const dynamicNavItems = toAppNavItemsFromDynamicDefs(repositoryMenuItems);
	const mergedAppNavItems = mergeDynamicMenuItems(
		appNavItems,
		dynamicNavItems,
	);

	return toMenuTree(mergedAppNavItems);
}
