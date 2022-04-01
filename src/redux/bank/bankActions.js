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
                contractId: contractId,
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