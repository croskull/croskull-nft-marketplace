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

const updateState = (payload) => {
    return {
        type: "UPDATE_STATE",
        payload: payload
    }
}

export const loadEbisusData = (sort) => {
    return async (dispatch) => {
        dispatch(fetchEbisusRequest())
        let rawSkullData = await (await fetch('https://api.ebisusbay.com/collections?collection=0xF87A517A5CaecaA03d7cCa770789BdB61e09e05F')).json();
        let rawBlueData = await (await fetch('https://api.ebisusbay.com/collections?collection=0xB929D3002208f405180D3C07616F88EDa45F3e14')).json();
        let rawRedData = await (await fetch('https://api.ebisusbay.com/collections?collection=0x508378E99F5527Acb6eB4f0fc22f954c5783e5F9')).json();
        
        if( rawSkullData.collections[0] && rawBlueData.collections[0] && rawRedData.collections[0]){
            let s = rawSkullData.collections[0];
            let b = rawBlueData.collections[0];
            let r = rawRedData.collections[0]
            dispatch(fetchEbisusSuccess({
                skullAvgPrice: s.averageSalePrice,
                skullFloorPrice: s.floorPrice,
                skullForSales: s.numberActive,
                skullSolds: s.numberOfSales,
                skullTotalVolume: s.totalVolume,
                //blue stats
                blueAvgPrice: b.averageSalePrice,
                blueFloorPrice: b.floorPrice,
                blueForSales: b.numberActive,
                blueSolds: b.numberOfSales,
                blueTotalVolume: b.totalVolume,
                //redpotion stats
                redAvgPrice: r.averageSalePrice,
                redFloorPrice: r.floorPrice,
                redForSales: r.numberActive,
                redSolds: r.numberOfSales,
                redTotalVolume: r.totalVolume,
            }))
        }
        dispatch(loadEbisusSkullsNew(sort))
        dispatch(loadEbisusBlue())
        dispatch(loadEbisusRed())
    }
}

export const loadEbisusSkulls = () => {
    return async (dispatch) => {
        let { marketplace } = store.getState()
        let { saleSkulls, skullForSales } = marketplace
        if( saleSkulls.length >= skullForSales) return
        if( saleSkulls.length > 0 ) {
            let newPage = parseInt(saleSkulls.length / 20) + 1
            let rawSkullData = await (await fetch(`https://api.ebisusbay.com/listings?collection=0xF87A517A5CaecaA03d7cCa770789BdB61e09e05F&state=0&page=${newPage}&pageSize=20`)).json();
            saleSkulls = saleSkulls.concat(
                rawSkullData.listings
            ) 
        }else{
            let rawSkullData = await (await fetch(`https://api.ebisusbay.com/listings?collection=0xF87A517A5CaecaA03d7cCa770789BdB61e09e05F&state=0&page=1&pageSize=20`)).json();
            saleSkulls = rawSkullData.listings
        }
        dispatch(updateState({
            key: "saleSkulls",
            value: saleSkulls
        }))
    }
}

export const loadEbisusSkullsNew = (i) => {
    return async (dispatch) => {
        let { marketplace } = store.getState()
        let skullList;
        let rawSkullData;
        const skullCollection = `https://api.ebisusbay.com/listings?collection=0xF87A517A5CaecaA03d7cCa770789BdB61e09e05F&state=0&page=1&pageSize=6666`
        switch (i){
            case 0:
            rawSkullData = await (await fetch(skullCollection)).json();
            skullList = rawSkullData.listings;
            break;
            case 1:
            rawSkullData = await (await fetch(skullCollection)).json();
            skullList = rawSkullData.listings;
            break;
            case 2:
                rawSkullData = await (await fetch(`${skullCollection}&sortBy=price`)).json();
            skullList = rawSkullData.listings.reverse();
            break;
            case 3:
                rawSkullData = await (await fetch(`${skullCollection}&sortBy=price`)).json();
            skullList = rawSkullData.listings;
            skullList = skullList;
            break;
            case 4:
                rawSkullData = await (await fetch(`${skullCollection}&sortBy=rank`)).json();
            skullList = rawSkullData.listings;
            break;
            case 5:
                rawSkullData = await (await fetch(`${skullCollection}&sortBy=rank`)).json();
            skullList = rawSkullData.listings.reverse();
            break;
            default:
                skullList=null;
            break;
        }

        dispatch(updateState({
            key: "saleSkulls",
            value: skullList
        }))
        dispatch(updateState({
            key: "skullList",
            value: skullList
        }))
    }
}

