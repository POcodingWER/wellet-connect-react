const hre = require("hardhat");

async function main() {
 
  const Greeter = await hre.ethers.getContractFactory("MyCollectible");
  const greeter = await Greeter.deploy();

  await greeter.deployed();

  console.log("Greeter deployed to:", greeter.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
