import { getCaver } from './lib/store';

export function getContractInstance(abi, contractAddress) {
  const caver = getCaver();
  return new caver.contract(abi, contractAddress);
}

// 해당 컨트랙트의 메서드를 호출하는 데 사용되는 가스비용 계산
export async function estimateGas(contract, methodName, params, from) {
  return await contract.methods[methodName](...params).estimateGas({ from });
}

// 해당 컨트랙트의 JSON 인터페이스를 반환한다. [트랜잭션 전송에 필요한 데이터 만들 때 사용]
export function getJsonInterface(contract, methodName) {
  return contract.options.jsonInterface.filter(
    ({ name }) => name === methodName
  )[0];
}

// 해당 컨트랙트의 메서드를 인코딩함 [트랜잭션 전송에 필요한 데이터 만들 때 사용]
export function encodeFunctionCall(contract, methodName, params) {
  const jsonInterface = getJsonInterface(contract, methodName);
  return getCaver().abi.encodeFunctionCall(jsonInterface, params);
}

// 스마트컨트랙트 메서드 실행 후 결과 반환
export async function sendTx({ gas, data, contractAddress, from }) {
  return await getCaver().klay.sendTransaction({
    type: 'SMART_CONTRACT_EXECUTION',
    from,
    to: contractAddress,
    gas,
    data,
  });
}

// 스마트 컨트랙트 실행
export async function executeContractMethod(
  contract,       //컨트랙트
  methodName,
  params,
  from
) {
  const gas = await estimateGas(contract, methodName, params, from);  //가스비계산이요
  const data = encodeFunctionCall(contract, methodName, params);  
  const tx = await sendTx({   //sendTransaction
    gas,
    data,
    contractAddress: contract.options.address,
    from,
  });
  return tx;
}

export const dateFormatter = (blockTimestamp) => dayjs(Number(blockTimestamp) * 1000).format('YYYY-MM-DD HH:mm:ss');

// estimate time of blocknumber
export async function getEstimateTimeByBlockNumber(num) {
  const blockNumber = await getCaver().klay.getBlockNumber();
  const block = await getCaver().klay.getBlock(blockNumber);
  const blockTimestamp = parseInt(block.timestamp);

  if (Number(num) == 0) {
    return '';
  }
  const diff = Number(num) - Number(blockNumber);

  if (diff <= 0) {
    const block = await getCaver().klay.getBlock(num);
    const blockTimestamp = Number(block.timestamp);
    return dateFormatter(blockTimestamp);
  }

  return dateFormatter(blockTimestamp + diff);
}

// get current block timestamp
export async function getCurrentBlockTimeStamp() {
  const blockNumber = await getCaver().klay.getBlockNumber();
  const block = await getCaver().klay.getBlock(blockNumber);
  const blockTimestamp = parseInt(block.timestamp);

  return { blockNumber, timeStamp: blockTimestamp };
}

const getBlockNumberByTimestamp = async (unixTimestamp) => {
  const currentBlockNumber = parseInt(
    await getCaver().rpc.klay.getBlockNumber()
  );
  const currentBlockTimestamp = await blockNumberToTimestamp(
    currentBlockNumber
  );

  if (unixTimestamp === currentBlockTimestamp) {
    return currentBlockNumber;
  }
  let blockNumber =
    currentBlockNumber - (currentBlockTimestamp - unixTimestamp);
  // Max search count: 6 times
  for (let i = 0; i < 6; i++) {
    let blockTimestamp = await blockNumberToTimestamp(blockNumber);
    if (blockTimestamp === unixTimestamp) {
      return blockNumber;
    }
    if (blockTimestamp > unixTimestamp) {
      blockNumber -= blockTimestamp - unixTimestamp;
    }
    if (blockTimestamp < unixTimestamp) {
      blockNumber += unixTimestamp - blockTimestamp;
    }
  }
  throw new Error(
    `Cannot find blockNumber.. Check block number: ${blockNumber} (+-1)`
  );
};

const getBlockNumberByFutureTimestamp = async (unixTimestamp) => {
  const currentBlockNumber = parseInt(
    await getCaver().rpc.klay.getBlockNumber()
  );
  const currentBlockTimestamp = await blockNumberToTimestamp(
    currentBlockNumber
  );

  if (unixTimestamp === currentBlockTimestamp) {
    return currentBlockNumber;
  }
  let blockNumber =
    currentBlockNumber + (unixTimestamp - currentBlockTimestamp);
  return blockNumber;
};

const blockNumberToTimestamp = async (blockNumber) => {
  let block;
  try {
    block = await getCaver().rpc.klay.getBlockByNumber(blockNumber);
    return parseInt(block.timestamp);
  } catch (e) {
    const currentBlockNumber = parseInt(
      await getCaver().rpc.klay.getBlockNumber()
    );
    const currentBlockTimestamp = await blockNumberToTimestamp(
      currentBlockNumber
    );
    return (
      currentBlockTimestamp +
      parseInt(blockNumber) -
      parseInt(currentBlockNumber)
    );
  }
};

export const convertBlockNumberToDate = async (blockNumber) => {
  const timestamp = await blockNumberToTimestamp(blockNumber);  //만들었을때 블록시간
  return dayjs(Number(timestamp) * 1000).format('YYYY-MM-DD HH:mm:ss');
};

export const convertDateToBlockNumber = async (date) => {
  const timestamp = dayjs(date, 'YYYY-MM-DD HH:mm:ss').unix();
  const currentTimestamp = parseInt(Date.now() / 1000);
  if (currentTimestamp >= timestamp) {
    return await getBlockNumberByTimestamp(timestamp);
  } else {
    return await getBlockNumberByFutureTimestamp(timestamp);
  }
};
