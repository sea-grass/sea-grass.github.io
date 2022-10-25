import { getProcessor, type DocumentResult } from '$lib/remark';
import cssMinifier from '$lib/css';
import { MINIFY_CSS } from '$lib/variables';
import yaml from 'yaml';
import logger from './logger';
import directives from './directives';

type Page = {
	path: string;
	frontmatter: any;
	document: string;
	collection?: string;
};

type Partial = {
	path: string;
	frontmatter: any;
	document: string;
};

type PageMap = {
	[slug: string]: Page;
};
type PageCollectionMap = {
	[collection: string]: Page[];
};

type ThemeMap = {
	[theme: string]: string;
};

type PartialMap = {
	[id: string]: Partial;
};

const errors = {
	noSlugFound() {
		return new Error(
			'Each page must contain a slug property in its frontmatter.'
		);
	},
	duplicateSlugFound(slug: string) {
		return new Error('Duplicate Slug found: [' + slug + ']');
	},
	missingFrontmatter() {
		return new Error(
			'Each document must contain frontmatter at the start of the file.'
		);
	},
	partials: {
		noIdFound() {
			return new Error(
				'Each partial must contain an id property in its frontmatter.'
			);
		},
		duplicateIdFound(id: string) {
			return new Error('Duplicate id found: [' + id + ']');
		}
	}
};

const files = {
	pages: import.meta.glob('$site/pages/**/*.md', { as: 'raw' }),
	themes: import.meta.glob('$site/themes/**/*.css', {
		as: 'raw'
	}),
	partials: import.meta.glob('$site/partials/**/*.md', {
		as: 'raw'
	})
};

const contentPromises = {
	pages: readPages(files.pages),
	themes: readThemes(files.themes),
	partials: readPartials(files.partials)
};

const processor = getProcessor(directives);

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

async function readPages(
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
}

async function readThemes(themes: Record<string, () => Promise<string>>) {
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

async function readPartials(
	partials: Record<string, () => Promise<string>>
): Promise<PartialMap> {
	type PartialEntry = [path: string, content: string];
	const entries = Object.entries(partials);

	const loadContent = async ([
		path,
		load
	]: typeof entries[number]): Promise<PartialEntry> => [path, await load()];

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

export const pages = {
	async load(slug: string) {
		const pages = await contentPromises.pages;
		return pages.slugs[slug];
	},
	async collection(name: string) {
		const pages = await contentPromises.pages;
		return pages.collections[name];
	}
};

export const themes = {
	async load(theme: string): Promise<string | undefined> {
		const themes = await contentPromises.themes;

		return themes[theme];
	}
};

export const partials = {
	async load(id: string) {
		const partials = await contentPromises.partials;
		return partials[id];
	}
};

export async function render(
	document: Page | Partial,
	options?: { partial: boolean }
): Promise<DocumentResult> {
	if (options?.partial)
		return await processor.processPartial(document.document);
	else return await processor.process(document.document);
}
