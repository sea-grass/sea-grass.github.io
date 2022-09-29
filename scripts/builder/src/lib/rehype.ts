import { rehype } from 'rehype';
import rehypePresetMinify from 'rehype-preset-minify';

const processor = rehype().use(rehypePresetMinify);

export async function minify(html: string) {
	return processor.process(html).then(String);
}
