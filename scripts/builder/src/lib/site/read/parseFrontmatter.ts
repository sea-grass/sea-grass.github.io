import yaml from 'yaml';
import errors from '../errors';

export function parseFrontmatter(document: string) {
	const frontmatterFence = '---\n';
	if (!document.startsWith(frontmatterFence)) throw errors.missingFrontmatter();

	const startIndex = frontmatterFence.length;
	// we search for the last fence block after the first fence block
	const endIndex = document.indexOf(frontmatterFence, startIndex);
	if (endIndex < 0) throw errors.missingFrontmatter();

	const frontmatter = document.slice(startIndex, endIndex);
	return yaml.parse(frontmatter);
}
