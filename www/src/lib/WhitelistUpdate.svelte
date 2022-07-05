<script>
  import validator from 'validator';
  import _ from 'lodash';
  import DataTable, { Head, Body, Row, Cell } from "@smui/data-table";
  import { user, getWhitelistContract, getMinterContract, getCaver, getNFTContract } from "./store";
  import { getContractInstance, executeContractMethod } from "../util";
  import Card from "./Card.svelte";
import { listen } from 'svelte/internal';

  let minterContract;
  let whitelistContract;
  let accountAddress;
  let options;
  
  $: showNftInfoData = [];

  const getNftName = async (address) => {
    const caver = getCaver();
    const nftContract = new caver.contract(caver.kct.kip17.abi, address);
    return nftContract.methods.name().call();
  }

  user.subscribe(async (u) => {
    if (u.connected !== true) {
      return;
    }
    accountAddress = u.address;

    minterContract = await getMinterContract();

    // minterOptions
    options = await minterContract.methods
      .getOptions()
      .call({ from: accountAddress });

    whitelistContract = await getWhitelistContract(); //화리 컨트랙트 넣어주고

    const maxSaleId = options?.[3]; // current SaleId
    const maxNftCount = 10; // TODO: 설정된 nft 개수를 구하기 위해서 컨트랙트를 수정해도 되는지 확인 필요

    for (let saleId = 1; saleId <= maxSaleId; saleId++) {
      const tempArr = [];
      for (let nftIndex = 0; nftIndex < maxNftCount; nftIndex++) {
        let nftAddressesBySaleId = "0x";
        let nftMinimumBalanceBySaleId = 0;

        try {
          nftAddressesBySaleId = await whitelistContract.methods
            .nftAddressesBySaleId(saleId, nftIndex)
            .call({ from: accountAddress });
          
          nftMinimumBalanceBySaleId = await whitelistContract.methods
          .nftMinimumBalanceBySaleId(saleId, nftIndex)
          .call({ from: accountAddress });
        } catch (e) {
          break;
          // console.log(e);
        }

        const nftName = await getNftName(nftAddressesBySaleId);
        
        tempArr.push({
          saleId: saleId,
          nftAddress: nftAddressesBySaleId,
          nftName: nftName,
          nftMinimumBalance: nftMinimumBalanceBySaleId,
        });
      }

      showNftInfoData.push(tempArr);
    }
    

    showNftInfoData = showNftInfoData.map((sale) =>
      sale.filter(({ nftAddress }) => nftAddress.trim("") != "0x")
    );
  });

  let addQuotaWhitelistSaleId = "";
  let addQuotaWhitelistAddress = "";
  async function addQuotaWhitelistAddressHandler() {
    if (!addQuotaWhitelistAddress || !addQuotaWhitelistSaleId) {
      return alert("필수정보를 입력하세요.");
    }

    if (!validator.isInt(addQuotaWhitelistSaleId)) {
      return alert('판매회차 번호는 숫자를 입력하세요');
    }
    const lines = addQuotaWhitelistAddress.split("\n").map((v) => v.trim()).filter((val) => val);
    const reg = new RegExp(/0x\w{40} +\d+/)   //0x +40자리 +숫자 
    const invalidLines = lines.filter((v) => !reg.test(v))  // 거짓이면 넣어주고

    if (invalidLines.length > 0) {  //배열에 하나랃도있으면
      return alert(`형식이 잘못됐습니다:\n${invalidLines.join('\n')}`);
    }
    const splitedAddress = lines.map((line) => {  //주소만빼고
      const [address, quota] = line.split(/\s+/);
      return address.trim();
    });

    const splitedQuotas = lines.map((line) => {   //숫자빼고
      const [address, quota] = line.split(/\s+/);
      return quota?.trim();
    });

    const notQuotas = splitedQuotas.filter(v => !v || isNaN(Number(v)));  //숫자 맞는지맞춰보고 스트링말고
    
    if (notQuotas.length > 0) {
      return alert(`잘못된 갯수가 있습니다:\n${notQuotas.join('\n')}`);
    }

    const notAddreses = splitedAddress.filter(s => !Caver.utils.isAddress(s));  //caver로 주소형식이맞나 찾아복
    if (notAddreses.length > 0) {
      return alert(`잘못된 주소가 있습니다:\n${notAddreses.join('\n')}`);
    }

    const addresses = splitedAddress.filter(s => Caver.utils.isAddress(s)).map(Caver.utils.toChecksumAddress);
    const addressChunks = _.chunk(addresses, 100);  //lodash 메소드로 chunk로 배열 100개씩 나눠서 만듬
    const quotaChunks = _.chunk(splitedQuotas, 100);

    let completeCount = 0;
    let lastTx;
    
    for (let i = 0; i < addressChunks.length; i++) {  //모르겠어요 ㅜㅜㅜㅜㅜㅜㅜ
      const addressChunk = addressChunks[i];
      const quotaChunk = quotaChunks[i];
      console.log(i);
      lastTx = await executeContractMethod(
        whitelistContract,    //컨트랙트
        "addSaleWhitelist",   //메소드이름
        [addQuotaWhitelistSaleId, addressChunk, quotaChunk],  //회차번호, 주소, 구매개수
        accountAddress    //지갑주소
      );
      console.log(lastTx);
      completeCount += addressChunk.length;
      console.log(`${completeCount}/${addresses.length}`);
    }

    if (lastTx.status) {
      alert("성공");
      // window.location.reload();  // 성공하면  재시작
    } else {
      alert("실패");
    }
  }
   
  let addWhitelistSaleId = "";
  let addWhitelistAddress = "";
  async function addWhitelistAddressHandler() {
    if (!addWhitelistAddress || !addWhitelistSaleId) {
      return alert("필수정보를 입력하세요.");
    }

    if (!validator.isInt(addWhitelistSaleId)) {
      return alert('판매회차 번호는 숫자를 입력하세요');
    }

    const splited = addWhitelistAddress.split("\n").map((v) => v.trim()).filter((val) => val);
    const notAddreses = splited.filter(s => !Caver.utils.isAddress(s));
    if (notAddreses.length > 0) {
      return alert(`잘못된 주소가 있습니다:\n${notAddreses.join('\n')}`);
    }

    const addresses = splited.filter(s => Caver.utils.isAddress(s)).map(Caver.utils.toChecksumAddress);

    const chunks = _.chunk(addresses, 100);
    let completeCount = 0;
    let lastTx;

    for (const chunk of chunks) {
      lastTx = await executeContractMethod(
        whitelistContract,
        "addSaleWhitelist",
        [addWhitelistSaleId, chunk, []],
        accountAddress
      );
      console.log(lastTx);
      completeCount += chunk.length;
      console.log(`${completeCount}/${addresses.length}`);
    }

    if (lastTx.status) {
      alert("성공");
      window.location.reload();
    } else {
      alert("실패");
    }
  }

  let removeWhitelistSaleId = "";
  let removeWhitelistAddress = "";
  async function removeWhitelistAddressHandler() {
    if (!removeWhitelistAddress || !removeWhitelistSaleId) {
      return alert("필수정보를 입력하세요.");
    }

    if (!validator.isInt(removeWhitelistSaleId)) {
      return alert('판매회차 번호는 숫자를 입력하세요');
    }

    const splited = removeWhitelistAddress.split("\n").map((v) => v.trim()).filter((val) => val);
    const notAddreses = splited.filter(s => !Caver.utils.isAddress(s));
    if (notAddreses.length > 0) {
      return alert(`잘못된 주소가 있습니다:\n${notAddreses.join('\n')}`);
    }

    
    const addresses = splited.filter(s => Caver.utils.isAddress(s))
      .map(Caver.utils.toChecksumAddress);
debugger;
    const tx = await executeContractMethod(
      whitelistContract,
      "removeSaleWhitelist",
      [removeWhitelistSaleId, addresses],
      accountAddress
    );

    console.log(tx);

    if (tx.status) {
      alert("성공");
      window.location.reload();
    } else {
      alert("실패");
    }
  }

  let saleId = "";
  let whitelistNftAddresses = "";
  async function setNftInfoHandler() {
    if (!whitelistContract) {
      return alert("지갑을 연결하세요.");
    }

    if (!saleId) {
      return alert('판매회차 번호를 입력하세요');
    }
    
    const lines = whitelistNftAddresses.split("\n").map((v) => v.trim()).filter((val) => val);
    const reg = new RegExp(/0x\w{40} +\d+/)
    const invalidLines = lines.filter((v) => !reg.test(v))
    if (invalidLines.length > 0) {
      return alert(`형식이 잘못됐습니다:\n${invalidLines.join('\n')}`);
    }
    
    const splitedAddress = lines.map((line) => {
      const [address, balance] = line.split(/\s+/);
      return address.trim();
    });

    const splitedBalances = lines.map((line) => {
      const [address, balance] = line.split(/\s+/);
      console.log(balance);
      return balance?.trim();
    });


    const notBalances = splitedBalances.filter(v => !v || isNaN(Number(v)));
    if (notBalances.length > 0) {
      return alert(`잘못된 갯수가 있습니다:\n${notBalances.join('\n')}`);
    }

    const notAddreses = splitedAddress.filter(s => !Caver.utils.isAddress(s));
    if (notAddreses.length > 0) {
      return alert(`잘못된 주소가 있습니다:\n${notAddreses.join('\n')}`);
    }

    const nftInfoAsString = await Promise.all(splitedAddress.map(async (address, index) => {
      let nftName = '';
      try {
        nftName = await getNftName(address);
      } catch (e) { 
        return;
      }
      return `address: ${address}\nname: ${nftName ? nftName : '???'}\nbalance: ${splitedBalances[index]}`;
    }));

    if (!window.confirm(`확인\n${nftInfoAsString.join('\n\n\n')}`)) return;


    const tx = await executeContractMethod(
      whitelistContract,
      "setNftInfo",
      [saleId, splitedAddress, splitedBalances],
      accountAddress
    );

    console.log(tx);

    if (tx.status) {
      alert("성공");
      window.location.reload();
    } else {
      alert("실패");
    }
  }
