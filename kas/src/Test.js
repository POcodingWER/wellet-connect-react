import React,{useState,useEffect,useCallback} from 'react'
import CaverExtKAS from'caver-js-ext-kas'
import Caver from'caver-js'
import MinterKIP17 from'./abi/MinterKIP17.json'
import KIP17 from'./abi/OwnableKIP17.json'

const accessKeyId = "";
const secretAccessKey = "";
const chainId = window.klaytn.networkVersion // for Baobab; 8217 if Cypress
const caver = new Caver(window.klaytn);
let caverExtKAS

if(accessKeyId===""||secretAccessKey===""){   //kasAPI
    caverExtKAS = new Caver(window.klaytn);
  }else{
    caverExtKAS = new CaverExtKAS(chainId, accessKeyId, secretAccessKey);
}

function Test() {
const [first, setfirst] = useState({})

  const getOwnershipNftList = async ()=>{ //보유 NFT search
    let nftTokenID = []
    const contract = new caverExtKAS.klay.Contract(KIP17.abi,'0x5544775e57aa4C4D83c606971C03Da06324CC451');
    console.log('보유 nft수',await contract.methods.balanceOf(window.klaytn.selectedAddress).call()); 
    const getBlockEvent = await contract.getPastEvents('Transfer',{ filter:{to:[window.klaytn.selectedAddress]}, fromBlock: 96534898, toBlock:'latest'})

   for (const v of getBlockEvent) {
      const findOwner = await contract.methods.ownerOf(v.returnValues.tokenId).call(); 
      if(findOwner.toLowerCase() === window.klaytn.selectedAddress.toLowerCase()) {
        nftTokenID.push(v)
      }
   }
   setfirst(nftTokenID);
  }

  const ttttttte = async ()=>{
    let checkOfTokenOwner=[1,1,1,1,1,1,2,2,2,2,3,3,3,].filter( (v)=>{ //필터에 어싱크쓰면 안됨
     return v === 1
   
    })
    console.log(checkOfTokenOwner);
  }

  return (
    <div className="App">
      <header>
        <button style={{width:'100px',height:'100px'}} onClick={getOwnershipNftList}>보유 NFT search </button>{first.length}
      </header>
    </div>
  );
}

export default Test;
