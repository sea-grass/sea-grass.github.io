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
import stampit from 'stampit';
import remarkCustomDirectives, { type Directives } from './plugins/remarkCustomDirectives';

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
		}
	},
	leafDirective: {
		async pagelatest(node) {
			const data = node.data || (node.data = {});
			data.hName = 'b';
		}
	}
};

const processor = unified()
	.use(remarkParse)
	.use(frontmatter)
	.use(extract, { yaml: yaml })
	.use(remarkGfm)
	.use(remarkHeadings)
	.use(remarkHeadingId)
	.use(remarkDirective)
	.use(remarkCustomDirectives, directives)
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
