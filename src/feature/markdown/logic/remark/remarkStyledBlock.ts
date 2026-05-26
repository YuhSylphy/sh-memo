import type { Root, StyledBlock } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

const remarkStyledBlock: Plugin<[], Root> = () => (tree) => {
	visit(tree, (node) => {
		if (
			!('name' in node) ||
			node.name !== 'style' ||
			!(
				node.type === 'containerDirective' ||
				node.type === 'leafDirective' ||
				node.type === 'textDirective'
			)
		) {
			return;
		}
		const targetNode = node as unknown as StyledBlock;
		targetNode.type = 'styledBlock';
		targetNode.data = {
			...node.data,
			styleName: node?.attributes?.class || 'default',
		};
	});
};

export default remarkStyledBlock;
