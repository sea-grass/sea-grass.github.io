import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root } from 'mdast';
import type {
	TextDirective,
	ContainerDirective,
	LeafDirective
} from 'mdast-util-directive';

export interface Directives {
	textDirective?: {
		[name: string]: (node: TextDirective) => Promise<void>;
	};
	containerDirective?: {
		[name: string]: (node: ContainerDirective) => Promise<void>;
	};
	leafDirective?: {
		[name: string]: (node: LeafDirective) => Promise<void>;
	};
}

const remarkCustomDirectives: Plugin<[Directives], Root> = (
	directives: Directives
) => {
	return async (tree) => {
		// we want to be able to execute our directives async
		// and wait for them to finish.so we capture the promises
		// from all executed directives and later await them.
		const promises = [];
		visit(tree, (node) => {
			/**
			 * We'll process nodes that match one of these directive types.
			 * textDirective represents inline content.
			 * leafDirective represents block content.
			 * containerDirective represents a container element and wraps more content.
			 */
			if (node.type === 'textDirective') {
				promises.push(directives.textDirective?.[node.name]?.(node));
			} else if (node.type === 'leafDirective') {
				promises.push(directives.leafDirective?.[node.name]?.(node));
			} else if (node.type === 'containerDirective') {
				promises.push(directives.containerDirective?.[node.name]?.(node));
			}
		});

		await Promise.all(promises);

		return tree;
	};
};

export default remarkCustomDirectives;