</script>

<whitelistUpdate>
  <Card title="확정 화이트리스트 추가">
    <div>
      <label class="form-label" for="addQuotaWhitelistSaleId">
        판매회차 번호
      </label>
      <input
        id="addQuotaWhitelistSaleId"
        bind:value={addQuotaWhitelistSaleId}
        class={`form-control ${addQuotaWhitelistSaleId > 0 ? '' : 'is-invalid'}`}
        placeholder="0"
      />
    </div>
    <div class="mt-2 mb-3">
      <label class="form-label" for="addQuotaWhitelistAddress">
        추가할 화이트리스트 주소
        <small class="text-muted">[지갑주소 구매제한개수] 형식. 복수 주소 입력시 줄바꿈.</small>
      </label>
      <textarea
        id="addQuotaWhitelistAddress"
        bind:value={addQuotaWhitelistAddress}
        class="form-control"
        placeholder="0x0000000000000000000000000000000000000000 3&#13;0x0000000000000000000000000000000000000000 1"
      />
    </div>
    <button class="btn btn-success mt-2" on:click={addQuotaWhitelistAddressHandler} disabled={!addQuotaWhitelistSaleId}>
      확정 화이트리스트 추가
    </button>
  </Card>
  <Card title="화이트리스트 추가">
    <label class="form-label" for="addWhitelistSaleId">
      판매회차 번호
    </label>
    <input
      id="addWhitelistSaleId"
      bind:value={addWhitelistSaleId}
      class={`form-control ${addWhitelistSaleId > 0 ? '' : 'is-invalid'}`}
      placeholder="0"
    />
    <div class="mt-2 mb-3">
      <label class="form-label" for="addWhitelistAddress">
        추가할 화이트리스트 주소
        <small class="text-muted">지갑주소. 복수 주소 입력시 줄바꿈.</small>
      </label>
      <textarea
        id="addWhitelistAddress"
        bind:value={addWhitelistAddress}
        class="form-control"
        placeholder="0x0000000000000000000000000000000000000000&#13;0x0000000000000000000000000000000000000000"
      />
    </div>
    <button class="btn btn-success mt-2" on:click={addWhitelistAddressHandler} disabled={!addWhitelistSaleId}>
      경쟁 화이트리스트 추가
    </button>
  </Card>
  <Card title="화이트리스트 삭제">
    <div>
      <label class="form-label" for="removeWhitelistSaleId">
        판매회차 번호
      </label>
    
      <input
        id="removeWhitelistSaleId"
        bind:value={removeWhitelistSaleId}
        placeholder="0"
        class={`form-control ${removeWhitelistSaleId > 0 ? '' : 'is-invalid'}`}
      />
    </div>
  
    <div class="mt-2">
      <label class="form-label" for="removeWhitelistAddress">
        삭제할 화이트리스트 주소
        <small class="text-muted">지갑주소. 복수 주소 입력시 줄바꿈.</small>
      </label>
    
      <textarea
        id="removeWhitelistAddress"
        bind:value={removeWhitelistAddress}
        class="form-control"
        placeholder="0x0000000000000000000000000000000000000000&#13;0x0000000000000000000000000000000000000000"
      />
    </div>
  
    <button class="btn btn-danger mt-2" on:click={removeWhitelistAddressHandler} disabled={!removeWhitelistSaleId}>
      화이트리스트 삭제
    </button>
  </Card>

  
  <Card>
    <DataTable table$aria-label="NFTAddresses Info">
      <Head>
        <Row>
          <Cell>판매회차</Cell>
          <Cell>NFT컨트랙트</Cell>
          <Cell>이름</Cell>
          <Cell>최소 보유 수량</Cell>
        </Row>
      </Head>
      <Body>
        {#each showNftInfoData as saleInfo, i}
          {#each saleInfo as { saleId, nftAddress, nftName, nftMinimumBalance }}
            <Row>
              <Cell>
                {#if saleId.toString() === options?.[1]}
                  <span class="badge bg-danger">Current</span>
                {/if}
                {saleId}
              </Cell>
              <Cell>{nftAddress}</Cell>
              <Cell>{nftName}</Cell>
              <Cell>{nftMinimumBalance}</Cell>
            </Row>
          {/each}
        {/each}
      </Body>
    </DataTable>
    <div class="mt-2">
      <label class="form-label" for="whitelistNftSaleId">
        변경할 판매회차 번호
        <small class="text-muted">{saleId}</small>
      </label>
      <input id="whitelistNftSaleId" bind:value={saleId} class={`form-control ${saleId > 0 ? '' : 'is-invalid'}`} placeholder="0" />
    </div>
    <div class="mt-2">
      <label class="form-label" for="whitelistNftAddresses">
        화이트리스트 조건으로 추가할 NFT 주소
        <small class="text-muted">[지갑주소 최소보유개수] 형식. 복수 주소 입력시 줄바꿈.</small>
      </label>
      <textarea
        id="whitelistNftAddresses"
        bind:value={whitelistNftAddresses}
        class="form-control"
        placeholder="0x0000000000000000000000000000000000000000 2&#13;0x0000000000000000000000000000000000000000 3"
      />
    </div>
    <br />
    <button class="btn btn-primary mt-2" on:click={setNftInfoHandler} disabled={!saleId}>
      수정
    </button>
  </Card>
</whitelistUpdate>
