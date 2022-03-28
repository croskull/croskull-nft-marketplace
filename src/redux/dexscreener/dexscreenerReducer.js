const initialState = {
    loading: false,
    //listings
    croInUsd: 0,
    graveInUsd: 0,
    graveInCro: 0,
    liquidityUsd: 0,
    liquidityCro: 0,
};

const dexscreenerReducer = (state = initialState, action) => {
    let payload = action.payload
    switch (action.type) {
        case "FETCH_DEX_REQUEST":
            return {
                ...initialState,
                loading: true
            };
        case "FETCH_DEX_SUCCESS":
            return {
                ...state,
                loading: false,
                croInUsd: payload.croInUsd,
                graveInUsd: payload.graveInUsd,
                graveInCro: payload.graveInCro,
                liquidityUsd: payload.liquidityUsd,
                liquidityCro: payload.liquidityCro
            };
        case "UPDATE_STATE":
            return {
                ...state,
                [payload.key]: payload.value
            }
        default:
            return state;
    }
};

export default dexscreenerReducer;