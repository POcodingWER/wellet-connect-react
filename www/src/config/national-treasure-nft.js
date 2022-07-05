import { getCaver } from '../lib/store';

const caver = getCaver();
const address = '0x122dbb0c76d1d96a9187a50c898a789b0ed1cf7c';
const contract = new caver.contract(caver.klay.KIP17.abi, address);

const nationalTConfig = {
  tokenAddress: address,
  getImageURI: async (tokenId) => {
    const raw = await contract.methods.tokenURI(tokenId).call();
    const res = await fetch(raw);
    const data = await res.json();
    return data.image;
  }
};

export default nationalTConfig;