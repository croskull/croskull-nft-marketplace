const initialState = {
    loading: false,
    evoSkulls: [],
    isPurpleApproved: false,
    isSkullApproved: false,
    rudeAllowance: false,
    soulsAllowance: false,
    totalSupply: 0,
}

const evoReducer = (state = initialState, action) => {
    let payload = action.payload
    switch (action.type) {
        case "FETCH_EVO":
            return {
                ...initialState,
                loading: true,
            };
        case "LOAD_EVO":
            return {
                ...state,
                loading: false,
                evoSkulls: payload.evoSkulls,
                isPurpleApproved: payload.isPurpleApproved,
                isSkullApproved: payload.isSkullApproved,
                rudeAllowance: payload.rudeAllowance,
                soulsAllowance: payload.soulsAllowance,
                totalSupply: payload.totalSupply,
            };
        case "UPDATE_STATE":
            return {
                ...state,
                [payload.key]: payload.value
            }
        case "DISCONNECT":
            return {
                ...state,
                loading: false,
                evoSkulls: [],
                isPurpleApproved: false,
                isSkullApproved: false,
                rudeAllowance: false,
                soulsAllowance: false,
                totalSupply: 0
            }
        default:
            return state;
    }
};

export default evoReducer;