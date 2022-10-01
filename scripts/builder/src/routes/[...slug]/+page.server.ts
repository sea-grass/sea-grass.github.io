import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { pages, themes } from '$lib/site';

export const prerender = true;
export const csr = false;

export const load: PageServerLoad = async ({ params }) => {
	// svelte populates the url param without the prefix
	const slug = '/' + params.slug;

	const page = await pages.load(slug);

	if (page) {
		const frontmatter = page.frontmatter as any;
		const theme = frontmatter.theme || 'default';

		const css: string = (await themes.load(theme)) || '';
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
