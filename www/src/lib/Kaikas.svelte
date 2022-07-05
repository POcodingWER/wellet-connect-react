<script>
  import { onDestroy, onMount } from 'svelte';
  import { user } from './store';

  const klaytn = window.klaytn;
  
  async function connect() {
    const accounts = await klaytn.enable();

    if (accounts.length >= 1) {
      user.set({
        connected: true,
        address: accounts[0],
        chainId: klaytn.networkVersion
      })
    }
  }

  const accountsChanged = (accounts) => user.update(u => ({...u, address: accounts[0]}));
  const networkChanged = (chainId) => user.update(u => ({...u, chainId}));

  onMount(async () => {
    if (klaytn.isConnected() && klaytn.selectedAddress) {
      user.set({
        connected: true,
        address: klaytn.selectedAddress,
        chainId: klaytn.networkVersion,
      })
    }

    klaytn.on('accountsChanged', accountsChanged);
    klaytn.on('networkChanged', networkChanged);
  });

  onDestroy(() => {
    // console.log('Destroy');
    klaytn.off('accountsChanged', accountsChanged);
    klaytn.off('networkChanged', networkChanged);
  });
</script>

<div>
  {#if !$user.connected}
    <button type="button" class="btn btn-primary" on:click={connect}>Connect</button>
  {/if}

  {#if $user.connected}
    <h4>chain Id: {$user.chainId}</h4>
    <div>address: {$user.address}</div>
  {/if}
  <hr />
</div>
