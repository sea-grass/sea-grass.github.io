<script lang="ts">
	export let document: Document;
	const { title, description, html, css } = document;
</script>

{@html html}

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="charset" content="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="stylesheet" href="/highlightjs/styles/rainbow.min.css" />
	<link rel="icon" type="image/png" href="/favicon.png" />
	<svelte:element this="style">{css}</svelte:element>
</svelte:head>
