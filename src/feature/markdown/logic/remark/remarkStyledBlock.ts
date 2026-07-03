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
			// class 属性が存在しない / 空の場合は null (リセットマーカー)
			styleName: node?.attributes?.class || null,
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
			{
				type:
					| 'paragraph'
					| 'heading'
					| 'noteAside'
					| 'styledBlock'
					| 'thematicBreak'
					| 'html'
					| 'collapseBlock';
			}
		>;

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
							tmp.length > 0 ? [createStyledBlock(tmp)] : [];

						const descendant = child.children as Nodes[];

						// styledBlock(null) な子は外側スタイルで包まず pass-through。
						// それ以外の連続した子をグループ化して外側スタイルで包む。
						const newDescendants: Nodes[] = [];
						let group: Nodes[] = [];
						for (const d of descendant) {
							if (
								d.type === 'styledBlock' &&
								(d as StyledBlock).data.styleName === null
							) {
								if (group.length > 0) {
									newDescendants.push(
										createStyledBlock(group),
									);
									group = [];
								}
								newDescendants.push(d);
							} else {
								group.push(d);
							}
						}
						if (group.length > 0) {
							newDescendants.push(createStyledBlock(group));
						}

						const parent = {
							...child,
							children: newDescendants,
						} as BlockNodes;
						return [[...acc, ...insertion, parent], []] as const;
					}
					case 'styledBlock': {
						if (child.data.styleName === null) {
							// リセットブロック: 外側スタイルで包まず pass-through
							// flatMap が底から処理するため、何重入れ子でも順にホイストされる
							const insertion =
								tmp.length > 0 ? [createStyledBlock(tmp)] : [];
							return [[...acc, ...insertion, child], []];
						}
						// 通常の入れ子 styledBlock: 外側スタイルで包む（順序を保つ）
						const insertion =
							tmp.length > 0 ? [createStyledBlock(tmp)] : [];
						const wrapped = createStyledBlock([child]);
						return [[...acc, ...insertion, wrapped], []];
					}
					case 'thematicBreak':
					case 'html':
					case 'collapseBlock': {
						// children を持たないか gridRow を保持すべきブロック要素。
						// tmp をフラッシュしてそのまま pass-through。
						// remarkNoteAside が付与した gridRow を保持するため styledBlock で包まない。
						const insertion =
							tmp.length > 0 ? [createStyledBlock(tmp)] : [];
						return [[...acc, ...insertion, child], []];
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
