import logger from './logger';
import yaml from 'yaml';
import cssMinifier from '$lib/css';
import { MINIFY_CSS } from '$lib/variables';
import errors from './errors';
import type {
	PageMap,
	PageCollectionMap,
	ThemeMap,
	PartialMap,
	Partial
} from './index.d';

function parseFrontmatter(document: string) {
	const frontmatterFence = '---\n';
	if (!document.startsWith(frontmatterFence)) throw errors.missingFrontmatter();

	const startIndex = frontmatterFence.length;
	// we search for the last fence block after the first fence block
	const endIndex = document.indexOf(frontmatterFence, startIndex);
	if (endIndex < 0) throw errors.missingFrontmatter();

	const frontmatter = document.slice(startIndex, endIndex);
	return yaml.parse(frontmatter);
}

export async function readPages(
	pages: Record<string, () => Promise<string>>
): Promise<{ slugs: PageMap; collections: PageCollectionMap }> {
	type PageEntry = [path: string, content: string];
	const entries = Object.entries(pages);

	const loadContent = async ([
		path,
		load
	]: (typeof entries)[number]): Promise<PageEntry> => [path, await load()];

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
}

export async function readThemes(
	themes: Record<string, () => Promise<string>>
) {
	return await Promise.all(
		Object.entries(themes).map(async ([name, getCss]) => {
			// I know that the themes directory is the 4th token,
			// so the theme name will be the 5th token
			const theme = name.split('/').slice(4, 5)[0];
			const css = await getCss();
			// Todo: enforce order of css files if necessary (maybe just alphabetical?)
			return { theme, css };
		})
	)
		.then((themeFiles) =>
			themeFiles.reduce<ThemeMap>((themeMap, { theme, css }) => {
				if (themeMap[theme]) themeMap[theme] += css;
				else themeMap[theme] = css;
				return themeMap;
			}, {})
		)
		.then(async (themeMap) => {
			if (MINIFY_CSS) {
				for (const theme in themeMap) {
					logger.info('Minifying theme (' + theme + ')');
					const result = await cssMinifier.process(themeMap[theme]);
					const { css } = result;
					themeMap[theme] = css;
				}
			}
			return themeMap;
		});
}

export async function readPartials(
	partials: Record<string, () => Promise<string>>
): Promise<PartialMap> {
	type PartialEntry = [path: string, content: string];
	const entries = Object.entries(partials);

	const loadContent = async ([
		path,
		load
	]: (typeof entries)[number]): Promise<PartialEntry> => [path, await load()];

	const parsePartials = (entries: PartialEntry[]): PartialMap => {
		const partials: PartialMap = {};

		for (const [path, document] of entries) {
			const frontmatter = parseFrontmatter(document);
			const id = frontmatter.id as string | undefined;
			if (!id) throw errors.partials.noIdFound();
			if (partials[id]) throw errors.partials.duplicateIdFound(id);

			const partial: Partial = {
				path,
				frontmatter,
				document
			};
			logger.info('Loaded partial with id(' + id + ')');
			partials[id] = partial;
		}

		return partials;
	};

	return await Promise.all(entries.map(loadContent)).then(parsePartials);
}
