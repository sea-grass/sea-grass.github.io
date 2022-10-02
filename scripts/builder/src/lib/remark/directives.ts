import { pages, render } from '$lib/site';
import type { Directives } from './plugins/remarkCustomDirectives';
import { h } from 'hastscript';

const errors = {
	expectedTextNode: () => new Error('Expected text node')
};

const directives: Directives = {
	textDirective: {
		// example text directive that simply bolds the content
		async bold(node) {
			const data = node.data || (node.data = {});
			data.hName = 'b';
		},
		async crossedout(node) {
			const data = node.data || (node.data = {});
			data.hName = 'del';
		}
	},
	containerDirective: {
		async inlineList(node) {
			const data = node.data || (node.data = {});
			data.hProperties = { class: 'inline-list' };
		},
		async block(node) {
			const { class: classes } = node.attributes;
			const data = node.data || (node.data = {});
			data.hProperties = { class: classes };
		},
		async details(node) {
			const data = node.data || (node.data = {});
			data.hName = 'details';
		}
	},
	leafDirective: {
		async pagelatest(node) {
			const child = node.children[0];
			if (child?.type !== 'text') throw errors.expectedTextNode();
			const { value: name } = child;
			console.log('Finding latest in collection(' + name + ')');
			const collection = await pages.collection(name);
			// assume collection is already sorted such that the first item is the latest
			const page = collection?.[0];
			if (page) {
				const data = node.data || (node.data = {});
				const result = await render(page);
				data.hName = 'div';
				data.hProperties = { class: 'pagelatest' };
				data.hChildren = [
					h(
						'a',
						{ href: (result.frontmatter as any).slug as string },
						result.title
					)
				];
			} else {
				// The collection is empty or does not exist,
				// so for now we'll silently exclude this node
				// from rendering.
				const data = node.data || (node.data = {});
				data.hChildren = [];
			}
		},
		async summary(node) {
			const data = node.data || (node.data = {});
			data.hName = 'summary';
		}
	}
};

export default directives;
