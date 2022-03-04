import store from "../store";

const genesisBlock = 1738447;

const updateMerchant = (payload) => {
  return {
    type: "UPDATE_MERCHANT",
    payload: payload
  }
}

const fetchDataRequest = () => {
  return {
    type: "CHECK_DATA_REQUEST",
  };
};

const fetchDataSuccess = (payload) => {
  return {
    type: "CHECK_DATA_SUCCESS",
    payload: payload,
  };
};

const updateState = ( payload ) => {
  return {
    type: "UPDATE_STATE",
    payload: payload
  }
}

const setPotions = ( payload ) => {
  return {
    type: "SET_POTIONS",
    payload: payload
  }
}

const fetchDataFailed = (payload) => {
  return {
    type: "CHECK_DATA_FAILED",
    payload: payload,
  };
};

const setSkullsStories = (payload) => {
  return {
    type: "SET_SKULLS_STORIES",
    payload: payload,
  };
};

const skullsRequest = () => {
  return {
      type: "SKULLS_REQUEST"
  }
}

export const cleanData = () => {
  return {
      type: "CLEAN_DATA"
  }
}

const skullsSuccess = (payload) => {
  return {
      type: "SKULLS_SUCCESS",
      payload: payload
  }
}

const fetchStakingSuccess = (payload) => {
  return {
    type: "FETCH_STAKING_SUCCESS",
    payload: payload
  }
}

const stakingDisabled = () => {
  return {
    type: "STAKING_DISABLED",
  }
}

const notificationRequest = (payload) => {
  return {
    type: "NOTIFICATION_REQUEST",
    payload: payload
  }
}

export const refreshSkullsStories = () => {
  return async (dispatch) => {
    let { croSkullsDescription, croSkullsGrave, contractDetected, accountAddress, ethProvider } = store.getState().blockchain

    if( ! contractDetected || ! accountAddress)
      return

    if ( ! croSkullsDescription ) return

    let storyAllowance = await croSkullsGrave.allowance( accountAddress, croSkullsDescription.address )
    storyAllowance = storyAllowance.toString()
    let storyCost = await croSkullsDescription._getCostInGrave()
    storyCost = storyCost.toString()
    dispatch( 
      updateState( { key: "storyAllowance", value: storyAllowance >= storyCost ? true : false } 
    ))
    let storiesFilter = croSkullsDescription.filters.DescriptionUpdate()

    let currentBlock = await ethProvider.getBlockNumber()
    let blockLimit = 2000;
    let blockDiff = currentBlock - genesisBlock
    let tempGenesis = genesisBlock
    let storyEvents = []
    for(let i = 1; i <= blockDiff; i += 2000){ 
      if( currentBlock - tempGenesis  < blockLimit ) {
        blockLimit = currentBlock - tempGenesis;
      }
      storyEvents.push.apply(
        storyEvents, 
        await croSkullsDescription.queryFilter(storiesFilter, tempGenesis, tempGenesis + blockLimit )
      )
      tempGenesis += blockLimit
    }
    let skullsStories = []
    storyEvents.map( story => {
      let { tokenId, ownerOf, ipfsHash } = story.args;
      skullsStories[tokenId] = {
        tokenId: tokenId.toString(),
        ownerOf: ownerOf,
        ipfsHash: ipfsHash,
        blocknumber: story.blockNumber
      }
    })

    skullsStories.sort( (a, b) => {
      return  b.blocknumber - a.blocknumber
    })

    dispatch(updateState({
      key: 'skullsStories',
      value: skullsStories
    }))
  }
}

export const sendNotification = ({ title, message, tx, type}) => {
    return async (dispatch) => {
      dispatch(notificationRequest({title, message, tx, type}))
    }
}

export const toTavern = ( skulls = false ) => { // UnStake Skull
  return async (dispatch) => {
    let { croSkullsStaking } = store.getState().blockchain
    let stakeSkullTx, skullsCount
    if( skulls instanceof Array ){
      skullsCount = skulls.length
      stakeSkullTx =  croSkullsStaking.batchUnstakeSkulls( skulls )
    }else{
      skullsCount = 1
      stakeSkullTx =  croSkullsStaking.unstakeSkull( skulls )
    }

    await stakeSkullTx.then(
      async (tx) => {
        dispatch(sendNotification({
          title: `Transaction Sent`,
          message: 'Waiting for confirmation...',
          tx,
          type: "info"
        }))
        await tx.wait(2)
        dispatch(sendNotification({
          title: `Success!`,
          message: `${skullsCount} Skull${skullsCount > 1 ? 's' : ''} unstaked!`,
          tx,
          type: "success"
        }))
        dispatch(getSkullsData())
      }
    ) 
  }
}

