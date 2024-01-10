<script lang="ts">
	import Document from '$lib/Document.svelte';
	// import type { PageData } from './$types';
	export let data;
</script>

<Document document={data.document} />
