import { rehype } from 'rehype';
import rehypePresetMinify from 'rehype-preset-minify';

async function minify(html: string) {
	return rehype().use(rehypePresetMinify).process(html).then(String);
}

export async function handle({ request, resolve }) {
	const response = await resolve(request);

	if (response.headers['content-type'] === 'text/html') {
		const body = await minify(response.body);
		return {
			...response,
			body
		};
	}

	return response;
}
