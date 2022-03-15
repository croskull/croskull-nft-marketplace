const initialState = {
    loading: false,
    //listings
    saleSkulls: [],
    saleBlue: [],
    saleRed: [],
    //skull stats
    skullAvgPrice: 0,
    skullFloorPrice: 0,
    skullForSales: 0,
    skullSolds: 0,
    skullTotalVolume:0,
    //bluepotion stats
    blueAvgPrice: 0,
    blueFloorPrice: 0,
    blueForSales: 0,
    blueSolds: 0,
    blueTotalVolume:0,
    //redpotion stats
    redAvgPrice: 0,
    redFloorPrice: 0,
    redForSales: 0,
    redSolds: 0,
    redTotalVolume:0,
};

const marketplaceReducer = (state = initialState, action) => {
    let payload = action.payload
    switch (action.type) {
        case "FETCH_EBISUS_REQUEST":
            return {
                ...initialState,
                loading: true
            };
        case "FETCH_EBISUS_SUCCESS":
            return {
                ...state,
                loading: false,
                //skull stats
                skullAvgPrice: payload.skullAvgPrice,
                skullFloorPrice: payload.skullFloorPrice,
                skullForSales: payload.skullForSales,
                skullSolds: payload.skullSolds,
                skullTotalVolume: payload.skullTotalVolume,
                //bluepotion stats
                blueAvgPrice: payload.blueAvgPrice,
                blueFloorPrice: payload.blueFloorPrice,
                blueForSales: payload.blueForSales,
                blueSolds: payload.blueSolds,
                blueTotalVolume: payload.blueTotalVolume,
                //redpotion stats
                redAvgPrice: payload.redAvgPrice,
                redFloorPrice: payload.redFloorPrice,
                redForSales: payload.redForSales,
                redSolds: payload.redSolds,
                redTotalVolume: payload.redTotalVolume,
            };
        case "FETCH_SKULLS_SUCCESS":
            return{
                ...state,
                loading: false,
                saleSkulls: payload.saleSkulls,
                saleBlue: payload.saleBlue,
                saleRed: payload.saleRed
            }
        case "UPDATE_STATE":
            return {
                ...state,
                [payload.key]: payload.value
            }
        default:
            return state;
    }
};

export default marketplaceReducer;