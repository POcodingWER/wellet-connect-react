<script>
  import { onMount } from 'svelte';
  import * as store from '../store';
  import * as utils from '../../util';

  export let saleId;

  let element;

  let startBlockNumber;
  let startDatetime;
  let lastTokenId;
  let buyAmountPerWallet;
  let buyAmountPerTrx;
  let saleKlayAmount;
  let saleKIP7Amount;

  onMount(() => {
    element.addEventListener('show.bs.modal', async (event) => {
      if (!accountAddress) {
        return alert('지갑연결을 확인하세요');
      }
      const minterContract = await store.getMinterContract();
      const saleInfo = await minterContract.methods.getSaleInfo(saleId).call({
        from: accountAddress,
      });

      console.log(saleInfo);
      lastTokenId = saleInfo.lastSaleTokenId;
      buyAmountPerWallet = saleInfo.buyAmountPerWallet;
      buyAmountPerTrx = saleInfo.buyAmountPerTrx;
      saleKlayAmount = store.getCaver().utils.fromWei(saleInfo.saleKlayAmount);
      saleKIP7Amount = store.getCaver().utils.fromWei(saleInfo.saleKIP7Amount);
      startBlockNumber = saleInfo.startBlockNumber;
      startDatetime = await utils.convertBlockNumberToDate(
        Number(startBlockNumber)
      );
    });
  });

  let accountAddress = null;
  store.user.subscribe((account) => {
    accountAddress = account.address;
  });

  async function blockNumberHandler() {
    startDatetime = await utils.convertBlockNumberToDate(startBlockNumber);
  }

  async function datetimeHandler() {
    startBlockNumber = await utils.convertDateToBlockNumber(startDatetime);
  }

  async function saveHandler() {
    if (!accountAddress) {
      return alert('지갑연결을 확인하세요');
    }
    if (
      Number(startBlockNumber) === 0 ||
      Number(lastTokenId) === 0 ||
      Number(buyAmountPerWallet) === 0 ||
      Number(buyAmountPerTrx) === 0 ||
      Number(saleKlayAmount) === 0 ||
      Number(saleKIP7Amount) === 0
    ) {
      return alert('입력값을 모두 입력하세요');
    }

    const minterContract = await store.getMinterContract();
    console.log([
      Number(saleId),
      Number(startBlockNumber),
      Number(lastTokenId),
      Number(buyAmountPerWallet),
      Number(buyAmountPerTrx),
      store.getCaver().utils.toWei(String(saleKlayAmount)),
      store.getCaver().utils.toWei(String(saleKIP7Amount)),
    ]);
    const tx = await utils.executeContractMethod(
      minterContract,
      'setSaleInfo',
      [
        Number(saleId),
        Number(startBlockNumber),
        Number(lastTokenId),
        Number(buyAmountPerWallet),
        Number(buyAmountPerTrx),
        store.getCaver().utils.toWei(String(saleKlayAmount)),
        // store.getCaver().utils.toWei(String(saleKIP7Amount)),
      ],
      accountAddress
    );

    console.log(tx);
    if (tx.status) {
      alert('저장되었습니다.');
      bootstrap.Modal.getInstance(element).hide();
      window.location.reload();
    } else {
      alert('실패하였습니다.');
    }
  }
</script>

<div>
  <button
    type="button"
    class="btn btn-outline-primary btn-sm"
    data-bs-toggle="modal"
    data-bs-target="#updateSaleModal{saleId}"
  >
    수정
  </button>

  <div
    class="modal fade"
    id="updateSaleModal{saleId}"
    tabindex="-1"
    aria-labelledby="updateSaleModalLabel"
    aria-hidden="true"
    bind:this={element}
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="updateSaleModalLabel">판매정보 수정</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          />
        </div>
        <div class="modal-body">
          <label for="startBlockNumber" class="form-label"
            >판매시작 블록번호</label
          >
          <div class="input-group mb-3">
            <button
              class="btn btn-outline-secondary"
              type="button"
              on:click={blockNumberHandler}>#</button
            >
            <input
              type="number"
              class="form-control"
              id="startBlockNumber"
              bind:value={startBlockNumber}
              placeholder="블록번호"
            />
            <button
              class="btn btn-outline-secondary"
              type="button"
              on:click={datetimeHandler}>Datetime</button
            >
            <input
              type="datetime"
              class="form-control"
              id="startDatetime"
              bind:value={startDatetime}
              placeholder="YYYY-MM-DD HH:mm:ss"
            />
          </div>

          <div class="mb-3">
            <label for="lastTokenId" class="form-label"
              >판매할 토큰ID(끝번호)</label
            >
            <input
              type="number"
              class="form-control"
              bind:value={lastTokenId}
              placeholder="99"
            />
            <div class="form-text">
              만약,99으로 설정시 tokenId 0(현재까지 판매수량)~99까지 총 100장
              판매 가능
            </div>
          </div>

          <div class="mb-3">
            <label for="buyAmountPerWallet" class="form-label"
              >지갑 당 구매 가능 수</label
            >
            <input
              type="number"
              class="form-control"
              bind:value={buyAmountPerWallet}
              placeholder="1"
            />
          </div>

          <div class="mb-3">
            <label for="buyAmountPerTrx" class="form-label"
              >트랜잭션 당 구매 가능 수</label
            >
            <input
              type="number"
              class="form-control"
              bind:value={buyAmountPerTrx}
              placeholder="1"
            />
            <div class="form-text">
              <b>지갑 당 구매 가능 수보다 같거나 작아야한다.</b>
            </div>
          </div>

          <div class="mb-3">
            <label for="saleKlayAmount" class="form-label"
              >판매할 Klay 가격</label
            >
            <input
              type="number"
              class="form-control"
              bind:value={saleKlayAmount}
              placeholder="120"
            />
          </div>

          <div class="mb-3">
            <label for="saleKIP7Amount" class="form-label">
              판매할 KIP7 Token 가격
              <small class="text-muted">없을시 99999</small>
            </label>
            <input
              type="number"
              class="form-control"
              bind:value={saleKIP7Amount}
              placeholder=""
            />
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal">Close</button
          >
          <button type="button" class="btn btn-primary" on:click={saveHandler}
            >Save changes</button
          >
        </div>
      </div>
    </div>
  </div>
</div>
