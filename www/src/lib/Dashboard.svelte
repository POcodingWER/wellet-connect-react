<script>
  import { onMount, onDestroy } from 'svelte';
  import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
  import * as store from './store';
  import AddSaleModal from './modal/AddSale.svelte';
  import UpdateSaleModal from './modal/UpdateSale.svelte';
  import * as utils from '../util';

  let accountAddress;
  let scopeURI = 'https://scope.klaytn.com/'

  let currentBlockNumber = 0; // 현재 블록번호
  let currentBlockTime = 0; // 현재 시간
  let totalSaleAmount = 0; // Counter of minter
  let totalSupply = 0; // NFT totalSupply

  let minterOptions = {}; // minter options
  let saleInfoList = [];
  let addressInfo = {};

  onMount(async () => {
    await loadBlockInfo();
  });

  const secTimer = setInterval(async () => {
    currentBlockNumber++;
    currentBlockTime++;
  }, 1000);

  const syncTimer = setInterval(async () => {
    loadBlockInfo();
    loadNFTSupply();
  }, 5000);

  onDestroy(() => {
    clearInterval(secTimer);
    clearInterval(syncTimer);
  });

  async function loadBlockInfo() {
    const { blockNumber, timeStamp } = await utils.getCurrentBlockTimeStamp();
    currentBlockNumber = blockNumber;
    currentBlockTime = timeStamp;
  }

  async function loadNFTSupply() {
    const minterContract = await store.getMinterContract();
    const nftContract = await store.getNFTContract();

    const currentTokenId = Number(
      await minterContract.methods.tokenIdCounter().call()
    );

    totalSaleAmount = currentTokenId > 0 ? currentTokenId - 1 : currentTokenId;
    totalSupply = await nftContract.methods.totalSupply().call();
  }

  async function loadSaleInfo() {}

  const SaleType = {
    Whitelist : 0,
    Public : 1,
  }

  async function saleStartHandler(saleId, saleType) {
    const alertTypeTxt = saleType === SaleType.Whitelist ? 'Whitelist' : 'Public';

    if (!confirm(alertTypeTxt + ' 판매 시작 하시겠습니까?')) {
      return;
    }

    if (!accountAddress) {
      return alert('지갑연결을 확인하세요.');
    }

    const minterContract = await store.getMinterContract();
    const tx = await utils.executeContractMethod(
      minterContract,
      'open',
      [Number(saleId), Number(saleType)],
      accountAddress
    );

    if (tx.status) {
      alert('판매중으로 변경되었습니다.');
      window.location.reload();
    } else {
      alert('실패하였습니다.');
    }
  }

  async function saleStopHandler(saleId) {
    if (!confirm('판매를 종료하겠습니까?')) {
      return;
    }

    if (!accountAddress) {
      return alert('지갑연결을 확인하세요.');
    }

    const minterContract = await store.getMinterContract();
    const tx = await utils.executeContractMethod(
      minterContract,
      'close',
      [],
      accountAddress
    );

    if (tx.status) {
      alert('판매를 종료하였습니다.');
      window.location.reload();
    } else {
      alert('실패하였습니다.');
    }
  }
  store.user.subscribe(async (account) => {
    if (account.connected !== true) {
      return;
    }
    accountAddress = account.address;

    if(account.chainId === 1001) {
      scopeURI = 'https://baobab.scope.klaytn.com/'
    }

    await loadNFTSupply();
    const minterContract = await store.getMinterContract(); //

    // minterOptions
    // 목록 isOpen, currentSaleId, currentSaleType, lastSaleId, retryBlockAmount, baseTokenURI
    minterOptions = await minterContract.methods
      .getOptions()
      .call({ from: account.address });
    
    console.log(minterOptions);

    // saleInfoList
    saleInfoList = [];
    for (let saleId = 1; saleId <= minterOptions._lastSaleId; saleId++) {
      //minterContract.methods getSaleInfo(id넣어주고)
      const saleInfo = await minterContract.methods
        .getSaleInfo(saleId)
        .call({from: account.address,});
        
      const row = {
        ...saleInfo,
        saleId,
        formattedSaleKIP7Amount: store //ether단위로바꿔줌
          .getCaver()
          .utils.fromWei(saleInfo.saleKIP7Amount),
        formattedSaleKlayAmount: store //ether단위로바꿔줌
          .getCaver()
          .utils.fromWei(saleInfo.saleKlayAmount,'ether'), //klaytn 인데 왜 이더로 되어있는지는모르겟네
        time: await utils.convertBlockNumberToDate(saleInfo.startBlockNumber),
      };
      console.log(row);
      saleInfoList = [...saleInfoList, row];
    }

    // addressInfoList
    addressInfo = await minterContract.methods
      .getAddress()
      .call({ from: account.address });
    console.log(addressInfo);

  });
</script>

