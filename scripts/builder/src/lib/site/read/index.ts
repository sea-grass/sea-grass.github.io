export { readPages } from './pages';

import logger from '../logger';
import cssMinifier from '$lib/css';
import { MINIFY_CSS } from '$lib/variables';
import errors from '../errors';
import type { ThemeMap, PartialMap, Partial } from '../../site/index.d';
import { parseFrontmatter } from './parseFrontmatter';

const parseThemeName = (fileName: string) => {
	// I know that the themes directory is the 4th token,
	// so the theme name will be the 5th token
	return fileName.split('/').slice(4, 5)[0];
};

async function getCssFiles(
	themes: Record<string, () => Promise<string>>
): Promise<{ theme: string; css: string }[]> {
	const cssFiles: { theme: string; css: string }[] = [];
	for (const [path, load] of Object.entries(themes)) {
		console.debug(path, 'sup');
		const theme = parseThemeName(path);
		const css = await load();
		cssFiles.push({ theme, css });
	}
	return cssFiles;
}

async function reduceToThemeMap(
	themeFiles: { theme: string; css: string }[]
): Promise<ThemeMap> {
	return themeFiles.reduce<ThemeMap>((themeMap, { theme, css }) => {
		if (themeMap[theme]) themeMap[theme] += css;
		else themeMap[theme] = css;
		return themeMap;
	}, {});
}

async function minifyCss(themeMap: ThemeMap): Promise<ThemeMap> {
	if (MINIFY_CSS)
		for (const theme in themeMap) {
			logger.info('Minifying theme (' + theme + ')');
			const result = await cssMinifier.process(themeMap[theme]);
			themeMap[theme] = result.css;
		}

	return themeMap;
}

export async function readThemes(
	themes: Record<string, () => Promise<string>>
) {
	return await getCssFiles(themes).then(reduceToThemeMap).then(minifyCss);
}

async function getPartialFiles(
	partials: Record<string, () => Promise<string>>
): Promise<PartialEntry> {
	type PartialEntry = [path: string, content: string];
	const loadContent = async ([path, load]): Promise<PartialEntry> => [
		path,
		await load()
	];
	return await Promise.all(Object.entries(partials).map(loadContent));
}

async function reduceToPartialMap(
	partialEntries: PartialEntry[]
): Promise<PartialMap> {
	const partials: PartialMap = {};

	for (const [path, document] of partialEntries) {
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
}

export async function readPartials(
	partials: Record<string, () => Promise<string>>
): Promise<PartialMap> {
	return await getPartialFiles(partials).then(reduceToPartialMap);
}
