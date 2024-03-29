import "./App.css";
import { Request, createDeepLink, receipt } from "favorlet.js";
import openModal from "./favorletmodal/favorletmodal";
import React, { useState, useEffect, useCallback } from "react";
import * as xlsx from "xlsx";

const LIMIT_SEC = 600;
const deferCollects = {};

function App() {
  const [address, setAddress] = useState("");

  useEffect(() => {
    let storage = JSON.parse(localStorage.getItem("favorlet_address"));
    if (storage?.state === "connect") {
      setAddress(storage?.address);
    }
  }, []);

  /**
   * Request 는 FAVORLET 앱을 통해 실행할 작업 또는 트랜잭션을 요청하는 단계로 네 가지의 요청이 존재
   * createDeepLink 는 Request 요청시 전달받은 requestId 를 통해서 DeepLink를 생성
   * receipt 는 FAVORLET 앱을 통해 전달받은 요청을 실행 및 그에 따른 결과 확인
   */
  const clear = (requestKey) => {
    clearInterval(deferCollects[requestKey]);
    deferCollects[requestKey] = null;
  };

  const getRes = async (requestKey) => {
    if (!requestKey) {
      return;
    }
    const cancel = () => {
      clear(requestKey);
    };

    return new Promise((resolve, reject) => {
      let limitSec = LIMIT_SEC;

      const polling = async (ontimeupdate, onexit) => {
        if (limitSec <= 1) {
          reject("timeout");
          onexit && onexit();
          return;
        }
        const res = await receipt(requestKey);
        limitSec -= 1;
        ontimeupdate && ontimeupdate(limitSec); //초마다 업데이트
        //트잭전송할때 사용
        if (res.transactions?.length) {
          if (res.transactions.every(({ status }) => status === "succeed")) {
            resolve(res[res.action]);
            onexit && onexit();
          } else if (
            res.transactions.every(
              ({ status }) => status === "canceled" || status === "failed"
            )
          ) {
            reject(res[res.action]);
            onexit && onexit();
          }
          return;
        }
        //지갑연결하고 그럴때 쓰는거같음
        if (res[res.action].status == "succeed") {
          resolve(res[res.action]);
          onexit && onexit();
        } else if (res[res.action].status === "canceled") {
          reject(res[res.action]);
          onexit && onexit();
        }
      };

      const url = createDeepLink(requestKey);
      //     const md = new MobileDetect(window.navigator.userAgent);
      //   const isMobile = !!md.mobile();
      //   if (isMobile) {
      //     openDeeplink(url);
      //     deferCollects[requestKey] = setInterval(polling, 1000)
      //   } else {
      //     openModal(url, (onupdate, onexit) => {
      //       onupdate(limitSec);
      //       deferCollects[requestKey] = setInterval(() => {
      //         polling(onupdate, onexit);
      //       }, 1000)
      //     }, cancel)
      //   }
      // }).finally(cancel)

      openModal(
        url,
        (onupdate, onexit) => {
          onupdate(limitSec); //처음생성시
          deferCollects[requestKey] = setInterval(() => {
            polling(onupdate, onexit);
          }, 1000);
        },
        cancel
      );
    }).finally(cancel);
  };

  const connectFavorlet = async () => {
    const response = await Request.connectWallet({
      chainId: 8217, // 해당 체인 id
      appName: "bellyGom connect", // FAVORLET 앱에 노출
    });
    console.log(response);

    const result = await getRes(response.requestId);
    console.log(result);
    setAddress(result.address);

    localStorage.setItem(
      "favorlet_address",
      JSON.stringify({ state: "connect", ...result })
    );

    const deepLink = createDeepLink(response.requestId);
    console.log(deepLink);

    // const result = await receipt(response.requestId); // Request를 통해 받은 requestId 2
    // console.log(result);
  };
  const disconnectFavorlet = () => {
    setAddress("");
    let storage = JSON.parse(localStorage.getItem("favorlet_address"));
    storage.state = "disconnect";
    localStorage.setItem("favorlet_address", JSON.stringify(storage));
  };

  const favorletSing = async () => {
    const response = await Request.signMessage({
      chainId: 8217, // 해당 체인 id
      appName: "Belly", // FAVORLET 앱에 노출
      from: address, // 서명할 지갑 주소
      message: "BellyGom Holder Verify", // 서명할 메세지
    });
    console.log(response);

    const result = await getRes(response.requestId);// Request를 통해 받은 requestId 
    console.log(result);
    console.log('주소값에 서명한 사인값',result.signature);

  };
 
  const favorletSendcoin = async () => {
    const response = await Request.sendCoin({
      appName: '코인전송',
      chainId: 8217,
      transactions:[
       {  from: "0xb8db26816b27aa95c76675e7c7e74cf9d62289bc", // 코인을 전송할 주소
          to: "0xbb2205461e27D5CD017D6ed74e23904817f943a0", // 코인을 받을 주소
          value: "3000000000000000", // 전송할 코인의 양
        }
      ]
    })
    console.log(response);

    const result = await getRes(response.requestId);// Request를 통해 받은 requestId 
    console.log(result);
    console.log('주소값에 서명한 사인값',result.signature);

  };
  const TRANSFER_ABI=  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
  const favorletTransaction = async () => {
    const response = await Request.executeContract({
      appName: '코인전송',
      chainId: 8217,
      transactions: [
        {
          from: "0xb8db26816b27aa95c76675e7c7e74cf9d62289bc", // 트랜잭션을 호출할 지갑 주소
          to: "0xc2247baccbc7f23b45f95526dcb7fc610beb73ae", // 호출되는 컨트랙트 주소
          value: "0", // 호출하는 abi 함수가 payable 인 경우 플랫폼 코인 전송
          abi: JSON.stringify([TRANSFER_ABI]), // 트랜잭션을 발생시키기 위한 abi
          params: `["0xb8db26816b27aa95c76675e7c7e74cf9d62289bc",0xbb2205461e27D5CD017D6ed74e23904817f943a0", 346]`, // 트랜잭션을 발생시키기 위한 abi 함수의 파라미터
          functionName: "transferFrom", // abi에서 호출 하려는 함수 이름
        },
      ],
    })
    console.log(response);

    const result = await getRes(response.requestId);// Request를 통해 받은 requestId 
    console.log(result);
    console.log('주소값에 서명한 사인값',result.signature);

  };
  const readExcel = (e) => {
    var input = e.target;
    var reader = new FileReader();
    reader.onload = function(){
        var fileData = reader.result;
        var wb = xlsx.read(fileData, {type : 'binary'});
        console.log(wb);
        wb.SheetNames.forEach(function(sheetName){
	        var rowObj =xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);
	        console.log(JSON.stringify(rowObj));

          const workbook = xlsx.utils.book_new();
          const sheet = xlsx.utils.json_to_sheet(rowObj);
          xlsx.utils.book_append_sheet(workbook, sheet, 'Sheet1');
          const fileName = `tttttt.xlsx`;
         xlsx.writeFile(workbook, fileName);
        })
    };
    reader.readAsBinaryString(input.files[0]);
  };


  return (
    <div className="App">
      <header className="App-header">
        <div>
          {address ? (
            <div>
              <button
                style={{ width: "220px", height: "50px" }}
                onClick={disconnectFavorlet}
              >
                favorlet 연결해제
              </button>
              {address}
            </div>
          ) : (
            <div>
              <button
                style={{ width: "220px", height: "50px" }}
                onClick={connectFavorlet}
              >
                1. favorlet 지갑연결
              </button>
            </div>
          )}
          <button
            style={{ width: "220px", height: "50px" }}
            onClick={favorletSing}
          >
            사인요청
          </button>
          <button
            style={{ width: "220px", height: "50px" }}
            onClick={favorletSendcoin}
          >
            코인전송
          </button>
          <button
            style={{ width: "220px", height: "50px" }}
            onClick={favorletTransaction}
          >
            favorletTransaction
          </button>
          <br />
          <input type="file" onChange={(e) => readExcel(e)}></input>
          <button
            style={{ width: "220px", height: "50px" }}
          >
            엑셀꾸미기

          </button>
        </div>
      </header>
    </div>
  );
}

export default App;
