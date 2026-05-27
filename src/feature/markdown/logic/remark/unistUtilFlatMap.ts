import type { Nodes } from 'mdast';

export function flatMap(
	ast: Nodes,
	fn: (Nodes: Nodes, index: number, parent: Nodes | null) => Nodes[] | null,
): Nodes {
	function transform(
		Nodes: Nodes,
		index: number,
		parent: Nodes | null,
	): Nodes[] {
		if ('children' in Nodes && Array.isArray(Nodes.children)) {
			const out = [];
			for (let i = 0, n = Nodes.children.length; i < n; i++) {
				const xs = transform(Nodes.children[i], i, Nodes);
				if (xs) {
					for (let j = 0, m = xs.length; j < m; j++) {
						out.push(xs[j]);
					}
				}
			}
			Nodes.children = out;
		}

		return fn(Nodes, index, parent) ?? [];
	}

	return transform(ast, 0, null)[0];
}
