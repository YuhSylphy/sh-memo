import type { RouteObject } from 'react-router-dom';
import type { AppNavItem } from '../../defs/appNavItems';

export type RouteHandle = {
	title?: string;
};

/** AppNavItem ツリーをフラット化してルートパスを持つ要素のみ返す */
function flattenItems(items: AppNavItem[]): AppNavItem[] {
	return items.flatMap((item) => [
		...(item.to ? [item] : []),
		...(item.children ? flattenItems(item.children) : []),
	]);
}

/**
 * AppNavItem ツリーから RouteObject[] を生成する。
 * framed (default: true) で MainFrame 配下か否かを振り分ける。
 */
export function buildRoutes(items: AppNavItem[]): {
	framed: RouteObject[];
	unframed: RouteObject[];
} {
	const framed: RouteObject[] = [];
	const unframed: RouteObject[] = [];

	for (const item of flattenItems(items)) {
		if (!item.to) continue;

		const route: RouteObject = {
			path: item.to.replace(/^\//, ''),
			handle: { title: item.title } satisfies RouteHandle,
			...(item.lazy ? { lazy: item.lazy } : {}),
		};

		if (item.framed === false) {
			unframed.push(route);
		} else {
			framed.push(route);
		}
	}

	return { framed, unframed };
}
