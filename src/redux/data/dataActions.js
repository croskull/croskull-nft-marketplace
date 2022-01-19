// log
import store from "../store";

const genesisBlock = 1641025;

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

export const sendNotification = ({ title, message, tx, type}) => {
    return async (dispatch) => {
      dispatch(notificationRequest({title, message, tx, type}))
    }
}

export const getStakingData =  () => {
  return async (dispatch) => {
    let {croSkullsStaking} = store.getState().blockchain;
    let started = await croSkullsStaking.started()
    if( started ){
      let isApproved = await croSkullsStaking.approvalStatus();
      console.log(isApproved )
      if( ! isApproved ){ //approved Staking contract as Operator into ERC721 Contract
        //prevediamo una sezione dove mostrare il bottone per attivare l'approval sul contratto NFT
        dispatch(stakingDisabled())
      }else{
        let malusFee = await croSkullsStaking.calculateMalusFee()
        let rewardPlusMalus = await croSkullsStaking.calculateRewardsPlusMalus()
        let rewards = await croSkullsStaking.calculateRewards()
        let rewardPerCycle = await croSkullsStaking._rewardPerCycles()
        let cyclesLastWithdraw = await croSkullsStaking._tenSecCyclesPassedLastWithdraw()
        malusFee = malusFee.toString()
        rewardPlusMalus = rewardPlusMalus.toString()
        rewards = rewards.toString()
        rewardPerCycle = rewardPerCycle.toString()
        cyclesLastWithdraw = cyclesLastWithdraw.toString()
        console.log(cyclesLastWithdraw)
        dispatch(fetchStakingSuccess({
          malusFee,
          rewardPlusMalus,
          rewards,
          rewardPerCycle,
          cyclesLastWithdraw
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
      let currentBlock = await ethProvider.getBlockNumber()
      let receivedFilter = croSkullsContract.filters.Transfer(null, accountAddress)
      let transferedFilter = croSkullsContract.filters.Transfer(accountAddress)
      let inStakeFilter = croSkullsStaking.filters.Stake(accountAddress)
      

      let receivedEvents = await croSkullsContract.queryFilter(receivedFilter, genesisBlock)
      let transferedEvents = await croSkullsContract.queryFilter(transferedFilter, genesisBlock)

      let inStakeTokens = await croSkullsStaking.getTokensIds()

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
          if (nTrasfer > transfered[tokenId] || nTrasfer && !transfered[tokenId]) {
              final.push(tokenId)
          }
      })
      //let sfiltred = received.filter( x => ! transfered.includes(x))
      final = final.filter(x => !inStakeTokens.includes(x))
      dispatch(skullsSuccess( {
          croSkulls: final,
          croSkullsStaked: inStakeTokens
      }))
      console.log( received, transfered )
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
