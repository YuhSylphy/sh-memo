import type { Nodes, Root, StyledBlock } from 'mdast';
import type { Plugin } from 'unified';
import { flatMap } from './unistUtilFlatMap';

const remarkStyledBlock: Plugin<[], Root> = () => (tree) => {
	flatMap(tree, (node) => {
		if (
			!('name' in node) ||
			node.name !== 'style' ||
			!(
				node.type === 'containerDirective' ||
				node.type === 'leafDirective' ||
				node.type === 'textDirective'
			)
		) {
			return [node];
		}

		const styledData: StyledBlock['data'] = {
			...node.data,
			styleName: node?.attributes?.class || 'default',
		};
		function createStyledBlock(children: StyledBlock['children'] = []) {
			return {
				type: 'styledBlock',
				data: { ...styledData },
				children,
				position: node.position,
			} as StyledBlock;
		}

		type BlockNodes = Extract<
			Nodes,
			{ type: 'paragraph' | 'heading' | 'noteAside' | 'styledBlock' }
		>;

		// TODO: handle other block nodes (list, code, blockquote, table, thematicBreak, html?) esp. thematicBreak
		const [acc, tmp] = node.children?.reduce<[BlockNodes[], Nodes[]]>(
			([acc, tmp], child, _ix) => {
				// styleの子がブロックノードの場合、styledBlockと親子関係を逆転させる
				// そうでない場合tmpに詰めておいて、まとめて1つのstyledBlockにする
				switch (child.type) {
					case 'paragraph':
					case 'heading':
					case 'noteAside': {
						// tmpに溜まっているノードがあればstyledBlockで括る
						const insertion =
							tmp.length > 0
								? (() => {
										return [createStyledBlock(tmp)];
									})()
								: [];

						const descendant = child.children;
						const styled = createStyledBlock(descendant);
						const parent = {
							...child,
							children: [styled],
						};
						// ここに来たら必ずtmpを消化するのでリセットして空配列を返す
						return [[...acc, ...insertion, parent], []];
					}
					case 'styledBlock': {
						// tmpに溜まっているノードがあればstyledBlockで括る（順序を保つ）
						const insertion =
							tmp.length > 0 ? [createStyledBlock(tmp)] : [];
						// 内側のstyledBlockを外側のstyleで包んでスタイル文脈を保つ
						const wrapped = createStyledBlock([child]);
						return [[...acc, ...insertion, wrapped], []];
					}
					default: {
						return [acc, [...tmp, child]];
					}
				}
			},
			[[], []],
		) ?? [[], []];

		const result = [
			...acc,
			...(tmp.length > 0 ? [createStyledBlock(tmp)] : []),
		];

		return result;
	});

	// visit(tree, (node) => {
	// 	if (
	// 		!('name' in node) ||
	// 		node.name !== 'style' ||
	// 		!(
	// 			node.type === 'containerDirective' ||
	// 			node.type === 'leafDirective' ||
	// 			node.type === 'textDirective'
	// 		)
	// 	) {
	// 		return;
	// 	}

	// 	const targetNode = node as unknown as StyledBlock;

	// 	targetNode.children?.forEach((child, ix) => {
	// 		console.info(
	// 			`Processing styled block child[${ix}]:`,
	// 			child.type,
	// 			child,
	// 		);
	// 	});

	// 	targetNode.type = 'styledBlock';
	// 	targetNode.data = {
	// 		...node.data,
	// 		styleName: node?.attributes?.class || 'default',
	// 	};
	// });
};

export default remarkStyledBlock;
