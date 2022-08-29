const hre = require("hardhat");
const { upgrades } = require("hardhat");

async function main() {
    
    //TODO : 아까 작성한 컨트랙트 getContractFactory사용해서 불러오기
    const SimpleStorageUpgrade = await hre.ethers.getContractFactory("SimpleStorageUpgrade");
    const ssu = await upgrades.deployProxy(SimpleStorageUpgrade,[500],{initializer:'set'}); //deployProxy로 처음 배포될때 set함수 호출해서 500으로 지정해줌
    // const ssu = await (SimpleStorageUpgrade.deploy())
    // await ssu.deployed()
    console.log('SimpleStorageUpgrade deployd to', ssu.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });