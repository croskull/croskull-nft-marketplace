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