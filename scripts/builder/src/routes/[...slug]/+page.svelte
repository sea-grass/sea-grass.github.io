<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	const { title, description, html, css } = data;
</script>

{@html html}

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<svelte:element this="style">{css}</svelte:element>
</svelte:head>
