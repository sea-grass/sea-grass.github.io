import { rehype } from 'rehype';
import rehypePresetMinify from 'rehype-preset-minify';
export async function minify(html: string) {
	return rehype().use(rehypePresetMinify).process(html).then(String);
}
