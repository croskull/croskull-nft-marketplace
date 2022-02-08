import store from "../store";

const genesisBlock = 1641340 || 1641340;

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
    let { croSkullsDescription, contractDetected,accountAddress, ethProvider } = store.getState().blockchain

    if( ! contractDetected || ! accountAddress)
      return
    
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
    console.log( storyEvents )
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

    /*dispatch(
      setSkullsStories( {
        skullsStories
      })
    )*/
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
    if( skulls.length > 1 ){
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

export const toMission = ( skulls = false ) => { // UnStake Skull
  return async (dispatch) => {
    let { croSkullsStaking } = store.getState().blockchain
    let stakeSkullTx, skullsCount;
    if( skulls.length > 1 ){
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
    let {croSkullsStaking, contractDetected, croSkullsContract, croSkullsGrave, accountAddress, ethProvider} = store.getState().blockchain;
    let initialState = store.getState().data
    if( ! contractDetected || ! accountAddress)
      return

    let started = await croSkullsStaking.started()
    if( started ){
      let isApproved = await croSkullsStaking.approvalStatus();
      if( ! isApproved ){ //approved Staking contract as Operator into ERC721 Contract
        //prevediamo una sezione dove mostrare il bottone per attivare l'approval sul contratto NFT
        dispatch(stakingDisabled())
      }else{
        let malusFee = await croSkullsStaking.calculateMalusFee()
        malusFee = malusFee.toString()
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


        let rewardPlusMalus = await croSkullsStaking.calculateRewardsPlusMalus()
        let rewards = await croSkullsStaking.calculateRewards()
        let rewardPerCycle = await croSkullsStaking._rewardPerCycles()
        let cyclesLastWithdraw = await croSkullsStaking._tenSecCyclesPassedLastWithdraw()
        let startStakeTimestamp = await croSkullsStaking.startStakeTimestamp()
        let userDetails = await croSkullsStaking.userDetails( accountAddress )
        let soulsGenerated = await croSkullsStaking.calculateDroppedSouls();
        let alreadyClaimed = userDetails.alreadyClaimed;
        let userGraveBalance = await croSkullsGrave.balanceOf(accountAddress)
        
        let lastBlock =  await ethProvider.getBlock()
        let blockTimestamp = lastBlock.timestamp;
        rewardPlusMalus = rewardPlusMalus.toString()
        rewards = rewards.toString()
        rewardPerCycle = rewardPerCycle.toString()
        cyclesLastWithdraw = cyclesLastWithdraw.toString()
        startStakeTimestamp = startStakeTimestamp.toString()
        soulsGenerated = soulsGenerated.toString()
        alreadyClaimed = alreadyClaimed.toString()
        userGraveBalance = userGraveBalance.toString()
        
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
          userGraveBalance,
          advancedMetadata: metaData
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
          ethProvider
      } = store.getState().blockchain
      if( ! croSkullsContract )
        return
      dispatch(refreshSkullsStories())
      dispatch(getStakingData())
      let ownedTokensCount = await croSkullsContract.balanceOf(accountAddress)
      ownedTokensCount = ownedTokensCount.toString()
      let skulls = [];
      for( let i = 0; i < ownedTokensCount; i++) {
        let tokenId = await croSkullsContract.tokenOfOwnerByIndex(accountAddress, i)
        skulls.push( tokenId.toString() )
      }
      let inStakeTokens = await croSkullsStaking.getTokensIds()
      /*
      let receivedFilter = croSkullsContract.filters.Transfer(null, accountAddress)
      let transferedFilter = croSkullsContract.filters.Transfer(accountAddress)
      //let inStakeFilter = croSkullsStaking.filters.Stake(accountAddress)
      
      let currentBlock = await ethProvider.getBlockNumber()
      let blockLimit = 2000;
      let blockDiff = currentBlock - genesisBlock
      let receivedEvents = [], transferedEvents = [ ];
      let tempGenesis = genesisBlock

      for(let i = 1; i <= blockDiff; i += 2000){ 
        if( currentBlock - tempGenesis  < blockLimit ) {
          blockLimit = currentBlock - tempGenesis;
        }
        receivedEvents.push.apply(
          receivedEvents, 
          await croSkullsContract.queryFilter(receivedFilter, tempGenesis, tempGenesis + blockLimit )
        );
          
        transferedEvents.push.apply( 
          transferedEvents, 
          await croSkullsContract.queryFilter(transferedFilter, tempGenesis, tempGenesis + blockLimit) 
        )
        tempGenesis += blockLimit
      }

      let received = [];
      let transfered = [];
      receivedEvents.map(event => {
          let topics = event.decode(event.data, event.topics)
          let tokenId = topics.tokenId.toString()
          //if( ! received.includes(tokenId) )
          if (received[tokenId]) {
              received[tokenId]++
          } else {
              received[tokenId] = 1
          }
      })
      transferedEvents.map(event => {
          let topics = event.decode(event.data, event.topics)
          let tokenId = topics.tokenId.toString()
          if (transfered[tokenId]) {
              transfered[tokenId]++
          } else {
              transfered[tokenId] = 1
          }
      })
      let final = []
      received.forEach((nTrasfer, tokenId) => {
          if (  nTrasfer > transfered[tokenId] || nTrasfer && !transfered[tokenId]) {
              final.push(tokenId)
          }
      })
      final = final.filter(x => !inStakeTokens.includes(x))*/

      dispatch(skullsSuccess( {
          croSkulls: skulls,
          croSkullsStaked: inStakeTokens
      }))
  }
}