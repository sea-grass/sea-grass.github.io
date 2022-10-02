import { pages, partials, render } from '$lib/site';
import type { Directives } from '../remark/plugins/remarkCustomDirectives';
import { h } from 'hastscript';
import { u } from 'unist-builder';
import type { LeafDirective } from 'mdast-util-directive';

const errors = {
	expectedTextNode: () => new Error('Expected text node'),
	partialNotFound: (id: string) =>
		new Error('Could not found partial(' + id + ')')
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
			const name = getLeafText(node);
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
		async collection(node) {
			const name = getLeafText(node);
			console.log('Finding collection(' + name + ')');
			const collection = await pages.collection(name);
			if (collection && collection.length > 0) {
				const data = node.data || (node.data = {});
				const results = await Promise.all(
					collection.map((page) => render(page))
				);

				data.hName = 'ol';
				data.hProperties = { class: 'collection' };
				data.hChildren = results.map((result) => {
					const slug = (result.frontmatter as any).slug as string;
					const title = result.title;
					return h('li', {}, h('a', { href: slug }, title));
				});
			} else {
				// The collection is empty or does not exist,
				// so for now we'll silently exclude this node
				// from rendering.
				const data = node.data || (node.data = {});
				data.hChildren = [];
			}
		},
		async partial(node) {
			const id = getLeafText(node);
			console.log('Finding partial(' + id + ')');
			const partial = await partials.load(id);
			if (!partial) throw errors.partialNotFound(id);

			const result = await render(partial, { partial: true });
			const data = node.data || (node.data = {});
			data.hName = 'div';
			data.hProperties = { class: 'partial' };
			data.hChildren = [u('raw', result.html)];
		},
		async summary(node) {
			const data = node.data || (node.data = {});
			data.hName = 'summary';
		}
	}
};

function getLeafText(node: LeafDirective): string {
	const child = node.children[0];
	if (child?.type !== 'text') throw errors.expectedTextNode();
	return child.value;
}

export default directives;
