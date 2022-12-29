import logger from '../logger';
import errors from '../errors';
import type { PageMap, PageCollectionMap, Page } from '../../site/index.d';
import { parseFrontmatter } from './parseFrontmatter';

export async function readPages(
	pages: Record<string, () => Promise<string>>
): Promise<{ slugs: PageMap; collections: PageCollectionMap }> {
	type PageEntry = [path: string, content: string];
	const entries = Object.entries(pages);

	const loadContent = async ([
		path,
		load
	]: typeof entries[number]): Promise<PageEntry> => [path, await load()];

	const parseDocuments = (
		entries: PageEntry[]
	): { slugs: PageMap; collections: PageCollectionMap } => {
		const slugs: PageMap = {};
		const collections: PageCollectionMap = {};

		for (const [path, document] of entries) {
			const frontmatter = parseFrontmatter(document);
			const slug = frontmatter.slug as string | undefined;
			if (!slug) throw errors.noSlugFound();
			if (slugs[slug]) throw errors.duplicateSlugFound(slug);

			const page: Page = {
				path,
				frontmatter,
				document
			};

			const collection = frontmatter.collection as string | undefined;
			if (collection) {
				page.collection = collection;

				logger.info(
					'Adding slug(' + slug + ') to collection(' + collection + ')',
					'foo'
				);
				if (!collections[collection]) collections[collection] = [];

				collections[collection].push(page);
			} else {
				logger.info('Loaded slug(' + slug + ')');
			}

			slugs[slug] = page;
		}

		return { slugs, collections };
	};

	return await Promise.all(entries.map(loadContent)).then(parseDocuments);

	return await getPageFiles(pages).then(reduceToPageMap);
}
