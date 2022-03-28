import { ethers } from "ethers";
import store from "../store";
import { sendNotification, getSkullsData } from "../data/dataActions";

const fetchDexRequest = () => {
  return {
    type: "FETCH_DEX_REQUEST",
  };
};

const fetchDexSuccess = (payload) => {
    return {
      type: "FETCH_DEX_SUCCESS",
      payload: payload
    }
}

const updateState = (payload) => {
    return {
        type: "UPDATE_STATE",
        payload: payload
    }
}

export const loadDexData = () => {
    return async (dispatch) => {
        dispatch(fetchDexRequest())
        let rawDexData = await (await fetch('https://api.dexscreener.io/latest/dex/pairs/cronos/0x4672D3D945700cc3BDf4a2b6704e429d567DC52c')).json();
        
        if( rawDexData.pair && rawDexData.pair.fdv ){
            let dexData = rawDexData.pair
            let graveInCro = dexData.priceNative
            let graveInUsd = dexData.priceUsd
            let croInUsd = (graveInUsd / graveInCro).toFixed(2)
            let liquidityUsd = dexData.liquidity.usd.toFixed(2)
            let liquidityCro = dexData.liquidity.quote
            dispatch(fetchDexSuccess({
                croInUsd,
                graveInUsd,
                graveInCro,
                liquidityUsd,
                liquidityCro,
            }))
        }
    }
}