import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root } from 'mdast';

const remarkImageAttributes: Plugin<[], Root> = () => {
	return function (tree) {
		visit(tree, 'image', (node, index, parent) => {
			const attributes = parent?.children[index + 1];
			if (!(attributes?.type === 'text')) {
				// we expect a text node containing the attributes
				// to be the immediate sibling of the image node.
				// If it's not there, we'll assume there are none.
				return;
			}

			const regex = /^\{(.*)\}$/;
			const result = regex.exec(attributes.value);
			if (!result) {
				// this must not be an attributes node. Leave it alone.
				return;
			}

			// Remove the attributes node from the document
			parent.children.splice(index + 1, 1);

			const attributePairs = result[1]
				.split(',')
				.map((pair) => pair.split('='))
				.reduce<Record<string, string>>((acc, curr) => {
					const name = curr[0].trim();
					const value = curr[1].trim();
					acc[name] = value;
					return acc;
				}, {});

			const data = node.data || (node.data = {});
			data.hProperties = attributePairs;
		});
		return tree;
	};
};

export default remarkImageAttributes;
