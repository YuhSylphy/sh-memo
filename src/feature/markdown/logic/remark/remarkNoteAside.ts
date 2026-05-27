import type { NoteAside, Root } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

const remarkNoteAside: Plugin<[], Root> = () => (tree) => {
	let gridRowCounter = 1; // gridRowのカウンターを初期化
	visit(tree, (node) => {
		// paragraph か heading の時は gridRowCounter をインクリメント
		if (node.type === 'paragraph' || node.type === 'heading') {
			node.data = {
				...node.data,
				gridRow: gridRowCounter++, // paragraph と heading のときはgridRowをカウントアップして設定
			};
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

		console.info('Processing directive node:', node);
		const targetNode = node as unknown as NoteAside;
		targetNode.type = 'noteAside';
		targetNode.data = {
			...node.data,
			gridRow: gridRowCounter, // noteAsideのときはgridRowをカウントアップしない
		};
	});
};

export default remarkNoteAside;
