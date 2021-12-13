<script lang="ts">
	import '../tailwind.css';
	import bannerWebp from '../assets/banner.webp';
</script>

<div class="my-0 md:max-w-md mx-auto">
	<img type="image/webp" src={bannerWebp} alt="Toronto skyline" />
	<div class="mx-2">
		<slot />
		<div class="font-serif">sea-grass (c) 2021</div>
	</div>
</div>
