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

type PageMap = {
	[slug: string]: Page;
};
type PageCollectionMap = {
	[collection: string]: Page[];
};

type ThemeMap = {
	[theme: string]: string;
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
	}
};

const files = {
	pages: import.meta.glob('$lib/../../../../site/pages/**/*.md', { as: 'raw' }),
	themes: import.meta.glob('$lib/../../../../site/themes/**/*.css', {
		as: 'raw'
	})
};

const contentPromises = {
	pages: readPages(files.pages),
	themes: readThemes(files.themes)
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

function readThemes(themes: Record<string, () => Promise<string>>) {
	return Promise.all(
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
					const { css } = await cssMinifier.process(themeMap[theme]);
					themeMap[theme] = css;
				}
			}
			return themeMap;
		});
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

export async function render(page: Page): Promise<DocumentResult> {
	return await processor.process(page.document);
}
