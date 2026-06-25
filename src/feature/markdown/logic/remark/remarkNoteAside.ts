import type { NoteAside, Root } from 'mdast';
import type { Plugin } from 'unified';
import { visit, SKIP } from 'unist-util-visit';

const remarkNoteAside: Plugin<[], Root> = () => (tree) => {
	let gridRowCounter = 1; // gridRowのカウンターを初期化
	visit(tree, (node) => {
		// collapseBlock は gridRow を付与するが SKIP しない。
		// visit が子ノードに降りることで、子の paragraph / noteAside 等も
		// 同カウンターで gridRow を取得できる。
		if (node.type === 'collapseBlock') {
			node.data = {
				...node.data,
				gridRow: gridRowCounter++,
				childGridRowStart: gridRowCounter, // インクリメント後の値 = 子の開始行
			};
			return; // SKIP しない
		}

		if (
			node.type === 'paragraph' ||
			node.type === 'heading' ||
			node.type === 'blockquote' ||
			node.type === 'list' ||
			node.type === 'code' ||
			node.type === 'table' ||
			node.type === 'thematicBreak' ||
			node.type === 'html'
		) {
			node.data = {
				...node.data,
				gridRow: gridRowCounter++, // ブロック要素は1行としてカウント
			};
			return SKIP;
		}

		if (
			!('name' in node) ||
			node.name !== 'note' ||
			!(
				node.type === 'containerDirective' ||
				node.type === 'leafDirective' ||
				node.type === 'textDirective'
			)
		) {
			return;
		}

		const targetNode = node as unknown as NoteAside;
		targetNode.type = 'noteAside';
		targetNode.data = {
			...node.data,
			gridRow: gridRowCounter, // noteAsideのときはgridRowをカウントアップしない
		};
	});
};

export default remarkNoteAside;
