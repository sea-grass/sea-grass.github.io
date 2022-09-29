import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({
		postcss: true
	}),

	kit: {
		inlineStyleThreshold: 1024,
		prerender: {
			crawl: true,
			entries: ['/']
		},
		paths: {
			base: process.env.BASE_URL || ''
		},
		adapter: adapter({
			pages: '../../build',
			assets: '../../build',
			fallback: null
		}),
		files: {
			assets: '../../site/assets'
		}
	}
};

export default config;
