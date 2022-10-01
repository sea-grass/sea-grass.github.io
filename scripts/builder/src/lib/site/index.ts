import { process, type DocumentResult } from '$lib/remark';
import cssMinifier from '$lib/css';
import { MINIFY_CSS } from '$lib/variables';

const errors = {
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

let _pages: Promise<PageMap> | undefined;
export const pages = {
	async load(slug: string) {
		if (!_pages) _pages = loadPages();

		return (await _pages)[slug];
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

async function loadPages(): Promise<PageMap> {
	const documents = await Promise.all(
		Object.values(files.pages).map(
			async (getMarkdown) => await getMarkdown().then(process)
		)
	);

	return documents.reduce<PageMap>((pageMap, document) => {
		const slug = (document.frontmatter as any).slug as string;

		if (pageMap[slug]) throw errors.duplicateSlugFound(slug);
		pageMap[slug] = document;
		return pageMap;
	}, {});
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
