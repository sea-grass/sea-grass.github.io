import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import frontmatter from 'remark-frontmatter';
import extract from 'remark-extract-frontmatter';
import { parse as yaml } from 'yaml';
import remarkHeadings from '@vcarl/remark-headings';
import remarkHeadingId from 'remark-heading-id';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import stampit from 'stampit';
import type { Plugin } from 'unified';
import type { Root } from 'mdast';

const { compose, deepProps } = stampit;

/**
 * Custom heading ids by default are generated with a prefix
 * to prevent DOM clobbering. I turned this off for content editing
 * convenience. I could turn it on and add a JS layer to handle navigating
 * to "safe" headings, but this would break document traversal without JS.
 * Without JS and to preserve the safe behaviour I'd have to find a way to
 * identify all custom headings within all documents, identify all inter-site
 * links using ids in the documents, and rewrite the id selectors within all
 * of those urls. This would reduce the speed of content parsing, but provide
 * the benefit of easy content editing and browsing.
 */
const UNSAFE_EMPTY_CLOBBER_PREFIX = '';

const schema = compose(
	deepProps(defaultSchema),
	deepProps({
		clobberPrefix: UNSAFE_EMPTY_CLOBBER_PREFIX,
		attributes: {
			div: ['class']
		}
	})
);

const directives = {
	textDirective: {
		// example text directive that simply bolds the content
		bold(node) {
			const data = node.data || (node.data = {});
			data.hName = 'b';
		},
		crossedout(node) {
			const data = node.data || (node.data = {});
			data.hName = 'b';
			data.hProperties = node.attributes;
		}
	},
	containerDirective: {
		inlineList(node) {
			const data = node.data || (node.data = {});
			data.hProperties = { class: 'inline-list' };
		}
	}
};

// TODO: Add support for defining custom directives
const remarkCustomDirectives: Plugin<[], Root> = () => {
	return (tree) => {
		visit(tree, (node) => {
			/**
			 * We'll process nodes that match one of these directive types.
			 * textDirective represents inline content.
			 * leafDirective represents block content.
			 * containerDirective represents a container element and wraps more content.
			 */
			if (
				node.type === 'textDirective' ||
				node.type === 'leafDirective' ||
				node.type === 'containerDirective'
			) {
				const directive = directives[node.type]?.[node.name];
				if (directive) {
					// process the node using the directive function
					directive(node);
					return;
				}
			}
		});
	};
};

const processor = unified()
	.use(remarkParse)
	.use(frontmatter)
	.use(extract, { yaml: yaml })
	.use(remarkGfm)
	.use(remarkHeadings)
	.use(remarkHeadingId)
	.use(remarkDirective)
	.use(remarkCustomDirectives)
	.use(remarkRehype)
	.use(rehypeSanitize, schema())
	.use(rehypeStringify);

export interface DocumentResult {
	html: string;
	title: string;
	description: string;
	frontmatter: object;
}

interface Heading {
	depth: number;
	value: string;
}

export async function process(markdown: string): Promise<DocumentResult> {
	const result = await processor.process(markdown);
	const titleHeading = (result.data.headings as Heading[]).filter(({ depth }) => depth === 1);
	if (titleHeading.length !== 1) {
		throw new Error(
			'There should be one and only one top-level heading in the document. Found ' +
				titleHeading.length +
				' top-level headings.'
		);
	}
	// extract the title from the top level heading
	const title = titleHeading[0].value;

	let description = '';
	if (result.data.description) description = result.data.description as string;
	return {
		html: String(result.value),
		title,
		description,
		frontmatter: result.data
	};
}
