// import { MINIFY_HTML } from '$lib/variables';
import type { Handle } from '@sveltejs/kit';
// import { minify } from '$lib/rehype';

// const html = (response: Response) =>
//	response.headers.get('content-type') === 'text/html';

async function postprocess(response: Response): Promise<Response> {
	return response;
	// In the current version of svelte-kit, when I return my own
	// `Response`, kit hangs for a few seconds before delivering my
	// response. Need to investigate this later.
	// if (MINIFY_HTML && html(response)) {
	// 	const body = await minify(await response.text());
	// 	const elapsed = performance.now() - start;
	// 	console.log(elapsed, 'b');
	// 	return new Response(body, response);
	// }

	// return response;
}

export const handle: Handle = async function handle({ event, resolve }) {
	const response = await resolve(event);
	const rendered = await postprocess(response);
	return rendered;
};
