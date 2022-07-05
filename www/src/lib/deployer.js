export const deploy = async (accountAddress, { abi, bytecode, args }) => {
  /*
  accountAddress: public지갑주소
   abi, bytecode, args 
   */
  console.log(accountAddress)
  const contract = new window.caver.klay.Contract(abi);
  const deployer = contract.deploy({
    data: bytecode,
    arguments: [...args],
  });

  const gas = await deployer.estimateGas(); //가스계산 추출
  const deployed = await deployer.send({  
    from: accountAddress,
    gas: gas,
    value: 0,
  });

  const contractAddress = deployed.options.address;
  return contractAddress;
};