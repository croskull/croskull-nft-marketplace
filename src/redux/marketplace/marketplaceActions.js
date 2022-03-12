import { ethers } from "ethers";
import store from "../store";
import { sendNotification, getSkullsData } from "../data/dataActions";

const fetchEbisusRequest = () => {
  return {
    type: "FETCH_EBISUS_REQUEST",
  };
};

const fetchEbisusSuccess = (payload) => {
    return {
      type: "FETCH_EBISUS_SUCCESS",
      payload: payload
    }
}

const fetchSkullsSuccess = (payload) => {
    return {
      type: "FETCH_SKULLS_SUCCESS",
      payload: payload
    }
}

export const loadEbisusData = () => {
    return async (dispatch) => {
        dispatch(fetchEbisusRequest())
        let rawSkullData = await (await fetch('https://api.ebisusbay.com/collections?collection=0xF87A517A5CaecaA03d7cCa770789BdB61e09e05F')).json();
        if( rawSkullData.collections[0] ){
            let {
                averageSalePrice,
                floorPrice,
                numberActive,
                numberOfSales,
                totalVolume
            } = rawSkullData.collections[0];
            dispatch(fetchEbisusSuccess({
                skullAvgPrice: averageSalePrice,
                skullFloorPrice: floorPrice,
                skullForSales: numberActive,
                skullSolds: numberOfSales,
                skullTotalVolume: totalVolume
            }))
        }
        dispatch(loadEbisusSkulls())
    }
}

export const loadEbisusSkulls = () => {
    return async (dispatch) => {
        let { marketplace } = store.getState()
        let { saleSkulls } = marketplace
        if( saleSkulls.length > 0 ) {
            let newPage = parseInt(saleSkulls.length / 20) + 1
            let rawSkullData = await (await fetch(`https://api.ebisusbay.com/listings?collection=0xF87A517A5CaecaA03d7cCa770789BdB61e09e05F&state=0&page=${newPage}&pageSize=20`)).json();
            saleSkulls = saleSkulls.concat(
                rawSkullData.listings
            ) 
        }else{
            let rawSkullData = await (await fetch(`https://api.ebisusbay.com/listings?collection=0xF87A517A5CaecaA03d7cCa770789BdB61e09e05F&state=0&page=1&pageSize=20`)).json();
            saleSkulls = rawSkullData.listings
            console.log(rawSkullData)
        }
        dispatch(fetchSkullsSuccess({
            saleSkulls
        }))
    }
}

export const purchaseItem = ( { _listingId, _cost, _skullId } ) => {
    return async (dispatch) => {
        let { ebisusMarketplace } = store.getState().blockchain
        if( ! ebisusMarketplace || ! _listingId) return
        let purchaseTx = ebisusMarketplace.makePurchase(_listingId, {
            value: _cost
        })
        await purchaseTx.then(
            async (tx) => {
                dispatch(sendNotification({
                    title: `Transaction Sent`,
                    message: 'Waiting for confirmation',
                    tx,
                    type: "info"
                }))
                await tx.wait(2)
                dispatch(sendNotification({
                    title: `Success`,
                    message: `Skull #${_skullId} purchased!`,
                    tx,
                    type: "success"
                }))
                dispatch(getSkullsData())
            }
        )
    }
}