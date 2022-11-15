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
      appName: "BlockChainApp", // FAVORLET 앱에 노출
      from: address, // 서명할 지갑 주소
      message: "서명할 메세지", // 서명할 메세지
    });
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

  const makeExcel = async () => {
    const creds ={
      "type": "service_account",
      "project_id": "fingerversebeelygom",
      "private_key_id": "65c6b0eb0a468915d48fc19fc00320f0238bb6ef",
      "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCy7SGK2g/S6fHH\nzNfxC0I+emHl+VlAdnbxlf3ojAb3jCCFzpcmtD41h/Z57VFcvfyr9/XtmIs9aOrk\nAQxoeY3aXbmzCt7CwRYgqMUGaT50I0dWwQURZC1jQtafQHk5q4o6Wchar1HlR7EL\nbhjtkkXEyqx2Fbt2BpVSS2t0uZH+l4W6dBxDPD5ahNhO1h/F9FpoWnUl1wzhfzdo\nYU8lZloFtJwdrMypflvSycNm9DqYSt1vw5MDcf7yVgApxCRRDiOQPqS7ow5THysc\nTwGajq7Sgg4jyX4/KWZle/i8GyMdErDc/6MR6rorOIU7L94BUnRn2UeQedC93Noo\nY/AcPgApAgMBAAECggEAAosrP95VYcFj3oCrmxP2t99yvHud9AZUQTGbyf5bVNsV\nubStHg/G1nt7TQA477TWJ7GPMO2dfEXmhmHEJe1cKtwVUCNlUKuJ+KuH1KjAbxNy\n4zcp5dDucdKf5Bt4kki0Q2Th26x2mDE7ryIqBA7hPvZ8yM5BgBdcOZNh+d4mfbaT\nJb9QvXDgqVUJrQp20C+bMewOStc7dE078gzXp8qhIknX/CUd4IuD6yVlPzuho/vV\nOE+G4WSNC8tFTU83gQZrfZ4BRrPXFvUVJR6XU2485m0g0MHQsEbo9oqRUcpF7+F4\nYkDI37gkzJpnrtkaGy2InvCVfpyY3w2+56nebr3b1QKBgQDXM8ks9wqP9SgXEOhJ\n6fzA3hUnUzSmPx/ckKY5/dQXy7CcvltI8c8oFyvYrPTg0hAU+mlLhGJLdH/dO78B\n2E1EOKj9YlKbmflJoYEDYuI9OofOl9yG/aBgBw3XefRMW/fe4dklV+eU65TJwMH1\nFStN6mkxnYdkqf4c6MvqsWOWdQKBgQDU2Mu296tKBs4qRZgRXX7jsQr7wMRzV87k\nzvoJlk4WIOZQzm0iB9RxntEaZM/hEX7ITRvujQZgK4YNktbgerekwZlaahKm4zgq\nD/YJXAOw/dyGpWoIKJydcEqz7ZWjM7DfJeZilPZQfKbX0XlBvpImtA+1Is0JwXwM\nW96IahiUZQKBgDh2euMUUi4hKYqbwgaaoNlNq4ks2JSB3W82eJaglYREyirl+vdx\nkmO3aKaqAnn2Q4fth7DrpAqeH2pBYcUvJl6u6w/IO1peFL0P5dSonilocPdwesjk\nRK7NSwFtGv7p5mgRI7MblERLZzdkHr+Z9Um1JjKBXWO5AlY9cjs6naF9AoGAcHZs\njSyn8OFPpb5H70T7estdBlCAfIF07CkArHgiokaX6zJnL4f7lF1aFxwVStK3rpYv\noAgbyky09A8WQl4VEpTItqE9YbjFQFRWp/Nab/ZywyI7uDvdJMLkddWfLzBs0Dty\nU7xpuXVjor0n2Lkc+B5D/m148SKurMkN9/43JpECgYBWQurIQWqEFy5my6xk5ZoN\nJCRmnoVAVlPxg6Zum4juJk+/0tPuuBuZXRaLhW7QFVDbkAoZ1mMnyKIuXmKEmGdq\nzOJYQYQyaHTM1PZkjtlzZT2179GprlV7M/n7W+NFHacr77VEMA6HAgsPMvEoN72P\nzhFG4IRbjMT24NGIFGBwUw==\n-----END PRIVATE KEY-----\n",
      "client_email": "bellygomtransaction-history@fingerversebeelygom.iam.gserviceaccount.com",
      "client_id": "110983533543049761912",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/bellygomtransaction-history%40fingerversebeelygom.iam.gserviceaccount.com"
    }

    // const authorize = new google.auth.JWT(client_email, null, private_key, [
    //   'https://www.googleapis.com/auth/spreadsheets',
    // ]);
    
    // const googleSheet = google.sheets({
    //   version: 'v4',
    //   auth: authorize,
    // });
   
    // const context = await googleSheet.spreadsheets.values.get({
    //   spreadsheetId: 'spread sheet ID',
    //   range: 'A1:A3',
    // });
  }

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
          <br />
          <input type="file" onChange={(e) => readExcel(e)}></input>
          <button
            style={{ width: "220px", height: "50px" }}
            onClick={makeExcel}
          >
            엑셀꾸미기

          </button>
        </div>
      </header>
    </div>
  );
}

export default App;
