import store from "../store";

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

const fetchBalancesSuccess = (payload) => {
  return {
    type: "FETCH_BALANCES_SUCCESS",
    payload
  }
}

export const updateState = ( payload ) => {
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

export const playSound = (audioPath ) => {
  return async (dispatch) => { 
    if( audioPath ){
      let newAudioSrc = new Audio(audioPath)
      newAudioSrc.play()
    }
  }
}


export const fetchBalances = () => {
  return async (dispatch) => {
    let { croSkullsGrave, croSkullsSouls, croSkullsRude, croSkullsPetEggs, accountAddress } = store.getState().blockchain

    let graveBalance = await croSkullsGrave.balanceOf(accountAddress)
    let rudeBalance = await croSkullsRude.balanceOf(accountAddress)
    let soulsBalance = await croSkullsSouls.balanceOf(accountAddress)
    let petEggsBalance = await croSkullsPetEggs.balanceOf(accountAddress)
    graveBalance = graveBalance.toString()
    rudeBalance = rudeBalance.toString()
    soulsBalance = soulsBalance.toString()
    petEggsBalance = petEggsBalance.toString()
    dispatch( fetchBalancesSuccess({
      graveBalance,
      rudeBalance,
      soulsBalance,
      petEggsBalance
    }))
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
    let { storiesLoading, storyLastBlock, skullsStories } = store.getState().data
    if( storiesLoading ) return;
    dispatch(updateState({
      key: 'storiesLoading',
      value: true
    }))
    let storiesFilter = croSkullsDescription.filters.DescriptionUpdate()

    croSkullsDescription.on('DescriptionUpdate', (content) => {
      console.log( content )
    })
    let currentBlock = await ethProvider.getBlockNumber()
    if( storyLastBlock )
      currentBlock = storyLastBlock;
    let finalBlock = 0;
    let blockLimit = 2000;
    let storyEvents = [];
    /*if( skullsStories.length )
      storyEvents = skullsStories*/

    let storyLimit = storyLastBlock ? 20 : 5;
    for(let i = 0; storyEvents.length <= storyLimit; i += blockLimit){ 
      storyEvents.push.apply(
        storyEvents, 
        await croSkullsDescription.queryFilter(storiesFilter, currentBlock - i - blockLimit, currentBlock - i )
      )
      finalBlock = currentBlock - i - blockLimit;
    }
    let newSkullsStories = []
    if( skullsStories)
      newSkullsStories = skullsStories
    storyEvents.map( story => {
      let { tokenId, ownerOf, ipfsHash } = story.args;
      if ( newSkullsStories[tokenId] )
        return

      newSkullsStories[tokenId] = {
        tokenId: tokenId.toString(),
        ownerOf: ownerOf,
        ipfsHash: ipfsHash,
        blocknumber: story.blockNumber
      }
    })

    newSkullsStories.sort( (a, b) => {
      return  b.blocknumber - a.blocknumber
    })

    dispatch(updateState({
      key: 'skullsStories',
      value: newSkullsStories
    }))
    dispatch(updateState({
      key: 'storiesLoading',
      value: false
    }))
    dispatch(updateState({
      key: 'storyLastBlock',
      value: finalBlock
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
      let petEggsBalance = await croSkullsPetEggs.minterList( accountAddress )
      let petEggsMaxSupply = await croSkullsPetEggs.eggsLimit()
      let petEggsSupply = await croSkullsPetEggs.eggsCounter()
      let petEggsCost = await croSkullsPetEggs.eggCost()
      let approvedEggs = await croSkullsGrave.allowance( accountAddress, croSkullsPetEggs.address )
      petEggsLimit = petEggsLimit.toString()
      petEggsBalance = petEggsBalance.toString()
      petEggsMaxSupply = petEggsMaxSupply.toString()
      petEggsSupply = petEggsSupply.toString()
      petEggsCost = petEggsCost.toString()
      approvedEggs = approvedEggs.toString() >= parseInt(petEggsCost)

      dispatch(updateMerchant({
        petEggsLimit,
        petEggsBalance,
        petEggsSupply,
        petEggsMaxSupply,
        petEggsCost,
        approvedEggs
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
        let daysLastWithdraw = await croSkullsStaking.daysSinceLastWithdraw()
        let graveTotalSupply = await croSkullsGrave.totalSupply();
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
        graveTotalSupply = graveTotalSupply.toString()
        
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
          totalSkullsStaked,
          totalWithdrawedGraves,
          soulsGenerated,
          totalWithdrawedSouls,
          lastWithdrawTimestamp,
          daysLastWithdraw,
          burnedGraves,
          graveTotalSupply
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
      dispatch(fetchBalances())
      let {
          croSkullsContract,
          croSkullsStaking,
          accountAddress,
          croPotionBlue,
          croPotionRed,
          croPotionPurple,
          croSkullsGrave
      } = store.getState().blockchain
      if( ! croSkullsContract )
        return
      dispatch(refreshSkullsStories())
      let redCount = await croPotionRed.balanceOf(accountAddress)
      let blueCount = await croPotionBlue.balanceOf(accountAddress)
      let purpleCount = await croPotionPurple.balanceOf(accountAddress)

      redCount = redCount.toString()
      blueCount = blueCount.toString()
      purpleCount = purpleCount.toString()

      let redId = [];
      for( let i = 0; i < redCount; i++) {
        let tokenId = await croPotionRed.tokenOfOwnerByIndex(accountAddress, i)
        redId.push( tokenId.toString() )
      }
      let blueId = [];
      for( let i = 0; i < redCount; i++) {
        let tokenId = await croPotionBlue.tokenOfOwnerByIndex(accountAddress, i)
        blueId.push( tokenId.toString() )
      }
      let purpleId = [];
      for( let i = 0; i < purpleCount; i++) {
        let tokenId = await croPotionPurple.tokenOfOwnerByIndex(accountAddress, i)
        purpleId.push( tokenId.toString() )
      }
      
      let purpleSupply = await croPotionPurple.totalSupply()
      purpleSupply = purpleSupply.toString()
      let purpleGraveAllowance = await croSkullsGrave.allowance(accountAddress, croPotionPurple.address)
      purpleGraveAllowance = purpleGraveAllowance.toString()
      let purpleBlueApproval = await croPotionBlue.isApprovedForAll(accountAddress, croPotionPurple.address)
      let purpleRedApproval = await croPotionRed.isApprovedForAll(accountAddress, croPotionPurple.address)
      dispatch( setPotions({
          redId,
          blueId,
          redCount,
          blueCount,
          purpleSupply,
          purpleCount,
          purpleId,
          purpleGraveAllowance,
          purpleBlueApproval,
          purpleRedApproval
        })
      )
      console.log( store.getState().data)
      dispatch(getStakingData())
      let ownedTokensCount = await croSkullsContract.balanceOf(accountAddress)
      ownedTokensCount = ownedTokensCount.toString()
      let skulls = [];
      for( let i = 0; i < ownedTokensCount; i++) {
        let tokenId = await croSkullsContract.tokenOfOwnerByIndex(accountAddress, i)
        skulls.push( tokenId.toString() )
      }
      let inStakeTokens = await croSkullsStaking.getTokensIds()
      const rawEbisusData = await fetch( 'https://api.ebisusbay.com/collections?collection=0xF87A517A5CaecaA03d7cCa770789BdB61e09e05F' );
      let ebisusData = await rawEbisusData.json();
      ebisusData = ebisusData.collections[0]
      const rawResult = await fetch( 'https://croskull.mypinata.cloud/ipfs/QmSrjCsmQ9e5m1HFYXRSYgxHi9K6u9a6DXRsWz7KWW5i6p/_metadata' );
      let metaData = await rawResult.json();
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
          advancedMetadata: metaData,
          ebisusData: ebisusData
      }))
  }
  
}

