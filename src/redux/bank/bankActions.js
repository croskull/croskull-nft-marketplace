import { ethers } from "ethers";
import store from "../store";
import { sendNotification, getSkullsData } from "../data/dataActions";

const fetchBankRequest = () => {
  return {
    type: "FETCH_BANK_REQUEST",
  };
};

const fetchBankSuccess = (payload) => {
    return {
      type: "FETCH_BANK_SUCCESS",
      payload: payload
    }
}

const fetchFarmSuccess = (payload) => {
    return {
      type: "FETCH_FARM_SUCCESS",
      payload: payload
    }
}


export const loadFarmData = () =>{
    return async (dispatch) => {
        let { accountAddress, croSkullsFarm, lpPair, ethProvider } = store.getState().blockchain
        let datas = [
            "rewardPerBlock",
            "paidOut",
            "endBlock",
        ]
        /*
        "userInfo",
        "poolInfo"*/
        if( ! croSkullsFarm ) return

        let finalData = []
        datas.forEach( async (data, i) => {
            let value = await croSkullsFarm[data]()
            value = await value.toString()
            console.log( value )
            finalData = {
                ...finalData,
                [data]: value
            }
        })
        let poolInfo = await croSkullsFarm.poolInfo(0)
        let lastRewardBlock = await croSkullsFarm.rewardPerBlock()
        let userInfo = await croSkullsFarm.userInfo(0,accountAddress)
        let totalPending = await croSkullsFarm.totalPending()
        let amount =  userInfo.amount.toString()
        lastRewardBlock =  lastRewardBlock.toString()
        totalPending =  totalPending.toString()
        let pendingRewards = await croSkullsFarm.pending(0,accountAddress)
        let lpPairAllowance = await lpPair.allowance(accountAddress, croSkullsFarm.address)
        let totalLiquidity = await lpPair.balanceOf(croSkullsFarm.address)
        let lpPairBalance = await lpPair.balanceOf(accountAddress)
        totalLiquidity = totalLiquidity.toString()
        //calculation locked lp value in $
        // croPerLP = croBalanceOfLP / LPTotalSupply
        // lpInUsd = croPerLP * stakedAmount * croInUsd
        let lpTotalSupply = await lpPair.totalSupply()
        lpTotalSupply = lpTotalSupply.toString()
        let lpCroBalance = await lpPair.getReserves()
        lpCroBalance = lpCroBalance[0].toString()
        let croPerLp = lpCroBalance / lpTotalSupply
        let totalStakedCro = croPerLp * totalLiquidity / 10 ** 18;
        lpPairBalance = await lpPairBalance.toString()
        lpPairAllowance = await lpPairAllowance.toString()
        let endBlock = await croSkullsFarm.endBlock()
        endBlock = await endBlock.toString()
        dispatch( fetchFarmSuccess({
            rewardPerBlock: lastRewardBlock,
            stakedAmount: amount,
            pendingRewards,
            lpPairAllowance,
            endBlock,
            totalLiquidity,
            lpPairBalance,
            totalPending,
            totalStakedCro
        }) )
    }
}

export const loadBankData = () => {
    return async (dispatch) => {
        dispatch(fetchBankRequest())
        let { accountAddress, croSkullsBank, croSkullsGrave } = store.getState().blockchain
        let datas = [
            "maxApy",
            "totalGraveVolume",
            "totalWishbonesVolume",
            "totalContractsVolume",
            "depositedGrave",
            "activeWishbones",
            "activeContracts",
            "wishboneCost",
            "bankFee",
        ]
        if( ! croSkullsBank ) return 

        let finalData = []
        datas.forEach( async data => {
            let value = await croSkullsBank[data]()
            value = await value.toString()
            finalData = {
                ...finalData,
                [data]: value
            }
        });
        let userContractsCount = await croSkullsBank.userContractCount(accountAddress)
        userContractsCount = await userContractsCount.toString()
        let userActiveContracts = await croSkullsBank.getActiveContracts()
        let userFinalContracts = []
        userActiveContracts.map( async contractId => {
            let contractRewards = await croSkullsBank.currentRewards(contractId)
            let contractHash = ethers.utils.solidityKeccak256([ "address", "uint" ], [ accountAddress, contractId ])
            let contractDetails = await croSkullsBank.userContracts(contractHash)
            let contractData = {
                contractId: contractId.toString(),
                amount: contractDetails.amount.toString(),
                duration: contractDetails.duration.toString(),
                startTimestamp: contractDetails.startTimestamp.toString(),
                unlockTimestamp: contractDetails.unlockTimestamp.toString(),
                usedWishbones: contractDetails.usedWishbones.toString(),
                rewards: contractRewards[0].toString(),
                apy: contractRewards[1].toString(),
                isClaimable: contractRewards[2]
            }
            userFinalContracts.push(contractData)
        })
        let allowance = await croSkullsGrave.allowance(accountAddress, croSkullsBank.address)
        allowance = await allowance.toString()
        finalData = {
            ...finalData,
            userContractsCount,
            userActiveContracts: userFinalContracts,
            allowance
        }
        dispatch(fetchBankSuccess( finalData ))
    }
}