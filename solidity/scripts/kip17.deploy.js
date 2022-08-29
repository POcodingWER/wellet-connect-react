const hre = require("hardhat");

async function main() {
 
  const Greeter = await hre.ethers.getContractFactory("OwnableKIP17");
  const greeter = await Greeter.deploy('plase','pplz');

  await greeter.deployed();

  console.log("Greeter deployed to:", greeter.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
