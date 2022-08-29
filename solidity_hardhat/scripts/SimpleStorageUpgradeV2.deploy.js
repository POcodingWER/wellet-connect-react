const hre = require("hardhat");
const { upgrades } = require("hardhat");

async function main() {
  //upgrades.deployProxy로 배포한 컨트랙트주소
  const proxyAddress ='0x558401B38a5bc20889D37d3A28fBC1131fDd0233';
  
  const SimpleStorageUpgradeV2 = await hre.ethers.getContractFactory("SimpleStorageUpgradeV2");
  const ssu2 = await upgrades.upgradeProxy(proxyAddress,SimpleStorageUpgradeV2);

  console.log('SimpleStorageUpgrade deployd to', ssu2.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });