import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root } from 'mdast';

/**
 * Providing attributes to images is not regular markdown behaviour,
 * so this is a polyfill to accomplish that.
 *
 * Performs a lookahead from each image node for a text
 * node containing the attributes that should be applied to this image.
 *
 * TODO Write tests for this - the attribute parsing is far from perfect.
 */
const remarkImageAttributes: Plugin<[], Root> = () => {
	return function (tree) {
		visit(tree, 'image', (node, index, parent) => {
			const next_index = index + 1;
			if (parent.children.length <= next_index) return;

			const maybe_attributes = parent.children[next_index];
			if (maybe_attributes.type === 'text') {
				const text = maybe_attributes.value;

				const regex = /^\{(.*)\}$/;
				const result = regex.exec(text);
				if (!result) {
					// this must not be an attributes node. Leave it alone.
					return;
				}

				// Remove the attributes node from the document
				parent.children.splice(next_index, 1);

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
			}
		});
		return tree;
	};
};

export default remarkImageAttributes;