export const approveStories = () => {
  return async ( dispatch ) => {
    let { croSkullsDescription, croSkullsGrave } = store.getState().blockchain
    let costInGrave = await croSkullsDescription._getCostInGrave()
    costInGrave = (costInGrave * 10).toString()
    let approveTx = croSkullsGrave.approve( croSkullsDescription.address, costInGrave )
    await approveTx.then(
      async (tx) => {
        dispatch(sendNotification({
          title: `Transaction Sent`,
          message: 'Waiting for confirmations',
          tx,
          type: "info"
        }))
        await tx.wait(2)
        dispatch(sendNotification({
          title: `Success!`,
          tx,
          type: "success"
        }))
        dispatch( updateState( {
          key: "storyAllowance",
          value: true
        }))
      }
    )
  }
}

export const toMission = ( skulls = false ) => { // UnStake Skull
  return async (dispatch) => {
    let { croSkullsStaking } = store.getState().blockchain
    let stakeSkullTx, skullsCount;
    if( skulls instanceof Array ){
      skullsCount = skulls.length
      stakeSkullTx =  croSkullsStaking.batchStakeSkulls( skulls )
    }else{
      skullsCount = 1
      stakeSkullTx =  croSkullsStaking.stakeSkull( skulls )
    }

    await stakeSkullTx.then(
      async (tx) => {
        dispatch(sendNotification({
          title: `Transaction Sent`,
          message: 'Waiting for confirmations',
          tx,
          type: "info"
        }))
        await tx.wait(2)
        dispatch(sendNotification({
          title: `Success!`,
          message: `${skullsCount} Skull${skullsCount > 1 ? 's' : ''} staked`,
          tx,
          type: "success"
        }))
        dispatch(getSkullsData())
      }
    )
  }
}

export const getStakingData =  () => {
  return async (dispatch) => {
    console.log('getStakingData')
    let {
      croSkullsStaking, 
      contractDetected, 
      croSkullsPetEggs, 
      croSkullsGrave, 
      croSkullsSouls,
      accountAddress,
      ethProvider
    } = store.getState().blockchain;
    if( ! contractDetected || ! accountAddress)
      return

    let started = await croSkullsStaking.started()
    if( started ){
      
      let isApproved = await croSkullsStaking.approvalStatus()
      let petEggsLimit = await croSkullsPetEggs.eggsPerAddress()
      let petEggsMintedByUser = await croSkullsPetEggs.minterList( accountAddress )
      let petEggsMaxSupply = await croSkullsPetEggs.eggsLimit()
      let petEggsSupply = await croSkullsPetEggs.eggsCounter()
      let petEggsCost = await croSkullsPetEggs.eggCost()
      let approvedEggs = await croSkullsGrave.allowance( accountAddress, croSkullsPetEggs.address )
      petEggsLimit = petEggsLimit.toString()
      petEggsMintedByUser = petEggsMintedByUser.toString()
      petEggsMaxSupply = petEggsMaxSupply.toString()
      petEggsSupply = petEggsSupply.toString()
      petEggsCost = petEggsCost.toString()
      approvedEggs = approvedEggs.toString() >= parseInt(petEggsCost)


      let userGraveBalance = await croSkullsGrave.balanceOf(accountAddress)
      userGraveBalance = userGraveBalance.toString()

      dispatch(updateMerchant({
        petEggsLimit,
        petEggsMintedByUser,
        petEggsSupply,
        petEggsMaxSupply,
        petEggsCost,
        approvedEggs,
        userGraveBalance
      }))

      if( ! isApproved ){
        dispatch(stakingDisabled())
      }else{
        let malusFee = await croSkullsStaking.calculateMalusFee()
        malusFee = malusFee.toString()

        let rewardPlusMalus = await croSkullsStaking.calculateRewardsPlusMalus()
        rewardPlusMalus = rewardPlusMalus[0]
        let rewards = await croSkullsStaking.calculateRewards()
        let rewardPerCycle = await croSkullsStaking._rewardPerCycles()
        let cyclesLastWithdraw = await croSkullsStaking._tenSecCyclesPassedLastWithdraw()
        let startStakeTimestamp = await croSkullsStaking.startStakeTimestamp()
        let userDetails = await croSkullsStaking.userDetails( accountAddress )
        let soulsGenerated = await croSkullsStaking.calculateDroppedSouls();
        let alreadyClaimed = userDetails.alreadyClaimed
        let totalSkullsStaked = await croSkullsStaking.stakedSkullsCount()
        let totalWithdrawedGraves = await croSkullsStaking.poolWithdrawedAmount()
        let totalWithdrawedSouls = await croSkullsStaking.poolWithdrawedSouls()
        let soulsBalance = await croSkullsSouls.balanceOf(accountAddress)
        let daysLastWithdraw = await croSkullsStaking.daysSinceLastWithdraw()
        let burnedGraves = await croSkullsGrave.burnedAmount()
        burnedGraves = burnedGraves.toString()

        daysLastWithdraw = daysLastWithdraw[0].toString()

        let lastWithdrawTimestamp = userDetails.lastWithdrawTimestamp.toString()
        
        let lastBlock =  await ethProvider.getBlock()
        let blockTimestamp = lastBlock.timestamp;
        
        rewardPlusMalus = rewardPlusMalus.toString()
        rewards = rewards.toString()
        rewardPerCycle = rewardPerCycle.toString()
        cyclesLastWithdraw = cyclesLastWithdraw.toString()
        startStakeTimestamp = startStakeTimestamp.toString()
        soulsGenerated = soulsGenerated.toString()
        alreadyClaimed = alreadyClaimed.toString()
        totalSkullsStaked = totalSkullsStaked.toString()
        totalWithdrawedGraves = totalWithdrawedGraves.toString()
        totalWithdrawedSouls = totalWithdrawedSouls.toString()
        soulsBalance = soulsBalance.toString()
        
        dispatch(fetchStakingSuccess({
          malusFee,
          rewardPlusMalus,
          rewards,
          rewardPerCycle,
          cyclesLastWithdraw,
          startStakeTimestamp,
          lastBlock,
          blockTimestamp,
          userDetails,
          alreadyClaimed,
          soulsGenerated,
          totalSkullsStaked,
          totalWithdrawedGraves,
          totalWithdrawedSouls,
          lastWithdrawTimestamp,
          soulsBalance,
          daysLastWithdraw,
          burnedGraves
        }))
      }
    }else{
      dispatch(stakingDisabled())
    }
  }
}

