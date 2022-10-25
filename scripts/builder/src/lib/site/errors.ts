const errors = {
	noSlugFound() {
		return new Error(
			'Each page must contain a slug property in its frontmatter.'
		);
	},
	duplicateSlugFound(slug: string) {
		return new Error('Duplicate Slug found: [' + slug + ']');
	},
	missingFrontmatter() {
		return new Error(
			'Each document must contain frontmatter at the start of the file.'
		);
	},
	partials: {
		noIdFound() {
			return new Error(
				'Each partial must contain an id property in its frontmatter.'
			);
		},
		duplicateIdFound(id: string) {
			return new Error('Duplicate id found: [' + id + ']');
		}
	}
};

export default errors;
