import type { PageServerLoad } from './$types';
import { pages, render, themes } from '$lib/site';
import { z } from 'zod';

export const prerender = true;
export const csr = false;

export const load: PageServerLoad = async ({ params }) => {
	// svelte populates the url param without the prefix
	const slug = '/' + params.slug;

	const page = await pages.load(slug);
	const result = await render(page);

	const { html, title, description } = result;

	const schema = z.object({
		theme: z.string().default('default')
	});

	const parse_result = await schema.safeParse(page.frontmatter);

	if (!parse_result.success) {
		throw new Error('Failed to parse page frontmatter');
	}

	const { theme } = parse_result.data;

	const css: string = (await themes.load(theme)) || '';
	return {
		href: slug,
		html,
		frontmatter: page.frontmatter,
		title,
		description,
		css
	};
};
