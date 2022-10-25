import { getProcessor, type DocumentResult } from '$lib/remark';
import directives from './directives';
import { readPages, readThemes, readPartials } from './read';
import type { Page, Partial } from './index.d';

const files = {
	pages: import.meta.glob('$site/pages/**/*.md', { as: 'raw' }),
	themes: import.meta.glob('$site/themes/**/*.css', {
		as: 'raw'
	}),
	partials: import.meta.glob('$site/partials/**/*.md', {
		as: 'raw'
	})
};

const contentPromises = {
	pages: readPages(files.pages),
	themes: readThemes(files.themes),
	partials: readPartials(files.partials)
};

export const pages = {
	async load(slug: string) {
		const pages = await contentPromises.pages;
		return pages.slugs[slug];
	},
	async collection(name: string) {
		const pages = await contentPromises.pages;
		return pages.collections[name];
	}
};

export const themes = {
	async load(theme: string): Promise<string | undefined> {
		const themes = await contentPromises.themes;

		return themes[theme];
	}
};

export const partials = {
	async load(id: string) {
		const partials = await contentPromises.partials;
		return partials[id];
	}
};

const processor = getProcessor(directives);
export async function render(
	document: Page | Partial,
	options?: { partial: boolean }
): Promise<DocumentResult> {
	if (options?.partial)
		return await processor.processPartial(document.document);
	else return await processor.process(document.document);
}
