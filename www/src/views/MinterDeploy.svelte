<script>
  import Kaikas from '../lib/Kaikas.svelte';
  import * as store from '../lib/store';
  import * as api from '../lib/api';
  import { deploy } from '../lib/deployer';
  import * as utils from '../util';
  import { link, push } from "svelte-spa-router";

  export let params = {};

  let walletAddress;
  let kip7Token = '0x0000000000000000000000000000000000000000';
  let nftToken = params.nftToken;
  let whiteListContract = params.whiteListContract;
  let baseTokenURI;

  let accountAddress = null;
  let accoundChainId = null;
  $: contractAddress = '';

  store.user.subscribe(async (user) => {
    if (user.connected !== true) {
      return;
    }

    accountAddress = user.address;
    accoundChainId = user.chainId;
  });

  async function deployHandler() {
    if (!store.getMinterInfo().bytecode) {
      return alert('컴파일 정보를 불러올 수 없습니다.');
    }

    if (!accountAddress) {
      return alert('지갑을 연결하세요.');
    }

    if (
      walletAddress.trim() === '' ||
      kip7Token.trim() === '' ||
      nftToken.trim() === '' ||
      whiteListContract.trim() === '' ||
      baseTokenURI.trim() === ''
    ) {
      return alert('필수 입력값을 입력하세요');
    }

    contractAddress = await deploy(accountAddress, {
      abi: store.getMinterInfo().abi,
      bytecode: store.getMinterInfo().bytecode,
      args: [
        walletAddress,
        // kip7Token,
        nftToken,
        whiteListContract,
        baseTokenURI[baseTokenURI.length-1] === '/' ? baseTokenURI : baseTokenURI + '/',
      ],
    });
    console.log(contractAddress);
    // 민터 컨트랙트 디플로이 후에 nft 토큰에 민터롤로 추가
    await addMinterHandler();

    return await api.saveMinterAddress(accoundChainId, accountAddress, contractAddress);
  }

  async function addMinterHandler() {
    if(!contractAddress) {
      return alert('민터 컨트랙트 디플로이가 완료되지 않았습니다.');
    }

    if(!accountAddress) {
      return alert('지갑을 연결하세요.');
    }

    const kip17Contract = await store.getNFTContract();

    const tx = await utils.executeContractMethod(
      kip17Contract,
      'addMinter',
      [contractAddress],
      accountAddress
    );

    if (tx.status) {
      alert('민터 추가 성공');
      push('/');
    } else {
      alert('민터 추가 실패');
    }
  }

</script>

<div>
  <Kaikas />
  <div class="mb-3">
    <label for="wallet" class="form-label">판매대금 받을 지갑주소</label>
    <input class="form-control" id="wallet" bind:value={walletAddress} placeholder="0x1234" />
  </div>
  <div class="mb-3">
    <label for="kip7" class="form-label">KIP7 Token 주소</label>
    <input class="form-control" id="kip7" bind:value={kip7Token} placeholder="0x1234" />
  </div>
  <div class="mb-3">
    <label for="kip17" class="form-label">KIP17(NFT) Token 주소</label>
    <input class="form-control" id="kip17" bind:value={nftToken} placeholder="" readonly />
  </div>
  <div class="mb-3">
    <label for="whitelist" class="form-label">화이트리스트 Contract 주소</label>
    <input class="form-control" id="whitelist" bind:value={whiteListContract} placeholder="" readonly />
  </div>
  <div class="mb-3">
    <label for="nft-meta" class="form-label">NFT 메타데이터 URI(끝에 / 필수)</label>
    <input class="form-control" id="nft-meta" bind:value={baseTokenURI} placeholder="https://miya.sunmiya.club/" />
  </div>


  <!-- <h3>KIP7 Token 주소</h3>
  <input bind:value={kip7Token} placeholder="0x1234" />
  <h3>KIP17(NFT) Token 주소</h3>
  <input bind:value={nftToken} placeholder="" readonly />
  <h3>화이트리스트 Contract 주소</h3>
  <input bind:value={whiteListContract} placeholder="" readonly />
  <h3>NFT 메타데이터 URI(끝에 / 필수)</h3>
  <input bind:value={baseTokenURI} placeholder="https://miya.sunmiya.club/" /> -->
  <button type="submit" class="btn btn-primary mb-3" on:click={deployHandler}>Deploy</button>

  <h1>{contractAddress}</h1>
  {#if contractAddress}
  <h1>배포 성공</h1>
  <button on:click={addMinterHandler}>민터 추가</button>
  <br/>
  <nav class="links">
    <a href="/" use:link>홈으로 돌아가기</a>
  </nav>
  {/if}
</div>

<style>
  nav.links {
    margin: 10px;
  }
</style>
