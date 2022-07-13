import React from 'react'
import CaverExtKAS from'caver-js-ext-kas'
export default function Hhii() {

    const accessKeyId = "{accessKeyId}"
    const secretAccessKey = "{secretAccessKey}"
    const chainId = 1001 // for Baobab; 8217 if Cypress
    // const caver = new CaverExtKAS()
    console.log(111111111111111111)
    // caver.initKASAPI(chainId, accessKeyId, secretAccessKey)
    // const account = await caver.rpc.klay.getAccount()

    const test = ()=>{
        console.log(22);
    }
  return (
    <div>
        <button onClick={test}>push push babe</button>
    </div>
  )
}
