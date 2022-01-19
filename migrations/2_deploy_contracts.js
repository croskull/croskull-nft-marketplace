const CroSkulls = artifacts.require("Croskulls");
const CroSkullsAmbassador = artifacts.require("CroSkullsAmbassador");
const CroSkullsStaking = artifacts.require("croSkullStaking");
const Grave = artifacts.require("Grave");
const fs = require('fs');
const readline = require('readline');

require("chai")
  .use(require("chai-as-promised"))
  .should();


const toBN = web3.utils.toBN;
const toWei = web3.utils.toWei;


module.exports = async function (deployer, network, accounts) {
  /*
  let owner = "0x297b0eC2EF5EB41b724DB54c0555b2E3Ae348701";
  await deployer.deploy(CroSkulls, 
    false, 
    true, 
    false, 
    true,
    { from: "0x297b0eC2EF5EB41b724DB54c0555b2E3Ae348701"}
  );

  async function processLineByLine() {
    let croSkulls = await CroSkulls.deployed();

    await croSkulls.addToWhitelist(owner,
      { from: owner}
    );

    await croSkulls.setNftPerAddressLimit( 5,
      { from: owner}
    );

    let newCost = toWei( "199" );
    await croSkulls.setCost( newCost, 
      {from: owner}  )

    const fileStream = fs.createReadStream('migrations/whitelist.txt');
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let alreadyAdded = [];
    let i = 0;
    for await (const address of rl) {
      if( ! alreadyAdded[address] ){
        i++;
        alreadyAdded[address] = true
        console.log(`#${i} - ${address} added to whitelist`)
        await croSkulls.addToWhitelist(address,
          { from: "0x297b0eC2EF5EB41b724DB54c0555b2E3Ae348701"}
        )
      }
      //await console.log(`Line from file: ${line}`);
    }
  }
  */

  let owner = accounts[0] || "0x297b0eC2EF5EB41b724DB54c0555b2E3Ae348701";
  /*await deployer.deploy(CroSkulls,
    { from: owner }
  );*/
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

    
  
  

  await croSkullsStaking.setNFTAddress(await croSkullsAmbassador.address)
  await setTimeout('', 3000)
  await croSkullsStaking.setTokenAddress(await grave.address)

  await setTimeout('', 3000)
  await grave.mint(
    await croSkullsStaking.address,
    "21897810000000000000000000"
  )
  await setTimeout('', 3000)
  await croSkullsStaking.fundRewardPool()
  await setTimeout('', 3000)
  await croSkullsStaking.startRewards()

  /*await croSkullsAmbassador.setApprovalForAll(
    await croSkullsStaking.address,
    true
  )*/
};