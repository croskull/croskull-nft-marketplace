/*const CroSkulls = artifacts.require("Croskulls");
const CroSkullsAmbassador = artifacts.require("CroSkullsAmbassador");
const Grave = artifacts.require("Grave");
const nftDescription = artifacts.require("nftDescription");*/
//const souls = artifacts.require("Souls");
const CroSkullsStaking = artifacts.require("croSkullStaking");
const fs = require('fs');
const readline = require('readline');

require("chai")
  .use(require("chai-as-promised"))
  .should();


const toBN = web3.utils.toBN;
const toWei = web3.utils.toWei;


module.exports = async function (deployer, network, accounts) {

  let owner = accounts[0] || "0x297b0eC2EF5EB41b724DB54c0555b2E3Ae348701";
  let Staking;

  await deployer.deploy(CroSkullsStaking, {
    from: owner
  }).then( async () => {
    Staking = await CroSkullsStaking.deployed();
  })
  /*
  let grave, croSkullsAmbassador, croSkullsStaking;
  await deployer.deploy(CroSkullsAmbassador, {
    from: owner
  }).then( async () => {
    croSkullsAmbassador = await CroSkullsAmbassador.deployed();
  })
  await deployer.deploy(CroSkullsStaking, {
    from: owner
  }).then( async () => {
    croSkullsStaking = await CroSkullsStaking.deployed();
  })
  await deployer.deploy(Grave, {
    from: owner
  }).then( async () => {
    grave = await Grave.deployed();
  })
  /*
  await croSkullsStaking.setNFTAddress(await croSkullsAmbassador.address)
  
  await croSkullsStaking.setTokenAddress(await grave.address)

  await croSkullsAmbassador.adminMintCroSkull(
    10,
    owner
  )
  
  await croSkullsStaking.fundRewardPool()
  
  await croSkullsStaking.startRewards()
  let description;
  */

  /*await deployer.deploy(nftDescription, {
    from: owner
  }).then( async () => {
    description = await nftDescription.deployed();
  })*/
};