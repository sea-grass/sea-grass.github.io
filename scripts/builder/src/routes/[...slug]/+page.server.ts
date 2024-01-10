import type { PageServerLoad } from './$types';
import { pages, render, themes } from '$lib/site';
import logger from '$lib/logger';
import type { Document } from '$lib/types';
import { z } from 'zod';

export const prerender = true;
export const csr = false;

export const load: PageServerLoad = async ({ params }) => {
	// svelte populates the url param without the prefix
	const slug = '/' + params.slug;

	logger.info('load.server(' + slug + ')');

	const page = await pages.load(slug);

	const result = await render(page);

	// TODO ...
	if (result.type !== 'page') throw new Error('Expected page');

	const { html, title, description } = result;

	const schema = z.object({
		theme: z.string().default('default')
	});

	const parse_result = schema.safeParse(page.frontmatter);

	if (!parse_result.success) {
		throw new Error('Failed to parse page frontmatter');
	}

	const { theme } = parse_result.data;

	const css: string = (await themes.load(theme)) || '';

	const document: Document = {
		title,
		description,
		html,
		css
	};

	return {
		href: slug,
		document,
		frontmatter: page.frontmatter
	};
};
