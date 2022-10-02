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
import remarkImageAttributes from './plugins/remarkImageAttributes';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import stampit from 'stampit';
import remarkCustomDirectives, {
	type Directives
} from './plugins/remarkCustomDirectives';

const { compose, deepProps } = stampit;

const errors = {
	expectedSingleTopLevelHeading(numFound: number) {
		return new Error(
			'There should be one and only one top-level heading in the document. Found ' +
				numFound +
				' top-level headings.'
		);
	},
	partialContainsTopLevelHeading() {
		return new Error('Partials must not contain top-level headings.');
	}
};

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

type Schema = Exclude<Parameters<typeof rehypeSanitize>[0], void>;
const schema = compose<Schema>(
	deepProps(defaultSchema),
	deepProps<Schema>({
		clobberPrefix: UNSAFE_EMPTY_CLOBBER_PREFIX,
		attributes: {
			div: ['class'],
			ol: ['class']
		}
	})
);

export interface DocumentResult {
	html: string;
	title?: string;
	description?: string;
	frontmatter: object;
	raw: string;
}

interface Heading {
	depth: number;
	value: string;
}

export function getProcessor(directives: Directives) {
	const processor = unified()
		.use(remarkParse)
		.use(frontmatter)
		.use(extract, { yaml: yaml })
		.use(remarkGfm)
		.use(remarkHeadings)
		.use(remarkHeadingId)
		.use(remarkImageAttributes)
		.use(remarkDirective)
		.use(remarkCustomDirectives, directives)
		.use(remarkRehype)
		.use(rehypeRaw)
		.use(rehypeHighlight)
		// Todo: Fix conflict between rehype-raw and rehype-sanitize
		// Before I added rehype-raw, rehype-sanitize would respect
		// the hast returned from directives.
		// I added rehype-raw to support the `::partial` directive,
		// which renders the html and injects it as a raw node.
		// (There might be a better way to do that, not sure.)
		// I'd still like to use rehype-sanitize, so I need
		// to look into this later.
		// Todo: Once rehype-sanitize is re-enabled, I'll also
		// need to make changes to the schema to allow highlighting
		// (https://github.com/rehypejs/rehype-highlight#example-sanitation)
		// .use(rehypeSanitize, schema())
		.use(rehypeStringify);

	return {
		async process(markdown: string): Promise<DocumentResult> {
			const result = await processor.process(markdown);
			const titleHeading = (result.data.headings as Heading[]).filter(
				({ depth }) => depth === 1
			);
			if (titleHeading.length !== 1) {
				throw errors.expectedSingleTopLevelHeading(titleHeading.length);
			}
			// extract the title from the top level heading
			const title = titleHeading[0].value;
			const description = (result.data?.description as string) || '';

			return {
				html: String(result.value),
				raw: markdown,
				title,
				description,
				frontmatter: result.data
			};
		},
		async processPartial(markdown: string): Promise<DocumentResult> {
			const result = await processor.process(markdown);
			const titleHeading = (result.data.headings as Heading[]).filter(
				({ depth }) => depth === 1
			);
			if (titleHeading.length === 1) {
				throw errors.partialContainsTopLevelHeading();
			}

			return {
				html: String(result.value),
				raw: markdown,
				frontmatter: result.data
			};
		}
	};
}
