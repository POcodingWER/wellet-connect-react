const hre = require("hardhat");

async function main() {
 
  const Greeter = await hre.ethers.getContractFactory("SunmiyaNFT");
  const greeter = await Greeter.deploy("여기가 name!",{
    args: ["SimpleToken", "Simple"],
    log: true,
  });

  await greeter.deployed();

  console.log("Greeter deployed to:", greeter.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
