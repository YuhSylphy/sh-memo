import type { CollapseBlock, Nodes, Root } from 'mdast';
import type { Plugin } from 'unified';
import { flatMap } from './unistUtilFlatMap';

/**
 * `:::collapse[label]{open}` containerDirective を CollapseBlock AST ノードに変換する。
 *
 * ## 記法
 * ```md
 * :::collapse[ラベル文字列 または :style[...]{.cls}]
 * 本文内容
 * :::
 *
 * :::collapse[デフォルト展開]{open}
 * 本文内容
 * :::
 * ```
 *
 * - `[...]` — 常時表示するラベル。省略可。インラインノード列として保持し、
 *   後続プラグイン（remarkRuby / remarkStyledBlock 等）がツリー走査で変換する。
 * - `{open}` — 属性キー `open` が存在する場合のみデフォルト展開とする。
 *
 * ## NOTE: remarkDebug で AST を確認すること
 * remark-directive は `[label]` を `data.directiveLabel === true` の
 * paragraph ノードとして children の先頭に配置する。
 * 実際の AST と乖離がある場合は本プラグインを修正すること。
 */
const remarkCollapseBlock: Plugin<[], Root> = () => (tree) => {
	flatMap(tree, (node) => {
		if (
			node.type !== 'containerDirective' ||
			!('name' in node) ||
			node.name !== 'collapse'
		) {
			return [node];
		}

		const attrs = node.attributes ?? {};
		const defaultOpen = 'open' in attrs;

		// remark-directive は [label] 部分を
		// data.directiveLabel === true の paragraph として children 先頭に置く。
		// それ以外が本体 children となる。
		const labelParagraph = node.children.find(
			(child) =>
				child.type === 'paragraph' &&
				(child.data as { directiveLabel?: boolean } | undefined)
					?.directiveLabel === true,
		);
		const labelNodes: Nodes[] =
			labelParagraph && 'children' in labelParagraph
				? (labelParagraph.children as Nodes[])
				: [];

		const bodyChildren = node.children.filter(
			(child) => child !== labelParagraph,
		) as Nodes[];

		const collapseNode: CollapseBlock = {
			type: 'collapseBlock',
			// gridRow / childGridRowStart は後続の remarkNoteAside が付与する (0 は仮置き)
			data: {
				...node.data,
				gridRow: 0,
				childGridRowStart: 0,
				label: labelNodes,
				defaultOpen,
			},
			children: bodyChildren,
			position: node.position,
		};

		return [collapseNode];
	});
};

export default remarkCollapseBlock;
