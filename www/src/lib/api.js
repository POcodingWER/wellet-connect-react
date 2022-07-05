// const temporaryStorage = {
//   '0xea34ec09b6a5c15c695cbbe2dadf39e9c71c2fde': {
//     '1001': {
//       'KIP17': '0xAAd01f7845F1e507D1eDf764Def3140c1a896c8F',
//       'Whitelist': '0x9450B6EE5Ae0f0e39DB7FF10c656c0C3C431bf97',
//       'Minter': '0xa9ee64e58fA908AB8d9fE5dCadB3268Ac8b08646'
//     }
//   }
// };

const BASE_URI = 'https://qxaz7p4d44.execute-api.ap-northeast-2.amazonaws.com/Prod/';

const createId = (network, owner) => `${owner}-${network}`;

async function get(network, owner) {  //아마존에 쏴서 컨트랙트 주소 가져옴
  const res = await fetch(`${BASE_URI}${createId(network, owner)}`);
  try {
    const info = await res.json();
    return info;
  } catch(e) {
    return null;
  }
}

async function save(network, owner, key, value) {   //back 으로 정보 넘기고 save
  const data = await get(network, owner) || {};

  const res = await fetch(BASE_URI, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...data,
      id: createId(network, owner),
      [key]: value
    })
  });

  return res.json();
}

export const getKIP17Address = async (network, owner) => {
  // console.log(network,owner) //1001 '0xf78458143c4928223a0f204cc9b7ff244b1e3eba'
  const info = await get(network, owner);
  if (!info) {
    return null;
  }

  return info.KIP17;
};
export const getWhitelistAddress = async (network, owner) => {
  const info = await get(network, owner);

  if (!info) {
    return null;
  }

  return info.Whitelist;
};
export const getMinterAddress = async (network, owner) => { //어드레스랑 인터넷주소보내서 정보가져옴 
  const info = await get(network, owner);

  if (!info) {
    return null;
  }
  return info.Minter;
};

export const saveKIP17Address = async (network, owner, address) => {     //save 정보 넘기고
  const data = await save(network, owner, 'KIP17', address);
  return data;
}

export const saveMinterAddress = async (network, owner, address) => {
  const data = await save(network, owner, 'Minter', address);
  return data;
}

export const saveWhitelistAddress = async (network, owner, address) => {
  const data = await save(network, owner, 'Whitelist', address);
  return data;
}

// 임시 주소
const tempContractAddress = {
  0: {
    KIP17: "0x9c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8",
    Whitelist: "0x9c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8",
    Minter: "0x9c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8",
  },
  // baobab
  1001: {
    KIP17: "0xa77ca21dd993c58e2f364fa46b51cb13f5e1f96b",
    Whitelist: "0x4820Bace8fA8ad5eacA11f9a59787cc2D3eD2732",
    Minter: "0xc78295446c950337e9ef037d0117f82ed7ac629a",
  },
  // mainnet
  8217: {
    KIP17: "0xa77ca21dd993c58e2f364fa46b51cb13f5e1f96b",
    Whitelist: "0x5a4fa31a951b15958a715864953c0536aa358e4c",
    Minter: "0xc78295446c950337e9ef037d0117f82ed7ac629a",
  },
};
