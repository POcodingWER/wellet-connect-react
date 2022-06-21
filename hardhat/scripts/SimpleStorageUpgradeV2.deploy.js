const hre = require("hardhat");
const { upgrades } = require("hardhat");

async function main() {
  //upgrades.deployProxy로 배포한 컨트랙트주소
  const proxyAddress ='0x5E1b5fcD53D438459Ea399Ded2F9d02FB75Ecf2A';
  
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