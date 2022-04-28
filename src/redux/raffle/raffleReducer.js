const initialState = {
    loading: false,
    //raffles state
    init: false,
    raffleCount: 0,
    raffles: [],
    allowance: false,
    isManager: false
};

const raffleReducer = (state = initialState, action) => {
    let payload = action.payload
    switch (action.type) {
        case "FETCH_RAFFLE_REQUEST":
            return {
                ...initialState,
                loading: true
            };
        case "FETCH_RAFFLE_SUCCESS":
            return {
                ...state,
                loading: false,
                raffleCount: payload.raffleCount,
                raffles: payload.raffles,
                allowance: payload.allowance,
                isManager: payload.isManager
            };
        case "UPDATE_STATE":
            return {
                ...state,
                [payload.key]: payload.value
            };
        default:
            return state;
    }
};

export default raffleReducer;