export const getSkullsData = () => {
  return async (dispatch) => {
      console.log('getSkullsData')
      dispatch(fetchDataRequest());
      let {
          croSkullsContract,
          croSkullsStaking,
          accountAddress,
          croPotionBlue,
          croPotionRed,
          ethProvider
      } = store.getState().blockchain
      if( ! croSkullsContract )
        return
      dispatch(refreshSkullsStories())
      let redCount = await croPotionRed.balanceOf(accountAddress)
      let blueCount = await croPotionBlue.balanceOf(accountAddress)
      redCount = redCount.toString()
      blueCount = blueCount.toString()
      dispatch( setPotions({
          redCount,
          blueCount
        }) )
      dispatch(getStakingData())
      let ownedTokensCount = await croSkullsContract.balanceOf(accountAddress)
      ownedTokensCount = ownedTokensCount.toString()
      let skulls = [];
      for( let i = 0; i < ownedTokensCount; i++) {
        let tokenId = await croSkullsContract.tokenOfOwnerByIndex(accountAddress, i)
        skulls.push( tokenId.toString() )
      }
      let inStakeTokens = await croSkullsStaking.getTokensIds()

      const rawResult = await fetch( 'https://croskull.mypinata.cloud/ipfs/QmSrjCsmQ9e5m1HFYXRSYgxHi9K6u9a6DXRsWz7KWW5i6p/_metadata' );
      let metaData = await rawResult.json();
      let tempMetadata = metaData
      let rarityPerTrait = []
      let traitRariry = []
      let totalRarity = 0;
      metaData.map( (skullData) => {
        let { attributes } = skullData
        attributes.map( ( trait, i ) => {
          totalRarity++
          rarityPerTrait[trait.value] = rarityPerTrait[trait.value] > 0 ? rarityPerTrait[trait.value] + 1 : 1
          traitRariry[trait.value] = 100 / totalRarity * rarityPerTrait[trait.value]
        })
      })

      metaData.map( (skullData, skullId) => {
        let { attributes } = skullData
        let rarityPower = 0;
        attributes.map( ( trait, i ) => {
          rarityPower += rarityPerTrait[trait.value]
        })
        metaData[skullId].rarityPower = rarityPower
        metaData[skullId].rarityPercent = 100 / totalRarity * rarityPower
        metaData[skullId].rank = 0
      })

      
      metaData.sort( (a, b ) => {
        return a.rarityPower - b.rarityPower
      })
      metaData.map( (skull, i ) => {
        metaData[i].rank = i+1
      })
      metaData.sort( (a,b) => {
        return a.edition - b.edition
      })


      dispatch(skullsSuccess( {
          croSkulls: skulls,
          croSkullsStaked: inStakeTokens,
          advancedMetadata: metaData
      }))
  }
}