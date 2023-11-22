module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.json',
		extraFileExtensions: ['.svelte'],
		sourceType: 'module',
		ecmaVersion: 2019
	},
	extends: [
		'eslint:recommended',
		'plugin:svelte/recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier'
	],
	settings: {
		svelte: {
			ignoreWarnings: ['svelte/no-at-html-tags']
		}
	},
	plugins: ['@typescript-eslint'],
	ignorePatterns: ['*.cjs'],
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: { parser: '@typescript-eslint/parser' }
		}
	],
	parserOptions: {},
	env: {
		browser: true,
		es2017: true,
		node: true
	}
};
