<script>
  import Kaikas from "../lib/Kaikas.svelte";
  import * as store from "../lib/store";
  import * as api from "../lib/api";
  import { user } from "../lib/store";
  import WhiteListInfo from "../lib/WhitelistInfo.svelte";
  import WhiteListUpdate from "../lib/WhitelistUpdate.svelte";

  let kip17Address = null;
  let whitelistAddress = null;
  let minterAddress = null;

  let kip17Abi = [];
  let minterAbi = [];

  export let options;

  user.subscribe(async (u) => {
    if (u.chainId === 0) {
      return;
    }
    kip17Address = await api.getKIP17Address(u.chainId, u.address);
    whitelistAddress = await api.getWhitelistAddress(u.chainId, u.address);
    minterAddress = await api.getMinterAddress(u.chainId, u.address);


    if (kip17Address) {
      const { abi } = store.getNFTInfo();
      kip17Abi = abi.filter(f => f.name === 'totalSupply')
    }

    if (minterAddress) {
      const { abi } = store.getMinterInfo();
      minterAbi = abi.filter(f => f.name === 'whitelistSale' || f.name === 'publicSale' || f.name === 'getSaleInfo' || f.name === 'tokenIdCounter')
    }
  });
</script>

<main>
  <Kaikas />
  <WhiteListInfo />
  <WhiteListUpdate />
</main>

<style>
</style>
