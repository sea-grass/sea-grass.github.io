import { pages } from '$lib/site';
import type { Directives } from './plugins/remarkCustomDirectives';

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
		/**
		 * Todo: Site content (markdown) is loaded and processed at the same time,
		 * so if I try to access a collection to include a snippet from one of its items
		 * from inside a directive, which gets called while the content is processed,
		 * I'm stuck in deadlock.
		 */
		async pagelatest(node) {
			const child = node.children[0];
			if (child?.type !== 'text') throw errors.expectedTextNode();
			const { value: name } = child;
			console.log('Finding latest in collection(' + name + ')');
			const collection = await pages.collection(name);
			console.log(collection);
			const data = node.data || (node.data = {});
			data.hName = 'h1';
		},
		async summary(node) {
			const data = node.data || (node.data = {});
			data.hName = 'summary';
		}
	}
};

export default directives;
