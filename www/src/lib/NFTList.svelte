<script>
  import { onDestroy, onMount } from 'svelte';
  import pLimit from 'p-limit';
  import { user, getCaver, getCaverForWebsocket } from './store';

  export let tokenAddress;
  export let getImageURI;

  const caver = getCaver();
  let selectedTokenIds = [];             // 선택한 NFT Token ID
  let toAddress = '';             // 전송 받을 지갑 주소

  const contract = new caver.contract(caver.klay.KIP17.abi, tokenAddress);
  const contractByKaikas = new window.caver.klay.Contract(caver.klay.KIP17.abi, tokenAddress);

  let items = [];
  user.subscribe(async (u) => {
    if (u.connected !== true) {
      return;
    }
    
    loadNFT(u.address);
  })

  async function loadNFT(address) {
    handleResetClick();
    const amount = await contract.methods.balanceOf(address).call();
    const limit = pLimit(10);

    const pList = [];
    for (let i = 0; i < amount; i++) {
      pList.push(limit(() => contract.methods.tokenOfOwnerByIndex(address, i).call()));
    }

    const tokenIds = await Promise.all(pList);

    const loadedTokens = await Promise.all(tokenIds.map(async (tokenId) => ({
      src: await Promise.resolve(getImageURI(tokenId)),
      tokenId,
      name: `#${tokenId}`,
    })));

    items = loadedTokens.sort((s, t) => s.tokenId - t.tokenId);
  }

  async function handleTransferClick() {
    if ($user.connected !== true) {
      return alert('지갑을 연결하세요.');
    }
    if (toAddress.trim() === '') {
      return alert('지갑주소를 입력하세요.');
    }

    if (selectedTokenIds.length === 0) {
      return alert('이미지를 선택하세요.')
    }

    for (const tokenId of selectedTokenIds) {
      try {
          await contractByKaikas.methods.transferFrom($user.address, toAddress, tokenId).send({
          gas: 3000000,
          from: $user.address,
        });    
      } catch(e) {
        console.log(e);
        alert(`TokenID: ${tokenId} 전송에 실패했습니다.`);
        return;
      }
    }

    alert(`${selectedTokenIds.join(',')} 전송하였습니다.`);
    await loadNFT($user.address);
  }

  function handleResetClick() {
    selectedTokenIds = [];
  }
</script>

<div>
  <div style="margin-bottom: 20px">
    <input type='text' bind:value={toAddress} placeholder='0x0000000' style='width:400px'>
    <button on:click={handleTransferClick}>Transfer</button>
    <button on:click={handleResetClick}>Reset</button>
    <div>
      {#each selectedTokenIds as tokenId}
        <span class="badge bg-success">{tokenId}</span>
      {/each}
    </div>
  </div>
  <div class="btn-group" role="group" aria-label="Basic checkbox toggle button group">
    <ul>
      {#each items as item}
        <li>
          <img src={item.src} alt={item.name} />
          <span class="no badge bg-secondary">{item.name}</span>
          <input type="checkbox" class="btn-check" id={`btncheck-${item.name}`} bind:group={selectedTokenIds} value={item.tokenId} autocomplete="off">
          <label for={`btncheck-${item.name}`}></label>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  ul {
    padding: 0;
  }
  li {
    position: relative;
    list-style: none;
    width: 256px;
    display: inline-block;
    margin: 2px;
  }
  li > img {
    width: 100%;
  }
  li > .no {
    position: absolute;
    left: 0;
    top: 0;
    margin: 12px;
  }
  li > label {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
  .btn-check:checked ~ label {
    border: 15px solid rgb(108, 117, 125);
  }
  .badge ~ .badge {
    margin-left: 2px;
  }
</style>