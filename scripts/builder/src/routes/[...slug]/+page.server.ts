import type { PageServerLoad } from './$types';
import { process } from '$lib/remark';
import { error } from '@sveltejs/kit';
import cssMinifier from '$lib/css';
import { MINIFY_CSS } from '$lib/variables';

export const prerender = true;
export const csr = false;

const pageFiles = Object.entries(
	import.meta.glob('$lib/../../../../site/pages/**/*.md', { as: 'raw' })
);

const pages = Promise.all(
	pageFiles.map(async (entry) => {
		const [, mod] = entry;
		const data = await mod();
		// TODO: Extract frontmatter and transform markdown
		return await process(data);
	})
);

const themeFiles = Object.entries(
	import.meta.glob('$lib/../../../../site/themes/**/*.css', { as: 'raw' })
);
const themes = Promise.all(
	// load the file contents of all css files
	themeFiles.map(async (entry) => {
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

export const load: PageServerLoad = async ({ params }) => {
	// svelte populates the url param without the prefix
	const slug = '/' + params.slug;

	const page = (await pages).find((page) => (page.frontmatter as any).slug === slug);

	if (page) {
		let theme = 'default';
		const frontmatter = page.frontmatter as any;
		if (frontmatter.theme) theme = frontmatter.theme;

		const css: string = (await themes)[theme] || '';
		return {
			href: frontmatter.slug as string,
			html: page.html,
			frontmatter,
			title: page.title,
			description: page.description,
			css
		};
	}

	throw error(404, 'not found');
};
