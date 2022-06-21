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
    //   accounts: ['47709a087b17d0ea86d1e5fc2253f59b4027ff6fc2ab4f904be56edd63bdca87'],
    //   saveDeployments: false,
    //   tags: ["test"]
    // },
    baobob: {
      url: 'https://public-node-api.klaytnapi.com/v1/baobab',
      chainId: 1001,
      accounts: [process.env.PRIVATE_KEY],
      saveDeployments: true,
      tags: ["test"]
    },
    cypress: {
      url: 'https://public-node-api.klaytnapi.com/v1/cypress',
      chainId: 8217,
      accounts: [process.env.PRIVATE_KEY],
      saveDeployments: true,
      tags: ["Belly Gom mint"]
    },
    // baobobDev: {
    //   url: 'https://kaikas.baobab.klaytn.net:8651',
    //   chainId: 1001,
    //   accounts: [process.env.PRIVATE_KEY] || '',
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
  solidity: "0.5.17",
};
  

