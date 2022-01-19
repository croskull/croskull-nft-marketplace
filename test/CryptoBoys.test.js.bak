const { assert } = require("chai");
const CroSkulls = artifacts.require("./CroSkulls.sol");

const fromWei = (num) => {
  return web3.utils.fromWei( num, "ether" )
}
const toBN = web3.utils.toBN;
const toWei = web3.utils.toWei;

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
      assert.equal(isWhitelist, true)
    });

    it("check if marketplace is disabled", async () => {
      let isMarketplace = await croSkulls.settings('isMarketplace');
      assert.equal(isMarketplace, false );
    });

    it("enable minting", async () => {
      await croSkulls.toggleSetting('isMintable');
    })

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
      let totalCROVolume = await croSkulls.totalCROVolume();
      totalCROVolume = fromWei( totalCROVolume );
      assert.equal(totalCROVolume, contractBalance);
    })

    it("check current owner reward fee, should be 0 ", async () => {
      let rewardFee = await croSkulls.getRewardFee();
      assert.equal(0,rewardFee )
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
        .totalCROVolume();
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

    it("testing rewards updating: minting some skulls| Should be equal to 34", async () => {
      for( let i = 2; i <= 9; i++){
        await croSkulls
          .mintCroSkull( 1,
            {
              from: accounts[i],
              value: web3.utils.toWei("2", "Ether"),
            }
        );
      }
      let totalRewardsCRO = await croSkulls.totalCROVolume();
      totalRewardsCRO = fromWei(totalRewardsCRO);
      let contractBalance = await web3.eth.getBalance(croSkulls.address);
      contractBalance = fromWei( contractBalance );
      assert.equal(totalRewardsCRO, contractBalance)
    })

    it("check current owner rewards, should be 6.256", async () => {
      let ownerRewards = await croSkulls.getRewardValue();
      ownerRewards = fromWei(ownerRewards);
      assert.equal(ownerRewards, 6.256);
    })

    let userRewards;

    it("accounts1 try to withdraw and check balance", async () => {
      let preUserBalance = toBN( await web3.eth.getBalance(accounts[1]) )
      userRewards = await croSkulls.getRewardValue(
        {
          from: accounts[1]
        }
      );
      let withdrawTX = await croSkulls.withdrawReward({
        from: accounts[1]
      })
      let gasUsed = withdrawTX.receipt.gasUsed;

      const tx = await web3.eth.getTransaction(withdrawTX.tx);
      let gasCost =  toBN( gasUsed ).mul( toBN( tx.gasPrice ) )


      let postUserBalance =   toBN( await web3.eth.getBalance(accounts[1] ) ).toString();
      let calculatedFinalBalance = preUserBalance.add(
        toBN(userRewards)
      );

      calculatedFinalBalance = calculatedFinalBalance.sub( gasCost );
      calculatedFinalBalance = calculatedFinalBalance.toString();

      assert.equal(calculatedFinalBalance,  postUserBalance )
    })

    it("check accounts[1] current ClaimedRewards", async () => {
      let alreadyClaimed = await croSkulls.userClaimedRewards(accounts[1]);
      assert.equal(userRewards.toString(), alreadyClaimed.toString() );
    })

    it("check accounts[1] current reward: should be 0 ", async () => {
      let currentRewards = await croSkulls.getRewardValue(
        {
          from: accounts[1]
        }
      );
      assert.equal(currentRewards.toString(), 0);
    })

    it("check owner current reward: should be 6.256 ", async () => {
      let currentRewards = await croSkulls.getRewardValue();
      assert.equal(fromWei( currentRewards) , 6.256 );
    })


  })

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
      await croSkulls.toggleSetting( "isMarketplace",
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

    it("check owner reward rate: should be 6.27072", async () => {
      //6.256 + 
      let currentRewards = await croSkulls.getRewardValue();

      let oldRewardValue = toBN(toWei( "6.256" ));

      let rewardFee = await croSkulls.getRewardFee();
      let lastTxValue = toBN(toWei( "2" ) ).divn(100).muln(4); // calcolo valore della tassa sulla vendita di tokens ( 4% )

      lastTxValue = lastTxValue.div( 
        toBN( 1000 )
      ).mul(rewardFee) // sul 4% della fee marketplace, calcolo la Percentuale di Reward in base a quanto descritto nello smart contract, divisione per 1000 visto il ,0 decimale

      let newRewardValue = oldRewardValue.add(
        lastTxValue
      )//aggiungo la nuova fee registrata al vecchio valore dell'user reward
      assert.equal( fromWei(newRewardValue ) ,fromWei(currentRewards) );//asserisco che i 2 valori siano uguali.
    })

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
      await croSkulls.toggleSetting("isMarketplace",
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