<div>
  <DataTable table$aria-label="Address Info">
    <Body>
      <Row>
        <Cell>NFT address</Cell>
        <Cell><a href="{scopeURI}account/{addressInfo._nftToken}" target="_blank">{addressInfo._nftToken}</a></Cell>
      </Row>
      <Row>
        <Cell>Whitelist address</Cell>
        <Cell><a href="{scopeURI}account/{addressInfo._whiteListContract}" target="_blank">{addressInfo._whiteListContract}</a></Cell>
      </Row>
      <Row>
        <Cell>판매대금 지갑주소</Cell>
        <Cell><a href="{scopeURI}account/{addressInfo._walletAddress}" target="_blank">{addressInfo._walletAddress}</a></Cell>
      </Row>
    </Body>
  </DataTable>
  <hr />
  <DataTable table$aria-label="Block Info" class="mb-3">
    <Head>
      <Row>
        <Cell>현재 블록 번호</Cell>
        <Cell>현재 시간</Cell>
      </Row>
    </Head>
    <Body>
      <Row>
        <Cell>{currentBlockNumber}</Cell>
        <Cell>{utils.dateFormatter(currentBlockTime)}</Cell>
      </Row>
    </Body>
  </DataTable>

  <DataTable table$aria-label="Supply Info">
    <Head>
      <Row>
        <Cell>현재까지 발행된 NFT Id [tokenIdCounter]</Cell>
        <Cell>현재 까지 NFT 총 발행량 [totalSupply]</Cell>
      </Row>
    </Head>
    <Body>
      <Row>
        <Cell>{totalSaleAmount}</Cell>
        <Cell>{totalSupply}</Cell>
      </Row>
    </Body>
  </DataTable>
  <hr />
  <div style="width: 100%; overflow: auto;">
    <DataTable table$aria-label="Option Info">
      <Head>
        <Row>
          <Cell>판매중</Cell>
          <Cell>현재 판매 회차</Cell>
          <Cell>현재 판매 유형</Cell>
          <Cell>등록된 판매 회차 수</Cell>
          <Cell>재시도 제한 블록 개수</Cell>
          <Cell>기본 Token URI</Cell>
        </Row>
      </Head>
      <Body>
        <Row>
          <Cell>
            {#if minterOptions._isOpen}
            <span class="badge bg-success">판매중</span>
          {:else}
          <span class="badge bg-secondary">판매종료</span>
          {/if}
  
          </Cell>
          <Cell>{minterOptions._currentSaleId}</Cell>
          {#if Number(minterOptions._currentSaleType) === SaleType.Public}
            <Cell>퍼블릭 세일</Cell>
          {:else if Number(minterOptions._currentSaleType) === SaleType.Whitelist}
            <Cell>화이트리스트 세일</Cell>
          {:else}
            <Cell>판매 유형 없음</Cell>
          {/if}
          <Cell>{minterOptions._lastSaleId}</Cell>
          <Cell>{minterOptions._retryBlockAmount}</Cell>
          <Cell>{minterOptions._baseTokenURI}</Cell>
        </Row>
      </Body>
    </DataTable>
  </div>
  <hr />
  {#if minterOptions._lastSaleId == 0}
    <h3>등록된 판매정보가 없습니다.</h3>
  {:else}
    <div style="width: 100%; overflow: auto;">
    <DataTable>
      <Head>
        <Row>
          <Cell>액션</Cell>
          <Cell>판매 회차 번호</Cell>
          <Cell>시작 블록 번호</Cell>
          <Cell>시간</Cell>
          <Cell>NFT 판매 제한 수량</Cell>
          <Cell>지갑 당 최대 구매 수량</Cell>
          <Cell>트랜잭션 당 최대 구매 수량</Cell>
          <Cell>KIP7 판매 가격(klay)</Cell>
          <Cell>Klay 판매 가격(klay)</Cell>
          <Cell>수정</Cell>
        </Row>
      </Head>
      <Body>
        {#each saleInfoList as saleInfo, index}
          <Row>
            <Cell>
              {#if Number(minterOptions._currentSaleId) === Number(saleInfo.saleId) && minterOptions._isOpen}
                <button
                  type="button"
                  class="btn btn-danger btn-sm"
                  on:click={() => saleStopHandler(saleInfo.saleId)}
                  >판매 중지</button
                >
              {:else}
                <button
                  type="button"
                  class="btn btn-outline-success btn-sm"
                  on:click={() => saleStartHandler(saleInfo.saleId, SaleType.Whitelist)}
                  >whitelist 세일 판매</button
                >
                <button
                  type="button"
                  class="btn btn-outline-success btn-sm"
                  on:click={() => saleStartHandler(saleInfo.saleId, SaleType.Public)}
                  >public 세일 판매</button
                >
              {/if}
            </Cell>
            <Cell>
              {saleInfo.saleId}
            </Cell> 
            <Cell>{saleInfo.startBlockNumber}</Cell>
            <Cell>{saleInfo.time}</Cell>
            <Cell>{saleInfo.lastSaleTokenId}</Cell>
            <Cell>{saleInfo.buyAmountPerWallet}</Cell>
            <Cell>{saleInfo.buyAmountPerTrx}</Cell>
            <Cell>{saleInfo.formattedSaleKIP7Amount}</Cell>
            <Cell>{saleInfo.formattedSaleKlayAmount}</Cell>
            <Cell><UpdateSaleModal saleId={saleInfo.saleId}/></Cell>
          </Row>
        {/each}
      </Body>
    </DataTable>
    </div>
  {/if}
  <div>
    <AddSaleModal />
  </div>
  <hr />
</div>
