import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { loadPages, loadThemes } from '$lib/site';

export const prerender = true;
export const csr = false;

const pages = loadPages();
const themes = loadThemes();

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
