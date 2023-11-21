import type { Directives } from 'remark-custom-directives';
import type {
	LeafDirective,
	TextDirective,
	ContainerDirective
} from 'mdast-util-directive';
import { h } from 'hastscript';
import { u } from 'unist-builder';
import { z } from 'zod';
import { pages, partials, render } from '$lib/site';

const errors = {
	expectedTextNode: () => new Error('Expected text node'),
	partialNotFound: (id: string) =>
		new Error('Could not found partial(' + id + ')'),
	parseError: (error: z.ZodError) =>
		new Error('Failed to parse frontmatter: ' + error.message)
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

const directives: Directives = {
	textDirective: {
		bold: make('b'),
		crossedout: make('del')
	},
	containerDirective: {
		inlineList: make('.inline-list'),
		details: make('details'),
		async block(node: ContainerDirective) {
			const { class: classes, style } = node.attributes;
			const data = node.data || (node.data = {});
			data.hProperties = { class: classes, style };
		}
	},
	leafDirective: {
		summary: make('summary'),
		async block(node: LeafDirective) {
			const { class: classes, style } = node.attributes;
			const data = node.data || (node.data = {});
			data.hProperties = { class: classes, style };
		},
		async pagelatest(node: LeafDirective) {
			const name = getLeafText(node);
			console.log('Finding latest in collection(' + name + ')');
			const collection = await pages.collection(name);
			// assume collection is already sorted such that the first item is the latest
			const page = collection?.[0];
			if (page) {
				const result = await render(page);
				const schema = z.object({
					slug: z.string(),
					title: z.string()
				});

				const parse_result = schema.safeParse(result.frontmatter);

				if (parse_result.success === false) {
					throw errors.parseError(parse_result.error);
				}

				const { slug: href, title } = parse_result.data;

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
			console.log('Finding collection(' + name + ')');
			const collection = await pages.collection(name);
			if (collection && collection.length > 0) {
				const results = await Promise.all(
					collection.map((page) => render(page))
				);

				const items = results
					.map((result) => {
						const schema = z.object({
							slug: z.string(),
							title: z.string()
						});

						const parse_result = schema.safeParse(result.frontmatter);

						if (parse_result.success === false) {
							throw errors.parseError(parse_result.error);
						}

						const { slug: href, title } = parse_result.data;

						return { title, href };
					})
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
			console.log('Finding partial(' + id + ')');
			const partial = await partials.load(id);
			if (!partial) throw errors.partialNotFound(id);

			const result = await render(partial, { partial: true });

			const data = node.data || (node.data = {});
			data.hProperties = {
				style: 'display: contents;'
			};
			data.hChildren = [u('raw', result.html)];

			// make('.partial', [u('raw', result.html)])(node);
		}
	}
};

function getLeafText(node: LeafDirective): string {
	const child = node.children[0];
	if (child?.type !== 'text') throw errors.expectedTextNode();
	return child.value;
}

export default directives;
