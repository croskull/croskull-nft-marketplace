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
    let { croSkullsDescription, accountAddress, ethProvider } = store.getState().blockchain

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
      console.log( story )
      skullsStories[tokenId] = {
        ownerOf: ownerOf,
        ipfsHash: ipfsHash
      }
    })


    console.log( skullsStories )
    dispatch(
      setSkullsStories( {
        skullsStories
      })
    )
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
        console.log( tx )
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
        console.log( tx )
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
    let {croSkullsStaking, croSkullsContract, accountAddress, ethProvider} = store.getState().blockchain;
    let started = await croSkullsStaking.started()
    if( started ){
      let isApproved = await croSkullsStaking.approvalStatus();
      let croSkullsAmount = await croSkullsContract.balanceOf( accountAddress )
      if( ! isApproved ){ //approved Staking contract as Operator into ERC721 Contract
        //prevediamo una sezione dove mostrare il bottone per attivare l'approval sul contratto NFT
        dispatch(stakingDisabled())
      }else{
        let malusFee = await croSkullsStaking.calculateMalusFee()
        let rewardPlusMalus = await croSkullsStaking.calculateRewardsPlusMalus()
        let rewards = await croSkullsStaking.calculateRewards()
        let rewardPerCycle = await croSkullsStaking._rewardPerCycles()
        let cyclesLastWithdraw = await croSkullsStaking._tenSecCyclesPassedLastWithdraw()
        let startStakeTimestamp = await croSkullsStaking.startStakeTimestamp()
        let userDetails = await croSkullsStaking.userDetails( accountAddress )
        let soulsGenerated = await croSkullsStaking.calculateDroppedSouls();
        let alreadyClaimed = userDetails.alreadyClaimed;
        
        let lastBlock =  await ethProvider.getBlock()
        let blockTimestamp = lastBlock.timestamp;
        malusFee = malusFee.toString()
        rewardPlusMalus = rewardPlusMalus.toString()
        rewards = rewards.toString()
        rewardPerCycle = rewardPerCycle.toString()
        cyclesLastWithdraw = cyclesLastWithdraw.toString()
        startStakeTimestamp = startStakeTimestamp.toString()
        soulsGenerated = soulsGenerated.toString()
        alreadyClaimed = alreadyClaimed.toString()
        
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
          soulsGenerated
        }))
      }
    }else{
      dispatch(stakingDisabled())
    }
  }
}

export const getSkullsData = () => {
  return async (dispatch) => {
      dispatch(fetchDataRequest());
      let {
          croSkullsContract,
          croSkullsStaking,
          accountAddress,
          ethProvider
      } = store.getState().blockchain

      dispatch(refreshSkullsStories())

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

      let inStakeTokens = await croSkullsStaking.getTokensIds()
      console.log( inStakeTokens )
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
      console.log( transfered )
      let final = []
      received.forEach((nTrasfer, tokenId) => {
          if (  nTrasfer > transfered[tokenId] || nTrasfer && !transfered[tokenId]) {
              final.push(tokenId)
          }
      })
      //let sfiltred = received.filter( x => ! transfered.includes(x))
      final = final.filter(x => !inStakeTokens.includes(x))
      dispatch(skullsSuccess( {
          croSkulls: final,
          croSkullsStaked: inStakeTokens
      }))
      console.log( final, inStakeTokens )
      dispatch(getStakingData())
      //await this.getStakingData()
  }
}


export const fetchData = () => {
  return async (dispatch) => {
    dispatch(fetchDataRequest());
    try {
      let totalSupply = await store
        .getState()
        .blockchain.smartContract.methods.totalSupply()
        .call();
      // let cost = await store
      //   .getState()
      //   .blockchain.smartContract.methods.cost()
      //   .call();

      dispatch(
        fetchDataSuccess({
          totalSupply,
          // cost,
        })
      );
    } catch (err) {
      console.log(err);
      dispatch(fetchDataFailed("Could not load data from contract."));
    }
  };
};
