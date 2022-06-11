import { BigNumber } from "@ethersproject/bignumber";
import store from "../store";

const fetchEvo = () => {
    return {
        type: "FETCH_EVO",
    };
}

const loadEvo = (payload) => {
    return {
        type: "LOAD_EVO",
        payload: payload,
    };
};

export const updateState = (payload) => {
    return {
        type: "UPDATE_STATE",
        payload
    }
}

export const loadEvoSkulls = () => {
    return async (dispatch) => {
        dispatch(fetchEvo())

        let { 
            croSkullsContract,
            croPotionPurple,
            croSkullsRude,
            croSkullsSouls,
            evoSkullsContract,
            accountAddress
        } = store.getState().blockchain

        let isSkullApproved = await croSkullsContract.isApprovedForAll(accountAddress, evoSkullsContract.address)
        let isPurpleApproved = await croPotionPurple.isApprovedForAll(accountAddress, evoSkullsContract.address)
        let rudeAllowance = (await croSkullsRude.allowance(accountAddress, evoSkullsContract.address)).toString()
        let soulsAllowance = (await croSkullsSouls.allowance(accountAddress, evoSkullsContract.address)).toString()
        let totalSupply = (await evoSkullsContract.totalSupply()).toString()
        let balanceOf = (await evoSkullsContract.balanceOf(accountAddress)).toString()
        let tokens = []
        let keys = []
        let keysInit = false
        for( let i = 0; i < balanceOf; i++) {
            let tokenId = await evoSkullsContract.tokenOfOwnerByIndex(accountAddress, i)
            let tempToken = await evoSkullsContract.getToken(tokenId)
            let tempCurToken = tempToken.currentToken
            if( ! keysInit ){
                Object.keys(tempCurToken).forEach((e, key) => {
                    if( parseInt(e) <= 17 ) return
                    keys.push(e)
                })
                keysInit = true
            }
            let cleanEvo = []
            for(let i = 0; i < keys.length; i++){
                let k = keys[i]
                cleanEvo[k] =  tempCurToken[k] instanceof BigNumber ? tempCurToken[k].toString() : tempCurToken[k]
            }
            let upgradeCost = (await evoSkullsContract.getUpgradeCost(tokenId)).toString()
            let cleanToken = {
                owner: accountAddress,
                id: tokenId.toString(),
                currentToken: cleanEvo,
                isClaimable: tempToken.isClaimable,
                isUsable: tempToken.isUsable,
                nextLvlExp: tempToken.nextLvlExp.toString(),
                isLevelable: tempToken.isLevelable,
                upgradeCost: upgradeCost
            }
            tokens[i] = cleanToken
        }
        let evoSkulls = tokens
        dispatch(loadEvo({
            totalSupply,
            evoSkulls,
            isPurpleApproved,
            isSkullApproved,
            rudeAllowance,
            soulsAllowance
        }))
    }
}
