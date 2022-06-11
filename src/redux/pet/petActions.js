import { BigNumber } from "@ethersproject/bignumber";
import store from "../store";

const fetchPet = () => {
    return {
        type: "FETCH_PET",
    };
}

const loadPet = (payload) => {
    return {
        type: "LOAD_PET",
        payload: payload,
    };
};

export const petUpdateState = (payload) => {
    return {
        type: "UPDATE_STATE",
        payload
    }
}

export const loadPets = () => {
    return async (dispatch) => {
        dispatch(fetchPet())

        let { 
            croSkullsPetEggs,
            petSeasonOne,
            croSkullsRude,
            croSkullsSouls,
            accountAddress,
            cnsDomain
        } = store.getState().blockchain
        let isEggApproved = await croSkullsPetEggs.isApprovedForAll(accountAddress, petSeasonOne.address)
        let rudeAllowance = (await croSkullsRude.allowance(accountAddress, petSeasonOne.address)).toString()
        let soulsAllowance = (await croSkullsSouls.allowance(accountAddress, petSeasonOne.address)).toString()
        let totalSupply = (await petSeasonOne.totalSupply()).toString()
        let balanceOf = (await petSeasonOne.balanceOf(accountAddress)).toString()
        let rewards = await petSeasonOne.hasRewards(accountAddress)
        rewards = rewards.rewards.toString()
        let tokens = []
        let keys = []
        let keysInit = false
        for( let i = 0; i < balanceOf; i++) {
            let tokenId = await petSeasonOne.tokenOfOwnerByIndex(accountAddress, i)
            let tempToken = await petSeasonOne.getToken(tokenId)
            let tempCurToken = tempToken.currentToken
            if( ! keysInit ){
                Object.keys(tempCurToken).forEach((e, key) => {
                    if( parseInt(e) <= 15 ) return
                    keys.push(e)
                })
                keysInit = true
            }
            let cleanEvo = []
            for(let i = 0; i < keys.length; i++){
                let k = keys[i]
                cleanEvo[k] =  tempCurToken[k] instanceof BigNumber ? tempCurToken[k].toString() : tempCurToken[k]
            }
            let upgradeCost = (await petSeasonOne.getUpgradeCost(tokenId)).toString()
            let cleanToken = {
                owner: accountAddress,
                id: tokenId.toString(),
                cnsDomain: cnsDomain,
                currentToken: cleanEvo,
                isClaimable: tempToken.isClaimable,
                isUsable: tempToken.isUsable,
                nextLvlExp: tempToken.nextLvlExp.toString(),
                isLevelable: tempToken.isLevelable,
                upgradeCost: upgradeCost,
                imageURL: `https://croskull.mypinata.cloud/ipfs/Qmckrn1QenE733tJarc48TU5J7pp3jDrXA2wryf363sPd1/${tokenId.toString()}.jpeg`
            }
            tokens[i] = cleanToken
        }
        let pets = tokens
        dispatch(loadPet({
            totalSupply,
            pets,
            isEggApproved,
            rudeAllowance,
            soulsAllowance,
            rewards
        }))
    }
}
