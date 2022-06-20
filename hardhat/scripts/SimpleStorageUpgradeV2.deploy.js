const hre = require("hardhat");
const { upgrades } = require("hardhat");

async function main() {
  //upgrades.deployProxy로 배포한 컨트랙트주소
  const proxyAddress ='0x9A676e781A523b5d0C0e43731313A708CB607508';
  
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