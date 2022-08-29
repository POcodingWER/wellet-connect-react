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
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_ROPSTEN_API_KEY}`,//인프로통해서 배포
      chainId: 3,
      accounts: [process.env.METAMASK_PRIVATE_KEY],
      saveDeployments: false,
      tags: ["test"]
    },
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_GOERLI_API_KEY}`,//알크미
      chainId: 5,
      accounts: [process.env.METAMASK_PRIVATE_KEY],
      saveDeployments: false,
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemyapi.io/v2/${process.env.POLYGON_MUMBAI_API_KEY}`,//알크미
      chainId: 80001,
      accounts: [process.env.METAMASK_PRIVATE_KEY],
      saveDeployments: false,
    },
    baobob: {
      url: 'https://public-node-api.klaytnapi.com/v1/baobab',
      chainId: 1001,
      accounts: [process.env.PRIVATE_KEY],
      saveDeployments: true,
      tags: ["test"]
    },
    // cypress: {
    //   url: 'https://public-node-api.klaytnapi.com/v1/cypress',
    //   chainId: 8217,
    //   accounts: [process.env.PRIVATE_KEY],
    //   saveDeployments: true,
    //   tags: ["Belly Gom mint"]
    // },
  },
  namedAccounts: {
    deployer: 0,
    player: 1,
  },
  mocha: {
    timeout: 300000
  },
  solidity: "0.8.7",
};
  

