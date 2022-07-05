<script>
  import * as store from '../lib/store';
  import * as api from '../lib/api';
  import { deploy } from '../lib/deployer';
  import Kaikas from '../lib/Kaikas.svelte';
  import Form from '../lib/Form.svelte';
  import { push } from "svelte-spa-router";

  let tokenName;
  let tokenSymbol;

  let accountAddress = null;
  let accoundChainId = null;
  $: contractAddress = '';

  store.user.subscribe(async (account) => {   //지갑정보가져옴
    if (account.connected !== true) {   
      return;
    }

    accountAddress = account.address;
    accoundChainId = account.chainId;
  });
  async function deployHandler() {
    if (!store.getNFTInfo().bytecode) {
      return alert('컴파일 정보를 불러올 수 없습니다.');
    }
    if (!accountAddress) {
      return alert('지갑을 연결하세요.');
    }

    if (tokenName.trim() === '' || tokenSymbol.trim() === '') {
      return alert('tokenName, tokenSymbol을 입력하세요');
    }

    contractAddress = await deploy(accountAddress, {    //contract deploy
      abi: store.getNFTInfo().abi,
      bytecode: store.getNFTInfo().bytecode,
      args: [tokenName, tokenSymbol],
    });
    await api.saveKIP17Address(accoundChainId, accountAddress, contractAddress);
    push('/');
  }
</script>

<Kaikas />
<div>
  <Form label="Token Symbol" bind:value={tokenSymbol} placeholder="MIYA" />
  <Form label="Token Name" bind:value={tokenName} placeholder="Sunmiya Club Official" />
  <!-- <div class="mb-3">
    <label for="tokenSymbol" class="form-label">Token Symbol</label>
    <input type="email" class="form-control" id="tokenSymbol" placeholder="MIYA">
  </div>
  <div class="mb-3">
    <label for="tokenName" class="form-label">Token Name</label>
    <input type="email" class="form-control" id="tokenName" placeholder="Sunmiya Club Official">
  </div> -->
  <button class="btn btn-primary" on:click={deployHandler}>Deploy</button>
</div>

<style>
</style>
