export type Page = {
	path: string;
	frontmatter: any;
	document: string;
	collection?: string;
};

export type Partial = {
	path: string;
	frontmatter: any;
	document: string;
};

export type PageMap = {
	[slug: string]: Page;
};

export type PageCollectionMap = {
	[collection: string]: Page[];
};

export type ThemeMap = {
	[theme: string]: string;
};

export type PartialMap = {
	[id: string]: Partial;
};
