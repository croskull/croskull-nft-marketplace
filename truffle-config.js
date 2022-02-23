require("babel-register");
require("babel-polyfill");
require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider');

const MNEMONIC = process.env.MNEMONIC;
module.exports = {
  networks: {
    development: { //ganache
      host: "127.0.0.1",
      port: 7545,
      network_id: "*", // Match any network id
    },
    testnet: { //cronos cassini
      provider: new HDWalletProvider(MNEMONIC, "https://cronos-testnet-3.crypto.org:8545"),
      network_id: "*",
      //skipDryRun: true
     },
     cronos: {
       provider: new HDWalletProvider(MNEMONIC, "https://evm-cronos.crypto.org"), 
       network_id: 25,
       skipDryRun: true
     },
  },
  contracts_directory: "./src/contracts/",
  contracts_build_directory: "./src/abis/",
  compilers: {
    solc: {
      version: "<0.8.2",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};