export const getAttribute = () =>{
    return async (dispatch) => {
    const rawResult = await fetch( 'https://croskull.mypinata.cloud/ipfs/QmSrjCsmQ9e5m1HFYXRSYgxHi9K6u9a6DXRsWz7KWW5i6p/_metadata' );
    let skullsList = await rawResult.json();
    let attributeList = [
        {name:'Background',value:[]},
        {name:'Skull',value:[]},
        {name:'Body',value:[]},
        {name:'Nose',value:[]},
        {name:'Eyes',value:[]},
        {name:'Hat',value:[]},
        {name:'Trait',value:[5,6]}
        ];
    skullsList.map(skull =>{
        (skull.attributes).map( at =>{
            switch (at.trait_type) {
                case 'Background':
                    if (!attributeList[0].value.includes(at.value))
                        attributeList[0].value.push(at.value);
                    break;
                case 'Skull':
                    if (!attributeList[1].value.includes(at.value))
                        attributeList[1].value.push(at.value);
                    break;
                case 'Body':
                    if (!attributeList[2].value.includes(at.value))
                        attributeList[2].value.push(at.value);
                    break;
                case 'Nose':
                    if (!attributeList[3].value.includes(at.value))
                        attributeList[3].value.push(at.value);
                    break;
                case 'Eyes':
                    if (!attributeList[4].value.includes(at.value))
                        attributeList[4].value.push(at.value);
                    break;
                case 'Hat':
                    if (!attributeList[5].value.includes(at.value))
                        attributeList[5].value.push(at.value);
                    break;
                default:
                    break;
            }
        })
    })
    dispatch(updateState({
        key: "attributesList",
        value: attributeList
    }))
    }
  }

export const loadEbisusBlue = () => {
    return async (dispatch) => {
        let { marketplace } = store.getState()
        let { saleBlue, blueForSales } = marketplace
        if( saleBlue.length >= blueForSales) return
        if( saleBlue.length > 0 ) {
            let newPage = parseInt(saleBlue.length / 20) + 1
            let rawBlueData = await (await fetch(`https://api.ebisusbay.com/listings?collection=0xB929D3002208f405180D3C07616F88EDa45F3e14&state=0&sortBy=price&page=${newPage}&pageSize=20`)).json();
            saleBlue = saleBlue.concat(
                rawBlueData.listings
            ) 
        }else{
            let rawBlueData = await (await fetch(`https://api.ebisusbay.com/listings?collection=0xB929D3002208f405180D3C07616F88EDa45F3e14&state=0&sortBy=price&page=1&pageSize=20`)).json();
            saleBlue = rawBlueData.listings
        }
        dispatch(updateState({
            key: "saleBlue",
            value: saleBlue
        }))
    }
}

export const loadEbisusRed = () => {
    return async (dispatch) => {
        let { marketplace } = store.getState()
        let { saleRed } = marketplace
        if( saleRed.length > 0 ) {
            let newPage = parseInt(saleRed.length / 20) + 1
            let rawRedData = await (await fetch(`https://api.ebisusbay.com/listings?collection=0x508378E99F5527Acb6eB4f0fc22f954c5783e5F9&state=0&sortBy=price&page=${newPage}&pageSize=20`)).json();
            saleRed = saleRed.concat(
                rawRedData.listings
            ) 
        }else{
            let rawRedData = await (await fetch(`https://api.ebisusbay.com/listings?collection=0x508378E99F5527Acb6eB4f0fc22f954c5783e5F9&state=0&sortBy=price&page=1&pageSize=20`)).json();
            saleRed = rawRedData.listings
        }
        dispatch(updateState({
            key: "saleRed",
            value: saleRed
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
                    message: `Item #${_skullId} purchased!`,
                    tx,
                    type: "success"
                }))
                dispatch(getSkullsData())
            }
        )
    }
}