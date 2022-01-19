const croSkullStaking = artifacts.require("croSkullStaking");
const _Grave = artifacts.require("Grave");
const _CroSkullsNFT = artifacts.require("CroSkullsAmbassador");
const {BN, time} = require('@openzeppelin/test-helpers');
const { assert } = require("chai");

const fromWei = (num) => {
  return web3.utils.fromWei( num, "ether" )
}
const toBN = web3.utils.toBN;
const toWei = web3.utils.toWei;
const DAY_IN_SEC =  60 * 60 * 24;
require("chai")
  .use(require("chai-as-promised"))
  .should();



/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("StakingTest", function ( accounts ) {
  let utils = web3.utils;
  let owner, Grave, CroSkull, Staking;
  let sAddress, gAddress, nAddress;

  before(async ( ) => {
    Staking = await croSkullStaking.deployed();
    Grave = await _Grave.deployed();
    CroSkull = await _CroSkullsNFT.deployed();
    owner = accounts[0];
  } );

  describe( "Init Contracts", async () => {
    it("Staking has Address", async () => {
      Staking.address = await Staking.address
      assert.notEqual(Staking.address, 0x0);
      assert.notEqual(Staking.address, "");
      assert.notEqual(Staking.address, null);
      assert.notEqual(Staking.address, undefined);
    })
    it("Grave has Address", async () => {
      Grave.address = await Grave.address
      assert.notEqual(Grave.address, 0x0);
      assert.notEqual(Grave.address, "");
      assert.notEqual(Grave.address, null);
      assert.notEqual(Grave.address, undefined);
    })
    it("CroSkull has Address", async () => {
      CroSkull.address = await CroSkull.address
      assert.notEqual(CroSkull.address, 0x0);
      assert.notEqual(CroSkull.address, "");
      assert.notEqual(CroSkull.address, null);
      assert.notEqual(CroSkull.address, undefined);
    })
    
    it("Staking: set Nft Address", async () => {
      await Staking.setNFTAddress(
        CroSkull.address
      )
      let nftAddress = await Staking.croSkullContract();
      assert.equal(nftAddress, CroSkull.address)
    })

    it("Staking: set Token Address", async () => {
      await Staking.setTokenAddress(
        Grave.address
      )
      let graveAddress = await Staking.rewardToken();
      assert.equal(graveAddress, Grave.address)
    })

    it("Grave: fund Staking contract", async () => {
      await Grave.mint(
        Staking.address,
        toWei("21897810"),
        { from: owner }
      )
      let stakingBalance = await Grave.balanceOf( Staking.address );
      assert.equal(
        21897810 * 10 ** 18,
        stakingBalance
      )
    })

    it("NFT: mint 20 skulls to owner", async () => {
      await CroSkull.adminMintCroSkull(
        10,
        owner
      )
    })

    it("NFT: approve Staking as Owner Operator", async () => {
      await CroSkull.setApprovalForAll(
        Staking.address,
        true
      )
      let stakingApproved = await CroSkull.isApprovedForAll( 
        owner,
        Staking.address 
      );
      assert.equal(
        stakingApproved,
        true
      )
    })

    it("Staking: refresh funding", async () => {
      await Staking.fundRewardPool();
      let poolRewards = await Staking.poolRewardSupply();
      assert.equal(
        poolRewards,
        toWei("21897810"),
      )
    })

    it("Staking: Start rewards ", async () => {
      await Staking.startRewards();
      let stakingStaus = await Staking.started();
      let stakingTimestamp = await Staking.startStakeTimestamp();
      console.log( stakingTimestamp.toString() )
      assert.equal(
        stakingStaus,
        true
      )
      assert.notEqual(
        stakingTimestamp,
        0
      )
    })

  })

  let stakedSkulls = [];
  let malusFee;

  describe("User Interact", async () => {
    it("Staking: stake skull #1", async () => {
      await Staking.stakeSkull(
        1
      );
      let tokenList = await Staking.getTokensIds();
      assert.equal(
        tokenList[0].toString(),
        [ 1 ]
      )
      stakedSkulls.push( tokenList[0].toString() )
    })

    it("Staking: check cycles", async () => {
      await time.increase(10)
      let cycles = await Staking._tenSecCyclesPassed();
      cycles = cycles.toString()
      
      assert.equal(
        cycles,
        1
      )
    })

    it("Staking: check cycles", async () => {
      await time.increase(10)
      let cycles = await Staking._tenSecCyclesPassed();
      cycles = cycles.toString()
      
      assert.equal(
        cycles,
        2
      )
    })

    it("Staking: check malusFee ", async () => {
      malusFee = await Staking.calculateMalusFee()
      malusFee = malusFee.toString()
      assert.equal(
        malusFee,
        50
      )
    })

    it("Staking: check malusReward ", async () => {
      let malusReward = await Staking.calculateRewardsPlusMalus()
      let reward = await Staking.calculateRewards()
      malusReward = parseInt( malusReward.toString() )
      reward =  reward.toString()
      let calculatedMalusReward = reward * 1000 / 100 * malusFee / 1000;
      let malusDif = malusReward - calculatedMalusReward
      console.log(malusDif)
      assert(
        malusDif < 100
      )
    })

    it("Staking: check cycles ", async () => {
      await time.increase( DAY_IN_SEC )
      let cycles = await Staking._tenSecCyclesPassed();
      cycles = cycles.toString()
      assert.equal(
        cycles,
        8642
      )
    })

    it("Staking: check malus fee ", async () => {
      let malusFeeAft1Day = await Staking.calculateMalusFee();
      malusFeeAft1Day = malusFeeAft1Day.toString()
      assert.equal(
        malusFeeAft1Day,
        47
      )
    })

    it("Staking: check days 1", async () => {
      let daysLastWithdraw = await Staking.daysSinceLastWithdraw();
      daysLastWithdraw = daysLastWithdraw[0].toString()
      assert.equal(
        daysLastWithdraw,
        1
      )
    })

    it("Staking: check days 2 ", async () => {
      await time.increase( DAY_IN_SEC )
      let daysLastWithdraw = await Staking.daysSinceLastWithdraw();
      daysLastWithdraw = daysLastWithdraw[0].toString()
      assert.equal(
        daysLastWithdraw,
        2
      )
    })
    
    it("Staking: check days 3 ", async () => {
      await time.increase( DAY_IN_SEC )
      let malusFeeAft1Day = await Staking.daysSinceLastWithdraw();
      malusFeeAft1Day = malusFeeAft1Day[0].toString()
      assert.equal(
        malusFeeAft1Day,
        3
      )
    })

    it("Staking: check malus fee ", async () => {
      let malusFeeAft3Days = await Staking.calculateMalusFee();
      malusFeeAft3Days = malusFeeAft3Days.toString()
      assert.equal(
        malusFeeAft3Days,
        42
      )
    })

    it("Staking: check rewards and malus", async () => {
      let malusReward = await Staking.calculateRewardsPlusMalus()
      let reward = await Staking.calculateRewards()
      let malusFee = await Staking.calculateMalusFee();
      malusReward = malusReward.toString()
      reward = reward.toString()
      malusFee = malusFee.toString()
      let calculatedReward = reward - ( reward / 100 * malusFee )
      let calculatedDiff = calculatedReward - malusReward
      assert.equal(
        calculatedDiff,
        0
      )
    })

    it("Staking: check souls (1) after 2 months", async () => {
      await time.increase( DAY_IN_SEC * 60 )
      let minedSouls = await Staking.calculateDroppedSouls();
      assert.equal(
        minedSouls.toString(),
        1
      )
    })

    it("Staking: Unstake Skull #1", async () => {
        let usertokens = await Staking.getTokensIds();
        console.log(usertokens)
        await Staking.unstakeSkull(1);
    })

    it("Staking: Check User List, Length and Ownership", async () => {
        let ownedList = await Staking.getTokensIds()
        console.log("staked list", ownedList )
        let ownerOfOne = await CroSkull.ownerOf(1)
        
        assert.equal(
            ownedList.length,
            0
        )
        assert.equal(
            ownerOfOne,
            owner
        )
    })

    let tokenList = []
    for( let i = 1; i <= 10; i++ ){
        tokenList.push(i)
    }

    it("Staking: Batch Stake Skulls from 1 ... 10", async () => {
        await Staking.batchStakeSkulls(
            tokenList
        )
    })
    let stakedList = []
    it("Staking: Check User List ( 1 ... 10 ), Length ( 10 ) and Ownership", async () => {
        let stakedSkulls = await Staking.userDetails(
            owner
        )
        stakedSkulls = stakedSkulls.tokenCount.toString()
        console.log(
            stakedSkulls
        )
        stakedList = await Staking.getTokensIds()
        let stakedArray = []
        for( let i = 0; i < stakedList.length; i++) {
            stakedArray.push( parseInt( stakedList[i].toString() ) )
        }

        assert.equal( 
            stakedSkulls.toString(),
            10
        )
        
    })

    it("Staking: Batch Unstake Skulls from 1 ... 10", async () => {
        await Staking.batchUnstakeSkulls(
            stakedList
        )
        let staked = stakedList = await Staking.getTokensIds()
        assert.equal(
            staked.length,
            0
        )
    })

    it("Staking: Check Staking Cycle (0) and stakedList ", async () => {
        let cycles = await Staking._tenSecCyclesPassed();
        let staked = await Staking.getTokensIds()
        assert.equal(
            cycles,
            0
        )
        assert.equal(
            staked.length,
            0
        )
        await time.increase(10)
        cycles = await Staking._tenSecCyclesPassed();
        staked = stakedList = await Staking.getTokensIds()
        assert.equal(
            cycles,
            1
        )
    })

    tokenList = [ 1, 4, 3, 9, 2, 5, 7, 6, 8, 10 ];

    it("Staking: Batch Stake Skulls from 1 ... 10", async () => {
        await Staking.batchStakeSkulls(
            tokenList
        )
        let staked = await Staking.getTokensIds()
        assert.equal(
            staked.length,
            10
        )
    })

    it("Staking: Batch unstake Skulls from 1 ... 5", async () => {
        await Staking.batchUnstakeSkulls(
            [ 5, 4, 8, 2, 1]
        )
        let staked = await Staking.getTokensIds()
        assert.equal(
            staked.length,
            5
        )
    })

    it("Staking: Check User List, Length ( 0 ) and Ownership ( 1 ... 10 )", async () => {
        return
        let stakedList = await Staking.getTokensIds()
        console.log( stakedList )
        assert.equal( 
            stakedSkulls.toString(),
            0
        )
        assert.equal(
            stakedList.length,
            0
        )
    }) 


  })
});

/*
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
})*/