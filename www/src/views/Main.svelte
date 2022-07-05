<script>
  import copy from 'copy-to-clipboard';

  import Kaikas from "../lib/Kaikas.svelte";
  import * as store from "../lib/store";
  import * as api from "../lib/api";
  import { user } from "../lib/store";
  import Dashboard from "../lib/Dashboard.svelte";

  let kip17Address = null;
  let whitelistAddress = null;
  let minterAddress = null;

  let kip17Abi = [];
  let minterAbi = [];

  user.subscribe(async (u) => {
    // console.log(u)  //connected: true, address: '0xf78458143c4928223a0f204cc9b7ff244b1e3eba', chainId: 1001 
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
  <ul class="list-group mt-4 mb-4">
    <li class="list-group-item">
      <div class="fw-bold">kip17 Address</div>
      <div class="me-auto">
      {#if !kip17Address}
        <a
          href="#/kip17-deploy"
          class="btn btn-outline-primary btn-sm"
        >
          Deploy
        </a>
      {:else}
        <small class="text-secondary">{kip17Address}</small>
        <p>
          <a
            class="btn btn-outline-primary btn-sm"
            data-bs-toggle="collapse"
            href="#showKip17ABI"
            role="button"
            aria-expanded="false"
            aria-controls="showKip17ABI">
            Show ABI
          </a>
          <button
            class="btn btn-outline-primary btn-sm" 
            on:click={copy(JSON.stringify(kip17Abi, null ,2))}>
            Copy ABI
          </button>
        </p>
        <div class="collapse" id="showKip17ABI">
          <div class="card card-body">
            <pre>{JSON.stringify(kip17Abi, null ,2)}</pre>
          </div>
        </div>
        {/if}
      </div>
    </li>

    <li class="list-group-item">
      <div class="fw-bold">Whitelist Address
        {#if whitelistAddress}
        <a
          href="#/whitelist"
          class="btn btn-outline-primary btn-sm"
          style="margin-left: 12px;"
        >Edit</a>
        {/if}
      </div>
      <div class="me-auto">
      {#if !whitelistAddress}
        <a
          href="#/whitelist-deploy"
          class="btn btn-outline-primary btn-sm"
        >
          Deploy
        </a>
      {:else}
        <small class="text-secondary">{whitelistAddress}</small>
      {/if}
      </div>
    </li>

    <li class="list-group-item">
      <div class="fw-bold">Minter Address</div>
      <div class="me-auto">
      {#if !minterAddress}
        <a
          href="#/minter-deploy/{kip17Address}/{whitelistAddress}"
          class="btn btn-outline-primary btn-sm"
        >
          Deploy
        </a>
      {:else}
        <small class="text-secondary">{minterAddress}</small>
        <p>
          <a class="btn btn-outline-primary btn-sm" data-bs-toggle="collapse" href="#showABI" role="button" aria-expanded="false" aria-controls="showABI">
            Show ABI
          </a>
          <button
            class="btn btn-outline-primary btn-sm" 
            on:click={copy(JSON.stringify(minterAbi, null ,2))}>
            Copy ABI
          </button>      
        </p>
        <div class="collapse" id="showABI">
          <div class="card card-body">
            <pre>{JSON.stringify(minterAbi, null ,2)}</pre>
          </div>
        </div>
      {/if}
      </div>
    </li>
  </ul>

  <!-- <div>TODO AdminRole 등록 화면</div> -->
  <div>
    <!-- 3개가 다 deploy되면 설정할수잇는 페이지보여 -->
    {#if kip17Address !== null && whitelistAddress !== null && minterAddress !== null}  
      <Dashboard />
    {/if}
  </div>
</main>

<style>
</style>