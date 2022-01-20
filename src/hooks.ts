import type { Response } from '@sveltejs/kit';
import { MINIFY_HTML } from '$lib/variables';
import { minify } from '$lib/rehype';

const html = (response: Response) => response.headers['content-type'] === 'text/html';

async function postprocess(response: Response) {
	if (MINIFY_HTML && html(response))
		return {
			...response,
			body: await minify(String(response.body))
		};

	return response;
}

export async function handle({ request, resolve }) {
	const response = await resolve(request);
	const rendered = await postprocess(response);
	return rendered;
}
