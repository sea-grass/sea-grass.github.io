import type { PageServerLoad } from './$types';
import { pages, render, themes } from '$lib/site';

export const prerender = true;
export const csr = false;

export const load: PageServerLoad = async ({ params }) => {
	// svelte populates the url param without the prefix
	const slug = '/' + params.slug;

	const page = await pages.load(slug);
	const result = await render(page);
	const { html, title, description } = result;

	const frontmatter = page.frontmatter as any;
	const theme = frontmatter.theme || 'default';

	const css: string = (await themes.load(theme)) || '';
	return {
		href: frontmatter.slug as string,
		html,
		frontmatter,
		title,
		description,
		css
	};
};
