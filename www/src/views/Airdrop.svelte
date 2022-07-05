<script>
  import Kaikas from '../lib/Kaikas.svelte';
  import NFTList from '../lib/NFTList.svelte';
  import NFTListConfig from '../config/sunmiya-nft';
	
</script>

<main>
  <Kaikas />
  <NFTList {...NFTListConfig} />
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>