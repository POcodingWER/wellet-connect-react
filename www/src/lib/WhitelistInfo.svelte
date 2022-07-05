<script>
  import { user, getWhitelistContract } from "./store";
  import { getContractInstance, executeContractMethod } from "../util";
  import Form from "./Form.svelte";
  import Card from "./Card.svelte";

  export let whitelistAddress; // 쓰는지 확인

  let whitelistContract;
  let accountAddress;
  user.subscribe(async (u) => {
    if (u.connected !== true) {
      return;
    }
    
    accountAddress = u.address;
    whitelistContract = await getWhitelistContract();
  });

  let saleId = "";
  let whitelistAddressesCount = 0;
  async function whitelistAddressesCountBySaleId() {
    if (!saleId) {
      return alert("판매 회차를 입력하세요.");
    }

    whitelistAddressesCount = await whitelistContract.methods
      .saleWhitelistCount(saleId)
      .call();
  }

  let isWhitelistSaleId;
  let isWhitelistAddress;
  let isSaleWhitelist = false;
  async function isSaleWhitelistHandler() {
    if (!whitelistContract) {
      return alert("지갑을 연결하세요.");
    }

    if (!isWhitelistAddress || !isWhitelistSaleId) {
      return alert("필수정보를 입력하세요.");
    }

    if (!Caver.utils.isAddress(isWhitelistAddress)) {
      return alert("주소형식이 아닙니다.");
    }

    isSaleWhitelist = await whitelistContract.methods
      .isSaleWhitelist(isWhitelistSaleId, isWhitelistAddress, 0, 0)
      .call();
  }
</script>

<whiteListInfo>
  <h2>Whitelist</h2>
  <Card title="등록된 화이트리스트 주소 개수(saleWhitelistCount) 조회">
    <div class="row g-3 align-items-center">
      <div class="col-auto">
        <label for="saleId" class="col-form-label">판매 회차</label>
      </div>
      <div class="col-auto">
        <input id="saleId" bind:value={saleId} placeholder="0" />
      </div>
      <div class="col-auto">
        <button
          class="btn btn-primary"
          on:click={whitelistAddressesCountBySaleId}
        >
          조회
        </button>
      </div>
      <div>
        등록된 화이트리스트: {whitelistAddressesCount} 개
      </div>
    </div>
  </Card>

  <Card title="화이트리스트 여부 조회">
    <Form
      cols="10"
      label="판매 회차"
      id="isWhitelistSaleId"
      bind:value={isWhitelistSaleId}
      placeholder="0"
    />
    <Form
      cols="10"
      label="지갑 주소"
      id="isWhitelistAddress"
      bind:value={isWhitelistAddress}
      placeholder="0x"
    />
    <button class="btn btn-primary" on:click={isSaleWhitelistHandler}>
      화이트리스트 여부 조회
    </button>
    <div>
      화이트리스트 여부 : {isSaleWhitelist}
    </div>
  </Card>
</whiteListInfo>