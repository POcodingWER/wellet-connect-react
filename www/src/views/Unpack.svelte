<script>
  import Kaikas from '../lib/Kaikas.svelte';
  import * as store from '../lib/store';
  import { deploy } from '../lib/deployer';
  import * as utils from '../util';
  import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';

  let accountAddress = null;
  let accoundChainId = null;

  let nftName = '';
  let nftSymbol = '';
  let nftImageURI = '';
  let nftDescription = '';

  let contractAddress = '0x2EEd1e1d18Ae114b9A65e0AB93cebC5885346d17';
  // 0x5487582334777498EE3Dd3669782cC98CE44E9B5 - mainnet - mobile-team
  // https://opensea.io/collection/apple-8ss0ttity2

  let loaded = false;
  let totalSupply = 0;
  let isAdmin = false;
  let mintToAddr = '';
  let mintTokenId = '';
  let unpackId = '';

  let nftBalance = [];

  store.user.subscribe(async (user) => {
    if (user.connected !== true) {
      return;
    }

    accountAddress = user.address;
    accoundChainId = user.chainId;
  });

  async function deployHandler() {
    if (!store.getUnpackNFTInfo().bytecode) {
      return alert('컴파일 정보를 불러올 수 없습니다.');
    }

    if (!accountAddress) {
      return alert('지갑을 연결하세요.');
    }

    if (
      nftName.trim() === '' ||
      nftSymbol.trim() === '' ||
      nftImageURI.trim() === '' ||
      nftDescription.trim() === ''
    ) {
      return alert('필수 입력값을 입력하세요');
    }

    contractAddress = await deploy(accountAddress, {
      abi: store.getUnpackNFTInfo().abi,
      bytecode: store.getUnpackNFTInfo().bytecode,
      args: [nftName, nftSymbol, nftImageURI, nftDescription],
    });
    console.log(contractAddress);
  }

  async function loadContractHandler() {
    if (!store.getUnpackNFTInfo().bytecode) {
      return alert('컴파일 정보를 불러올 수 없습니다.');
    }

    if (!accountAddress) {
      return alert('지갑을 연결하세요.');
    }

    console.log(store.getUnpackNFTInfo().abi);
    console.log(contractAddress);
    const outputABI = store.getUnpackNFTInfo().abi.filter(v => v.name === 'unpack' || v.name === 'Unpack');
    console.log(JSON.stringify(outputABI));
    const caver = store.getCaver();
    const contract = new caver.contract(
      store.getUnpackNFTInfo().abi,
      contractAddress
    );

    totalSupply = await contract.methods.totalSupply().call();
    isAdmin = await contract.methods.isOwner().call({ from: accountAddress });
    loaded = true;
    mintToAddr = accountAddress;

    nftBalance = [];
    const balance = await contract.methods.balanceOf(accountAddress).call();
    for (let i = 0; i < balance; i++) {
      const tokenId = await contract.methods
        .tokenOfOwnerByIndex(accountAddress, i)
        .call();
      const tokenURI = await contract.methods.tokenURI(tokenId).call();
      const metadata = await fetch(tokenURI).then((res) => res.json());
      nftBalance = [
        ...nftBalance,
        {
          tokenId,
          metadata,
        },
      ];
    }
  }

  async function mintHandler() {
    if (!store.getUnpackNFTInfo().bytecode) {
      return alert('컴파일 정보를 불러올 수 없습니다.');
    }

    if (!accountAddress) {
      return alert('지갑을 연결하세요.');
    }

    if (mintToAddr.trim() === '') {
      return alert('NFT를 받을 주소를 입력하세요.');
    }

    if (mintTokenId.trim() === '') {
      return alert('tokenId를 입력하세요.');
    }

    const toAddr = mintToAddr;

    const caver = store.getCaver();
    const contract = new caver.contract(
      store.getUnpackNFTInfo().abi,
      contractAddress
    );

    const tx = await utils.executeContractMethod(
      contract,
      'mint',
      [toAddr, Number(mintTokenId)],
      accountAddress
    );

    await loadContractHandler();
    mintToAddr = toAddr;
  }

  async function unpackHandler(tokenId) {
    if (!store.getUnpackNFTInfo().bytecode) {
      return alert('컴파일 정보를 불러올 수 없습니다.');
    }

    if (!accountAddress) {
      return alert('지갑을 연결하세요.');
    }

    if (unpackId.trim() === '') {
      return alert('unpackId를 입력하세요.');
    }
    
    const caver = store.getCaver();
    const contract = new caver.contract(
      store.getUnpackNFTInfo().abi,
      contractAddress
    );
    const tx = await utils.executeContractMethod(
      contract,
      'unpack',
      [String(unpackId), tokenId],
      accountAddress
    );

    console.log(tx);
  }
