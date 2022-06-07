require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: "hardhat", 
  solidity: {
    compilers:[{version: "0.8.9"}, {version: "0.4.19"}, {version: "0.6.12"}]
  },
  networks: {
    "hardhat": {
      chainId: 31337,
      forking: {
        url: process.env.MAINNET_RPC_URL
      }
    },
    // "rinkeby": {
    //   chainId: 4,
    //   url: process.env.RINKEBY_RPC_URL, 
    //   accounts: [process.env.PRIVATE_KEY],
    //   blockConfirmations: 6
    // }
  },
  namedAccounts: {
    deployer: {
      default: 0
    },
    user: {
      default: 1
    }
  },
  gasReporter: {
    enabled: true,
    currency: "INR",
    noColors: true,
    token: "ETH",
    outputFile: 'gas_report.txt'
  },
  // etherscan: {
  //    apiKey: process.env.ETHERSCAN_API_KEY,
  // },
  mocha: {
    timeout: 300000, //timeout of max 300 seconds
  }
}


