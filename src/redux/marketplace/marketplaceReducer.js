const initialState = {
    loading: false,
    //listings
    saleSkulls: [],
    //skull stats
    skullAvgPrice: 0,
    skullFloorPrice: 0,
    skullForSales: 0,
    skullSolds: 0,
    skullTotalVolume:0,
    //bluepotion stats
    //redpotion stats
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
            };
        case "FETCH_SKULLS_SUCCESS":
            return{
                ...state,
                loading: false,
                saleSkulls: payload.saleSkulls
            }
        default:
            return state;
    }
};

export default marketplaceReducer;