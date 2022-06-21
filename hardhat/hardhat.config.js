require("dotenv").config();

require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');  //여기추가
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    // hardhat: { // https://hardhat.org/hardhat-network/guides/mainnet-forking.html
    //   forking: {
    //     url: "https://eth-mainnet.alchemyapi.io/v2/<key>",
    //     blockNumber: 11321231
    //   }
    // },
    // ropsten: {
    //   url: 'https://ropsten.infura.io/v3/e81fcce544f741798dc16dcb7b33d9d7',
    //   chainId: 3,
    //   accounts: [""],
    //   saveDeployments: false,
    //   tags: ["test"]
    // },
    baobob: {
      url: 'https://kaikas.baobab.klaytn.net:8651',
      chainId: 1001,
      accounts: [process.env.PRIVATE_KEY],
      saveDeployments: true,
      tags: ["test"]
    },
    // baobobDev: {
    //   url: 'https://kaikas.baobab.klaytn.net:8651',
    //   chainId: 1001,
    //   accounts: [""],
    //   saveDeployments: true,
    //   tags: ["staging"]
    // },
  },
  namedAccounts: {
    deployer: 0,
    player: 1,
  },
  mocha: {
    timeout: 300000
  },
  solidity: "0.8.4",
};
  

