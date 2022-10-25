/** variables.ts */

/// Site builder

/** If true, the site builder will minify the generated HTML page. */
export const MINIFY_HTML = bool(import.meta.env.VITE_MINIFY_HTML, true);
/** If true, the site builder will minify the generated CSS bundle. */
export const MINIFY_CSS = bool(import.meta.env.VITE_MINIFY_CSS, true);

/// Helpers
function bool(val: any, fallback: boolean) {
	if (val === undefined) return Boolean(fallback);
	return val === '1';
}
