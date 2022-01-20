/** A build-time flag to determine whether HTML responses should be minified or not */
export const MINIFY_HTML: boolean =
	import.meta.env.VITE_MINIFY_HTML === undefined ? true : import.meta.env.VITE_MINIFY_HTML === '1';
