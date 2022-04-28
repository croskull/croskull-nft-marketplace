/*const CroSkulls = artifacts.require("Croskulls");
const CroSkullsAmbassador = artifacts.require("CroSkullsAmbassador");
const nftDescription = artifacts.require("nftDescription");*/
//const souls = artifacts.require("Souls");
//const CroSkullsStaking = artifacts.require("croSkullStaking");

//const Grave = artifacts.require("Grave");
//const SkullBank = artifacts.require("SkullsBank");
//const SkullsFarm = artifacts.require("SkullsFarm");

//const Rude = artifacts.require("Rude");
const PurplePotion = artifacts.require("PurplePotions")


const fs = require('fs');
const readline = require('readline');

require("chai")
  .use(require("chai-as-promised"))
  .should();


const toBN = web3.utils.toBN;
const toWei = web3.utils.toWei;


module.exports = async function (deployer, network, accounts) {

  let owner = accounts[0] || "0x297b0eC2EF5EB41b724DB54c0555b2E3Ae348701";
  let purplePotion;
  let blue = "0xB929D3002208f405180D3C07616F88EDa45F3e14";
  let red = "0x508378E99F5527Acb6eB4f0fc22f954c5783e5F9";
  let grave = "0x9885488cD6864DF90eeBa6C5d07B35f08CEb05e9";
  await deployer.deploy(
    PurplePotion,
    blue,
    red,
    grave,
    {
      from: owner
    }
  ).then( async () => {
    purplePotion = await PurplePotion.deployed();
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