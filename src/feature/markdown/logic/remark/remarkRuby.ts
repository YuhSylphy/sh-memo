import type { Root, Ruby } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

const remarkRuby: Plugin<[], Root> = () => (tree) => {
	visit(tree, (node) => {
		if (
			!('name' in node) ||
			node.name !== 'ruby' ||
			!(
				node.type === 'containerDirective' ||
				node.type === 'leafDirective' ||
				node.type === 'textDirective'
			)
		) {
			return;
		}
		const targetNode = node as unknown as Ruby;
		targetNode.type = 'ruby';
		// attributesのキーをrubyTextとして利用
		const rubyText =
			Object.keys(node?.attributes ?? {}).find((_) => 1) ?? '';
		targetNode.data = {
			...node.data,
			rubyText,
		};
	});
};

export default remarkRuby;
