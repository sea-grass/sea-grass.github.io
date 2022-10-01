import { process, type DocumentResult } from '$lib/remark';
import cssMinifier from '$lib/css';
import { MINIFY_CSS } from '$lib/variables';

const errors = {
	noSlugFound() {
		return new error(
			'Each page must contain a slug property in its frontmatter.'
		);
	},
	duplicateSlugFound(slug: string) {
		return new Error('Duplicate Slug found: [' + slug + ']');
	}
};

const files = {
	pages: import.meta.glob('$lib/../../../../site/pages/**/*.md', { as: 'raw' }),
	themes: import.meta.glob('$lib/../../../../site/themes/**/*.css', {
		as: 'raw'
	})
};

let _pages:
	| Promise<{ slugs: PageMap; collections: PageCollectionMap }>
	| undefined;
export const pages = {
	async load(slug: string) {
		if (!_pages) _pages = loadPages();

		return (await _pages).slugs[slug];
	},
	async collection(name: string) {
		if (!_pages) _pages = loadPages();

		return (await _pages).collections[name];
	}
};

let _themes: Promise<ThemeMap> | undefined;
export const themes = {
	async load(theme: string): Promise<string | undefined> {
		if (!_themes) _themes = loadThemes();

		return (await _themes)[theme];
	}
};

type PageMap = {
	[slug: string]: DocumentResult;
};

type PageCollectionMap = {
	[collection: string]: DocumentResult[];
};

async function loadPages(): Promise<{
	slugs: PageMap;
	collections: PageCollectionMap;
}> {
	const documents = await Promise.all(
		Object.values(files.pages).map(
			async (getMarkdown) => await getMarkdown().then(process)
		)
	);

	const slugs: PageMap = {};
	const collections: PageCollectionMap = {};

	for (const document of documents) {
		const frontmatter = document.frontmatter as any;
		const slug = frontmatter.slug as string | undefined;
		if (!slug) throw errors.noSlugFound();
		const collection = frontmatter.collection as string | undefined;

		if (slugs[slug]) throw errors.duplicateSlugFound(slug);
		slugs[slug] = document;

		if (collection) {
			console.log(
				'Adding slug(' + slug + ') to collection(' + collection + ')'
			);
			if (!collections[collection]) collections[collection] = [];

			collections[collection].push(document);
		} else {
			console.log('Loaded slug(' + slug + ')');
		}
	}

	return { slugs, collections };
}

type ThemeMap = {
	[theme: string]: string;
};

async function loadThemes(): Promise<ThemeMap> {
	const themeFiles = await Promise.all(
		// load the file contents of all css files
		Object.entries(files.themes).map(async ([name, getCss]) => {
			// I know that the themes directory is the 4th token,
			// so the theme name will be the 5th token
			const theme = name.split('/').slice(4, 5)[0];
			const css = await getCss();
			// Todo: enforce order of css files if necessary (maybe just alphabetical?)
			return { theme, css };
		})
	);

	const themeMap = themeFiles.reduce<ThemeMap>((themeMap, { theme, css }) => {
		if (themeMap[theme]) themeMap[theme] += css;
		else themeMap[theme] = css;
		return themeMap;
	}, {});

	if (MINIFY_CSS) {
		for (const theme in themeMap) {
			const { css } = await cssMinifier.process(themeMap[theme]);
			themeMap[theme] = css;
		}
	}

	return themeMap;
}
