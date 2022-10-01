import { process } from '$lib/remark';
import cssMinifier from '$lib/css';
import { MINIFY_CSS } from '$lib/variables';

const files = {
	pages: import.meta.glob('$lib/../../../../site/pages/**/*.md', { as: 'raw' }),
	themes: import.meta.glob('$lib/../../../../site/themes/**/*.css', { as: 'raw' })
};

export async function loadPages() {
	return await Promise.all(
		Object.entries(files.pages).map(async (entry) => {
			const [, mod] = entry;
			const data = await mod();
			// TODO: Extract frontmatter and transform markdown
			return await process(data);
		})
	);
}

export async function loadThemes() {
	return await Promise.all(
		// load the file contents of all css files
		Object.entries(files.themes).map(async (entry) => {
			const [name, mod] = entry;
			// I know that the themes directory is the 4th token,
			// so the theme name will be the 5th token
			const theme = name.split('/').slice(4, 5)[0];
			const css = await mod();
			// Todo: enforce order of css files if necessary (maybe just alphabetical?)
			return { name: theme, css };
		})
	)
		// concatenate css content for each theme
		.then((themeFiles) =>
			themeFiles.reduce((acc, curr) => {
				if (acc[curr.name]) acc[curr.name] += curr.css;
				else acc[curr.name] = curr.css;
				return acc;
			}, {})
		)
		// minify css if necessary
		.then((themeMap) => {
			if (MINIFY_CSS)
				return Promise.all(
					Object.entries(themeMap).map(async (entry): Promise<{ name: string; css: string }> => {
						const [name] = entry;
						const css: string = entry[1] as string;
						const result = await cssMinifier.process(css);
						return { name, css: result.css };
					})
				).then((themeEntries) =>
					Object.fromEntries(themeEntries.map(({ name, css }) => [name, css]))
				);
			else return themeMap;
		});
}
