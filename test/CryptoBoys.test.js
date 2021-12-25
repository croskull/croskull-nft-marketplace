const { assert } = require("chai");

const CroSkulls = artifacts.require("./CroSkulls.sol");

const fromWei = (num) => {
  return web3.utils.fromWei( num, "ether" )
}

require("chai")
  .use(require("chai-as-promised"))
  .should();

contract("CroSkulls", async (accounts) => {
  let croSkulls, result, croSkullCount, contractAddress, owner;
  let utils = web3.utils;
  

  before(async () => {
    croSkulls = await CroSkulls.deployed();
    owner = accounts[0];

    
  });

  describe("Deployment", async () => {
    it("contract has an address", async () => {
      contractAddress = await croSkulls.address;
      assert.notEqual(contractAddress, 0x0);
      assert.notEqual(contractAddress, "");
      assert.notEqual(contractAddress, null);
      assert.notEqual(contractAddress, undefined);
    });

    it("has a name", async () => {
      const name = await croSkulls.collectionName();
      assert.equal(name, "CROSkull");
    });

    it("has a symbol", async () => {
      const symbol = await croSkulls.collectionNameSymbol();
      assert.equal(symbol, "CRS");
    });
  });

  describe("Whitelist and Minting Antions", async () => {
    it("check if whitelist is enabled", async () => {
      let isWhitelist = await croSkulls.settings('isWhitelist');
      console.log(isWhitelist)
      assert.equal(isWhitelist, true)
    });

    it("check if marketplace is disabled", async () => {
      let isMarketplace = await croSkulls.settings('isMarketplace');
      assert.equal(isMarketplace, false );
    });

    it("should reject - with whitelist enabled, try to mint without begin in the whitelist", async () => {
      await croSkulls.mintCroSkull( 1, //_mintamount
        { 
          from: accounts[1],
          value:  web3.utils.toWei("1", "Ether") // actual cost 1eth * _mintamount
        }
      ).should.be.rejected;
    });

    it("check if accounts[1] is present into whitelist, should be false", async () => {
      let isWhitelisted = await croSkulls.whitelist(accounts[1]);
      assert.equal( isWhitelisted, false);
    });


    it("adding accounts[1] to whitelist", async () => {
      await croSkulls.addToWhitelist(
        accounts[1],
        { from: owner }
      );
    });

    it("check if accounts[1] is present into whitelist, should be true", async () => {
      let isWhitelisted = await croSkulls.whitelist(accounts[1]);
      assert.equal( isWhitelisted, true);
    });

    it("with whitelist enabled, try to mint begin in the whitelist", async () => {
      await croSkulls.mintCroSkull( 1, //_mintamount
        { 
          from: accounts[1], 
          value: web3.utils.toWei("1", "Ether") // actual cost 1eth * _mintamount
        }
      );
    });

    it("disable Whitelist", async () => {
      await croSkulls.toggleSetting(
        'isWhitelist',
        { from: owner}
      );
    })

    it("with whitelist disabled, try to mint without being in the whitelist", async () => {
      await croSkulls.mintCroSkull( 1, //_mintamount
        { 
          from: owner, //not in whitelist
          value: web3.utils.toWei("1", "Ether") // actual cost 1eth * _mintamount
        }
      );
    })
  })

  describe("testing withdraw functionalities", async () => {
    let contractBalance = 0;
    it("check croskull blaance", async () => {
      contractBalance = await web3.eth.getBalance(croSkulls.address);
      contractBalance = fromWei( contractBalance );
      assert.equal(contractBalance, 2);
    })

    it("check total reward amount", async () => {
      let totalCROReward = await croSkulls.totalCROReward();
      totalCROReward = fromWei( totalCROReward );
      console.log(totalCROReward);
      console.log(contractBalance)
      assert.equal(totalCROReward, contractBalance);
    })

    it("check current owner reward fee, should be 0 ", async () => {
      await croSkulls.getRewardFee().should.be.rejected;
    })

    it("set owner fee to 18,4%", async () => {
      await croSkulls.addRewardable(
        owner,
        184,
        {
          from: owner
        }
      );
    })

    it("set accounts[1] fee to 18,6%", async () => {
      await croSkulls.addRewardable(
        accounts[1],
        186,
        {
          from: owner
        }
      );
    })

    it("check current owner reward fee, should be 184", async () => {
      let ownerFee = await croSkulls.getRewardFee();
      assert.equal(ownerFee, 184);
    })

    it("check accounts[1] reward fee, should be 186", async () => {
      let account1fee = await croSkulls.getRewardFee({
        from: accounts[1]
      });
      assert.equal(account1fee, 186);
    })

    it("check current owner rewards, should be 0.368", async () => {
      let ownerRewards = await croSkulls.getRewardValue();
      ownerRewards = fromWei(ownerRewards);
      assert.equal(ownerRewards, 0.368);
    })

    it("check accounts[1] rewards, should be 0.372", async () => {
      let accounts1Reward = await croSkulls.getRewardValue(
        {
          from: accounts[1]
        }
      );
      accounts1Reward = fromWei(accounts1Reward);
      assert.equal(accounts1Reward, 0.372);
    })

    it("should reject - try to withdraw without being in list", async () => {
      await croSkulls.withdrawReward(
        {
          from: accounts[2]
        }
      )
        .should.be.rejected;
    })

    it("should reject - try to withdraw being in list, but with withdraw disabled", async () => {
      await croSkulls.withdrawReward(
        {
          from: owner
        }
      )
        .should.be.rejected;
    })
    

    it("buying some skulls", async () => {
      for( let i = 2; i <= 9; i++){
        await croSkulls
          .mintCroSkull( 2,
            {
              from: accounts[i],
              value: web3.utils.toWei("2", "Ether"),
            }
        );
      }
    })

    it("checking current supply", async () => {
      let skulls = await croSkulls
          .croSkullCounter();
      assert.equal(skulls, 18)
    })

    it("check current reward pool, should be 18", async () => {
      let totalReward = await croSkulls
        .totalCROReward();
      totalReward = fromWei(totalReward)
      assert.equal(totalReward, 18);
    })

    it("check current owner rewards, should be 3.312", async () => {
      let ownerRewards = await croSkulls.getRewardValue();
      ownerRewards = fromWei(ownerRewards);
      assert.equal(ownerRewards, 3.312);
    })

    it("check accouts[1] rewards, should be 3.348", async () => {
      let accounts1 = await croSkulls.getRewardValue({
        from: accounts[1]
      });
      accounts1 = fromWei(accounts1);
      assert.equal(accounts1, 3.348);
    })

    it("enable withdraw", async () => {
      await croSkulls.toggleSetting('isWithdraw');
    })

    it("testing disabled Update Rewards : minting some skulls", async () => {
      for( let i = 2; i <= 9; i++){
        await croSkulls
          .mintCroSkull( 1,
            {
              from: accounts[i],
              value: web3.utils.toWei("2", "Ether"),
            }
        );
      }
      let totalRewardsCRO = await croSkulls.totalCROReward();
      totalRewardsCRO = fromWei(totalRewardsCRO);
      console.log(totalRewardsCRO)
      let contractBalance = await web3.eth.getBalance(croSkulls.address);
      contractBalance = fromWei( contractBalance );
      assert.notEqual(totalRewardsCRO, contractBalance)
    })

  })
  return
  describe("Marketplace Actions", async () => {
    it("should reject - with marketplace disabled, toggle in sale", async () => {
      await croSkulls.toggleForSale(
        1,
        {
          from: accounts[1]
        })
          .should.be.rejected;
    })

    it("should reject - with marketplace disabled, change token price", async () => {
      await croSkulls.toggleForSale(
        1,
        web3.utils.toWei("1", "Ether"),
        {
          from: accounts[1]
        })
          .should.be.rejected;
    })

    it("enable marketplace", async () => {
      await croSkulls.enableMarketplace(
        { from: owner }
      );
    })

    it("with marketplace enabled, toggle in sale", async () => {
      await croSkulls.toggleForSale(
        1,
        {
          from: accounts[1]
        });
    });

    it("with marketplace enabled, change token price", async () => {
      await croSkulls.changeTokenPrice( 1,
        web3.utils.toWei("2", "Ether"),//set token #1 price to 2 eth
        {
          from: accounts[1]
        });
    });

    it("with marketplace enabled, try to purchase a token", async () => {
      await croSkulls.buyToken( 1, 
        { 
          from: owner,
          value: web3.utils.toWei("2", "Ether"),
        }
      );
    });

    it("afterpurchase, check if token #1 is not forSale", async () => {
      let croSkull = await croSkulls.allCroSkulls(1, {
        from: owner
      })

      let croSkullforSale = croSkull.forSale;

      assert.equal(croSkullforSale, false)
    })

    it("with marketplace enabled, change token price", async () => {
      await croSkulls.changeTokenPrice( 1,
        web3.utils.toWei("1", "Ether"),
        {
          from: owner,
        }
      )
    })

    it("disable marketplace", async () => {
      await croSkulls.disableMarketplace(
        { from: owner }
      );
    })

    it("should revert - with marketplace disabled, try to purchase a token", async () => {
      await croSkulls.buyToken( 1, 
        { 
          from: accounts[1],
          value: web3.utils.toWei("1", "Ether"),
        }
      ).should.be.rejected;
    });
  })
})