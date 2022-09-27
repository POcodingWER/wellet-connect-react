const fs = require('fs');
const axios = require('axios');

function Unix_timestamp(t){
  var date = new Date(t*1000);
  var year = date.getFullYear();
  var month = "0" + (date.getMonth()+1);
  var day = "0" + date.getDate();
  var hour = "0" + date.getHours();
  var minute = "0" + date.getMinutes();
  var second = "0" + date.getSeconds();
  return year + "-" + month.substr(-2) + "-" + day.substr(-2) + " " + hour.substr(-2) + ":" + minute.substr(-2) + ":" + second.substr(-2);
}

const 뽑기 = async () => {
    const timer = ms => new Promise(res => setTimeout(res, ms))
    let nftBox =[];
    let startTime = 1661958000;   //9월 1일
    let dayTimeStemp = 86400;
    let unixTime = startTime
    let id = 10;
    let csv =`id, symbol,price,unixTime,source,createdAt,updatedAt\r\n`
    for (let i = 1; i < 26; i++) {
      const url = `https://api.coingecko.com/api/v3/coins/favor/history?date=${i}-9-2022`
      console.log(url);
      await timer(3000);   //딜레이주는거임 너무빨리요청하면 caver에서 error처리함
      const price = await axios(url).then((res)=>res.data.market_data.current_price.krw);
      console.log(price);
      let stopTime = startTime +(dayTimeStemp*i);

      while (unixTime < stopTime) {
        const date = await Unix_timestamp(unixTime);
        csv += `${id},FAVOR,${price.toFixed(2)},${unixTime},COIN_GECKO,${date},${date}\r\n`;
        id +=1;
        unixTime += 60;
      }

    }

    fs.writeFileSync('favor_price.csv', csv);
  };
  뽑기();