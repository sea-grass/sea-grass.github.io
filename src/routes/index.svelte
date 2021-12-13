<script lang="ts">
	const projects = [
		{ href: 'bookmarklet-repository', text: 'Bookmarklet repository' },
		{ href: 'https://skyline.ceagrass.workers.dev/image-viewer', text: 'Generative skyline' },
		{ href: 'cel.js', text: 'cel.js' }
	];
</script>

<nav>
	<ul class="grid grid-cols-6 gap-4 items-center">
		<li class="col-span-2">
			<a class="hover:font-bold" href="/">
				<h1 class="text-xl inline-block">sea-grass</h1>
			</a>
		</li>
		<li><a class="hover:font-bold" href="https://github.com/sea-grass">github</a></li>
		<!-- <li><a href="#blog">blog</a></li> -->
		<li><a class="hover:font-bold" href="#projects">projects</a></li>
		<li><a class="hover:font-bold" href="wiki">wiki</a></li>
	</ul>
</nav>

<!-- <section id="blog" class="outline-dashed outline-1 my-4 p-1 target:bg-slate-600 target:outline-double">
	<h2 class="text-2xl text-center">blog</h2>ab
</section> -->

<section
	id="projects"
	class="outline-dashed outline-1 my-4 p-1 target:outline-4 target:outline-double target:shadow-lg target:shadow-black offset "
>
	<h2 class="text-2xl text-center">projects</h2>
	{#each projects as { href, text }}
		<a
			{href}
			class="m-4 outline-1 outline p-4 shadow-sm hover:outline-4 block hover:cursor-pointer text-l"
		>
			{text}
		</a>
	{/each}
</section>
