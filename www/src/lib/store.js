import { writable } from 'svelte/store';
import * as api from './api';
import MinterKIP17 from '../../../solidity/artifacts/contracts/MinterKIP17.sol/MinterKIP17.json';
import OwnableKIP17 from '../../../solidity/artifacts/contracts/OwnableKIP17.sol/OwnableKIP17.json';
import Whitelist from "../../../solidity/artifacts/contracts/Whitelist.sol/Whitelist.json";
// import UnpackKIP17 from "../../../solidity/artifacts/contracts/UnpackKIP17.sol/UnpackKIP17.json";

export const user = writable({
  connected: false,
  address: '',
  chainId: 0
});

let account = {};
user.subscribe(u => {
  account = {...u};
});
  
let caverWS = null;
let caver = null;
let minterContract = null;
let nftContract = null;
let whitelistContract = null;

export const getCaver = () => {
  if (caver === null) {
    caver = new Caver(klaytn);  //지갑정보 넣음
  }
  return caver;
}
export const getCaverForWebsocket = () => {
  if (caverWS === null) {
    const ws = new Caver.providers.WebsocketProvider('ws://54.180.130.219:8552', {
      reconnect: {
        auto: true,
        delay: 0,
        maxAttempts: false,
        onTimeout: false,
      },
    });

    caverWS = new Caver(ws);
  }
  
  return caverWS;
}

export const getMinterInfo = () => {
  return {
    abi: MinterKIP17.abi, 
    bytecode: MinterKIP17.bytecode
  }
}

export const getNFTInfo = () => {
  return {
    abi: OwnableKIP17.abi, 
    bytecode: OwnableKIP17.bytecode
  }
}

export const getWhitelistInfo = () => {
  return {
    abi: Whitelist.abi, 
    bytecode: Whitelist.bytecode
  }
}

// export const getUnpackNFTInfo = () => {
//   return {
//     abi: UnpackKIP17.abi, 
//     bytecode: UnpackKIP17.bytecode
//   }
// }

export const getMinterContract = async () => {    //caver.contract(abi,contractAddress)
  const caver = getCaver(); 
  
  if (minterContract === null) {
    minterContract = new caver.contract(MinterKIP17.abi, await api.getMinterAddress(account.chainId, account.address));
  }
  return minterContract;
}
export const getNFTContract = async () => {
  const caver = getCaver();
  if (nftContract === null) {
    nftContract = new caver.contract(OwnableKIP17.abi, await api.getKIP17Address(account.chainId, account.address));
  }

  return nftContract;
}
export const getWhitelistContract = async () => {
  const caver = getCaver();
  if (whitelistContract === null) {
    whitelistContract = new caver.contract(Whitelist.abi, await api.getWhitelistAddress(account.chainId, account.address));
  }

  return whitelistContract;
}

