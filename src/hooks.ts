import { rehype } from 'rehype';
import rehypePresetMinify from 'rehype-preset-minify';
import rehypeSanitize from 'rehype-sanitize';

async function minify(html: string) {
	return (
		rehype()
			// Effectively strip script tags from the output
			// This method has the downside that an element that I use in the future will need to be added to `tagNames` to be preserved.
			.use(rehypeSanitize, {
				clobberPrefix: '',
				allowDoctypes: true,
				tagNames: [
					'html',
					'head',
					'body',
					'meta',
					'link',
					'title',
					'style',
					'ul',
					'li',
					'a',
					'img',
					'div',
					'span',
					'div',
					'section',
					'h1',
					'h2'
				],
				strip: ['script'],
				attributes: {
					meta: ['charset', 'name', 'content'],
					html: ['lang'],
					a: ['href'],
					img: ['alt', 'src'],
					'*': ['className', 'id'],
					link: ['rel', 'href', 'type']
				}
			})
			.use(rehypePresetMinify)
			.process(html)
			.then(String)
	);
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
