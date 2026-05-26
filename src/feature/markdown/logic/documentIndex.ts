import { type DynamicMenuDef } from '../../../core/frame/logic/repositoryMenuSchema';

/**
 * `menu.yaml` 由来のドキュメント定義。
 */
export type MarkdownDocumentIndexItem = {
	/** `menu.yaml` の `id`。 */
	id: string;
	/** GitHub リポジトリ配下の markdown パス。 */
	path: string;
	/** ぱんくず結合済みタイトル。 */
	title: string;
	/** Material Icons のリガチャ名。 */
	icon?: string;
};

/**
 * `DynamicMenuDef` ツリーをフラットな索引配列に変換する。
 * @param items `menu.yaml` 由来のメニュー定義ツリー
 * @param ancestorTitles 祖先タイトルの積み上げ（再帰用）
 */
export function buildDocumentIndex(
	items: DynamicMenuDef[],
	ancestorTitles: string[] = [],
): MarkdownDocumentIndexItem[] {
	return items.flatMap((item) => {
		const nextAncestorTitles = [...ancestorTitles, item.title];
		const self = item.path
			? [
					{
						id: item.id,
						path: item.path,
						title: nextAncestorTitles.join(' - '),
						icon: item.icon,
					},
				]
			: [];

		const children = item.children
			? buildDocumentIndex(item.children, nextAncestorTitles)
			: [];

		return [...self, ...children];
	});
}
