import type { Directives } from 'remark-custom-directives';
import type {
	LeafDirective,
	TextDirective,
	ContainerDirective
} from 'mdast-util-directive';
import { h } from 'hastscript';
import { u } from 'unist-builder';
import { pages, partials, render } from '$lib/site';
import logger from './logger';

const errors = {
	expectedTextNode: () => new Error('Expected text node'),
	partialNotFound: (id: string) =>
		new Error('Could not found partial(' + id + ')')
};

type Directive = LeafDirective | ContainerDirective | TextDirective;

const make =
	(...hArgs: Parameters<typeof h>) =>
	async <TDirective extends Directive>(node: TDirective) => {
		const data = node.data || (node.data = {});
		const result = h(...hArgs);
		data.hName = result.tagName;
		if (result.properties) data.hProperties = result.properties;
		if (result.children.length > 0) data.hChildren = result.children;
	};

const block = async (node: ContainerDirective | LeafDirective) => {
	const { class: classes } = node.attributes;
	make('.' + classes)(node);
};

const directives: Directives = {
	textDirective: {
		bold: make('b'),
		crossedout: make('del')
	},
	containerDirective: {
		inlineList: make('.inline-list'),
		details: make('details'),
		block
	},
	leafDirective: {
		summary: make('summary'),
		block,
		async pagelatest(node: LeafDirective) {
			const name = getLeafText(node);
			logger.info('Finding latest in collection(' + name + ')');
			const collection = await pages.collection(name);
			// assume collection is already sorted such that the first item is the latest
			const page = collection?.[0];
			if (page) {
				const result = await render(page);
				const href = (result.frontmatter as any).slug as string;
				const title = result.title;

				make('.pagelatest', [h('a', { href }, title)])(node);
			} else {
				// The collection is empty or does not exist,
				// so for now we'll silently exclude this node
				// from rendering.
				const data = node.data || (node.data = {});
				data.hChildren = [];
			}
		},
		async collection(node: LeafDirective) {
			const name = getLeafText(node);
			logger.info('Finding collection(' + name + ')');
			const collection = await pages.collection(name);
			if (collection && collection.length > 0) {
				const results = await Promise.all(
					collection.map((page) => render(page))
				);

				const items = results
					.map((result) => ({
						href: (result.frontmatter as any).slug as string,
						title: result.title
					}))
					.map(({ href, title }) => h('li', h('a', { href }, title)));

				make('ol.collection', items)(node);
			} else {
				// The collection is empty or does not exist,
				// so for now we'll silently exclude this node
				// from rendering.
				const data = node.data || (node.data = {});
				data.hChildren = [];
			}
		},
		async partial(node: LeafDirective) {
			const id = getLeafText(node);
			logger.info('Finding partial(' + id + ')');
			const partial = await partials.load(id);
			if (!partial) throw errors.partialNotFound(id);

			const result = await render(partial, { partial: true });

			make('.partial', [u('raw', result.html)])(node);
		}
	}
};

function getLeafText(node: LeafDirective): string {
	const child = node.children[0];
	if (child?.type !== 'text') throw errors.expectedTextNode();
	return child.value;
}

export default directives;
