<script>
  import Kaikas from "../lib/Kaikas.svelte";
  import { push } from "svelte-spa-router";
  import * as store from "../lib/store";
  import { deploy } from "../lib/deployer";
  import * as api from '../lib/api';

  let accountAddress = null;
  let accoundChainId = null;
  $: contractAddress = '';

  store.user.subscribe(async (account) => {
    if (account.connected !== true) {
      return;
    }

    accountAddress = account.address;
    accoundChainId = account.chainId;
  });

  async function deployHandler() {
    if (!store.getWhitelistInfo().bytecode) {
      return alert('컴파일 정보를 불러올 수 없습니다.');
    }

    if (!accountAddress) {
      return alert("지갑을 연결하세요.");
    }

    contractAddress = await deploy(accountAddress, {
      abi: store.getWhitelistInfo().abi,
      bytecode: store.getWhitelistInfo().bytecode,
      args: []
    });

    await api.saveWhitelistAddress(accoundChainId, accountAddress, contractAddress);

    push('/');
  }
</script>

<div>
  <Kaikas />
  <button class="btn btn-primary" on:click={deployHandler}>Whitelist Deploy</button>
  <h1>{contractAddress}</h1>
</div>

<style>
</style>
