<script lang="ts">
	import Icon from 'fa-svelte';
	import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';
	const projects = [
		{
			rel: 'external',
			href: 'bookmarklet-repository',
			github: 'https://github.com/sea-grass/bookmarklet-repository',
			text: 'Bookmarklet repository'
		},
		{
			rel: 'external',
			href: 'https://skyline.ceagrass.workers.dev/image-viewer',
			text: 'Generative skyline'
		},
		{ rel: 'external', href: 'cel.js', text: 'cel.js' }
	];
</script>

<section id="projects">
	<h2 class="text-2xl text-center">projects</h2>
	{#each projects as { href, text, github, rel }}
		<div class="project">
			<a class="self-start text-lg font-sans" {href} {rel}>
				{text}
			</a>
			{#if github}
				<a rel="external" href={github} class="self-end">
					<Icon icon={faGithub} /> View on GitHub
				</a>
			{/if}
		</div>
	{/each}
</section>

<style lang="postcss">
	#projects {
		@apply outline-dashed outline-1 my-4 p-1 target:outline-4 target:outline-double target:shadow-lg target:shadow-black;
	}

	.project {
		@apply flex flex-col m-4 outline-1 outline p-4 shadow-sm block;
	}
</style>
