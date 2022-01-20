import { MINIFY_HTML } from '$lib/variables';
import type { Handle } from '@sveltejs/kit';
import { minify } from '$lib/rehype';

const html = (response: Response) => response.headers['content-type'] === 'text/html';

async function postprocess(response: Response): Promise<Response> {
	if (MINIFY_HTML && html(response)) {
		const body = await minify(response.body);
		return new Response(body, response);
	}

	return response;
}

export const handle: Handle = async function handle({ event, resolve }) {
	const response = await resolve(event);
	const rendered = await postprocess(response);
	return rendered;
};
