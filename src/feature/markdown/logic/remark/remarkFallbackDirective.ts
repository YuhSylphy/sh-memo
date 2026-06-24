import type { Nodes, Paragraph, Root, Text } from 'mdast';
import type {
	ContainerDirective,
	LeafDirective,
	TextDirective,
} from 'mdast-util-directive';

import type { Plugin } from 'unified';
import { flatMap } from './unistUtilFlatMap';

/** 変換済みノード群からテキスト内容を再帰的に抽出する */
function getTextContent(nodes: Nodes[]): string {
	return nodes
		.map((node) => {
			if ('value' in node && typeof node.value === 'string') {
				return node.value;
			}
			if ('children' in node && Array.isArray(node.children)) {
				return getTextContent(node.children as Nodes[]);
			}
			return '';
		})
		.join('');
}

/** directive の attributes オブジェクトを `{.cls #id key="val"}` 形式に戻す */
function serializeAttrs(
	attrs: (TextDirective | LeafDirective | ContainerDirective)['attributes'],
): string {
	if (!attrs) return '';
	const parts: string[] = [];
	for (const [key, value] of Object.entries(attrs)) {
		if (value === undefined || value === null) continue;
		if (key === 'class') {
			value
				.split(/\s+/)
				.filter(Boolean)
				.forEach((cls) => parts.push(`.${cls}`));
		} else if (key === 'id') {
			parts.push(`#${value}`);
		} else {
			parts.push(`${key}="${value}"`);
		}
	}
	return parts.length > 0 ? `{${parts.join(' ')}}` : '';
}

/**
 * 未処理の textDirective / leafDirective / containerDirective を
 * 元の Markdown 記法に近い文字列のテキストノードに変換するフォールバックプラグイン。
 *
 * 既存の directive プラグイン（remarkNoteAside / remarkRuby / remarkStyledBlock）より
 * 後に適用することで、変換されなかった directive だけを対象にできる。
 */
const remarkFallbackDirective: Plugin<[], Root> = () => (tree) => {
	flatMap(tree, (node) => {
		if (
			node.type !== 'textDirective' &&
			node.type !== 'leafDirective' &&
			node.type !== 'containerDirective'
		) {
			return [node];
		}

		const dir = node;
		const prefix = (() => {
			switch (node.type) {
				case 'textDirective':
					return ':';
				case 'leafDirective':
					return '::';
				case 'containerDirective':
					return ':::';
				default: {
					const _exhaustiveCheck: never = node;
					console.error(
						`Unexpected directive type: ${JSON.stringify(_exhaustiveCheck)}`,
					);
					return '';
				}
			}
		})();

		// flatMap は子ノードを先に変換済みなので getTextContent で安全に取り出せる
		const childrenText = getTextContent(dir.children);
		const label = childrenText ? `[${childrenText}]` : '';
		const attrs = serializeAttrs(dir.attributes);

		const textValue =
			node.type === 'containerDirective'
				? `${prefix}${dir.name}${attrs}\n${childrenText}\n${prefix}`
				: `${prefix}${dir.name}${label}${attrs}`;

		const textNode: Text = { type: 'text', value: textValue };

		switch (node.type) {
			case 'textDirective': {
				// textDirective → インラインの text ノード
				return [textNode];
			}
			case 'leafDirective':
			case 'containerDirective': {
				// ブロックレベル → paragraph でラップ
				const para: Paragraph = {
					type: 'paragraph',
					children: [textNode],
				};
				return [para];
			}
			default: {
				const _exhaustiveCheck: never = node;
				console.error(
					`Unexpected directive type: ${JSON.stringify(_exhaustiveCheck)}`,
				);
				return [node];
			}
		}
	});
};

export default remarkFallbackDirective;
