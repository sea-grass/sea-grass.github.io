import { rehype } from 'rehype';
import rehypePresetMinify from 'rehype-preset-minify';
export async function minify(html) {
	return rehype().use(rehypePresetMinify).process(html).then(String);
}
