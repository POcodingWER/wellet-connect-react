import QRcode from "qrcode"
import "./favorlet-modal.css";

const lang = {
  en: {
    title: '  FAVORLET QR Connect',
    time: 'Time Remaining',
    scan: 'Scan the QR code through a QR code\nreader or the FAVORLET app.',
    open: 'Open FAVORLET',
    unlock: 'Unlock Wallet',
    scanner: 'Click the code scanner',
    connect: 'Scan the code and connect',
    disclaimer: '* FAVORLET > Top menu bar > Code scanner can be used.',
  },
  ko: {
    title: '페이보릿 QR 연결',
    time: '남은시간',
    scan: 'QR 코드 리더기 또는 페이보릿 앱을 통해 QR 코드를 스캔해주세요.',
    open: '페이보릿 실행',
    unlock: 'Unlock Wallet',
    scanner: 'Click the code scanner',
    connect: 'Scan the code and connect',
    disclaimer: '*Favorlet &gt; 코드스캔(사이드메뉴)에서도 스캔이 가능합니다.',
  }
}

const favorletModalHtmlString = (lang) => `<div class="favorlet-modal">
  <div role="presentation" class="backdrop"></div>
  <div class="d-flex modal-dialog">
    <div class="d-flex-column upperbox">
      <div class="d-flex titlebox">
        <div class="d-flex">
          <img width="40" height="20" alt="" src="/images/web-img-logo-favorlet.svg">
          <div class="pre-line title">${lang.title}</div>
        </div>
        <button class="exit-btn">
          <img width="24" height="24" alt="" src="/images/close.svg">
        </button>
      </div>
      <div class="d-flex qrbox">
        <div class="qrcode"></div>
        <div class="d-flex timebox">
          <span class="pre-line time">${lang.time}</span>
          <span class="qrcode_remain_time pre-line interval">00 : 00</span>
        </div>
        <div class="pre-line timeguide">${lang.scan}</div>
      </div>
    </div>
    <div class="d-flex guide">
      <div class="d-flex justify-center">
        <div class="d-flex step">
          <div class="step-circle"><img alt="" src="/images/web-img-logo-favorlet.svg"></div>
          <div class="pre-line text">${lang.open}</div>
        </div>
        <img alt="" src="/images/web-icon-24-arrow-right.svg" class="arrow">
        <div class="d-flex step">
          <div class="step-circle"><img alt="" src="/images/web-icon-24-qr.svg"></div>
          <div class="pre-line text">${lang.unlock}</div>
        </div>
        <img alt="" src="/images/web-icon-24-arrow-right.svg" class="arrow">
        <div class="d-flex step">
          <div class="step-circle"><img alt="" src="/images/web-icon-24-scan.svg"></div>
          <div class="pre-line text">${lang.scanner}</div>
        </div>
        <img alt="" src="/images/web-icon-24-arrow-right.svg" class="arrow">
        <div class="d-flex step">
          <div class="step-circle"><img alt="" src="/images/web-icon-24-unlock.svg"></div>
          <div class="pre-line text">${lang.connect}</div>
        </div>
      </div>
      <div class="pre-line helper">${lang.disclaimer}</div>
    </div>
  </div>
</div>`

const createElementFromHTML = (htmlString) => {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes.
  return div.firstChild;
}

const displayTime = (time) => {
  const min = Math.floor(time / 60);
  const seconds = time % 60;
  return `${min >= 10 ? min : '0' + min} : ${seconds >= 10 ? seconds : '0' + seconds}`;
}

const openModal = (url, ready, close) => {
  const langObj = lang[localStorage.getItem('alternative-wallet-locale')] || lang.ko;
  const modal = createElementFromHTML(favorletModalHtmlString(langObj));
  const qrcode = modal.querySelector('.favorlet-modal .qrcode');
  const canvas = document.createElement('canvas');
  qrcode.appendChild(canvas);
  document.body.appendChild(modal)
  const exitbtnDom = modal.querySelector('.exit-btn');
  exitbtnDom.addEventListener('click', () => {
    close();
    modal.remove();
  })
  const remainTime = modal.querySelector('.favorlet-modal .qrcode_remain_time');
  QRcode.toCanvas(
    canvas,
    url,
    () => {
      ready((time) => {
        remainTime.innerText = displayTime(time);
      }, () => {
        modal.remove();
      });
    }
  )
}

export default openModal;