</script>

<main>
  <Kaikas />
  <hr />
  <div class="mb-3 row" style="margin-top: 10px;">
    <label for="name" class="col-sm-1 col-form-label">Name</label>
    <div class="col-sm-2">
      <input
        type="text"
        id="name"
        class="form-control"
        placeholder="MiyaGift-Dinner"
        bind:value={nftName}
      />
    </div>
    <label for="symbol" class="col-sm-1 col-form-label">Symbol</label>
    <div class="col-sm-2">
      <input
        type="text"
        id="symbol"
        class="form-control"
        placeholder="MiyaGift"
        bind:value={nftSymbol}
      />
    </div>
  </div>
  <div class="mb-3 row">
    <label for="imageURI" class="col-sm-1 col-form-label">ImageURI</label>
    <div class="col-sm-3">
      <input
        type="text"
        id="imageURI"
        class="form-control"
        placeholder="https://sunmiya.club/images/logo-3-d-smyc.png"
        bind:value={nftImageURI}
      />
    </div>
    <label for="description" class="col-sm-1 col-form-label">Desc.</label>
    <div class="col-sm-7">
      <input
        type="text"
        id="description"
        class="form-control"
        placeholder="...."
        bind:value={nftDescription}
      />
    </div>
  </div>
  <div class="mb-3 row">
    <button class="btn btn-primary" on:click={deployHandler}>Deploy</button>
  </div>

  <hr />
  <div class="mb-3 row">
    <label for="contractAddress" class="col-sm-4 col-form-label"
      >Deployed Contract Address</label
    >
    <div class="col-sm-5">
      <input
        type="text"
        id="contractAddress"
        class="form-control"
        placeholder="0x385c6068Ce0e2b0e97fcA032465b3c513516fB2a"
        bind:value={contractAddress}
      />
    </div>
    <div class="col-sm-3">
      <button class="btn btn-primary" on:click={loadContractHandler}
        >Load</button
      >
    </div>
  </div>
  <hr />
  {#if loaded}
    <div class="mb-3 row">
      TotalSupply: {totalSupply}
    </div>
    {#if isAdmin}
      <div class="mb-3 row">
        <label for="mintToAddr" class="col-sm-4 col-form-label"
          >Mint to Address</label
        >
        <div class="col-sm-5">
          <input
            type="text"
            class="form-control"
            id="mintToAddr"
            bind:value={mintToAddr}
          />
        </div>

        <div class="col-sm-2">
          <input
          type="text"
          id="mintTokenId"
          class="form-control"
          placeholder={Number(totalSupply)}
          bind:value={mintTokenId}
        />
          </div>
        <div class="col-sm-1">
          <button class="btn btn-primary" on:click={mintHandler}>Mint</button>
        </div>
      </div>
    {/if}

    <DataTable class="mb-3 row" table$aria-label="myNFT">
      <Head>
        <Row>
          <Cell>tokenId</Cell>
          <Cell>Name</Cell>
          <Cell>Image</Cell>
          <Cell>Action</Cell>
        </Row>
      </Head>
      <Body>
        {#each nftBalance as myNFT}
          <Row>
            <Cell>{myNFT.tokenId}</Cell>
            <Cell>{myNFT.metadata.name}</Cell>
            <Cell>{myNFT.metadata.image}</Cell>
            <Cell>
                <input
                type="text"
                id="unpackId"
                class="form-control"
                placeholder='unpackId'
                bind:value={unpackId}
              />
      
              <button class="btn btn-primary" on:click={() => unpackHandler(myNFT.tokenId)}
                >Unpack</button
              >
            </Cell>
          </Row>
        {/each}
      </Body>
    </DataTable>
  {/if}
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
