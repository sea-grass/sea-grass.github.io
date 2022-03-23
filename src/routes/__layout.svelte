<script lang="ts">
	import '../global.css';
	import bannerWebp from '../assets/banner.webp';
	import resolve from '$lib/resolve';
	const nav = [
		{ href: 'https://github.com/sea-grass', text: 'github' },
		{ href: resolve('/#projects'), text: 'projects' },
		{ href: '/wiki', text: 'wiki' }
	];
</script>

<header>
	<img class="mx-auto" type="image/webp" src={bannerWebp} alt="Toronto skyline" />
</header>
<div class="my-0 md:max-w-md mx-auto">
	<div class="mx-2">
		<a href="/" class="flex m-2 gap-2 justify-center">
			<img
				class="icon"
				src="https://avatars.githubusercontent.com/u/3868549?s=64&v=4"
				alt="Abstract art logo"
			/>
			<h1 class="text-6xl inline-block">Chris Grass</h1>
		</a>
		<nav>
			<ul class="grid grid-cols-6 gap-4 items-center">
				<li class="col-span-2" />
				{#each nav as { href, text } (href)}
					<li>
						<a {href} class="flex justify-start items-center gap-x-0.5">
							{text}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
		<slot />
		<footer>sea-grass (c) 2022</footer>
	</div>
</div>

<style lang="postcss">
	header {
		@apply bg-slate-300;
	}
	footer {
		@apply font-serif text-center text-slate-300 font-bold italic;
	}
	.icon {
		@apply rounded-full w-12 h-12 self-center;
	}
</style>
