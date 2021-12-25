const CroSkulls = artifacts.require("Croskulls");

module.exports = async function(deployer) {
  await deployer.deploy(CroSkulls, 
    false, 
    true, 
    false, 
    { from: "0x297b0eC2EF5EB41b724DB54c0555b2E3Ae348701"}
  );
};